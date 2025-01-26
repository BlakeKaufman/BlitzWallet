import {generateMnemonic} from '@dreson4/react-native-quick-bip39';
import {storeData} from './secureStore';
import {nip06} from 'nostr-tools';

export default function createAccountMnemonic(setContactsPrivateKey) {
  try {
    let generatedMnemonic = generateMnemonic();
    const unuiqueKeys = new Set(generatedMnemonic.split(' '));

    if (unuiqueKeys.size != 12) {
      let runCount = 0;
      let didFindValidMnemoinc = false;
      while (runCount < 50 && !didFindValidMnemoinc) {
        console.log('RUNNING IN WHILE LOOP');
        runCount += 1;
        const newTry = generateMnemonic();
        const uniqueItems = new Set(newTry.split(' '));
        if (uniqueItems.size != 12) continue;
        didFindValidMnemoinc = true;
        generatedMnemonic = newTry;
      }
    }

    const filtedMnemoinc = generatedMnemonic
      .split(' ')
      .filter(word => word.length > 2)
      .join(' ');
    storeData('mnemonic', generatedMnemonic);
    const privatKey = nip06.privateKeyFromSeedWords(generatedMnemonic);
    setContactsPrivateKey && setContactsPrivateKey(privatKey);
    return filtedMnemoinc;
  } catch (err) {
    console.log('generate mnemoinc error:', err);
    return false;
  }
}
