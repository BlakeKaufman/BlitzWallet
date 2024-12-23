import {
  PayAmountVariant,
  PaymentMethod,
  prepareReceivePayment,
  prepareSendPayment,
  receivePayment,
  sendPayment,
} from '@breeztech/react-native-breez-sdk-liquid';

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
      description: description,
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
    } else optionalAmount = undefined;

    const prepareResponse = await prepareSendPayment({
      destination: invoice,
      amount: optionalAmount,
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
