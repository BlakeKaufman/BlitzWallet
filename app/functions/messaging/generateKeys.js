import * as nostr from 'nostr-tools';

import {retrieveData, storeData} from '../secureStore';
import generateMnemnoic from '../seed';

export function generatePubPrivKeyForMessaging() {
  try {
    const mnemonic = generateMnemnoic();

    const privateKey = nostr.nip06.privateKeyFromSeedWords(mnemonic);
    const publicKey = nostr.getPublicKey(privateKey);
    console.log(privateKey, publicKey);

    storeData('contactsPrivateKey', JSON.stringify(privateKey));

    return publicKey;
  } catch (err) {
    console.log(err);
  }
}
