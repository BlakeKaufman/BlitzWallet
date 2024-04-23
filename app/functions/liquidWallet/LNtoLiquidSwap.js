import axios from 'axios';

import ecc from '@bitcoinerlab/secp256k1';
import {ECPairFactory} from 'ecpair';
import {crypto} from 'liquidjs-lib';
import {Musig, SwapTreeSerializer, TaprootUtils} from 'boltz-core';
import {retrieveData, storeData} from '../secureStore';
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
    console.log('TEST');
    const pairSwapInfo = await getSwapPairInformation();

    if (!pairSwapInfo) new Error('no swap info');

    const sendingAmount =
      pairSwapInfo.limits.minimal > swapAmountSats ||
      pairSwapInfo.limits.maximal < swapAmountSats
        ? pairSwapInfo.limits.minimal + 500
        : swapAmountSats;

    setSendingAmount(sendingAmount);

    const [data, publicKey, privateKey] = await createLNtoLiquidSwap(
      pairSwapInfo.hash,
      sendingAmount,
    );

    console.log(data.refundPublicKey);

    return new Promise(resolve =>
      resolve([data, pairSwapInfo, publicKey, privateKey]),
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

async function createLNtoLiquidSwap(pairHash, swapAmountSats) {
  try {
    const [publicKey, privateKey] = await getPublicKey();
    const preimage = getRandomBytes(32);

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
        preimageHash: crypto.sha256(preimage).toString('hex'),
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
      resolve([data, publicKey, privateKey]);
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

  const privateKey = Buffer.from(liquidPrivKey || randomBytesArray);
  const privateKeyString = privateKey.toString('hex');

  // Create a public key from the private key
  const publicKey = ECPair.fromPrivateKey(privateKey).publicKey.toString('hex');
  const didStore = await storeData('liquidKey', JSON.stringify(privateKey));

  return new Promise(resolve => resolve([publicKey, privateKeyString]));
}
