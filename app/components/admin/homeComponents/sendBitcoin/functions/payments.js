import {
  InputTypeVariant,
  PaymentStatus,
  ReportIssueRequestVariant,
  parseInput,
  payLnurl,
  reportIssue,
  sendPayment,
} from '@breeztech/react-native-breez-sdk';
import {
  getBoltzApiUrl,
  getBoltzWsUrl,
} from '../../../../../functions/boltz/boltzEndpoitns';
import {contactsLNtoLiquidSwapInfo} from '../../contacts/internalComponents/LNtoLiquidSwap';
import handleReverseClaimWSS from '../../../../../functions/boltz/handle-reverse-claim-wss';
// import {getLiquidFromSwapInvoice} from '../../../../../functions/boltz/magicRoutingHints';
import {breezPaymentWrapper} from '../../../../../functions/SDK';
import {
  breezLiquidLNAddressPaymentWrapper,
  breezLiquidPaymentWrapper,
} from '../../../../../functions/breezLiquid';
import {assetIDS} from '../../../../../functions/liquidWallet/assetIDS';
import {
  BLITZ_DEFAULT_PAYMENT_DESCRIPTION,
  SATSPERBITCOIN,
} from '../../../../../constants';
import breezLNAddressPaymentWrapper from '../../../../../functions/SDK/lightningAddressPaymentWrapper';
import {
  PayAmountVariant,
  payOnchain,
  preparePayOnchain,
} from '@breeztech/react-native-breez-sdk-liquid';
import breezLNOnchainPaymentWrapper from '../../../../../functions/SDK/breezOnchainPaymentWrapper';

export async function sendLiquidPayment_sendPaymentScreen({
  sendingAmount,
  paymentInfo,
  navigate,
  fromPage,
  publishMessageFunc,
  paymentDescription,
}) {
  try {
    const formattedLiquidAddress = `${
      process.env.BOLTZ_ENVIRONMENT === 'testnet'
        ? 'liquidtestnet:'
        : 'liquidnetwork:'
    }${paymentInfo.data.address}?assetid=${
      assetIDS['L-BTC']
    }&message=${paymentDescription}&amount=${(
      sendingAmount / SATSPERBITCOIN
    ).toFixed(8)}`;

    const paymentResponse = await breezLiquidPaymentWrapper({
      invoice: formattedLiquidAddress,
      paymentType: 'bip21Liquid',
    });

    if (!paymentResponse.didWork) {
      handleNavigation({
        navigate,
        didWork: false,
        response: {
          details: {error: paymentResponse.error, amountSat: sendingAmount},
        },
        formattingType: 'liquidNode',
      });
      return;
    }
    const {payment, fee} = paymentResponse;

    if (fromPage === 'contacts') {
      publishMessageFunc();
    }

    console.log(payment, fee);
  } catch (err) {
    console.log(err);
  }
}

