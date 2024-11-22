import {
  InputTypeVariant,
  PaymentStatus,
  ReportIssueRequestVariant,
  parseInput,
  payLnurl,
  reportIssue,
  sendPayment,
} from '@breeztech/react-native-breez-sdk';
import {sendLiquidTransaction} from '../../../../../functions/liquidWallet';
import createLiquidToLNSwap from '../../../../../functions/boltz/liquidToLNSwap';
import handleSubmarineClaimWSS from '../../../../../functions/boltz/handle-submarine-claim-wss';
import {getBoltzWsUrl} from '../../../../../functions/boltz/boltzEndpoitns';
import {Alert} from 'react-native';
import {contactsLNtoLiquidSwapInfo} from '../../contacts/internalComponents/LNtoLiquidSwap';
import handleReverseClaimWSS from '../../../../../functions/boltz/handle-reverse-claim-wss';
import {getLiquidFromSwapInvoice} from '../../../../../functions/boltz/magicRoutingHints';
import {breezPaymentWrapper} from '../../../../../functions/SDK';

export async function sendLiquidPayment_sendPaymentScreen({
  sendingAmount,
  paymentInfo,
  navigate,
  fromPage,
  publishMessageFunc,
}) {
  try {
    const didSend = await sendLiquidTransaction(
      sendingAmount,
      paymentInfo.addressInfo.address,
    );

    if (didSend) {
      if (fromPage === 'contacts') {
        publishMessageFunc();
      }
      setTimeout(() => {
        handleNavigation(navigate, true);
      }, 1000);
    } else {
      handleNavigation(navigate, false);
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
  sendingAmount,
  fromPage,
  publishMessageFunc,
}) {
  const lnAddress = await getLNAddressForLiquidPayment(
    paymentInfo,
    sendingAmount,
  );

  if (!lnAddress) {
    handleNavigation(navigate, false);
    return;
  }

  const {swapInfo, privateKey} = await createLiquidToLNSwap(lnAddress);

  if (!swapInfo?.expectedAmount || !swapInfo?.address) {
    const response = await getLiquidFromSwapInvoice(lnAddress);
    if (!response) {
      Alert.alert('Cannot decode swap invoice.', '', [
        {text: 'Ok', onPress: () => goBackFunction()},
      ]);
    } else {
      const {invoice, liquidAddress} = response;

      if (invoice.timeExpireDate < Math.round(new Date().getTime() / 1000)) {
        Alert.alert('Swap invoice has expired', '', [
          {text: 'Ok', onPress: () => goBackFunction()},
        ]);
        return;
      }

      const didSend = await sendLiquidTransaction(
        invoice?.satoshis,
        liquidAddress,
      );
      if (didSend) {
        handleNavigation(navigate, true);
      } else {
        handleNavigation(navigate, false);
      }
    }

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
    page: fromPage,
    handleFunction: publishMessageFunc,
  });
  if (didHandle) {
    const didSend = await sendLiquidTransaction(
      swapInfo.expectedAmount,
      swapInfo.address,
    );
    if (!didSend) {
      setHasError('Error sending payment. Try again.');
      webSocket.close();
    }
  }
}

