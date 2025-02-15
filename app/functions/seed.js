import {generateMnemonic} from '@dreson4/react-native-quick-bip39';
import {storeData} from './secureStore';

export default function createAccountMnemonic() {
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
    return filtedMnemoinc;
  } catch (err) {
    console.log('generate mnemoinc error:', err);
    return false;
  }
}
