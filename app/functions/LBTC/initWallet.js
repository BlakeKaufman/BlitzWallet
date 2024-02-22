import axios from 'axios';
import ecc from '@bitcoinerlab/secp256k1';
import {ECPairFactory} from 'ecpair';
const ECPair = ECPairFactory(ecc);
import mempoolJS from '@mempool/mempool.js';

import generateMnemnoic from '../seed';
import {BIP32Factory} from 'bip32';
import {mnemonicToSeed} from '@dreson4/react-native-quick-bip39';

import * as Liquid from 'liquidjs-lib';

const bip32 = BIP32Factory(ecc);

export default async function initLiquidWallet() {
  const mnemonic =
    'wasp raw public ladder topple fitness milk gorilla slab alter swift oppose'; //  await generateMnemnoic();
  generateAddress(mnemonic);
  getUserLiquidBalance(mnemonic);
  sendTransaction(mnemonic);
}

async function generateAddress(mnemonic) {
  try {
    const seed = mnemonicToSeed(mnemonic);
    const root = bip32.fromSeed(seed);
    const derivationPath = "m/84'/0'/0'/0";
    const child = root.derivePath(`${derivationPath}/${0}`);
    const address = Liquid.payments.p2wpkh({
      pubkey: child.publicKey,
      network: Liquid.networks.liquid,
    }).address;

    console.log(address);

    return new Promise(resolve => {
      resolve(address);
    });
  } catch (err) {
    console.log(err);
  }
}

async function getUserLiquidBalance(mnemonic) {
  const seed = mnemonicToSeed(mnemonic);
  const root = bip32.fromSeed(seed);
  const derivationPath = "m/84'/0'/0'/0";

  const child = root.derivePath(`${derivationPath}/${0}`);

  const address = Liquid.payments.p2wpkh({
    pubkey: child.publicKey,
    network: Liquid.networks.liquid,
  }).address;

  const request = await axios.get(
    `https://blockstream.info/liquid/api/address/${address}`,
  );

  console.log(request.data);
}

async function sendTransaction(mnemonic) {
  const receipentAddress = '';
  const paymentAmount = '';
  const networkFee = await axios.get(
    `https://blockstream.info/liquid/api/fee-estimates`,
  );
  const derivationPath = "m/84'/0'/0'/0";
  const [privateKey, publicKey] = getKeyPair(mnemonic);
  const fromAddress = await generateAddress(mnemonic);
  const UTXOs = await getUTXOs(fromAddress);
  console.log(UTXOs);
  if (UTXOs.length === 0) {
    throw new Error('INVALID Address');
  }

  const txb = new Liquid.Pset();
  txb.addInput({
    p,
  });
}

function getKeyPair(mnemonic) {
  const seed = mnemonicToSeed(mnemonic);
  const root = bip32.fromSeed(seed);
  const derivationPath = "m/84'/0'/0'/0";
  const child = root.derivePath(`${derivationPath}/${0}`);
  const privateKey = child.privateKey;
  const publicKey = child.publicKey;

  return [privateKey, publicKey];
}

async function getUTXOs(address) {
  const esploraBaseUrl = 'https://blockstream.info/liquid'; // For testnet. Use 'https://blockstream.info' for mainnet.
  try {
    const response = await axios.get(
      `${esploraBaseUrl}/api/address/${address}/utxo`,
    );

    if (response.status === 200) {
      const responseData = response.data;
      let transformedUTXOs = [];

      for (let i = 0; i < responseData.length; i++) {
        const currentData = responseData[i];
        const txResponse = await axios.get(
          `${esploraBaseUrl}/api/tx/${currentData.txid}`,
        );
        if (txResponse.status === 200) {
          const scriptPubKey =
            txResponse.data.vout[currentData.vout].scriptpubkey;

          transformedUTXOs.push({...currentData, scriptPubkey: scriptPubKey});
        }
      }

      return new Promise(resolve => {
        resolve(transformedUTXOs);
      });
    } else {
      return false;
    }
  } catch {
    return false;
  }
}
