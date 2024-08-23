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

const wallets = {};

async function getECashInvoice({amount}) {
  try {
    const wallet = await createWallet('https://mint.lnwallet.app');
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

async function getEcashBalance() {
  const savedProofs = await getStoredProofs();
  // const publicKey = getPublicKey(contactsPrivateKey);
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

  const userBalance = savedProofs.reduce((prev, curr) => {
    const proof = curr;
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
    const wallet = await createWallet('https://mint.lnwallet.app');
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

    return {parsedInvoie: prasedInvoice};
    console.log(info, 'TESTING');
  } catch (err) {
    return {parsedInvoie: null};
    console.log(err);
  }
}

async function checkMintQuote({quote}) {
  try {
    const wallet = await createWallet('https://mint.lnwallet.app');
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
  const wallet = await createWallet('https://mint.lnwallet.app');
  const {fee_reserve} = await wallet.createMeltQuote(invoice);
  console.log(fee_reserve, 'CASHU PAY FEE');
  return fee_reserve;
}

export async function cleanEcashWalletState() {
  const wallet = await createWallet('https://mint.lnwallet.app');
  const usableProofs = await getStoredProofs();
  const spentProofs = await wallet.checkProofsSpent(usableProofs);
  await removeProofs(spentProofs);
}

export async function sendEcashPayment(bolt11Invoice) {
  const wallet = await createWallet('https://mint.lnwallet.app');
  const meltQuote = await wallet.createMeltQuote(bolt11Invoice);
  const eCashBalance = await getEcashBalance();

  const {proofsToUse} = await getProofsToUse(
    null,
    meltQuote.amount + meltQuote.fee_reserve,
    'desc',
  );

  if (
    proofsToUse.length === 0 ||
    eCashBalance < meltQuote.amount + meltQuote.fee_reserve
  ) {
    return false;
  } else {
    return {quote: meltQuote, proofsToUse};
  }
}

export function formatEcashTx({time, amount, paymentType, fee}) {
  let txObject = {
    time: null,
    amount: null,
    type: 'ecash',
    paymentType: null,
    fee: null,
  };
  txObject['time'] = time;
  txObject['amount'] = amount;
  txObject['paymentType'] = paymentType;
  txObject['fee'] = fee;

  return txObject;
}

export async function getProofsToUse(mintURL, amount, order = 'desc') {
  const proofsAvailable = await getStoredProofs();
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
}

export {getECashInvoice, checkMintQuote, mintEcash, getEcashBalance};
