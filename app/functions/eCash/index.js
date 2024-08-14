import {CashuMint, CashuWallet, getEncodedToken} from '@cashu/cashu-ts';
import {retrieveData} from '../secureStore';
import {mnemonicToSeed} from '@dreson4/react-native-quick-bip39';
import {parseInput} from '@breeztech/react-native-breez-sdk';
import {getLocalStorageItem, setLocalStorageItem} from '../localStorage';
import {getPublicKey} from 'nostr-tools';
import {
  decryptMessage,
  encriptMessage,
} from '../messaging/encodingAndDecodingMessages';

const mint = new CashuMint('https://mint.lnwallet.app');
const wallet = new CashuWallet(mint);

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
  contactsPrivateKey,
  toggleMasterInfoObject,
  masterInfoObject,
}) {
  try {
    const publicKey = getPublicKey(contactsPrivateKey);
    // const wallet = await getWalletInfo();
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

    const prasedInvoice = await parseInput(invoice);
    console.log(prasedInvoice.invoice.amountMsat);

    const info = await wallet.mintTokens(
      prasedInvoice.invoice.amountMsat / 1000,
      quote,
    );
    savedProofs.push(info.proofs);

    toggleMasterInfoObject({
      eCashProofs: encriptMessage(
        contactsPrivateKey,
        publicKey,
        JSON.stringify(savedProofs),
      ),
    });

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

export {getECashInvoice, checkMintQuote, mintEcash, getEcashBalance};
