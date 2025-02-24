import {
  CashuMint,
  CashuWallet,
  CheckStateEnum,
  MintQuoteState,
} from '@cashu/cashu-ts';
import {retrieveData} from '../secureStore';
import {mnemonicToSeed} from '@dreson4/react-native-quick-bip39';
import {parseInput} from '@breeztech/react-native-breez-sdk';
import {getLocalStorageItem, setLocalStorageItem} from '../localStorage';

import {BLITZ_DEFAULT_PAYMENT_DESCRIPTION} from '../../constants';
import {
  getSelectedMint,
  getStoredProofs,
  incrementMintCounter,
  removeProofs,
  setMintCounter,
  storeEcashTransactions,
  storeProofs,
} from './db';
import {parseInvoice} from '@breeztech/react-native-breez-sdk-liquid';
import customUUID from '../customUUID';
import EventEmitter from 'events';
import {sumProofsValue} from './proofs';
export const ACTIVE_MINT_STORAGE_KEY = 'ACTIVE_ECASH_MINT';
export const ECASH_QUOTE_STORAGE_KEY = 'UNPAID_ECASH_QUOTES';

export const RESTORE_PROOFS_EVENT_NAME = 'RESTORING_PROOF_EVENT';
export const restoreProofsEventListener = new EventEmitter();

let eCashWallets = {};

export const initEcashWallet = async mintURL => {
  try {
    const selctingMint = mintURL ? Promise.resolve(mintURL) : getSelectedMint();
    const activeMintURL = await selctingMint;
    if (!activeMintURL) throw new Error('No selected mint to save to');
    if (!activeMintURL) return;
    if (eCashWallets[activeMintURL]) return eCashWallets[activeMintURL];
    const mnemonic = await retrieveData('mnemonic');
    const mint = new CashuMint(activeMintURL);
    const keysets = (await mint.getKeySets()).keysets.filter(
      ks => ks.unit === 'sat',
    );
    const keys = (await mint.getKeys()).keysets.find(ks => ks.unit === 'sat');
    const seed = mnemonicToSeed(mnemonic);
    const wallet = new CashuWallet(mint, {
      bip39seed: Uint8Array.from(seed),
      mintInfo: await mint.getInfo(),
      unit: 'sat',
      keysets,
      keys,
    });

    await wallet.loadMint();

    eCashWallets[activeMintURL] = wallet;
    return wallet;
  } catch (err) {
    console.log('init ecash wallet error', err);
    return false;
  }
};

export const restoreProofs = async mintURL => {
  try {
    restoreProofsEventListener.emit(
      RESTORE_PROOFS_EVENT_NAME,
      'Starting restore process',
    );
    const wallet = await initEcashWallet(mintURL);
    const BATCH_SIZE = 100;
    let currentCount = 0;
    let emptyBatchCount = 0;
    let lastSuccessfulRestore = 0;
    let totalRestoredProofs = 0;

    while (emptyBatchCount < 3) {
      restoreProofsEventListener.emit(
        RESTORE_PROOFS_EVENT_NAME,
        `Running batch number ${Math.round(currentCount / BATCH_SIZE)}`,
      );

      const restoredProofs = await wallet.restore(
        currentCount,
        currentCount + BATCH_SIZE - 1,
      );
      console.log(restoredProofs, 'restored proofs');
      console.log(restoredProofs.proofs.length, 'restor proofs length');
      if (!restoredProofs.proofs || restoredProofs.proofs.length === 0) {
        emptyBatchCount++;
        restoreProofsEventListener.emit(
          RESTORE_PROOFS_EVENT_NAME,
          `Found empty batch number ${emptyBatchCount}`,
        );
        await new Promise(res => setTimeout(res, 1000));
      } else {
        restoreProofsEventListener.emit(
          RESTORE_PROOFS_EVENT_NAME,
          `Found proofs`,
        );
        emptyBatchCount = 0;
        lastSuccessfulRestore = currentCount;

        const proofStates = await wallet.checkProofsStates(
          restoredProofs.proofs,
        );
        restoreProofsEventListener.emit(
          RESTORE_PROOFS_EVENT_NAME,
          `Checking proofs state`,
        );

        const unspentProofs = restoredProofs.proofs.filter(
          (proof, index) => proofStates[index].state === 'UNSPENT',
        );

        if (unspentProofs.length > 0) {
          restoreProofsEventListener.emit(
            RESTORE_PROOFS_EVENT_NAME,
            `Saving unspent proofs`,
          );
          await storeProofs(unspentProofs, mintURL);
        }

        totalRestoredProofs += restoredProofs.proofs.length;
      }

      currentCount += BATCH_SIZE;
    }

    const finalCounter = totalRestoredProofs;
    console.log(
      `Restore complete. Last successful restore at counter: ${
        finalCounter + 1
      }`,
    );
    await setMintCounter(mintURL, finalCounter + 1);

    restoreProofsEventListener.emit(RESTORE_PROOFS_EVENT_NAME, `end`);
    return true;
  } catch (err) {
    console.error('Error restoring proofs:', err);
    restoreProofsEventListener.emit(RESTORE_PROOFS_EVENT_NAME, `error`);
    return null;
  }
};

