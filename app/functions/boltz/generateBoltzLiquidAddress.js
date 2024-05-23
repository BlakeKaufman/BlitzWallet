import * as ecc from '@bitcoinerlab/secp256k1';
import * as liquid from 'liquidjs-lib';
import {createBoltzSwapKeys} from './createKeys';
import {retrieveData} from '../secureStore';
import {SLIP77Factory} from 'slip77';

import BIP32Factory from 'bip32';
import {mnemonicToSeed} from '@dreson4/react-native-quick-bip39';

const slip77 = SLIP77Factory(ecc);
const bip32 = BIP32Factory(ecc);
export default async function generateBoltzLiquidAddress() {
  try {
    const seed = await retrieveData('mnemonic');
    console.log(seed);
    const xpub = getXpub(Buffer.from(mnemonicToSeed(seed), 'hex'));

    const pubkey = bip32.fromBase58(xpub).derive(0).derive(1).publicKey;

    const {address, output} = liquid.payments.p2wpkh({
      network: process.env.BOLTZ_API.includes('testnet')
        ? liquid.networks.testnet
        : liquid.networks.liquid,
      pubkey,
    });

    if (!address || !output)
      throw new Error('Unable to generate liquid payment');
    const script = output;
    const unconfidentialAddress = liquid.address.fromOutputScript(
      script,
      process.env.BOLTZ_API.includes('testnet')
        ? liquid.networks.testnet
        : liquid.networks.liquid,
    );

    const blindingKeys = await deriveBlindingKeys(script, seed);

    const confidentialAddress = liquid.address.toConfidential(
      unconfidentialAddress,
      blindingKeys.publicKey,
    );

    return new Promise(resolve => {
      resolve(confidentialAddress);
    });
  } catch (err) {
    return new Promise(resolve => {
      resolve(false);
    });
  }
}

const getXpub = seed => {
  return bip32
    .fromSeed(seed)
    .derivePath(
      process.env.BOLTZ_API.includes('testnet')
        ? "m/84'/1'/0'"
        : "m/84'/1776'/0'",
    )
    .neutered()
    .toBase58();
};

const deriveBlindingKeys = async (script, seed) => {
  try {
    const masterBlindingKey = slip77
      .fromSeed(seed.toString('hex'))
      .masterKey.toString('hex');

    if (!masterBlindingKey) throw new Error('Could not get masterBlindingKey');
    const blindingKeyNode = slip77.fromMasterBlindingKey(masterBlindingKey);
    if (!blindingKeyNode)
      throw new Error(
        'No blinding key node, Account cannot derive blinding key',
      );
    const {publicKey, privateKey} = blindingKeyNode.derive(script);
    if (!publicKey || !privateKey)
      throw new Error('Could not derive blinding keys');
    return {publicKey, privateKey};
  } catch (err) {
    console.log(err);
  }
};
