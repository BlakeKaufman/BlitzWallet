import {
  InputTypeVariant,
  PaymentStatus,
  ReportIssueRequestVariant,
  payLnurl,
  sendPayment,
} from '@breeztech/react-native-breez-sdk';
import {sendLiquidTransaction} from '../../../../../functions/liquidWallet';
import createLiquidToLNSwap from '../../../../../functions/boltz/liquidToLNSwap';
import handleSubmarineClaimWSS from '../../../../../functions/boltz/handle-submarine-claim-wss';
import {getBoltzWsUrl} from '../../../../../functions/boltz/boltzEndpoitns';
import {Alert} from 'react-native';
import {contactsLNtoLiquidSwapInfo} from '../../contacts/internalComponents/LNtoLiquidSwap';
import handleReverseClaimWSS from '../../../../../functions/boltz/handle-reverse-claim-wss';

export async function sendLiquidPayment_sendPaymentScreen({
  sendingAmount,
  paymentInfo,
  navigate,
}) {
  try {
    const didSend = await sendLiquidTransaction(
      sendingAmount / 1000,
      paymentInfo.addressInfo.address,
    );

    if (didSend) {
      navigate.navigate('HomeAdmin');
      navigate.navigate('ConfirmTxPage', {
        for: 'paymentSucceed',
        information: {},
      });
    } else {
      navigate.navigate('HomeAdmin');
      navigate.navigate('ConfirmTxPage', {
        for: 'paymentFailed',
        information: {},
      });
    }
  } catch (err) {
    console.log(err);
  }
}

export async function sendToLNFromLiquid_sendPaymentScreen({
  paymentInfo,
  webViewRef,
  setHasError,
  toggleMasterInfoObject,
  masterInfoObject,
  contactsPrivateKey,
  goBackFunction,
  navigate,
}) {
  const lnAddress = await getLNAddressForLiquidPayment(paymentInfo);

  const {swapInfo, privateKey} = await createLiquidToLNSwap(lnAddress);

  if (!swapInfo?.expectedAmount || !swapInfo?.address) {
    Alert.alert('Cannot send money to this address', '', [
      {text: 'Ok', onPress: () => goBackFunction()},
    ]);

    return;
  }

  const refundJSON = {
    id: swapInfo.id,
    asset: 'L-BTC',
    version: 3,
    privateKey: privateKey,
    blindingKey: swapInfo.blindingKey,
    claimPublicKey: swapInfo.claimPublicKey,
    timeoutBlockHeight: swapInfo.timeoutBlockHeight,
    swapTree: swapInfo.swapTree,
  };
  const webSocket = new WebSocket(
    `${getBoltzWsUrl(process.env.BOLTZ_ENVIRONMENT)}`,
  );

  const didHandle = await handleSubmarineClaimWSS({
    ref: webViewRef,
    webSocket: webSocket,
    invoiceAddress: lnAddress,
    swapInfo,
    privateKey,
    toggleMasterInfoObject,
    masterInfoObject,
    contactsPrivateKey,
    refundJSON,
    navigate,
  });
  if (didHandle) {
    const didSend = await sendLiquidTransaction(
      swapInfo.expectedAmount,
      swapInfo.address,
    );

    if (!didSend) {
      webSocket.close();
      setHasError('Error sending payment. Try again.');
    }
  }
}

export async function sendLightningPayment_sendPaymentScreen({
  sendingAmount,
  paymentInfo,
  navigate,
}) {
  try {
    if (paymentInfo.type === InputTypeVariant.LN_URL_PAY) {
      if (!lnurlDescriptionInfo.didAsk) {
        navigate.navigate('LnurlPaymentDescription', {
          setLnurlDescriptionInfo: setLnurlDescriptionInfo,
          paymentInfo: paymentInfo,
        });
        return;
      }
      setIsLoading(true);
      const response = await payLnurl({
        data: paymentInfo.data,
        amountMsat: sendingAmount,
        comment: lnurlDescriptionInfo.description,
      });
      if (response) {
        navigate.navigate('HomeAdmin');
        navigate.navigate('ConfirmTxPage', {
          for: response.type,
          information: response,
        });
      }

      return;
    }

    setIsLoading(true);

    const response = paymentInfo?.invoice?.amountMsat
      ? await sendPayment({
          bolt11: paymentInfo?.invoice?.bolt11,
        })
      : await sendPayment({
          bolt11: paymentInfo?.invoice?.bolt11,
          amountMsat: Number(sendingAmount),
        });

    navigate.navigate('HomeAdmin');
    navigate.navigate('ConfirmTxPage', {
      for: response.type,
      information: response,
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
    }
  }
}

export async function sendToLiquidFromLightning_sendPaymentScreen({
  paymentInfo,
  sendingAmount,
  navigate,
  webViewRef,
}) {
  const [data, swapPublicKey, privateKeyString, keys, preimage, liquidAddress] =
    await contactsLNtoLiquidSwapInfo(
      paymentInfo.addressInfo.address,
      sendingAmount / 1000,
    );
  if (!data?.invoice) throw new Error('No Invoice genereated');
  const webSocket = new WebSocket(
    `${getBoltzWsUrl(process.env.BOLTZ_ENVIRONMENT)}`,
  );
  const didHandle = await handleReverseClaimWSS({
    ref: webViewRef,
    webSocket: webSocket,
    liquidAddress: liquidAddress,
    swapInfo: data,
    preimage: preimage,
    privateKey: keys.privateKey.toString('hex'),
    navigate: navigate,
  });
  if (didHandle) {
    try {
      const didSend = await sendPayment(data?.invoice);
      if (didSend.payment.status === PaymentStatus.FAILED) {
        webSocket.close();
        navigate.navigate('HomeAdmin');
        navigate.navigate('ConfirmTxPage', {
          for: 'paymentFailed',
          information: {},
        });
      }
    } catch (err) {
      console.log(err);
      webSocket.close();
      navigate.navigate('HomeAdmin');
      navigate.navigate('ConfirmTxPage', {
        for: 'paymentFailed',
        information: {},
      });
    }
  }
}

export async function getLNAddressForLiquidPayment(paymentInfo) {
  let invoiceAddress;

  if (paymentInfo.type === InputTypeVariant.LN_URL_PAY) {
    const response = await fetch(
      `${paymentInfo.data.callback}?amount=${sendingValue}`,
    );

    const bolt11Invoice = (await response.json()).pr;

    invoiceAddress = bolt11Invoice;
  } else {
    invoiceAddress = paymentInfo.invoice.bolt11;
  }

  return invoiceAddress;
}
