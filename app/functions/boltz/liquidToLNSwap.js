import axios from 'axios';
import {createBoltzSwapKeys} from './createKeys';
import {getBoltzSwapPairInformation} from './boltzSwapInfo';
import {getBoltzApiUrl} from './boltzEndpoitns';

export default async function createLiquidToLNSwap(invoice) {
  try {
    const pairSwapInfo = await getBoltzSwapPairInformation('liquid-ln');
    if (!pairSwapInfo) throw Error('no swap info');

    const {privateKeyString, keys, publicKey} = await createBoltzSwapKeys();

    const url = `${getBoltzApiUrl(
      process.env.BOLTZ_ENVIRONMENT,
    )}/v2/swap/submarine`;

    const postData = {
      invoice: invoice,
      to: 'BTC',
      from: 'L-BTC',
      refundPublicKey: publicKey,
      referralId: 'blitzWallet',
    };

    console.log(postData);

    const request = await axios.post(url, postData);

    return new Promise(resolve => {
      resolve({
        swapInfo: request.data,
        privateKey: privateKeyString,
      });
    });
  } catch (err) {
    console.log(err);
    return new Promise(resolve => resolve(false));
  }
}
