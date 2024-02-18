import axios from 'axios';
import {generateSecureRandom} from 'react-native-securerandom';
import ecc from '@bitcoinerlab/secp256k1';
import {ECPairFactory} from 'ecpair';
const ECPair = ECPairFactory(ecc);

async function getSwapFee() {
  try {
    const request = await axios.get(
      'https://api.boltz.exchange/getfeeestimation',
    );
    const data = request.data;
    console.log(data);
  } catch (err) {
    console.log(err);
    return new Promise(resolve => {
      resolve(false);
    });
  }
}
async function getSwapPairInformation() {
  try {
    const request = await axios.get('https://api.boltz.exchange/getpairs');
    const data = request.data.pairs['L-BTC/BTC'];
    return new Promise(resolve => {
      resolve(data);
    });
  } catch (err) {
    console.log(err);
    return new Promise(resolve => {
      resolve(false);
    });
  }
}

async function createLiquidSwap(invoice, hash) {
  try {
    const randomBytesArray = await generateSecureRandom(32);
    const privateKey = Buffer.from(randomBytesArray);
    // Create a public key from the private key
    const publicKey =
      ECPair.fromPrivateKey(privateKey).publicKey.toString('hex');

    const url = 'https://api.boltz.exchange/createswap';
    // Set the Content-Type header to application/json
    const headers = {
      'Content-Type': 'application/json',
    };
    const postData = {
      type: 'submarine',
      pairId: 'L-BTC/BTC',
      orderSide: 'sell',
      invoice: invoice,
      //   pairHash: hash,
      refundPublicKey: publicKey,
    };

    const request = await axios.post(url, postData);

    return new Promise(resolve => {
      resolve(request.data);
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
