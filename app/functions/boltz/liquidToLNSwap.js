import axios from 'axios';
import {generateSecureRandom} from 'react-native-securerandom';
import ecc from '@bitcoinerlab/secp256k1';
import {ECPairFactory} from 'ecpair';
import {crypto} from 'liquidjs-lib';
import {Musig, SwapTreeSerializer, TaprootUtils} from 'boltz-core';
import {retrieveData, storeData} from '../secureStore';
import {receivePayment} from '@breeztech/react-native-breez-sdk';

import {gdk, sendLiquidTransaction} from '../liquidWallet';
import {createBoltzSwapKeys} from './createKeys';
import {getBoltzSwapPairInformation} from './boltzSwapInfo';

export default async function createLiquidToLNSwap(invoice) {
  try {
    const pairSwapInfo = await getBoltzSwapPairInformation('liquid-ln');
    if (!pairSwapInfo) new Error('no swap info');

    // const adjustedSatAmount = Math.round(
    //   swapAmountSats -
    //     pairSwapInfo.fees.minerFees -
    //     swapAmountSats * (pairSwapInfo.fees.percentage / 100),
    // );

    // const invoice = await receivePayment({
    //   amountMsat: adjustedSatAmount * 1000,
    //   description: 'Auto channel open',
    // });

    // if (invoice) {

    const [swapInfo, privateKey] = await getLiquidtoLNSwapInfo(
      invoice?.lnInvoice?.bolt11 || invoice,
      pairSwapInfo.hash,
    );

    // const didSend = await sendLiquidTransaction(
    //   swapAmountSats,
    //   swapInfo.address,
    // );

    // if (didSend) {

    // toggleMasterInfoObject({
    //   failedLiquidSwaps: [...masterInfoObject.failedLiquidSwaps].concat(
    //     claimItem,
    //   ),
    // });
    return new Promise(resolve =>
      resolve({
        swapInfo: swapInfo,
        privateKey: privateKey,
      }),
    );
    // } else {
    //   return new Promise(resolve => resolve(false));
    // }
    // } else {
    //   return new Promise(resolve => resolve(false));
    // }
  } catch (err) {
    return new Promise(resolve => resolve(false));
  }
}

export async function getLiquidtoLNSwapInfo(invoice, hash) {
  try {
    const {privateKeyString, keys, publicKey} = await createBoltzSwapKeys();

    const url = `${process.env.BOLTZ_API}/v2/swap/submarine`;

    const postData = {
      invoice: invoice,
      to: 'BTC',
      from: 'L-BTC',
      refundPublicKey: publicKey,
    };

    const request = await axios.post(url, postData);

    return new Promise(resolve => {
      resolve([request.data, privateKeyString, keys]);
    });

    // console.log(request.data);
  } catch (err) {
    console.log(err, 'CERATE LIQUID SWAP ERROR');
    return new Promise(resolve => {
      resolve([false, false]);
    });
  }
}
