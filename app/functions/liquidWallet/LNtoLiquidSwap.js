import axios from 'axios';

import ecc from '@bitcoinerlab/secp256k1';
import {ECPairFactory} from 'ecpair';
import {crypto} from 'liquidjs-lib';
import {Musig, SwapTreeSerializer, TaprootUtils} from 'boltz-core';
import {deleteItem, retrieveData, storeData} from '../secureStore';
import {receivePayment} from '@breeztech/react-native-breez-sdk';
import {createLiquidSwap} from '../LBTC';
import {createLiquidReceiveAddress, gdk, sendLiquidTransaction} from '.';
import {getRandomBytes} from 'expo-crypto';

const ECPair = ECPairFactory(ecc);
export default async function createLNToLiquidSwap(
  swapAmountSats,
  setSendingAmount,
  toggleMasterInfoObject,
  masterInfoObject,
) {
  try {
    const pairSwapInfo = await getSwapPairInformation();

    if (!pairSwapInfo) new Error('no swap info');

    const sendingAmount =
      pairSwapInfo.limits.minimal > swapAmountSats ||
      pairSwapInfo.limits.maximal < swapAmountSats
        ? pairSwapInfo.limits.minimal + 500
        : swapAmountSats;

    setSendingAmount(sendingAmount);

    const [data, publicKey, privateKey, keys, preimage, liquidAddress] =
      await generateSwapInfo(pairSwapInfo.hash, sendingAmount);

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

async function getSwapPairInformation() {
  try {
    const request = await axios.get(
      'https://api.boltz.exchange/v2/swap/reverse',
    );
    const data = request.data['BTC']['L-BTC'];
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

async function generateSwapInfo(pairHash, swapAmountSats) {
  try {
    const [publicKey, privateKey, keys] = await getPublicKey();
    const preimage = getRandomBytes(32);

    const preimageHash = crypto.sha256(preimage).toString('hex');
    const liquidAddress = await createLiquidReceiveAddress();

    const request = await axios.post(
      `https://api.boltz.exchange/v2/swap/reverse`,
      {
        // invoiceAmount: 3000,
        // to: 'L-BTC',
        // from: 'BTC',
        // claimAddress: liquidAddress.address,
        // claimPublicKey: publicKey,
        // preimageHash: crypto.sha256(preimage).toString('hex'),

        from: 'BTC',
        to: 'L-BTC',
        preimageHash: preimageHash,
        claimPublicKey: publicKey,
        claimAddress: liquidAddress.address,
        invoiceAmount: swapAmountSats,
        // onchainAmount: swapAmountSats,
        pairHash: pairHash,
        // referralId: 'string',
        // address: 'string',
        // addressSignature: 'string',
        // claimCovenant: false,
      },
    );

    const data = request.data;

    return new Promise(resolve => {
      resolve([
        data,
        publicKey,
        privateKey,
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

async function getPublicKey() {
  // Create a random preimage for the swap; has to have a length of 32 bytes

  const liquidPrivKey = JSON.parse(await retrieveData('liquidKey'));

  const privateKey = Buffer.from(liquidPrivKey || getRandomBytes(32));
  const privateKeyString = privateKey.toString('hex');
  const keys = ECPair.fromPrivateKey(privateKey);
  const publicKey = ECPair.fromPrivateKey(privateKey).publicKey.toString('hex');

  return new Promise(resolve => resolve([publicKey, privateKeyString, keys]));
}
