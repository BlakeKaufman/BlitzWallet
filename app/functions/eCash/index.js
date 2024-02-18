import {CashuMint, CashuWallet, getEncodedToken} from '@cashu/cashu-ts';
import {retrieveData} from '../secureStore';
import {mnemonicToSeed} from '@breeztech/react-native-breez-sdk';

async function getWallet() {
  try {
    const mint = new CashuMint(
      'https://legend.lnbits.com/cashu/api/v1/Ue2M2UoaY8wdGsbZ4SbY9N',
    );
    // const keys = await mint.getKeys();
    const mnemonic = await retrieveData('mnemonic');
    const seed = await mnemonicToSeed(mnemonic);

    const wallet = new CashuWallet(mint);
    const value = await generateMintRequest(wallet, 1);
    invoiceHasBeenPaid(wallet, 1, value.hash);

    return new Promise(resolve => {
      resolve(wallet);
    });
  } catch (err) {
    console.log(err);
    return new Promise(resolve => {
      resolve(false);
    });
  }
}

async function generateMintRequest(wallet, amount) {
  try {
    const {pr, hash} = await wallet.requestMint(amount);
    console.log(pr);
    console.log(hash);

    return new Promise(resolve => {
      resolve({lnInvoice: pr, hash: hash});
    });
  } catch (err) {
    console.log(err);
  }
}

async function invoiceHasBeenPaid(wallet, balance, hash) {
  const {proofs} = await wallet.requestTokens(balance, hash);
  //Encoded proofs can be spent at the mint
  // const encoded = getEncodedToken({
  //   token: [
  //     {
  //       mint: 'https://legend.lnbits.com/cashu/api/v1/Ue2M2UoaY8wdGsbZ4SbY9N',
  //       proofs,
  //     },
  //   ],
  // });
  console.log(proofs);
}

export {getWallet, generateMintRequest};
