import axios from 'axios';
import {generateSecureRandom} from 'react-native-securerandom';
import ecc from '@bitcoinerlab/secp256k1';
import {ECPairFactory} from 'ecpair';
import {crypto} from 'liquidjs-lib';
import {Musig, SwapTreeSerializer, TaprootUtils} from 'boltz-core';
import {retrieveData, storeData} from '../secureStore';
import {receivePayment} from '@breeztech/react-native-breez-sdk';
import {createLiquidSwap} from '../LBTC';
import {gdk, sendLiquidTransaction} from '.';

export default async function createLiquidToLNSwap(
  swapAmountSats,
  toggleMasterInfoObject,
  masterInfoObject,
) {
  try {
    const pairSwapInfo = await getSwapPairInformation();
    if (!pairSwapInfo) new Error('no swap info');

    const adjustedSatAmount = Math.round(
      swapAmountSats -
        pairSwapInfo.fees.minerFees -
        swapAmountSats * (pairSwapInfo.fees.percentage / 100),
    );

    const invoice = await receivePayment({
      amountMsat: adjustedSatAmount * 1000,
      description: 'Auto channel open',
    });

    if (invoice) {
      const [swapInfo, privateKey] = await createLiquidSwap(
        invoice.lnInvoice.bolt11,
        pairSwapInfo.hash,
      );

      const didSend = await sendLiquidTransaction(
        swapAmountSats,
        swapInfo.address,
      );

      if (didSend) {
        const claimItem = {
          id: swapInfo.id,
          asset: 'L-BTC',
          version: 3,
          privateKey: privateKey,
          blindingKey: swapInfo.blindingKey,
          claimPublicKey: swapInfo.claimPublicKey,
          timeoutBlockHeight: swapInfo.timeoutBlockHeight,
          swapTree: swapInfo.swapTree,
          adjustedSatAmount: adjustedSatAmount,
        };
        toggleMasterInfoObject({
          failedLiquidSwaps: [...masterInfoObject.failedLiquidSwaps].concat(
            claimItem,
          ),
        });
        return new Promise(resolve => resolve(true));
      } else {
        return new Promise(resolve => resolve(false));
      }
    } else {
      return new Promise(resolve => resolve(false));
    }
  } catch (err) {
    return new Promise(resolve => resolve(false));
  }
}

async function getSwapPairInformation() {
  try {
    const request = await axios.get(
      'https://api.boltz.exchange/v2/swap/submarine',
    );
    const data = request.data['L-BTC']['BTC'];
    return new Promise(resolve => {
      resolve(data);
    });
  } catch (err) {
    console.log(err, 'ERR');
    return new Promise(resolve => {
      resolve(false);
    });
  }
}
