import {mnemonicToSeed} from '@breeztech/react-native-breez-sdk';
export default async function isValidMnemonic(mnemonic) {
  const mnemoincToString = mnemonic.join(' ');
  try {
    await mnemonicToSeed(mnemoincToString);

    return new Promise(resolve => {
      resolve(true);
    });
  } catch (err) {
    // console.log(err);
    return new Promise(resolve => {
      resolve(false);
    });
  }
}
