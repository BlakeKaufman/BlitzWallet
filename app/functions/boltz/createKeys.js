import ecc from '@bitcoinerlab/secp256k1';
import {ECPairFactory} from 'ecpair';
import crypto from 'react-native-quick-crypto';
import {networks as liquidNetworks} from 'liquidjs-lib';
import {Buffer} from 'buffer';

const ECPair = ECPairFactory(ecc);

export async function createBoltzSwapKeys() {
  const byteArray = crypto.randomBytes(32);
  console.log(byteArray);
  const keyFormatt = {
    network:
      process.env.BOLTZ_ENVIRONMENT === 'testnet'
        ? liquidNetworks.testnet
        : liquidNetworks.liquid,
  };
  const keys = ECPair.fromPrivateKey(byteArray, keyFormatt);

  const privateKey = keys.privateKey.toString('hex');
  const publicKey = Buffer.from(keys.publicKey).toString('hex');

  return new Promise(resolve => {
    resolve({
      privateKeyString: privateKey,
      keys: keys,
      publicKey: publicKey,
    });
  });
}
