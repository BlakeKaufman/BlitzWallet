import {
  openChannelFee,
  receivePayment,
} from '@breeztech/react-native-breez-sdk';
import createLiquidToLNSwap from '../boltz/liquidToLNSwap';
import {LIQUIDAMOUTBUFFER} from '../../constants/math';

export default async function autoOpenChannel({
  liquidNodeInformation,
  masterInfoObject,
}) {
  try {
    if (!masterInfoObject.liquidWalletSettings.regulateChannelOpen)
      return new Promise(resolve => resolve(false));

    if (
      liquidNodeInformation.userBalance <
      masterInfoObject.liquidWalletSettings.regulatedChannelOpenSize +
        LIQUIDAMOUTBUFFER
    )
      return new Promise(resolve => resolve(false));

    const channelOpenFee = await openChannelFee({
      amountMsat:
        masterInfoObject.liquidWalletSettings.regulatedChannelOpenSize * 1000,
    });

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
  } catch (err) {
    console.log(err, 'in auto open');
    new Promise(resolve => resolve(false));
  }
}
