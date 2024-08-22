import {CashuMint, CashuWallet, getEncodedToken} from '@cashu/cashu-ts';
import {retrieveData} from '../secureStore';
import {mnemonicToSeed} from '@dreson4/react-native-quick-bip39';
import {parseInput} from '@breeztech/react-native-breez-sdk';
import {getLocalStorageItem, setLocalStorageItem} from '../localStorage';
import {storeProofs, getStoredProofs, removeProofs} from './proofStorage';
import {getPublicKey} from 'nostr-tools';
import {
  decryptMessage,
  encriptMessage,
} from '../messaging/encodingAndDecodingMessages';
import {sumProofsValue} from './proofs';

const mint = new CashuMint('https://mint.lnwallet.app');
const wallet = new CashuWallet(mint);

const wallets = {};

async function getECashInvoice({amount}) {
  try {
    let localStoredQuotes =
      JSON.parse(await getLocalStorageItem('ecashQuotes')) || [];

    localStoredQuotes = localStoredQuotes.filter(item => {
      const quoteDate = new Date(item.expiry * 1000);
      const currentDate = new Date();

      return !(quoteDate < currentDate && !item.paid);
    });

    const mintQuote = await wallet.createMintQuote(amount);
    localStoredQuotes.push(mintQuote);
    setLocalStorageItem('ecashQuotes', JSON.stringify(localStoredQuotes));
    console.log(mintQuote);
    return mintQuote;
  } catch (err) {
    console.log(err);
  }
}

// async function getWalletInfo() {
//   try {
//     const mneominc = await retrieveData('mnemonic');
//     const seed = mnemonicToSeed(mneominc);

//     const mint = new CashuMint('https://mint.nutmix.cash');
//     const wallet = new CashuWallet(mint, {mnemonicOrSeed: seed});

//     return wallet;
//   } catch (err) {
//     console.log(err);
//   }
// }

function getEcashBalance({contactsPrivateKey, masterInfoObject}) {
  const publicKey = getPublicKey(contactsPrivateKey);
  let savedProofs =
    typeof masterInfoObject.eCashProofs === 'string'
      ? [
          ...JSON.parse(
            decryptMessage(
              contactsPrivateKey,
              publicKey,
              masterInfoObject.eCashProofs,
            ),
          ),
        ]
      : [];

  const userBalance = savedProofs.reduce((prev, curr) => {
    const [proof] = curr;
    return (prev += proof.amount);
  }, 0);
  return userBalance;
}

async function mintEcash({
  invoice,
  quote,
  // contactsPrivateKey,
  // toggleMasterInfoObject,
  // masterInfoObject,
  mintURL,
}) {
  try {
    // const publicKey = getPublicKey(contactsPrivateKey);
    // const wallet = await getWalletInfo();

    // let savedProofs =
    //   typeof masterInfoObject.eCashProofs === 'string'
    //     ? [
    //         ...JSON.parse(
    //           decryptMessage(
    //             contactsPrivateKey,
    //             publicKey,
    //             masterInfoObject.eCashProofs,
    //           ),
    //         ),
    //       ]
    //     : [];

    const prasedInvoice = await parseInput(invoice);
    console.log(prasedInvoice.invoice.amountMsat);

    const info = await wallet.mintTokens(
      prasedInvoice.invoice.amountMsat / 1000,
      quote,
    );
    // savedProofs.push(info.proofs);

    console.log(info.proofs);

    await storeProofs(info.proofs);

    // toggleMasterInfoObject({
    //   eCashProofs: encriptMessage(
    //     contactsPrivateKey,
    //     publicKey,
    //     JSON.stringify(savedProofs),
    //   ),
    // });

    return true;
    console.log(info, 'TESTING');
  } catch (err) {
    console.log(err);
  }
}

async function checkMintQuote({quote}) {
  try {
    // const wallet = await getWalletInfo();
    const mintQuote = await wallet.checkMintQuote(quote);
    return mintQuote;
  } catch (err) {
    console.log(err);
  }
}

export const createWallet = async mintUrl => {
  const mnemonic = await retrieveData('mnemonic');

  const mint = new CashuMint(mintUrl);
  const seed = mnemonicToSeed(mnemonic);
  const keys = await mint.getKeys();
  const wallet = new CashuWallet(mint, keys, seed);

  wallets[mintUrl] = wallet;
  return wallet;
};

export async function checkFees(mintUrl, invoice) {
  const test = await wallet.getMintInfo();
  console.log(test);
  const {fee} = await CashuMint.checkMeltQuote(mintUrl, {pr: invoice});
  console.log(fee, 'CASHU PAY FEE');
  return fee;
}

export const sendEcashPayment = async (mintULR, invoice, fee = 2) => {
  try {
    // const wallet = await createWallet(mintULR);
    const {amountMsat} = (await parseInput(invoice)).invoice;
    const amount = amountMsat / 1000;
    if (!amount) {
      throw new Error('bad invoice amount');
    }
    const amountToPay = amount + fee;
    const proofs = await getStoredProofs();

    console.log(proofs, 'STORED PROFFS');

    if (!proofs?.length) {
      const {proofsToUse} = await getProofsToUse(mintULR, amountToPay);
      proofs = proofsToUse;
    }

    if (sumProofsValue(proofs) > amountToPay) {
      console.log(`[payLnInvoce] use send`, {
        amountToPay,
        amount,
        fee,
        proofs: sumProofsValue(proofs),
      });
      console.log(proofs, 'BEFORE SEND');

      const {send, returnChange, newKeys} = await wallet.send(amount, proofs);
      if (returnChange) {
        await storeProofs(returnChange);
      }
      if (result.spentProofs.length > 0) {
        await removeProofs(result.spentProofs);
      }
      proofs = send;
    } else {
      return {error: 'insufficent balance'};
    }

    console.log(proofs, 'AFTER SEND');
    const result = await wallet.payLnInvoice(invoice, proofs, fee);
    if (result?.newKeys) {
      _setKeys(mintULR, result.newKeys);
    }
    if (result?.change?.length) {
      await storeProofs(result.change);
    }
    if (result.isPaid) {
      await removeProofs(proofs);
    }
    const realFee = fee - sumProofsValue(result.change);
    if (realFee < 0) {
      console.log(
        '######################################## ERROR ####################################',
      );
      console.log({
        result,
        fee,
        realFee,
        amountToPay,
        amount,
        proofs: sumProofsValue(proofs),
      });
    }
    return {error: '', result, fee, realFee};

    // const storedProofs = await getStoredProofs();
    // CashuWallet.send();
    // const result = await wallet.pay(amount, recipientAddress, storedProofs);
    // if (result.spentProofs.length > 0) {
    //   await removeProofs(result.spentProofs);
    // }
    // return result;
  } catch (error) {
    console.error('Payment failed:', JSON.stringify(error, null, 2));
    console.error('Payment failed:', error.response);
  }
};

export async function getProofsToUse(mintURL, amount, order = 'desc') {
  const usableProofs = await getStoredProofs();
  const proofsToSend = [];
  let amountAvailable = 0;
  if (order === 'desc') {
    usableProofs.sort((a, b) => b.amount - a.amount);
  } else {
    usableProofs.sort((a, b) => a.amount - b.amount);
  }

  usableProofs.forEach(proof => {
    console.log(proof, 'T');
    if (amountAvailable >= amount) {
      return;
    }

    amountAvailable = amountAvailable + proof.amount;

    proofsToSend.push(proof);
  });
  return {proofsToUse: proofsToSend};
}

export {getECashInvoice, checkMintQuote, mintEcash, getEcashBalance};
