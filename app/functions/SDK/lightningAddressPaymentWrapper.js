import {payLnurl} from '@breeztech/react-native-breez-sdk';
import {getLocalStorageItem} from '../localStorage';

export default async function breezLNAddressPaymentWrapper({
  sendingAmountSat,
  paymentInfo,
  confirmFunction,
  failureFunction,
  paymentDescription,
}) {
  let resposne;
  try {
    const useTrampoline =
      JSON.parse(await getLocalStorageItem('useTrampoline')) ?? true;

    console.log('USING TRAMPOLINE', useTrampoline);
    const amountMsat = sendingAmountSat * 1000;

    const optionalComment = paymentDescription;
    const optionalPaymentLabel = paymentDescription;
    resposne = await payLnurl({
      data: paymentInfo.data,
      amountMsat,
      useTrampoline,
      comment: optionalComment,
      paymentLabel: optionalPaymentLabel,
    });

    return true;
  } catch (err) {
    console.log(err);

    failureFunction && failureFunction(resposne);
    return false;
  } finally {
    confirmFunction && confirmFunction(resposne);
  }
}
