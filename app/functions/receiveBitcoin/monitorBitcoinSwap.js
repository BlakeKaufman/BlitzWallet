import {inProgressSwap} from '@breeztech/react-native-breez-sdk';

export default async function monitorSwap() {
  try {
    const swapInfo = await inProgressSwap();
    if (!swapInfo) throw new Error('No Swap');
    return new Promise(resolve => {
      resolve(swapInfo);
    });
  } catch (err) {
    return new Promise(resolve => {
      resolve(false);
    });
  }
}
