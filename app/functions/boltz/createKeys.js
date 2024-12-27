import ecc from '@bitcoinerlab/secp256k1';
import {ECPairFactory} from 'ecpair';
import crypto from 'react-native-quick-crypto';
import {networks as liquidNetworks} from 'liquidjs-lib';

import {Buffer} from 'buffer';
import {getRandomBytes} from 'expo-crypto';

const ECPair = ECPairFactory(ecc);

export async function createBoltzSwapKeys() {
  // const savedPrivateKeyHex = isJSON(await retrieveData('liquidKey'));
  const privateKey = makeRandom();

  // Create a public key from the private key
  const keys = ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'), {
    network:
      process.env.BOLTZ_ENVIRONMENT === 'testnet'
        ? liquidNetworks.testnet
        : liquidNetworks.liquid,
  });

  // const didStore =
  //   savedPrivateKeyHex === privateKey ||
  //   (await storeData('liquidKey', JSON.stringify(privateKey)));

  // if (!didStore) throw new Error('could not store data');

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
    network:
      process.env.BOLTZ_ENVIRONMENT === 'testnet'
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