export async function sendLightningPayment_sendPaymentScreen({
  sendingAmount,
  paymentInfo,
  navigate,
  fromPage,
  publishMessageFunc,
}) {
  // try {
  if (paymentInfo.type === InputTypeVariant.LN_URL_PAY) {
    const invoice = await getLNAddressForLiquidPayment(
      paymentInfo,
      sendingAmount,
    );

    const parsedLNURL = await parseInput(invoice);
    breezPaymentWrapper({
      paymentInfo: parsedLNURL,
      amountMsat: parsedLNURL?.invoice?.amountMsat,
      failureFunction: () => handleNavigation(navigate, false),
      confirmFunction: response => {
        handleNavigation(navigate, false, response);
      },
    });
    return;

    // console.log(newPaymentInfo, parsedINPut);
    //   if (!lnurlDescriptionInfo.didAsk) {
    //     navigate.navigate('LnurlPaymentDescription', {
    //       setLnurlDescriptionInfo: setLnurlDescriptionInfo,
    //       paymentInfo: paymentInfo,
    //     });
    //     return;
    //   }
    //   setIsLoading(true);
    // const response = await payLnurl({
    //   useTrampoline: false,
    //   data: paymentInfo.data,
    //   amountMsat: sendingAmount * 1000,
    //   comment: '',
    // });
    // console.log(response.type === 'endpointError', 'ERROR HANDLIGN');
    // if (response.type === 'endpointError') {
    //   handleNavigation(navigate, false);
    //   return;
    // }

    // if (response) {
    //   handleNavigation(navigate, false, response);
    // }
  }

  breezPaymentWrapper({
    paymentInfo: paymentInfo,
    amountMsat: paymentInfo?.invoice?.amountMsat,
    failureFunction: () => handleNavigation(navigate, false),
    confirmFunction: response => {
      if (fromPage === 'contacts') {
        publishMessageFunc();
      }
      setTimeout(
        () => {
          handleNavigation(navigate, false, response);
        },
        fromPage === 'contacts' ? 1000 : 0,
      );
    },
  });
  return;

  // setIsLoading(true);

  // const response = paymentInfo?.invoice?.amountMsat
  //   ? await sendPayment({
  //       useTrampoline: false,
  //       bolt11: paymentInfo?.invoice?.bolt11,
  //     })
  //   : await sendPayment({
  //       useTrampoline: false,
  //       bolt11: paymentInfo?.invoice?.bolt11,
  //       amountMsat: Number(sendingAmount * 1000),
  //     });

  if (fromPage === 'contacts') {
    publishMessageFunc();
  }
  setTimeout(() => {
    handleNavigation(navigate, false, response);
  }, 1000);
  // } catch (err) {
  //   console.log(err);
  //   try {
  //     const paymentHash = paymentInfo.invoice.paymentHash;
  //     await reportIssue({
  //       type: ReportIssueRequestVariant.PAYMENT_FAILURE,
  //       data: {paymentHash},
  //     });
  //     handleNavigation(navigate, false);
  //   } catch (err) {
  //     console.log(err);
  //     handleNavigation(navigate, false);
  //   }
  // }
}

export async function sendToLiquidFromLightning_sendPaymentScreen({
  paymentInfo,
  sendingAmount,
  navigate,
  webViewRef,
  fromPage,
  publishMessageFunc,
}) {
  const [data, swapPublicKey, privateKeyString, keys, preimage, liquidAddress] =
    await contactsLNtoLiquidSwapInfo(
      paymentInfo.addressInfo.address,
      sendingAmount,
      fromPage === 'contacts' ? 'Contacts payment' : 'Send to liquid address',
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
    fromPage: fromPage,
    contactsFunction: publishMessageFunc,
  });
  if (didHandle) {
    try {
      const prasedInput = await parseInput(data.invoice);
      // console.log(data);
      breezPaymentWrapper({
        paymentInfo: prasedInput,
        amountMsat: prasedInput?.invoice?.amountMsat,
        failureFunction: () => handleNavigation(navigate, false),
        confirmFunction: () => {
          console.log('CONFIRMED');
        },
      });
      return;
      // const didSend = await sendPayment({
      //   bolt11: data.invoice,
      //   useTrampoline: false,
      // });
      // if (didSend.payment.status === PaymentStatus.FAILED) {
      //   webSocket.close();
      //   handleNavigation(navigate, false);
      // }
    } catch (err) {
      console.log(err);
      webSocket.close();
      handleNavigation(navigate, false);
    }
  }
}

export async function getLNAddressForLiquidPayment(paymentInfo, sendingValue) {
  let invoiceAddress;

  if (paymentInfo.type === InputTypeVariant.LN_URL_PAY) {
    const response = await fetch(
      `${paymentInfo.data.callback}?amount=${sendingValue * 1000}`,
    );

    const bolt11Invoice = (await response.json()).pr;

    invoiceAddress = bolt11Invoice;
  } else {
    invoiceAddress = paymentInfo.invoice.bolt11;
  }

  return invoiceAddress;
}

function handleNavigation(navigate, didWork, response) {
  navigate.reset({
    index: 0, // The top-level route index
    routes: [
      {
        name: 'HomeAdmin',
        params: {screen: 'Home'},
      },
      {
        name: 'ConfirmTxPage',
        params: {
          for: response
            ? response.type
            : didWork
            ? 'paymentSucceed'
            : 'paymentFailed',
          information: response ? response : {},
        },
      },
    ],
  });
}
