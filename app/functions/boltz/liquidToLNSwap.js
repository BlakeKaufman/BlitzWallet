import axios from 'axios';
import {createBoltzSwapKeys} from './createKeys';
import {getBoltzSwapPairInformation} from './boltzSwapInfo';

export default async function createLiquidToLNSwap(invoice) {
  try {
    const pairSwapInfo = await getBoltzSwapPairInformation('liquid-ln');
    if (!pairSwapInfo) new Error('no swap info');

    const {privateKeyString, keys, publicKey} = await createBoltzSwapKeys();

    const url = `${process.env.BOLTZ_API}/v2/swap/submarine`;

    console.log(invoice);

    const postData = {
      invoice: invoice,
      to: 'BTC',
      from: 'L-BTC',
      refundPublicKey: publicKey,
    };

    const request = await axios.post(url, postData);

    console.log(request.data);

    return new Promise(resolve => {
      resolve({
        swapInfo: request.data,
        privateKey: privateKeyString,
      });
    });
  } catch (err) {
    return new Promise(resolve => resolve(false));
  }
}

// export async function getLiquidtoLNSwapInfo(invoice, hash) {
//   try {
//     const {privateKeyString, keys, publicKey} = await createBoltzSwapKeys();

//     const url = `${process.env.BOLTZ_API}/v2/swap/submarine`;

//     const postData = {
//       invoice: invoice,
//       to: 'BTC',
//       from: 'L-BTC',
//       refundPublicKey: publicKey,
//     };

//     const request = await axios.post(url, postData);

//     return new Promise(resolve => {
//       resolve([request.data, privateKeyString, keys]);
//     });

//     // console.log(request.data);
//   } catch (err) {
//     console.log(err, 'CERATE LIQUID SWAP ERROR');
//     return new Promise(resolve => {
//       resolve([false, false]);
//     });
//   }
// }
