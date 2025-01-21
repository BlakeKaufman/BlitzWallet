import {
  addEventListener,
  connect,
  defaultConfig,
  getInfo,
  LiquidNetwork,
  setLogger,
} from '@breeztech/react-native-breez-sdk-liquid';
import {getOrCreateDirectory} from './connectToNode';
import {retrieveData} from './secureStore';

const logHandler = logEntry => {
  if (logEntry.level != 'TRACE') {
    console.log(`[${logEntry.level}]: ${logEntry.line}`);
  }
};
let didConnect = false;
export default async function connectToLiquidNode(breezLiquidEvent) {
  // Create the default config

  // setLogger(logHandler);

  if (didConnect) {
    console.log('RUNNING IN DID CONNECT');
    let ableToRetrive = false;
    let runcount = 0;

    while (!ableToRetrive && runcount < 4) {
      try {
        const liquid_node_info = await getInfo();
        ableToRetrive = true;
        return new Promise(resolve => {
          resolve({
            isConnected: true,
            reason: null,
            liquid_node_info: liquid_node_info.walletInfo,
          });
        });
      } catch (err) {
        console.log(err, 'LIQUID NODE ABLE TO RETRIVE ERR');
        await new Promise(res => setTimeout(res, 2000));
      } finally {
        runcount += 1;
      }
    }
    return new Promise(resolve => {
      resolve({
        isConnected: false,
        reason: 'Not able to get liquid information',
      });
    });
  }

  didConnect = true;
  try {
    // Create the default config, providing your Breez API key
    const config = await defaultConfig(
      LiquidNetwork[
        process.env.BOLTZ_ENVIRONMENT === 'testnet' ? 'TESTNET' : 'MAINNET'
      ],
      process.env.LIQUID_BREEZ_KEY,
    );
    const directoryPath = await getOrCreateDirectory(
      'liquidFilesystemUUID',
      config.workingDir,
    );
    config.workingDir = directoryPath;
    const mnemonic = (await retrieveData('mnemonic'))
      .split(' ')
      .filter(word => word.length > 0)
      .join(' ');

    // By default in React Native the workingDir is set to:
    // `/<APPLICATION_SANDBOX_DIRECTORY>/breezSdkLiquid`
    // You can change this to another writable directory or a
    // subdirectory of the workingDir if managing multiple mnemonics.
    // console.log(`Working directory: ${config.workingDir}`);
    // config.workingDir = "path to writable directory"

    await connect({mnemonic, config});

    await addEventListener(breezLiquidEvent);
    return new Promise(resolve => {
      resolve({
        isConnected: true,
        reason: null,
      });
    });
  } catch (err) {
    console.log(err, 'connect to node err LIQUID');
    return new Promise(resolve => {
      resolve({
        isConnected: false,
        reason: err,
      });
    });
  }
}
