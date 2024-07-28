import axios from 'axios';
import {createBoltzSwapKeys} from './createKeys';
import {getBoltzSwapPairInformation} from './boltzSwapInfo';
import {sha256} from 'liquidjs-lib/src/crypto';
import crypto from 'react-native-quick-crypto';

import {getBoltzApiUrl} from './boltzEndpoitns';
import {createLiquidReceiveAddress} from '../liquidWallet';

export default async function createLNToLiquidSwap(
  swapAmountSats,
  description,
  setSendingAmount,
  frompage,
  toggleMasterInfoObject,
  masterInfoObject,
) {
  try {
    const pairSwapInfo = await getBoltzSwapPairInformation('ln-liquid');

    if (!pairSwapInfo) new Error('no swap info');

    // const sendingAmount =
    //   frompage === 'lnurlWithdrawl'
    //     ? swapAmountSats
    //     : pairSwapInfo.limits.minimal >= swapAmountSats ||
    //       pairSwapInfo.limits.maximal < swapAmountSats
    //     ? pairSwapInfo.limits.minimal + 500
    //     : swapAmountSats;

    // if (setSendingAmount && swapAmountSats != sendingAmount) {
    //   setSendingAmount(sendingAmount);
    //   return;
    // }

    const [data, publicKey, privateKey, keys, preimage, liquidAddress] =
      await genertaeLNtoLiquidSwapInfo(
        pairSwapInfo.hash,
        swapAmountSats,
        description,
      );

    return new Promise(resolve =>
      resolve([
        data,
        pairSwapInfo,
        publicKey,
        privateKey,
        keys,
        preimage,
        liquidAddress,
      ]),
    );
  } catch (err) {
    return new Promise(resolve => resolve(false));
  }
}

async function genertaeLNtoLiquidSwapInfo(
  pairHash,
  swapAmountSats,
  description,
) {
  try {
    const {publicKey, privateKeyString, keys} = await createBoltzSwapKeys();
    const preimage = crypto.randomBytes(32);

    const preimageHash = sha256(preimage).toString('hex');

    const liquidAddress = await createLiquidReceiveAddress();
    const signature = keys.signSchnorr(
      sha256(Buffer.from(liquidAddress.address, 'utf-8')),
    );

    console.log(liquidAddress.address);

    const data = (
      await axios.post(
        `${getBoltzApiUrl(process.env.BOLTZ_ENVIRONMENT)}/v2/swap/reverse`,
        {
          address: liquidAddress.address,
          addressSignature: signature.toString('hex'),
          claimPublicKey: keys.publicKey.toString('hex'),
          from: 'BTC',
          invoiceAmount: swapAmountSats,
          preimageHash: preimageHash,
          to: 'L-BTC',
          referralId: 'blitzWallet',
          description: description || 'Send to Blitz Wallet',
        },
      )
    ).data;

    return new Promise(resolve => {
      resolve([
        data,
        publicKey,
        privateKeyString,
        keys,
        preimage.toString('hex'),
        liquidAddress.address,
      ]);
    });
  } catch (err) {
    console.log(err, 'ERR');
    return new Promise(resolve => {
      resolve(false);
    });
  }
}
