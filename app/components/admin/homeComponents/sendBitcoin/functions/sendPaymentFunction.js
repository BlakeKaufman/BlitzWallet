import {
  ReportIssueRequestVariant,
  reportIssue,
} from '@breeztech/react-native-breez-sdk';

export default async function sendPaymentFunction({
  canUseLiquid,
  canUseLightning,
  isLightningPayment,
  sendingAmount,
  paymentInfo,
  webViewRef,
  setHasError,
  navigate,
}) {
  try {
    if (isLightningPayment) {
      if (canUseLightning) {
        //Send Lightnig payment
      } else {
        // preform Liquid to LN swap
      }
    } else {
      if (canUseLiquid) {
        //Send liquid payment
      } else {
        //preform lightning to liquid swap
      }
    }
  } catch (err) {
    setHasError('Error sending payment. Try again.');
    if (!isLightningPayment) return;
    try {
      const paymentHash = paymentInfo.invoice.paymentHash;
      await reportIssue({
        type: ReportIssueRequestVariant.PAYMENT_FAILURE,
        data: {paymentHash},
      });
    } catch (err) {
      console.log(err);
    }
  }
}
