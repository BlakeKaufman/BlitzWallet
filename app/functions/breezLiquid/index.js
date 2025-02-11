import {
  lnurlPay,
  PayAmountVariant,
  PaymentMethod,
  prepareLnurlPay,
  prepareReceivePayment,
  prepareSendPayment,
  receivePayment,
  sendPayment,
} from '@breeztech/react-native-breez-sdk-liquid';
import {BLITZ_DEFAULT_PAYMENT_DESCRIPTION} from '../../constants';

export async function breezLiquidReceivePaymentWrapper({
  sendAmount,
  paymentType,
  description,
}) {
  try {
    // Set the amount you wish the payer to send via lightning, which should be within the above limits
    const prepareResponse = await prepareReceivePayment({
      paymentMethod:
        paymentType === 'lightning'
          ? PaymentMethod.LIGHTNING
          : paymentType === 'liquid'
          ? PaymentMethod.LIQUID_ADDRESS
          : PaymentMethod.BITCOIN_ADDRESS,
      payerAmountSat:
        paymentType === 'liquid' && !sendAmount ? undefined : sendAmount,
    });

    // If the fees are acceptable, continue to create the Receive Payment
    const receiveFeesSat = prepareResponse.feesSat;
    console.log(`Fees: ${receiveFeesSat} sats`);

    const res = await receivePayment({
      prepareResponse,
      description: description || BLITZ_DEFAULT_PAYMENT_DESCRIPTION,
    });

    const destination = res.destination;
    return {destination, receiveFeesSat};
  } catch (err) {
    console.log(err);
    return false;
  }
}
export async function breezLiquidPaymentWrapper({
  paymentType,
  sendAmount,
  invoice,
  shouldDrain,
}) {
  try {
    let optionalAmount;

    if (paymentType === 'bolt12') {
      optionalAmount = {
        type: PayAmountVariant.RECEIVER,
        amountSat: sendAmount,
      };
    } else if (paymentType === 'liquidNoAmount') {
      optionalAmount = {
        type: PayAmountVariant.RECEIVER,
        amountSat: sendAmount,
      };
    } else if (paymentType === 'bip21Liquid' && shouldDrain) {
      optionalAmount = {
        type: PayAmountVariant.DRAIN,
      };
    } else optionalAmount = undefined;

    const prepareResponse = await prepareSendPayment({
      destination: invoice,
      amount: optionalAmount ? optionalAmount : undefined,
    });

    // If the fees are acceptable, continue to create the Send Payment
    const sendFeesSat = prepareResponse.feesSat;
    console.log(`Fees: ${sendFeesSat} sats`);

    const sendResponse = await sendPayment({
      prepareResponse,
    });

    const payment = sendResponse.payment;
    return {payment, fee: sendFeesSat, didWork: true};
  } catch (err) {
    console.log(err);
    return {error: err, didWork: false};
  }
}

export async function breezLiquidLNAddressPaymentWrapper({
  sendAmountSat,
  description,
  paymentInfo,
}) {
  try {
    const amountMsat = sendAmountSat * 1000;
    const optionalComment = description;
    const optionalValidateSuccessActionUrl = true;

    const prepareResponse = await prepareLnurlPay({
      data: paymentInfo,
      amountMsat,
      comment: optionalComment,
      validateSuccessActionUrl: optionalValidateSuccessActionUrl,
    });
    const feesSat = prepareResponse.feesSat;
    console.log(`Fees: ${feesSat} sats`);

    const result = await lnurlPay({
      prepareResponse,
    });
    result.data.payment;
    const payment = result.data.payment;
    return {payment, fee: feesSat, didWork: true};
  } catch (err) {
    console.log(err, 'BREEZ LIQUID TO LN ADDRESS PAYMENT WRAPPER');
    return {error: err, didWork: false};
  }
}