export async function sendToLNFromLiquid_sendPaymentScreen({
  paymentInfo,
  webViewRef,
  toggleMasterInfoObject,
  masterInfoObject,
  contactsPrivateKey,
  goBackFunction,
  navigate,
  sendingAmount,
  fromPage,
  publishMessageFunc,
  toggleSavedIds,
  paymentDescription,
}) {
  if (paymentInfo.type === InputTypeVariant.LN_URL_PAY) {
    const paymentResponse = await breezLiquidLNAddressPaymentWrapper({
      sendAmountSat: sendingAmount,
      description: paymentDescription,
      paymentInfo: paymentInfo.data,
    });

    if (!paymentResponse.didWork) {
      handleNavigation({
        navigate,
        didWork: false,
        response: {
          details: {error: paymentResponse.error, amountSat: sendingAmount},
        },
        formattingType: 'liquidNode',
      });
      return;
    }
    const {payment, fee} = paymentResponse;

    if (fromPage === 'contacts') {
      publishMessageFunc();
    }

    console.log(payment, fee);
    return;
  }

  const lnAddress = await getLNAddressForLiquidPayment(
    paymentInfo,
    sendingAmount,
  );

  if (!lnAddress) {
    handleNavigation({
      navigate,
      didWork: false,
      response: {
        details: {
          error: 'Unable to get valid lighting invoice',
          amountSat: sendingAmount,
        },
      },
      formattingType: 'liquidNode',
    });
    return;
  }
  const paymentResponse = await breezLiquidPaymentWrapper({
    invoice: lnAddress,
    paymentType: 'liquidSwap',
  });

  if (!paymentResponse.didWork) {
    handleNavigation({
      navigate,
      didWork: false,
      response: {
        details: {error: paymentResponse.error, amountSat: sendingAmount},
      },
      formattingType: 'liquidNode',
    });
    return;
  }
  const {payment, fee} = paymentResponse;

  if (fromPage === 'contacts') {
    publishMessageFunc();
  }

  console.log(payment, fee);
  return;

  // const {swapInfo, privateKey} = await createLiquidToLNSwap(lnAddress);

  // if (!swapInfo?.expectedAmount || !swapInfo?.address) {
  //   const response = await getLiquidFromSwapInvoice(lnAddress);
  //   if (!response) {
  //     navigate.navigate('ErrorScreen', {
  //       errorMessage: 'Error decode invoice.',
  //       customNavigator: () => goBackFunction(),
  //     });
  //     // Alert.alert('Cannot decode swap invoice.', '', [
  //     //   {text: 'Ok', onPress: () => goBackFunction()},
  //     // ]);
  //   } else {
  //     const {invoice, liquidAddress} = response;

  //     if (invoice.timeExpireDate < Math.round(new Date().getTime() / 1000)) {
  //       navigate.navigate('ErrorScreen', {
  //         errorMessage: 'Invoice has expired',
  //         customNavigator: () => goBackFunction(),
  //       });
  //       // Alert.alert('Swap invoice has expired', '', [
  //       //   {text: 'Ok', onPress: () => goBackFunction()},
  //       // ]);
  //       return;
  //     }

  //     const didSend = await sendLiquidTransaction(
  //       invoice?.satoshis,
  //       liquidAddress,
  //       false,
  //       false,
  //     );
  //     if (didSend) {
  //       handleNavigation(navigate, true);
  //     } else {
  //       handleNavigation(navigate, false);
  //     }
  //   }

  //   return;
  // }

  // const refundJSON = {
  //   id: swapInfo.id,
  //   asset: 'L-BTC',
  //   version: 3,
  //   privateKey: privateKey,
  //   blindingKey: swapInfo.blindingKey,
  //   claimPublicKey: swapInfo.claimPublicKey,
  //   timeoutBlockHeight: swapInfo.timeoutBlockHeight,
  //   swapTree: swapInfo.swapTree,
  // };
  // const webSocket = new WebSocket(
  //   `${getBoltzWsUrl(process.env.BOLTZ_ENVIRONMENT)}`,
  // );

  // const didHandle = await handleSubmarineClaimWSS({
  //   ref: webViewRef,
  //   webSocket: webSocket,
  //   invoiceAddress: lnAddress,
  //   swapInfo,
  //   privateKey,
  //   toggleMasterInfoObject,
  //   masterInfoObject,
  //   contactsPrivateKey,
  //   refundJSON,
  //   navigate,
  //   page: fromPage,
  //   handleFunction: publishMessageFunc,
  // });
  // if (didHandle) {
  //   const didSend = await sendLiquidTransaction(
  //     swapInfo.expectedAmount,
  //     swapInfo.address,
  //     true,
  //     false,
  //     toggleSavedIds,
  //   );
  //   if (!didSend) {
  //     webSocket.close();
  //     handleNavigation(navigate, false);
  //   }
  // }
}

