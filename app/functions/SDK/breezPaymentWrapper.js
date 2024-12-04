import {
  reportIssue,
  ReportIssueRequestVariant,
  sendPayment,
} from '@breeztech/react-native-breez-sdk';
import {getLocalStorageItem} from '../localStorage';

export default async function breezPaymentWrapper({
  paymentInfo,
  amountMsat,
  confirmFunction,
  failureFunction,
  paymentDescription,
}) {
  let resposne;
  try {
    const useTrampoline =
      JSON.parse(await getLocalStorageItem('useTrampoline')) ?? true;

    console.log('USING TRAMPOLINE', useTrampoline);

    resposne = !!paymentInfo?.invoice?.amountMsat
      ? await sendPayment({
          useTrampoline: useTrampoline,
          bolt11: paymentInfo?.invoice?.bolt11,
          label: paymentDescription || '',
        })
      : await sendPayment({
          useTrampoline: useTrampoline,
          bolt11: paymentInfo?.invoice?.bolt11,
          amountMsat,
          label: paymentDescription || '',
        });
    return true;
  } catch (err) {
    console.log(err);
    try {
      const paymentHash = paymentInfo.invoice.paymentHash;
      await reportIssue({
        type: ReportIssueRequestVariant.PAYMENT_FAILURE,
        data: {paymentHash},
      });
    } catch (err) {
      console.log(err);
    } finally {
      failureFunction && failureFunction();
    }
    return false;
  } finally {
    confirmFunction && confirmFunction(resposne);
  }
}
