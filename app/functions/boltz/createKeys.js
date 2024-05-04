import axios from 'axios';
import {generateSecureRandom} from 'react-native-securerandom';
import ecc from '@bitcoinerlab/secp256k1';
import {ECPairFactory} from 'ecpair';

import {deleteItem, retrieveData, storeData} from '../secureStore';
import * as nostr from 'nostr-tools';
import {networks} from 'liquidjs-lib';

const ECPair = ECPairFactory(ecc);
export async function createBoltzSwapKeys() {
  const savedPrivateKeyHex = isJSON(await retrieveData('liquidKey'));
  const privateKey = savedPrivateKeyHex || nostr.generatePrivateKey();

  const privateKeyBuffer = Buffer.from(privateKey, 'hex', {
    networks: networks.testnet,
  });

  // Create a public key from the private key
  const keys = ECPair.fromPrivateKey(privateKeyBuffer, {
    network: networks.testnet,
  });

  const didStore =
    savedPrivateKeyHex === privateKey ||
    (await storeData('liquidKey', JSON.stringify(privateKey)));

  // const keys = ECPair.fromPrivateKey(privateKeyBuffer);

  if (!didStore) throw new error('could not store data');

  return new Promise(resolve => {
    resolve({
      privateKeyString: keys.privateKey.toString('hex'),
      keys: keys,
      publicKey: keys.publicKey.toString('hex'),
    });
  });
}

function isJSON(data) {
  try {
    return JSON.parse(data);
  } catch (err) {
    return data;
  }
}
