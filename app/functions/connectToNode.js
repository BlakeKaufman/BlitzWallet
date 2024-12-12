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
import {randomUUID} from 'expo-crypto';
import {Platform} from 'react-native';
import {BREEZ_WORKING_DIR_KEY} from '../constants';

const logHandler = logEntry => {
  if (logEntry.level != 'TRACE') {
    console.log(`[${logEntry.level}]: ${logEntry.line}`);
  }
};

export default async function connectToNode(breezEvent) {
  // Create the default config

  // setLogStream(logHandler);

  try {
    const node_info = await nodeInfo();
    return new Promise(resolve => {
      resolve({isConnected: true, reason: null, node_info: node_info});
    });
  } catch (err) {
    try {
      const nodeConfig = {
        type: NodeConfigVariant.GREENLIGHT,
        config: {
          // inviteCode: inviteCode,
          partnerCredentials: {
            //IOS needs to be developerKey abd developerCert
            developerKey: unit8ArrayConverter(
              toByteArray(btoa(process.env.GL_CUSTOM_NOBODY_KEY)),
            ),
            developerCert: unit8ArrayConverter(
              toByteArray(btoa(process.env.GL_CUSTOM_NOBODY_CERT)),
            ),
          },
        },
      };

      const config = await defaultConfig(
        EnvironmentType.PRODUCTION,
        process.env.API_KEY,
        nodeConfig,
      );

      let savedUUIDforFileSystem = await getLocalStorageItem(
        'greenlightFilesystemUUI',
      );
      if (!savedUUIDforFileSystem) {
        savedUUIDforFileSystem = randomUUID();
        await setLocalStorageItem(
          'greenlightFilesystemUUI',
          savedUUIDforFileSystem,
        );
      }

      const directoryPath = `${config.workingDir}/${savedUUIDforFileSystem}`;
      console.log(directoryPath, 'DIRECTORY PATH');

      await ensureDirectoryExists(directoryPath, config.workingDir);

      config.workingDir = directoryPath;

      await setLocalStorageItem(BREEZ_WORKING_DIR_KEY, directoryPath);

      console.log(directoryPath, 'DIRECTORY PATH');

      const mnemonic = (await retrieveData('mnemonic'))
        .split(' ')
        .filter(word => word.length > 0)
        .join(' ');

      if (mnemonic) {
        const seed = await mnemonicToSeed(mnemonic);

        // Connect to the Breez SDK make it ready for use
        const connectRequest = {config, seed};
        await connect(connectRequest, breezEvent);

        return new Promise(resolve => {
          resolve({isConnected: true, reason: 'Connected through node'});
        });
      } else {
        console.log('no Mneomincs');
        return new Promise(resolve => {
          resolve({isConnected: false, reason: 'No mnemonic'});
        });
      }
    } catch (err) {
      console.log(err, 'connect to node err');
      return new Promise(resolve => {
        resolve({
          isConnected: false,
          // errMessage: JSON.stringify(err),
          reason: 'error connecting',
        });
      });
    }
  }
}

async function ensureDirectoryExists(directoryPath, breezFolder) {
  try {
    const dirInfo = await FileSystem.getInfoAsync(
      `${Platform.OS === 'ios' ? '' : 'file:/'}${directoryPath}`,
    );
    console.log('Directory Info:', dirInfo);

    if (!dirInfo.exists) {
      console.log(
        'Creating directory:',
        `${Platform.OS === 'ios' ? '' : 'file:/'}${directoryPath}`,
      );
      await FileSystem.makeDirectoryAsync(
        `${Platform.OS === 'ios' ? '' : 'file:/'}${directoryPath}`,
        {
          intermediates: true,
        },
      );
      console.log('Directory created successfully');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  } catch (err) {
    console.error('Directory Creation Error:', err);
    throw err;
  }
}
function unit8ArrayConverter(unitArray) {
  return Array.from(
    unitArray.filter(num => Number.isInteger(num) && num >= 0 && num <= 255),
  );
}
