import axios from 'axios';

// import {crypto, networks} from 'liquidjs-lib';
import {createLiquidReceiveAddress} from '../liquidWallet';
import {getRandomBytes} from 'expo-crypto';
import {createBoltzSwapKeys} from './createKeys';
import {getBoltzSwapPairInformation} from './boltzSwapInfo';
import * as crypto from 'react-native-quick-crypto';
import {sha256} from 'liquidjs-lib/src/crypto';

export default async function createLNToLiquidSwap(
  swapAmountSats,
  setSendingAmount,
  toggleMasterInfoObject,
  masterInfoObject,
) {
  try {
    const pairSwapInfo = await getBoltzSwapPairInformation('ln-liquid');

    if (!pairSwapInfo) new Error('no swap info');

    const sendingAmount =
      pairSwapInfo.limits.minimal > swapAmountSats ||
      pairSwapInfo.limits.maximal < swapAmountSats
        ? pairSwapInfo.limits.minimal + 500
        : swapAmountSats;

    setSendingAmount &&
      swapAmountSats != sendingAmount &&
      setSendingAmount(sendingAmount);

    const [data, publicKey, privateKey, keys, preimage, liquidAddress] =
      await genertaeLNtoLiquidSwapInfo(pairSwapInfo.hash, sendingAmount);

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

async function genertaeLNtoLiquidSwapInfo(pairHash, swapAmountSats) {
  try {
    const {publicKey, privateKeyString, keys} = await createBoltzSwapKeys();
    const preimage = getRandomBytes(32);

    const preimageHash = sha256(preimage).toString('hex');

    const liquidAddress = await createLiquidReceiveAddress();

    // console.log(liquidAddress, process.env.BOLTZ_API);

    const request = await axios.post(
      `${process.env.BOLTZ_API}/v2/swap/reverse`,
      {
        from: 'BTC',
        to: 'L-BTC',
        preimageHash: preimageHash,
        claimPublicKey: publicKey,
        // claimAddress: liquidAddress.address,
        // invoiceAmount: swapAmountSats,
        invoiceAmount: swapAmountSats,
        // onchainAmount: swapAmountSats,
        pairHash: pairHash,
        // referralId: 'string',
        // address: liquidAddress.address,
        // addressSignature: 'string',
        // claimCovenant: false,
      },
    );

    const data = request.data;

    return new Promise(resolve => {
      resolve([
        data,
        publicKey,
        privateKeyString,
        keys,
        preimageHash,
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
