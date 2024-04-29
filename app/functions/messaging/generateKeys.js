import * as nostr from 'nostr-tools';

import {retrieveData, storeData} from '../secureStore';

export async function generatePubPrivKeyForMessaging() {
  try {
    // const mnemonic = generateMnemnoic();
    const mnemonic = await retrieveData('mnemonic');

    const privateKey = nostr.nip06.privateKeyFromSeedWords(mnemonic);
    const publicKey = nostr.getPublicKey(privateKey);

    return new Promise(resolve => resolve(publicKey));
  } catch (err) {
    console.log(err);
  }
}
