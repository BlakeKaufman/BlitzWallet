import {
  openChannelFee,
  receivePayment,
} from '@breeztech/react-native-breez-sdk';
import createLiquidToLNSwap from '../boltz/liquidToLNSwap';

export default async function autoOpenChannel(
  nodeInformation,
  liquidNodeInformation,
  masterInfoObject,
  toggleMasterInfoObject,
) {
  if (!masterInfoObject.liquidWalletSettings.regulateChannelOpen)
    return new Promise(resolve => resolve(false));

  if (
    liquidNodeInformation.userBalance <
    masterInfoObject.liquidWalletSettings.regulatedChannelOpenSize + 500
  )
    return new Promise(resolve => resolve(false));

  console.log('RUN');

  const channelOpenFee = await openChannelFee({
    amountMsat:
      masterInfoObject.liquidWalletSettings.regulatedChannelOpenSize * 1000,
  });
  // channelOpenFee.feeMsat
  // WHERE TO ADD CHANNEL OPEN FEE LOGIC

  let maxChannelOpenFee =
    masterInfoObject.liquidWalletSettings?.maxChannelOpenFee || 5000; //for legacy users that might not have changed liquid seetings page

  if (maxChannelOpenFee < channelOpenFee.feeMsat / 1000)
    return new Promise(resolve => resolve(false));

  const invoice = await receivePayment({
    amountMsat:
      masterInfoObject.liquidWalletSettings.regulatedChannelOpenSize * 1000,
    description: 'Auto Channel Open',
  });

  if (invoice) {
    // {swapInfo, privateKey}
    const liquidLNSwapResponse = await createLiquidToLNSwap(
      invoice.lnInvoice.bolt11,
    );

    if (liquidLNSwapResponse) {
      return new Promise(resolve =>
        resolve({
          swapInfo: liquidLNSwapResponse.swapInfo,
          privateKey: liquidLNSwapResponse.privateKey,
          invoice: invoice.lnInvoice.bolt11,
          didWork: true,
        }),
      );
    } else {
      return new Promise(resolve => resolve(false));
    }
  } else {
    new Promise(resolve => resolve(false));
  }
}
