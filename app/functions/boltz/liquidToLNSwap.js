import axios from 'axios';
import {createBoltzSwapKeys} from './createKeys';
import {getBoltzSwapPairInformation} from './boltzSwapInfo';

export default async function createLiquidToLNSwap(invoice) {
  try {
    const pairSwapInfo = await getBoltzSwapPairInformation('liquid-ln');
    if (!pairSwapInfo) new Error('no swap info');

    const {privateKeyString, keys, publicKey} = await createBoltzSwapKeys();

    const url = `${process.env.BOLTZ_API}/v2/swap/submarine`;

    const postData = {
      invoice:
        'lntb25u1pnr2r2upp5dxwz865w7fygymr692cmtqavxtgw37m6fxtt3qnk6paa736n6g9qdqqcqzzsxqyz5vqsp5nlsva93lrtnk3ger38zh8p7ywuvg9wyda4etgp9y563vndfpzkrq9qyyssq8cg7kvm3lj5e8lx7vfrm9mx7uxnv9mqkdmht8yk66l6yrra06qjn8445yagerenl5pg6pmgklhn5u66wall45vmxgef68vvcefs863cpgcldz0',
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
