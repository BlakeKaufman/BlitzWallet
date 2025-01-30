import {
  openChannelFee,
  receivePayment,
} from '@breeztech/react-native-breez-sdk';
import {calculateBoltzFeeNew} from '../boltz/boltzFeeNew';
import {LIQUID_DEFAULT_FEE} from '../../constants';

export default async function autoOpenChannel({
  masterInfoObject,
  minMaxLiquidSwapAmounts,
}) {
  try {
    if (!masterInfoObject.liquidWalletSettings.regulateChannelOpen)
      return false;

    const channelOpenFee = await openChannelFee({
      amountMsat:
        masterInfoObject.liquidWalletSettings.regulatedChannelOpenSize * 1000,
    });
    let maxChannelOpenFee =
      masterInfoObject.liquidWalletSettings?.maxChannelOpenFee || 5000; //for legacy users that might not have changed liquid seetings page

    if (maxChannelOpenFee < channelOpenFee.feeMsat / 1000) return false;

    const boltzFee = calculateBoltzFeeNew(
      masterInfoObject.liquidWalletSettings.regulatedChannelOpenSize,
      'liquid-ln',
      minMaxLiquidSwapAmounts.submarineSwapStats,
    );
    const fee = boltzFee * 2 + LIQUID_DEFAULT_FEE;
    const invoice = await receivePayment({
      amountMsat:
        (masterInfoObject.liquidWalletSettings.regulatedChannelOpenSize - fee) *
        1000,
      description: 'Auto Channel Open',
    });

    if (invoice) {
      return {
        type: 'submarineSwap',
        for: 'autoChannelOpen',
        didRun: true,
        isEcash: false,
        invoice,
      };
    } else return false;
  } catch (err) {
    console.log(err, 'in auto open');
    return false;
  }
}