async function getECashInvoice({amount, mintURL, descriptoin}) {
  try {
    const wallet = await initEcashWallet(mintURL);
    console.log(wallet);
    let mintQuote;
    let derivePathIndex;
    let didFindMintQuote = true;
    const runCount = 10;
    let counter = 0;

    while (didFindMintQuote && runCount > counter) {
      counter += 1;
      mintQuote = {parsedInvoie: null};
      try {
        console.log('ecash invioce run count', counter);
        mintQuote = await wallet.createMintQuote(
          amount,
          descriptoin || BLITZ_DEFAULT_PAYMENT_DESCRIPTION,
        );

        const didMint = await mintEcash({
          invoice: mintQuote.request,
          quote: mintQuote.quote,
          mintURL: mintURL,
        });

        if (didMint.parsedInvoie || didMint.error === 'Quote not paid') {
          derivePathIndex = didMint.counter;
          break;
        }
        await new Promise(res => setTimeout(res, 500));
      } catch (err) {
        console.log('getEcash while loop error');
      }
    }

    await hanleEcashQuoteStorage(mintQuote, true, derivePathIndex);

    console.log('generated Ecash quote', mintQuote);
    return {mintQuote, counter: derivePathIndex, mintURL};
  } catch (err) {
    console.log('generating ecash invoice error', err);
    return false;
  }
}

export const hanleEcashQuoteStorage = async (mintQuote, addProof, counter) => {
  try {
    const activeMintURL = await getSelectedMint();
    if (!activeMintURL) throw new Error('No selected mint to save to');

    let localStoredQuotes =
      JSON.parse(await getLocalStorageItem(ECASH_QUOTE_STORAGE_KEY)) || [];

    if (addProof) {
      localStoredQuotes.push({...mintQuote, mintURL: activeMintURL, counter});
    } else {
      localStoredQuotes = localStoredQuotes.filter(
        quote => quote.quote !== mintQuote,
      );
    }

    await setLocalStorageItem(
      ECASH_QUOTE_STORAGE_KEY,
      JSON.stringify(localStoredQuotes),
    );
  } catch (err) {
    console.log('handle ecash quotes error', err);
  }
};

export const getEcashBalance = async () => {
  try {
    const activeMintURL = await getSelectedMint();
    if (!activeMintURL) throw new Error('No selected mint to save to');
    const savedProofs = await getStoredProofs(activeMintURL);
    console.log(savedProofs, 'saved proofs');
    if (!savedProofs) return 0;
    const userBalance = savedProofs.reduce((prev, curr) => {
      const proof = curr;
      return (prev += proof.amount);
    }, 0);
    return userBalance;
  } catch (err) {
    console.log('Get ecash balance error', err);
    return false;
  }
};

