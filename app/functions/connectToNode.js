import {
  defaultConfig,
  EnvironmentType,
  NodeConfigVariant,
  connect,
  mnemonicToSeed,
  nodeInfo,
  setLogStream,
} from '@breeztech/react-native-breez-sdk';
import {retrieveData} from './secureStore';

import {btoa, atob, toByteArray} from 'react-native-quick-base64';
import {getLocalStorageItem, setLocalStorageItem} from './localStorage';
import * as FileSystem from 'expo-file-system';
import {Platform} from 'react-native';
import {BREEZ_WORKING_DIR_KEY} from '../constants';
import customUUID from './customUUID';

// const logHandler = logEntry => {
//   if (logEntry.level != 'TRACE') {
//     console.log(`[${logEntry.level}]: ${logEntry.line}`);
//   }
// };

// export default async function connectToNode(breezEvent) {
//   // Create the default config

//   // setLogStream(logHandler);

//   try {
//     const node_info = await nodeInfo();
//     return new Promise(resolve => {
//       resolve({
//         isConnected: true,
//         reason: null,
//         node_info: node_info,
//       });
//     });
//   } catch (err) {
//     try {
//       const nodeConfig = {
//         type: NodeConfigVariant.GREENLIGHT,
//         config: {
//           // inviteCode: inviteCode,
//           partnerCredentials: {
//             //IOS needs to be developerKey abd developerCert
//             developerKey: unit8ArrayConverter(
//               toByteArray(btoa(process.env.GL_CUSTOM_NOBODY_KEY)),
//             ),
//             developerCert: unit8ArrayConverter(
//               toByteArray(btoa(process.env.GL_CUSTOM_NOBODY_CERT)),
//             ),
//           },
//         },
//       };

//       const config = await defaultConfig(
//         EnvironmentType.PRODUCTION,
//         process.env.API_KEY,
//         nodeConfig,
//       );

//       const directoryPath = await getOrCreateDirectory(
//         'greenlightFilesystemUUID',
//         config.workingDir,
//       );

//       config.workingDir = directoryPath;

//       await setLocalStorageItem(BREEZ_WORKING_DIR_KEY, directoryPath);

//       console.log(directoryPath, 'DIRECTORY PATH');

//       const mnemonic = (await retrieveData('mnemonic'))
//         .split(' ')
//         .filter(word => word.length > 0)
//         .join(' ');

//       if (mnemonic) {
//         const seed = await mnemonicToSeed(mnemonic);

//         // Connect to the Breez SDK make it ready for use
//         const connectRequest = {config, seed};
//         await connect(connectRequest, breezEvent);

//         return new Promise(resolve => {
//           resolve({isConnected: true, reason: 'Connected through node'});
//         });
//       } else {
//         console.log('no Mneomincs');
//         return new Promise(resolve => {
//           resolve({isConnected: false, reason: 'No mnemonic'});
//         });
//       }
//     } catch (err) {
//       console.log(err, 'connect to node err');
//       return new Promise(resolve => {
//         resolve({
//           isConnected: false,
//           // errMessage: JSON.stringify(err),
//           reason: 'error connecting',
//         });
//       });
//     }
//   }
// }
export async function getOrCreateDirectory(uuidKey, workingDir) {
  try {
    let savedUUID = await getLocalStorageItem(uuidKey);
    if (!savedUUID) {
      savedUUID = customUUID();
      await setLocalStorageItem(uuidKey, savedUUID);
    }

    const directoryPath = `${workingDir}/${savedUUID}`;

    const dirInfo = await FileSystem.getInfoAsync(directoryPath);
    console.log(dirInfo);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(
        `${Platform.OS === 'ios' ? '' : 'file:/'}${directoryPath}`,
        {intermediates: true},
      );
      console.log(
        `Directory created: ${
          Platform.OS === 'ios' ? '' : 'file:/'
        }${directoryPath}`,
      );
    } else {
      console.log(dirInfo);
      console.log(
        `Directory already exists: ${
          Platform.OS === 'ios' ? '' : 'file:/'
        }${directoryPath}`,
      );
    }
    await new Promise(resolve => setTimeout(resolve, 2000)); //adds two second buffer
    return directoryPath;
  } catch (err) {
    console.error('Error ensuring directory:', err);
    throw err;
  }
}
export function unit8ArrayConverter(unitArray) {
  return Array.from(
    unitArray.filter(num => Number.isInteger(num) && num >= 0 && num <= 255),
  );
}
