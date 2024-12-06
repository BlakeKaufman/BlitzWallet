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
    let savedUUIDforFileSystem = await getLocalStorageItem(
      'greenlightFilesystemUUI',
    );
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

      if (!savedUUIDforFileSystem) {
        const uuid = randomUUID();
        setLocalStorageItem('greenlightFilesystemUUI', uuid);
        savedUUIDforFileSystem = uuid;
      }

      const directoryPath = config.workingDir + `/${savedUUIDforFileSystem}`;

      setLocalStorageItem('breezWorkignDir', JSON.stringify(directoryPath));

      config.workingDir = directoryPath;

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

function unit8ArrayConverter(unitArray) {
  return Array.from(
    unitArray.filter(num => Number.isInteger(num) && num >= 0 && num <= 255),
  );
}
