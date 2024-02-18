import {generateMnemonic} from '@dreson4/react-native-quick-bip39';

export default async function generateMnemnoic() {
  // Generate a random 32-byte entropy
  try {
    const mnemonic = generateMnemonic();

    return new Promise((resolve, reject) => {
      resolve(mnemonic);
    });
  } catch (err) {
    console.log(err);
  }
}
