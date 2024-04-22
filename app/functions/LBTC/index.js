import axios from 'axios';
import {generateSecureRandom} from 'react-native-securerandom';
import ecc from '@bitcoinerlab/secp256k1';
import {ECPairFactory} from 'ecpair';
import {crypto} from 'liquidjs-lib';
import {Musig, SwapTreeSerializer, TaprootUtils} from 'boltz-core';
import {retrieveData, storeData} from '../secureStore';

const ECPair = ECPairFactory(ecc);
async function getSwapFee() {
  try {
    const request = await axios.get(
      'https://api.boltz.exchange/getfeeestimation',
    );
    const data = request.data;
  } catch (err) {
    console.log(err);
    return new Promise(resolve => {
      resolve(false);
    });
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

async function createLiquidSwap(invoice, hash) {
  try {
    console.log(invoice);
    const liquidPrivKey = JSON.parse(await retrieveData('liquidKey'));

    const randomBytesArray = await generateSecureRandom(32);

    const privateKey = Buffer.from(liquidPrivKey || randomBytesArray);

    // Create a public key from the private key
    const publicKey =
      ECPair.fromPrivateKey(privateKey).publicKey.toString('hex');

    const privateKeyString = privateKey.toString('hex');

    const didStore = await storeData('liquidKey', JSON.stringify(privateKey));

    if (!didStore) throw new error('could not store data');

    const url = 'https://api.boltz.exchange/v2/swap/submarine';

    const postData = {
      invoice: invoice,
      to: 'BTC',
      from: 'L-BTC',
      refundPublicKey: publicKey,
    };

    const request = await axios.post(url, postData);

    return new Promise(resolve => {
      resolve([request.data, privateKeyString]);
    });

    // console.log(request.data);
  } catch (err) {
    console.log(err);
    return new Promise(resolve => {
      resolve(false);
    });
  }
}

export {getSwapFee, getSwapPairInformation, createLiquidSwap};
