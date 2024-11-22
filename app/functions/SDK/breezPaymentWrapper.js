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
}) {
  let resposne;
  try {
    const useTrampoline =
      JSON.parse(await getLocalStorageItem('useTrampoline')) ?? true;

    console.log('USING TRAMPOLINE', useTrampoline);

    resposne = !!amountMsat
      ? await sendPayment({
          useTrampoline: useTrampoline,
          bolt11: paymentInfo?.invoice?.bolt11,
        })
      : await sendPayment({
          useTrampoline: useTrampoline,
          bolt11: paymentInfo?.invoice?.bolt11,
          amountMsat,
        });
  } catch (err) {
    try {
      const paymentHash = paymentInfo.invoice.paymentHash;
      await reportIssue({
        type: ReportIssueRequestVariant.PAYMENT_FAILURE,
        data: {paymentHash},
      });
    } catch (err) {
      console.log(err);
    } finally {
      failureFunction();
    }
  } finally {
    confirmFunction(resposne);
  }
}
