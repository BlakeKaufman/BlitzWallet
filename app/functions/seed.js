import {generateMnemonic} from '@dreson4/react-native-quick-bip39';
import {storeData} from './secureStore';
import {nip06} from 'nostr-tools';

export default function generateMnemnoic(setContactsPrivateKey) {
  // Generate a random 32-byte entropy
  try {
    let validMnemonic = '';
    for (let index = 0; index < 5; index++) {
      const generatedMnemonic = generateMnemonic()
        .split(' ')
        .filter(word => word.length > 2)
        .join(' ');

      if (findDuplicates(generatedMnemonic)) continue;

      validMnemonic = generatedMnemonic;
      break;
    }

    storeData('mnemonic', validMnemonic);

    const privatKey = nip06.privateKeyFromSeedWords(validMnemonic);
    setContactsPrivateKey && setContactsPrivateKey(privatKey);
    return validMnemonic;
  } catch (err) {
    console.log(err);
    return false;
  }
}

export function findDuplicates(wordArr) {
  let duplicateWords = {};
  let hasDuplicates = false;

  wordArr.split(' ').forEach(word => {
    const lowerCaseWord = word.toLowerCase();
    if (duplicateWords[lowerCaseWord]) duplicateWords[lowerCaseWord]++;
    else duplicateWords[lowerCaseWord] = 1;
  });

  Object.keys(duplicateWords).forEach(word => {
    if (duplicateWords[word] != 1) hasDuplicates = true;
  });

  return hasDuplicates;
}