async function claimUnclaimedEcashQuotes() {
  try {
    let localStoredQuotes =
      JSON.parse(await getLocalStorageItem(ECASH_QUOTE_STORAGE_KEY)) || [];

    console.log(localStoredQuotes, 'STORED ECASH QUOTES');
    let newTransactions = {};
    let newProofs = {};
    const newQuotes = await Promise.all(
      localStoredQuotes.map(async storedQuoteInformation => {
        console.log(storedQuoteInformation?.mintURL);
        if (!storedQuoteInformation?.mintURL || !storedQuoteInformation.counter)
          return false;
        const minQuoteResponse = await checkMintQuote({
          quote: storedQuoteInformation.quote,
          mintURL: storedQuoteInformation.mintURL,
        });
        console.log(minQuoteResponse, 'mint wuote eroasjdflkajsdfj');
        if (!minQuoteResponse) return false;

        const quoteDate = new Date(minQuoteResponse.expiry * 1000);
        const currentDate = new Date();

        if (minQuoteResponse.state === MintQuoteState.UNPAID)
          return quoteDate < currentDate ? false : minQuoteResponse;

        const didMint = await mintEcash({
          invoice: minQuoteResponse.request,
          quote: minQuoteResponse.quote,
          mintURL: storedQuoteInformation.mintURL,
          globalCounter: storedQuoteInformation.counter,
        });
        if (didMint.parsedInvoie) {
          const formattedEcashTx = formatEcashTx({
            time: Date.now(),
            amount: didMint.parsedInvoie.invoice.amountMsat / 1000,
            fee: 0,
            paymentType: 'received',
          });

          if (!newTransactions[storedQuoteInformation?.mintURL]) {
            newTransactions[storedQuoteInformation?.mintURL] = [];
          }
          newTransactions[storedQuoteInformation?.mintURL].push(
            formattedEcashTx,
          );

          if (!newProofs[storedQuoteInformation?.mintURL]) {
            newProofs[storedQuoteInformation?.mintURL] = [];
          }
          newProofs[storedQuoteInformation?.mintURL].push(...didMint.proofs);
          return false;
        } else {
          if (
            minQuoteResponse.state === MintQuoteState.PAID ||
            minQuoteResponse.state === MintQuoteState.ISSUED
          )
            return false;

          return minQuoteResponse;
        }
      }),
    );
    console.log(newQuotes, 'NEW QUOTES');
    const filterdQuotes = newQuotes.filter(item => !!item);

    setLocalStorageItem(ECASH_QUOTE_STORAGE_KEY, JSON.stringify(filterdQuotes));

    if (!newTransactions.length && !newProofs.length) return;
    for (const mintURL in newTransactions) {
      if (newTransactions[mintURL].length) {
        await storeEcashTransactions(newTransactions[mintURL], mintURL);
      }
    }

    for (const mintURL in newProofs) {
      if (newProofs[mintURL].length) {
        await storeProofs(newProofs[mintURL], mintURL);
      }
    }
  } catch (err) {
    console.log('claim unclaimed ecash quotes err', err);
  }
}

async function mintEcash({invoice, quote, mintURL, globalCounter}) {
  let counter = 0;
  try {
    const mint = mintURL ? Promise.resolve(mintURL) : getSelectedMint();
    const currentMint = await mint;
    if (!currentMint) throw new Error('No selected mint');
    const wallet = await initEcashWallet(currentMint);
    const selctingCounter = globalCounter
      ? Promise.resolve(globalCounter)
      : incrementMintCounter(currentMint);
    counter = await selctingCounter;
    const prasedInvoice = await parseInput(invoice);
    console.log(prasedInvoice.invoice.amountMsat, 'mint ecash amount');
    console.log(counter, 'ECASH COUNTER');

    const info = await wallet.mintProofs(
      prasedInvoice.invoice.amountMsat / 1000,
      quote,
      {counter, keysetId: wallet.keysetId},
    );

    console.log(info, 'TESTING');

    return {parsedInvoie: prasedInvoice, proofs: info, counter};
  } catch (err) {
    console.log(err, 'mint Ecash error');
    if (err.message === 'quote not paid') {
      console.log('The quote has not been paid. Handling this specific error.');
      return {parsedInvoice: null, error: 'Quote not paid', counter};
    }

    // If other errors occur, you can handle them here:
    return {parsedInvoice: null, error: err.message, counter};
  }
}
export const checkMintQuote = async ({quote, mintURL}) => {
  try {
    const mint = mintURL ? Promise.resolve(mintURL) : getSelectedMint();
    const currentMint = await mint;
    if (!currentMint) throw new Error('No selected mint');
    const wallet = await initEcashWallet(currentMint);
    const mintQuote = await wallet.checkMintQuote(quote);
    console.log(mintQuote, 'mint quote');
    return mintQuote;
  } catch (err) {
    console.log(err, 'CHECK MINT QUOTE ERROR');
    return false;
  }
};

export async function cleanEcashWalletState(mintURL) {
  try {
    const storedProofs = await getStoredProofs(mintURL);
    const wallet = await initEcashWallet(mintURL);

    const proofsState = await wallet.checkProofsStates(storedProofs);

    const spendProofs = proofsState.filter(proof => {
      return proof.state === CheckStateEnum.SPENT;
    });
    await removeProofs(spendProofs);
    return true;
  } catch (err) {
    console.log('clean wallet state error', err);
    return false;
  }
}

export const getMeltQuote = async bolt11Invoice => {
  try {
    const mintURL = await getSelectedMint();
    if (!mintURL) throw new Error('No seleected mint url');
    const wallet = await initEcashWallet(mintURL);
    const storedProofs = await getStoredProofs(mintURL);
    const meltQuote = await wallet.createMeltQuote(bolt11Invoice);
    const {proofsToUse} = getProofsToUse(
      storedProofs,
      meltQuote.amount + meltQuote.fee_reserve,
      'desc',
    );
    return {quote: meltQuote, proofsToUse};
  } catch (err) {
    console.log('Error creating melt quote', err);
    return false;
  }
};

