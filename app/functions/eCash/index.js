import {
  CashuMint,
  CashuWallet,
  CheckStateEnum,
  getEncodedToken,
} from '@cashu/cashu-ts';
import {retrieveData} from '../secureStore';
import {mnemonicToSeed} from '@dreson4/react-native-quick-bip39';
import {parseInput} from '@breeztech/react-native-breez-sdk';
import {getLocalStorageItem, setLocalStorageItem} from '../localStorage';
// import {storeProofs, getStoredProofs, removeProofs} from './proofStorage';
import {getPublicKey} from 'nostr-tools';
import {
  decryptMessage,
  encriptMessage,
} from '../messaging/encodingAndDecodingMessages';
import {sumProofsValue} from './proofs';
import {BLITZ_DEFAULT_PAYMENT_DESCRIPTION} from '../../constants';

const wallets = {};

async function getECashInvoice({amount, mintURL, descriptoin}) {
  try {
    const wallet = await createWallet(mintURL);
    console.log(wallet);
    let localStoredQuotes =
      JSON.parse(await getLocalStorageItem('ecashQuotes')) || [];

    localStoredQuotes = localStoredQuotes.filter(item => {
      const quoteDate = new Date(item.expiry * 1000);
      const currentDate = new Date();

      return !(quoteDate < currentDate && !item.paid);
    });

    const mintQuote = await wallet.createMintQuote(
      amount,
      descriptoin || BLITZ_DEFAULT_PAYMENT_DESCRIPTION,
    );
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

// async function getEcashBalance() {
//   const savedProofs = await getStoredProofs();
//   // const publicKey = getPublicKey(contactsPrivateKey);
//   // let savedProofs =
//   //   typeof masterInfoObject.eCashProofs === 'string'
//   //     ? [
//   //         ...JSON.parse(
//   //           decryptMessage(
//   //             contactsPrivateKey,
//   //             publicKey,
//   //             masterInfoObject.eCashProofs,
//   //           ),
//   //         ),
//   //       ]
//   //     : [];

//   const userBalance = savedProofs.reduce((prev, curr) => {
//     const proof = curr;
//     return (prev += proof.amount);
//   }, 0);
//   return userBalance;
// }

async function mintEcash({
  invoice,
  quote,
  // contactsPrivateKey,
  // toggleMasterInfoObject,
  // masterInfoObject,
  mintURL,
}) {
  try {
    const wallet = await createWallet(mintURL);
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

    const info = await wallet.mintProofs(
      prasedInvoice.invoice.amountMsat / 1000,
      quote,
    );
    // savedProofs.push(info.proofs);

    console.log(info.proofs);

    // await storeProofs(info.proofs);

    // toggleMasterInfoObject({
    //   eCashProofs: encriptMessage(
    //     contactsPrivateKey,
    //     publicKey,
    //     JSON.stringify(savedProofs),
    //   ),
    // });

    console.log(info, 'TESTING');
    return {parsedInvoie: prasedInvoice, proofs: info};
  } catch (err) {
    console.log(err);
    return {parsedInvoie: null};
  }
}

async function checkMintQuote({quote, mintURL}) {
  try {
    const wallet = await createWallet(mintURL);
    const mintQuote = await wallet.checkMintQuote(quote);
    return mintQuote;
  } catch (err) {
    console.log(err, 'CHECK MINT QUOTE ERROR');
  }
}

export const createWallet = async mintUrl => {
  if (wallets[mintUrl]) return wallets[mintUrl];
  const mnemonic = await retrieveData('mnemonic');

  const mint = new CashuMint(mintUrl);
  const seed = mnemonicToSeed(mnemonic);
  const keys = await mint.getKeys();

  const wallet = new CashuWallet(mint, {
    bip39seed: seed,
  });
  await wallet.loadMint();

  wallets[mintUrl] = wallet;
  return wallet;
};

// export async function checkFees(mintUrl, invoice) {
//   const wallet = await createWallet('https://mint.lnwallet.app');
//   const {fee_reserve} = await wallet.createMeltQuote(invoice);
//   console.log(fee_reserve, 'CASHU PAY FEE');
//   return fee_reserve;
// }

export async function cleanEcashWalletState(currentMint) {
  const wallet = await createWallet(currentMint.mintURL);
  const usableProofs = currentMint.proofs;

  const spentProofs = await wallet.checkProofsStates(usableProofs);

  return usableProofs.filter((proof, index) => {
    return spentProofs[index].state === CheckStateEnum.SPENT;
  });
}

// export async function sendEcashPayment(bolt11Invoice, mintURL) {
//   const wallet = await createWallet(mintURL);
//   const meltQuote = await wallet.createMeltQuote(bolt11Invoice);
//   const eCashBalance = await getEcashBalance();

//   const {proofsToUse} = await getProofsToUse(
//     null,
//     meltQuote.amount + meltQuote.fee_reserve,
//     'desc',
//   );

//   if (
//     proofsToUse.length === 0 ||
//     eCashBalance < meltQuote.amount + meltQuote.fee_reserve
//   ) {
//     return false;
//   } else {
//     return {quote: meltQuote, proofsToUse};
//   }
// }

export async function sendEcashToLightningPayment({
  wallet,
  proofsToSend,
  invoice,
}) {
  try {
    const meltQuote = await wallet.createMeltQuote(invoice);
    const meltResponse = await wallet.meltProofs(meltQuote, proofsToSend);

    return {...meltResponse, isPaid: true};
  } catch (err) {
    console.log(err);
    return {isPaid: false};
  }
}

export function formatEcashTx({time, amount, paymentType, fee, preImage}) {
  let txObject = {
    time: null,
    amount: null,
    type: 'ecash',
    paymentType: null,
    fee: null,
    preImage: null,
  };
  txObject['time'] = time;
  txObject['amount'] = amount;
  txObject['paymentType'] = paymentType;
  txObject['fee'] = fee;
  txObject['preImage'] = preImage;

  return txObject;
}

export function getProofsToUse(storedProofs, amount, order = 'desc') {
  const proofsAvailable = storedProofs;
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

export {getECashInvoice, checkMintQuote, mintEcash};
