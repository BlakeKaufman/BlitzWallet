// import {
//   connect,
//   defaultConfig,
//   LiquidNetwork,
// } from '@breeztech/react-native-breez-sdk-liquid';
// import {validateMnemonic} from '@dreson4/react-native-quick-bip39';
// import {retrieveData} from '../secureStore';
// import isValidMnemonic from '../isValidMnemonic';
// async function startLiquidSession() {
//   try {
//     const mnemonic = await generateLiquidMnemonic();

//     // Create the default config
//     const config = await defaultConfig(LiquidNetwork.MAINNET);
//     console.log(mnemonic, LiquidNetwork);

//     await connect({mnemonic: mnemonic, config});
//   } catch (err) {
//     console.log('START SESSION ERROR', err);
//     return new Promise(resolve => {
//       resolve(false);
//     });
//   }
// }

// async function generateLiquidMnemonic() {
//   try {
//     const retrivedMnemonic = await retrieveData('mnemonic');
//     const filteredMnemonic = retrivedMnemonic
//       .split(' ')
//       .filter(item => item)
//       .join(' ');

//     retrivedMnemonic != filteredMnemonic &&
//       storeData('mnemonic', filteredMnemonic);

//     const isValid = await isValidMnemonic(filteredMnemonic.split(' '));

//     // gdk.validateMnemonic(filteredMnemonic);
//     // const isValid = isValidMnemonic(filteredMnemonic);
//     // console.log(isValid, 'IS VALID MNEOMNIC');
//     if (!isValid) throw new Error('Not valid mnemoic');
//     return new Promise(resolve => {
//       resolve(filteredMnemonic);
//     });
//   } catch (err) {
//     console.log(err, 'GENERATE MNEMONIC ERROR');
//     return new Promise(resolve => {
//       resolve(false);
//     });
//   }
// }

// export {startLiquidSession};
