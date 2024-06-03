import ecc from '@bitcoinerlab/secp256k1';
import {ECPairFactory, networks} from 'ecpair';

import {deleteItem, retrieveData, storeData} from '../secureStore';

import {getRandomBytes} from 'expo-crypto';
import {networks as liquidNetworks} from 'liquidjs-lib';

import BIP32Factory from 'bip32';

const ECPair = ECPairFactory(ecc);
const bip32 = BIP32Factory(ecc);

export async function createBoltzSwapKeys() {
  const savedPrivateKeyHex = isJSON(await retrieveData('liquidKey'));
  const privateKey = savedPrivateKeyHex || makeRandom();

  // Create a public key from the private key
  const keys = ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'), {
    network: process.env.BOLTZ_API.includes('testnet')
      ? liquidNetworks.testnet
      : liquidNetworks.liquid,
  });

  const didStore =
    savedPrivateKeyHex === privateKey ||
    (await storeData('liquidKey', JSON.stringify(privateKey)));

  if (!didStore) throw new Error('could not store data');

  return new Promise(resolve => {
    resolve({
      privateKeyString: keys.privateKey.toString('hex'),
      keys: keys,
      publicKey: keys.publicKey.toString('hex'),
    });
  });
}

const makeRandom = () => {
  return ECPair.fromPrivateKey(Buffer.from(getRandomBytes(32)), {
    network: process.env.BOLTZ_API.includes('testnet')
      ? liquidNetworks.testnet
      : liquidNetworks.liquid,
  }).privateKey.toString('hex');
};

function isJSON(data) {
  try {
    return JSON.parse(data);
  } catch (err) {
    return data;
  }
}
