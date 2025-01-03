import {
  FeeratePreset,
  fetchReverseSwapFees,
  onchainPaymentLimits,
  payOnchain,
  prepareOnchainPayment,
  SwapAmountType,
} from '@breeztech/react-native-breez-sdk';
import {getMempoolReccomenededFee} from '../getMempoolFeeRates';

export default async function breezLNOnchainPaymentWrapper({
  amountSat,
  onlyPrepare,
  paymentInfo,
  navigate,
}) {
  try {
    const currentLimits = await onchainPaymentLimits();

    console.log(`Minimum amount, in sats: ${currentLimits.minSat}`);
    console.log(`Maximum amount, in sats: ${currentLimits.maxSat}`);

    if (currentLimits.minSat > amountSat) return {didWork: false};
    if (currentLimits.maxSat < amountSat) return {didWork: false};

    const satPerVbyte = (await getMempoolReccomenededFee()) || 10;
    console.log(satPerVbyte, 'MEMPOOL');

    const prepareResponse = await prepareOnchainPayment({
      amountSat,
      amountType: SwapAmountType.RECEIVE,
      claimTxFeerate: satPerVbyte,
    });
    console.log(`Sender amount: ${prepareResponse.senderAmountSat} sats`);
    console.log(`Recipient amount: ${prepareResponse.recipientAmountSat} sats`);
    console.log(`Total fees: ${prepareResponse.totalFees} sats`);

    if (onlyPrepare) {
      return {didWork: true, fees: prepareResponse.totalFees};
    }

    const destinationAddress = paymentInfo?.data.address;
    const reverseSwapInfo = await payOnchain({
      recipientAddress: destinationAddress,
      prepareRes: prepareResponse,
    });
    console.log(reverseSwapInfo.reverseSwapInfo);

    return {
      didWork: true,
      reverseSwapInfo: reverseSwapInfo.reverseSwapInfo,
      prepareResponse: prepareResponse,
    };
  } catch (err) {
    console.error(err);
    return {didWork: false, error: JSON.stringify(err)};
  }
}
