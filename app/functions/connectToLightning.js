import {
  defaultConfig,
  EnvironmentType,
  NodeConfigVariant,
  connect,
  nodeInfo,
  setLogStream,
  mnemonicToSeed,
} from '@breeztech/react-native-breez-sdk';

import {btoa, toByteArray} from 'react-native-quick-base64';
import {getOrCreateDirectory, unit8ArrayConverter} from './connectToNode';
import {retrieveData} from './secureStore';
import {BREEZ_WORKING_DIR_KEY} from '../constants';
import {setLocalStorageItem} from './localStorage';

const logHandler = logEntry => {
  if (logEntry.level != 'TRACE') {
    console.log(`[${logEntry.level}]: ${logEntry.line}`);
  }
};

export default async function connectToLightningNode(breezEvent) {
  try {
    const node_info = await nodeInfo();

    return new Promise(resolve => {
      resolve({
        isConnected: true,
        reason: null,
        node_info: node_info,
      });
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

      const directoryPath = await getOrCreateDirectory(
        'greenlightFilesystemUUID',
        config.workingDir,
      );

      config.workingDir = directoryPath;
      await setLocalStorageItem(BREEZ_WORKING_DIR_KEY, directoryPath);
      // Connect to the Breez SDK make it ready for use
      const mnemonic = (await retrieveData('mnemonic'))
        .split(' ')
        .filter(word => word.length > 0)
        .join(' ');
      const seed = await mnemonicToSeed(mnemonic);
      const connectRequest = {config, seed};
      await connect(connectRequest, breezEvent);

      return new Promise(resolve => {
        resolve({isConnected: true, reason: 'Connected through node'});
      });
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