function formatEcashTx({amount, paymentType, fee, preImage}) {
  let txObject = {
    id: customUUID(),
    time: new Date().getTime(),
    amount: null,
    type: 'ecash',
    paymentType: null,
    fee: null,
    preImage: null,
  };
  txObject['amount'] = amount;
  txObject['paymentType'] = paymentType;
  txObject['fee'] = fee;
  txObject['preImage'] = preImage;

  return txObject;
}

export const getProofsToUse = (proofsAvailable, amount, order = 'desc') => {
  try {
    const proofsToSend = [];
    let amountAvailable = 0;
    if (order === 'desc') {
      proofsAvailable.sort((a, b) => b.amount - a.amount);
    } else {
      proofsAvailable.sort((a, b) => a.amount - b.amount);
    }

    proofsAvailable.forEach(proof => {
      if (amountAvailable >= amount) {
        return;
      }

      amountAvailable = amountAvailable + proof.amount;

      proofsToSend.push(proof);
    });
    return {proofsToUse: proofsToSend};
  } catch (err) {
    console.log('Getting proofs to use error', err);
  }
};

export const payLnInvoiceFromEcash = async ({quote, invoice, proofsToUse}) => {
  const mintURL = await getSelectedMint();
  const wallet = await initEcashWallet(mintURL);
  const walletProofsToDelete = JSON.parse(JSON.stringify(proofsToUse));
  let proofs = walletProofsToDelete;
  let returnChangeGlobal = [];
  const decodedInvoice = await parseInvoice(invoice);
  const amount = decodedInvoice.amountMsat / 1000;
  console.log('ecash quote fee reserve:', quote?.fee_reserve);
  const amountToPay = (quote?.fee_reserve || 5) + amount;
  console.log('Proofs before send', proofs);
  console.log(sumProofsValue(proofs), amountToPay);
  try {
    if (sumProofsValue(proofs) < amountToPay)
      throw new Error('Not enough funds to cover payment');
    console.log('[payLnInvoce] use send ', {
      amountToPay,
      amount,
      fee: quote?.fee_reserve,
      proofs: sumProofsValue(proofs),
    });
    const {keep: proofsToKeep, send: proofsToSend} = await wallet.send(
      amountToPay,
      proofs,
      {
        includeFees: true,
      },
    );
    console.log(proofsToKeep, 'PROOFS TO KEEP');
    console.log(proofsToSend, 'PROOFS TO SEND');
    if (proofsToKeep?.length) {
      returnChangeGlobal.push(...proofsToKeep);
    }

    proofs = proofsToSend;
    console.log('Proofs after send', proofs);

    const meltQuote = await wallet.createMeltQuote(invoice);
    let didPay = false;
    let runCount = 0;
    let meltResponse;
    while (runCount < 10 || didPay) {
      runCount += 1;
      try {
        const counter = await incrementMintCounter(mintURL);
        meltResponse = await wallet.meltProofs(meltQuote, proofs, {
          counter,
          keysetId: wallet.keysetId,
        });
        break;
      } catch (err) {
        console.log('in loop pay error', err);
      }
    }

    console.log('PAY RESPONSE', meltResponse);
    if (meltResponse?.change?.length) {
      returnChangeGlobal.push(...meltResponse?.change);
    }
    await removeProofs(walletProofsToDelete);
    const realFee = quote?.fee_reserve - sumProofsValue(meltResponse.change);
    const txObject = {
      amount: quote.amount,
      fee: realFee < 0 ? 0 : realFee,
      paymentType: 'sent',
      preImage: meltResponse.payment_preimage,
    };
    const formattedEcashTx = formatEcashTx(txObject);
    await storeProofs(returnChangeGlobal);
    await storeEcashTransactions([formattedEcashTx]);
    return new Promise(res =>
      setTimeout(() => {
        res(txObject);
      }, 1000),
    );
  } catch (err) {
    console.log('paying ln invoice from ecash error', err);
    await removeProofs(walletProofsToDelete);
    await storeProofs([...returnChangeGlobal, ...proofs]);
    return new Promise(res =>
      setTimeout(() => {
        res(false);
      }, 1000),
    );
  }
};

export {getECashInvoice, mintEcash, claimUnclaimedEcashQuotes, formatEcashTx};
