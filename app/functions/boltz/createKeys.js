import axios from 'axios';
import {generateSecureRandom} from 'react-native-securerandom';
import ecc from '@bitcoinerlab/secp256k1';
import {ECPairFactory} from 'ecpair';

import {retrieveData, storeData} from '../secureStore';

const ECPair = ECPairFactory(ecc);
export async function createBoltzSwapKeys() {
  const liquidPrivKey = JSON.parse(await retrieveData('liquidKey'));

  const randomBytesArray = await generateSecureRandom(32);

  const privateKey = Buffer.from(liquidPrivKey || randomBytesArray);

  // Create a public key from the private key
  const publicKey = ECPair.fromPrivateKey(privateKey).publicKey.toString('hex');

  const privateKeyString = privateKey.toString('hex');

  const didStore =
    privateKey.toString('hex') === liquidPrivKey.toString('hex') ||
    (await storeData('liquidKey', JSON.stringify(privateKey)));

  const keys = ECPair.fromPrivateKey(privateKey);

  if (!didStore) throw new error('could not store data');

  return new Promise(resolve => {
    resolve({
      privateKeyString: privateKeyString,
      keys: keys,
      publicKey: publicKey,
    });
  });
}