export async function sendLightningPayment_sendPaymentScreen({
  sendingAmount,
  paymentInfo,
  navigate,
  fromPage,
  publishMessageFunc,
  paymentDescription,
}) {
  // try {
  if (paymentInfo.type === InputTypeVariant.LN_URL_PAY) {
    await breezLNAddressPaymentWrapper({
      paymentInfo,
      sendingAmountSat: sendingAmount,
      paymentDescription,
      failureFunction: response =>
        handleNavigation({
          navigate,
          didWork: false,
          response: response.data,
          formattingType: 'lightningNode',
        }),
      confirmFunction: response => {
        if (fromPage === 'contacts') {
          publishMessageFunc();
        }
        setTimeout(
          () => {
            handleNavigation({
              navigate,
              didWork: true,
              response: response.data,
              formattingType: 'lightningNode',
            });
          },
          fromPage === 'contacts' ? 1000 : 0,
        );
      },
    });
    return;
    // const invoice = await getLNAddressForLiquidPayment(
    //   paymentInfo,
    //   sendingAmount,
    // );

    // const parsedLNURL = await parseInput(invoice);
    // breezPaymentWrapper({
    //   paymentInfo: parsedLNURL,
    //   amountMsat: parsedLNURL?.invoice?.amountMsat,
    //   paymentDescription: paymentDescription,
    //   failureFunction: response =>
    //     handleNavigation({
    //       navigate,
    //       didWork: false,
    //       response,
    //       formattingType: 'lightningNode',
    //     }),
    //   confirmFunction: response => {
    //     handleNavigation({
    //       navigate,
    //       didWork: true,
    //       response,
    //       formattingType: 'lightningNode',
    //     });
    //   },
    // });
    // return;

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

  await breezPaymentWrapper({
    paymentInfo: paymentInfo.data,
    amountMsat:
      paymentInfo?.data.invoice?.amountMsat || Number(sendingAmount * 1000),
    failureFunction: response =>
      handleNavigation({
        navigate,
        didWork: false,
        response,
        formattingType: 'lightningNode',
      }),
    confirmFunction: response => {
      if (fromPage === 'contacts') {
        publishMessageFunc();
      }
      setTimeout(
        () => {
          handleNavigation({
            navigate,
            didWork: true,
            response,
            formattingType: 'lightningNode',
          });
        },
        fromPage === 'contacts' ? 1000 : 0,
      );
    },
  });
  // return;

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

  // if (fromPage === 'contacts') {
  //   publishMessageFunc();
  // }
  // setTimeout(() => {
  //   handleNavigation(navigate, false, response);
  // }, 1000);
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
  try {
    const [
      data,
      swapPublicKey,
      privateKeyString,
      keys,
      preimage,
      liquidAddress,
    ] = await contactsLNtoLiquidSwapInfo(
      paymentInfo.data.address,
      sendingAmount,
      fromPage === 'contacts'
        ? 'Contacts payment'
        : BLITZ_DEFAULT_PAYMENT_DESCRIPTION,
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
      privateKey: privateKeyString,
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
          failureFunction: response =>
            handleNavigation({
              navigate,
              didWork: false,
              response,
              formattingType: 'lightningNode',
            }),
          confirmFunction: response => {
            async function pollBoltzSwapStatus() {
              let didSettleInvoice = false;
              let runCount = 0;

              while (!didSettleInvoice && runCount < 10) {
                runCount += 1;
                const resposne = await fetch(
                  getBoltzApiUrl() + `/v2/swap/${data.id}`,
                );
                const boltzData = await resposne.json();

                if (boltzData.status === 'invoice.settled') {
                  didSettleInvoice = true;
                  handleNavigation({
                    navigate,
                    didWork: true,
                    response,
                    formattingType: 'lightningNode',
                  });
                } else {
                  console.log('Waiting for confirmation....');
                  await new Promise(resolve => setTimeout(resolve, 5000));
                }
              }
            }
            pollBoltzSwapStatus();
            console.log('CONFIRMED');
          },
        });
      } catch (err) {
        console.log(err);
        webSocket.close();
        handleNavigation({
          navigate,
          didWork: false,
          response: {
            details: {error: err, amountSat: sendingAmount},
          },
          formattingType: 'lightningNode',
        });
      }
    }
  } catch (err) {
    console.log(err, 'SEND ERROR');
    handleNavigation({
      navigate,
      didWork: false,
      response: {
        details: {error: 'Not able to generate invoice'},
      },
      formattingType: 'lightningNode',
    });
  }
}

export async function getLNAddressForLiquidPayment(
  paymentInfo,
  sendingValue,
  description,
) {
  let invoiceAddress;

  if (paymentInfo.type === InputTypeVariant.LN_URL_PAY) {
    const url = `${paymentInfo.data.callback}?amount=${sendingValue * 1000}${
      !!paymentInfo?.data.commentAllowed
        ? `&comment=${encodeURIComponent(description || '')}`
        : ''
    }`;
    console.log('Generated URL:', url);
    const response = await fetch(url);

    const bolt11Invoice = (await response.json()).pr;

    invoiceAddress = bolt11Invoice;
  } else {
    invoiceAddress = paymentInfo.data.invoice.bolt11;
  }

  return invoiceAddress;
}
export async function sendBitcoinPayment({
  paymentInfo,
  sendingValue,
  description,
  onlyPrepare,
  from,
}) {
  try {
    if (from === 'liquid') {
      const prepareResponse = await preparePayOnchain({
        amount: {
          type: PayAmountVariant.RECEIVER,
          amountSat: sendingValue,
        },
      });

      // Check if the fees are acceptable before proceeding
      const totalFeesSat = prepareResponse.totalFeesSat;

      if (onlyPrepare) {
        return {didWork: true, fees: totalFeesSat};
      }

      const destinationAddress = paymentInfo?.data.address;

      const payOnchainRes = await payOnchain({
        address: destinationAddress,
        prepareResponse,
      });
      console.log(payOnchainRes.payment);
      return {didWork: true};
    } else if (from === 'lightning') {
      const breezOnChainResponse = await breezLNOnchainPaymentWrapper({
        amountSat: sendingValue,
        onlyPrepare: onlyPrepare,
        paymentInfo: paymentInfo,
      });
      return breezOnChainResponse;
    } else {
      return {didWork: false};
    }
  } catch (err) {
    console.error(err, 'PAY ONCHAIN ERROR');
    return {didWork: false, error: JSON.stringify(err)};
  }
}

function handleNavigation({navigate, didWork, response, formattingType}) {
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
          for: didWork ? 'paymentSucceed' : 'paymentFailed',
          information: response ? response : {},
          formattingType: formattingType,
        },
      },
    ],
  });
}
