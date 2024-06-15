import {receivePayment} from '@breeztech/react-native-breez-sdk';
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
    masterInfoObject.liquidWalletSettings.regulatedChannelOpenSize
  )
    return new Promise(resolve => resolve(false));

  console.log('RUN');
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
          swapInfo,
          privateKey,
          invoice: invoice.lnInvoice.bolt11,
          didWork: true,
        }),
      );
    } else {
      return new Promise(resolve =>
        resolve({
          swapInfo: null,
        }),
      );
    }
  } else {
    new Promise(resolve => resolve(false));
  }
}
