import {
  openChannelFee,
  receivePayment,
} from '@breeztech/react-native-breez-sdk';

export default async function autoOpenChannel({masterInfoObject}) {
  try {
    if (!masterInfoObject.liquidWalletSettings.regulateChannelOpen)
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
      return new Promise(resolve =>
        resolve({
          type: 'submarineSwap',
          for: 'autoChannelOpen',
          didRun: true,
          isEcash: false,
          invoice,
        }),
      );
    } else return new Promise(resolve => resolve(false));
  } catch (err) {
    console.log(err, 'in auto open');
    new Promise(resolve => resolve(false));
  }
}
