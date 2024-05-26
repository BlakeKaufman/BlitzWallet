import axios from 'axios';
import {generateSecureRandom} from 'react-native-securerandom';
import ecc from '@bitcoinerlab/secp256k1';
import {ECPairFactory, networks} from 'ecpair';

import {deleteItem, retrieveData, storeData} from '../secureStore';
import * as nostr from 'nostr-tools';
import {getRandomBytes} from 'expo-crypto';
import {networks as liquidNetworks} from 'liquidjs-lib';

import BIP32Factory from 'bip32';

import {
  generateMnemonic,
  mnemonicToSeed,
} from '@dreson4/react-native-quick-bip39';

const ECPair = ECPairFactory(ecc);
const bip32 = BIP32Factory(ecc);

export async function createBoltzSwapKeys() {
  // deleteItem('liquidKey');

  // const seed = mnemonicToSeed(await retrieveData('mnemonic'));
  // //||mnemonicToSeed( generateMnemonic());

  // const root = bip32.fromSeed(
  //   seed,
  //   process.env.BOLTZ_API.includes('testnet')
  //     ? liquidNetworks.testnet
  //     : liquidNetworks.liquid,
  // );

  // const child = root
  //   .derivePath(
  //     process.env.BOLTZ_API.includes('testnet') ? "84'/1'/0'" : "84'/1776'/0'",
  //   )
  //   .derive(0)
  //   .derive(0);
  // const privateKey = child.privateKey;

  const savedPrivateKeyHex = isJSON(await retrieveData('liquidKey'));
  const privateKey =
    savedPrivateKeyHex ||
    ECPair.makeRandom({
      network: process.env.BOLTZ_API.includes('testnet')
        ? liquidNetworks.testnet
        : liquidNetworks.liquid,
    }).privateKey.toString('hex');

  // Create a public key from the private key
  const keys = ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'), {
    network: process.env.BOLTZ_API.includes('testnet')
      ? liquidNetworks.testnet
      : liquidNetworks.liquid,
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
