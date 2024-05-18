import axios from 'axios';
import {generateSecureRandom} from 'react-native-securerandom';
import ecc from '@bitcoinerlab/secp256k1';
import {ECPairFactory, networks} from 'ecpair';

import {deleteItem, retrieveData, storeData} from '../secureStore';
import * as nostr from 'nostr-tools';
import {getRandomBytes} from 'expo-crypto';
import {networks as liquidNetworks} from 'liquidjs-lib';

const ECPair = ECPairFactory(ecc);

export async function createBoltzSwapKeys() {
  // deleteItem('liquidKey');
  const savedPrivateKeyHex = isJSON(await retrieveData('liquidKey'));
  const privateKey = savedPrivateKeyHex || makeRandom();

  const privateKeyBuffer = Buffer.from(privateKey, 'hex');

  // Create a public key from the private key
  const keys = ECPair.fromPrivateKey(privateKeyBuffer, {
    // network: liquidNetworks.testnet,
  });

  const didStore =
    savedPrivateKeyHex === privateKey ||
    (await storeData('liquidKey', JSON.stringify(privateKey)));

  // const keys = ECPair.fromPrivateKey(privateKeyBuffer);

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
    // network: liquidNetworks.testnet,
  }).privateKey.toString('hex');
};

function isJSON(data) {
  try {
    return JSON.parse(data);
  } catch (err) {
    return data;
  }
}
