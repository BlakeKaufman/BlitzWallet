import {
  Animated,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
} from 'react-native';
import {
  CENTER,
  COLORS,
  FONT,
  ICONS,
  SATSPERBITCOIN,
  SHADOWS,
  SIZES,
} from '../../../../constants';
import SwipeButton from 'rn-swipe-button';
import {useEffect, useRef, useState} from 'react';
import {
  InputTypeVariant,
  LnUrlCallbackStatusVariant,
  ReportIssueRequestVariant,
  lnurlAuth,
  parseInput,
  payLnurl,
  reportIssue,
  sendPayment,
  withdrawLnurl,
} from '@breeztech/react-native-breez-sdk';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import getKeyboardHeight from '../../../../hooks/getKeyboardHeight';
import {
  getLiquidFees,
  sendLiquidTransaction,
} from '../../../../functions/liquidWallet';
import {calculateBoltzFee} from '../../../../functions/boltz/calculateBoltzFee';
import createLiquidToLNSwap from '../../../../functions/boltz/liquidToLNSwap';
import WebView from 'react-native-webview';
import {formatBalanceAmount, numberConverter} from '../../../../functions';
const webviewHTML = require('boltz-swap-web-context');

export default function SendPaymentScreen(props) {
  console.log('CONFIRM SEND PAYMENT SCREEN');
  const [paymentInfo, setPaymentInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [sendingAmount, setSendingAmount] = useState(null);
  const [lnurlDescriptionInfo, setLnurlDescriptionInfo] = useState({
    didAsk: false,
    description: '',
  });
  const keyboardHeight = getKeyboardHeight();
  const [swapFee, setSwapFee] = useState({});
  const [liquidNetworkFee, setLiquidNetworkFee] = useState(0);
  const {
    theme,
    nodeInformation,
    masterInfoObject,
    liquidNodeInformation,
    toggleMasterInfoObject,
  } = useGlobalContextProvider();
  const [hasError, setHasError] = useState('');
  const webViewRef = useRef();
  const navigate = useNavigation();
  const BTCadress = props.route.params?.btcAdress;
  const isBTCdenominated =
    masterInfoObject.userBalanceDenomination === 'hidden' ||
    masterInfoObject.userBalanceDenomination === 'sats';

  const fiatSatValue = nodeInformation.fiatStats.value / SATSPERBITCOIN;

  const isUsingBank =
    masterInfoObject.liquidWalletSettings.regulatedChannelOpenSize &&
    nodeInformation.userBalance * 1000 - 5000 < sendingAmount &&
    liquidNodeInformation.userBalance * 1000 - 5000 > sendingAmount;
  const isUsingBankWithZeroInvoice =
    isUsingBank &&
    paymentInfo.type != InputTypeVariant.LN_URL_PAY &&
    !paymentInfo.invoice?.amountMsat;

  const canSendPayment =
    isUsingBank &&
    sendingAmount / 1000 >= swapFee?.pairSwapInfo?.limits?.minimal;

  const handleClaimMessage = event => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.error) throw Error(data.error);
      console.log(data, 'DATA FROM WEBVIEW');
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    decodeLNAdress();
    (async () => {
      const liquidFees = await getLiquidFees();

      const txSize = (148 + 3 * 34 + 10.5) / 100;

      setLiquidNetworkFee(liquidFees.fees[0] * txSize);
    })();
  }, []);

  return (
    <View
      style={[
        styles.popupContainer,
        {
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
          paddingTop: Platform.OS === 'ios' ? 0 : 10,
        },
      ]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={{flex: 1}}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView
            style={{flex: 1, alignItems: 'center', position: 'relative'}}>
            <View style={styles.topBar}>
              <TouchableOpacity onPress={() => goBackFunction()}>
                <Image
                  style={styles.backButton}
                  source={ICONS.smallArrowLeft}
                />
              </TouchableOpacity>
            </View>
            {/* This webview is used to call WASM code in brosers as WASM code cannot be called in react-native */}
            <WebView
              ref={webViewRef}
              containerStyle={{position: 'absolute', top: 1000, left: 1000}}
              source={webviewHTML}
              originWhitelist={['*']}
              onMessage={handleClaimMessage}
            />
            {hasError ? (
              <View style={styles.innerContainer}>
                <ActivityIndicator
                  size="large"
                  color={theme ? COLORS.darkModeText : COLORS.lightModeText}
                />
                <Text
                  style={{
                    fontFamily: FONT.Descriptoin_Regular,
                    fontSize: SIZES.medium,
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    marginTop: 10,
                  }}>
                  {hasError}
                </Text>
              </View>
            ) : !isLoading ? (
              <>
                <Text
                  style={[
                    styles.headerText,
                    {
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    },
                  ]}>
                  Total Balance
                </Text>
                <Text
                  style={[
                    styles.headerText,
                    {
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                      marginBottom: 30,
                    },
                  ]}>
                  {Math.round(
                    isBTCdenominated
                      ? nodeInformation.userBalance
                      : nodeInformation.userBalance * fiatSatValue,
                  ).toLocaleString()}{' '}
                  {isBTCdenominated ? 'sats' : nodeInformation.fiatStats.coin}
                </Text>

                <Text
                  style={[
                    styles.subHeaderText,
                    {
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    },
                  ]}>
                  Amount that will be sent:
                </Text>

                {paymentInfo.type != InputTypeVariant.LN_URL_PAY &&
                paymentInfo.invoice.amountMsat ? (
                  <Text
                    style={[
                      styles.sendingAmtBTC,
                      {
                        color: theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                      },
                    ]}>
                    {(isBTCdenominated
                      ? paymentInfo?.invoice?.amountMsat / 1000
                      : (paymentInfo?.invoice?.amountMsat / 1000) * fiatSatValue
                    ).toLocaleString()}{' '}
                    {isBTCdenominated ? 'sats' : nodeInformation.fiatStats.coin}
                  </Text>
                ) : (
                  <View
                    style={[
                      styles.sendingAmountInputContainer,
                      {alignItems: Platform.OS == 'ios' ? 'baseline' : null},
                    ]}>
                    {/* <View style={{maxWidth: 150}}> */}
                    <TextInput
                      style={[
                        styles.sendingAmtBTC,
                        {
                          color: theme
                            ? COLORS.darkModeText
                            : COLORS.lightModeText,
                          maxWidth: 175,
                          margin: 0,
                          padding: 0,
                        },
                      ]}
                      placeholderTextColor={
                        theme ? COLORS.darkModeText : COLORS.lightModeText
                      }
                      value={
                        sendingAmount === null || sendingAmount === 0
                          ? ''
                          : String(sendingAmount / 1000)
                      }
                      keyboardType="number-pad"
                      placeholder="0"
                      onChangeText={e => {
                        if (isNaN(e)) return;
                        setSendingAmount(Number(e) * 1000);
                      }}
                      onEndEditing={async () => {
                        const [boltzFee, pairSwapInfo] =
                          await calculateBoltzFee(sendingAmount / 1000);

                        setSwapFee({fee: boltzFee, pairSwapInfo: pairSwapInfo});
                      }}
                    />
                    {/* </View> */}

                    <Text
                      style={[
                        styles.sendingAmtBTC,
                        {
                          color: theme
                            ? COLORS.darkModeText
                            : COLORS.lightModeText,
                        },
                      ]}>
                      {' '}
                      {isBTCdenominated
                        ? 'sats'
                        : nodeInformation.fiatStats.coin}
                    </Text>
                  </View>
                )}
                <View
                  style={[
                    styles.invoiceContainer,
                    {
                      backgroundColor: theme
                        ? COLORS.darkModeBackgroundOffset
                        : COLORS.lightModeBackgroundOffset,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.invoiceText,
                      {
                        color: theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                        textAlign:
                          paymentInfo.type === InputTypeVariant.LN_URL_PAY
                            ? 'center'
                            : 'left',
                      },
                    ]}>
                    {paymentInfo.type === InputTypeVariant.LN_URL_PAY
                      ? paymentInfo.data.lnAddress
                      : paymentInfo?.invoice?.bolt11.slice(0, 100) + '...'}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.headerText,
                    {
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    },
                  ]}>
                  Fee and Speed
                </Text>
                <Text
                  style={[
                    styles.subHeaderText,
                    {
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                      fontSize: 13,
                    },
                  ]}>
                  {nodeInformation.uesrBalance > sendingAmount
                    ? 'instant with 0 Blitz fee'
                    : `bank swap fee of ${formatBalanceAmount(
                        numberConverter(
                          swapFee.fee + liquidNetworkFee,
                          'sats',
                          nodeInformation,
                          0,
                        ),
                      )} sats`}
                </Text>

                {isUsingBankWithZeroInvoice && (
                  <Text
                    style={{
                      textAlign: 'center',
                      marginTop: 'auto',
                      fontFamily: FONT.Title_Regular,
                      fontSize: SIZES.medium,
                      marginBottom: 10,
                    }}>
                    Zero Amount Invoices are not excepted when paying from the
                    bank
                  </Text>
                )}

                {isUsingBank &&
                  !canSendPayment &&
                  !isUsingBankWithZeroInvoice && (
                    <Text
                      style={{
                        textAlign: 'center',
                        marginTop: 'auto',
                        fontFamily: FONT.Title_Regular,
                        fontSize: SIZES.medium,
                        marginBottom: 10,
                      }}>
                      Minium send amount from bank is{' '}
                      {swapFee.pairSwapInfo?.limits?.minimal} sats
                    </Text>
                  )}

                {!keyboardHeight.isShowing && (
                  <SwipeButton
                    containerStyles={{
                      opacity:
                        paymentInfo.type === InputTypeVariant.LN_URL_PAY &&
                        (sendingAmount > paymentInfo.data.maxSendable ||
                          sendingAmount < paymentInfo.data.minSendable)
                          ? 0.5
                          : isUsingBankWithZeroInvoice ||
                            (isUsingBank && !canSendPayment)
                          ? 0.5
                          : 1,
                      width: '90%',
                      maxWidth: 350,
                      borderColor: theme
                        ? COLORS.darkModeText
                        : COLORS.lightModeText,
                      marginTop:
                        isUsingBankWithZeroInvoice ||
                        (isUsingBank && !canSendPayment)
                          ? 10
                          : 'auto',
                      marginBottom: 30,
                      ...CENTER,
                    }}
                    titleStyles={{fontWeight: 'bold', fontSize: SIZES.large}}
                    swipeSuccessThreshold={100}
                    onSwipeSuccess={() => {
                      if (isUsingBankWithZeroInvoice) return;
                      if (
                        paymentInfo.type === InputTypeVariant.LN_URL_PAY &&
                        (sendingAmount > paymentInfo.data.maxSendable ||
                          sendingAmount < paymentInfo.data.minSendable)
                      )
                        return;
                      // if (isUsingBank && !canSendPayment) return;
                      Keyboard.dismiss();
                      sendPaymentFunction();
                    }}
                    shouldResetAfterSuccess={
                      isUsingBank && canSendPayment ? false : true
                    }
                    railBackgroundColor={
                      theme
                        ? COLORS.lightModeBackground
                        : COLORS.darkModeBackground
                    }
                    railBorderColor={
                      theme
                        ? COLORS.lightModeBackground
                        : COLORS.darkModeBackground
                    }
                    height={55}
                    railStyles={{
                      backgroundColor: theme
                        ? COLORS.lightModeBackground
                        : COLORS.darkModeBackground,
                      borderColor: theme
                        ? COLORS.lightModeBackground
                        : COLORS.darkModeBackground,
                    }}
                    thumbIconBackgroundColor={
                      theme
                        ? COLORS.darkModeBackground
                        : COLORS.lightModeBackground
                    }
                    thumbIconBorderColor={
                      theme
                        ? COLORS.lightModeBackground
                        : COLORS.darkModeBackground
                    }
                    titleColor={
                      theme
                        ? COLORS.darkModeBackground
                        : COLORS.lightModeBackground
                    }
                    title="Slide to confirm"
                  />
                )}
              </>
            ) : (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <ActivityIndicator
                  size="large"
                  color={theme ? COLORS.darkModeText : COLORS.lightModeText}
                />
              </View>
            )}
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );

  function getClaimSubmarineSwapJS({invoiceAddress, swapInfo, privateKey}) {
    const args = JSON.stringify({
      apiUrl: process.env.BOLTZ_API,
      network: 'testnet',
      invoice: invoiceAddress,
      swapInfo,
      privateKey,
    });

    webViewRef.current.injectJavaScript(
      `window.claimSubmarineSwap(${args}); void(0);`,
    );
  }

  async function sendPaymentFunction() {
    try {
      const sendingValue =
        paymentInfo.type != InputTypeVariant.LN_URL_PAY &&
        paymentInfo?.invoice.amountMsat
          ? paymentInfo?.invoice.amountMsat
          : isBTCdenominated
          ? sendingAmount
          : (sendingAmount * SATSPERBITCOIN) / nodeInformation.fiatStats.value;

      if (!paymentInfo?.invoice?.amountMsat && !sendingAmount) {
        Alert.alert(
          'Cannot send a zero amount',
          'Please add an amount to send',
          [{text: 'Ok'}],
        );
        return;
      }
      if (
        nodeInformation.userBalance * 1000 - 5000 < sendingValue &&
        liquidNodeInformation.userBalance * 1000 - 5000 + swapFee.fee * 1000 <
          sendingValue
      ) {
        Alert.alert(
          'Your balance is too low to send this payment',
          'Please add funds to your account',
          [{text: 'Ok', onPress: () => goBackFunction()}],
        );
        return;
      }

      if (nodeInformation.userBalance * 1000 - 5000 > sendingValue) {
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

        // console.log(response);
        if (response) {
          navigate.navigate('HomeAdmin');
          navigate.navigate('ConfirmTxPage', {
            for: response.type,
            information: response,
          });
        }
      } else {
        console.log('LIQUID PAYMNET');

        let invoiceAddress;

        if (paymentInfo.type === InputTypeVariant.LN_URL_PAY) {
          console.log(sendingValue);
          console.log(paymentInfo.data);
          const response = await fetch(
            `${paymentInfo.data.callback}?amount=${sendingValue}`,
          );

          const bolt11Invoice = (await response.json()).pr;

          invoiceAddress = bolt11Invoice;
        } else {
          invoiceAddress = paymentInfo.invoice.bolt11;
        }

        setIsLoading(true);

        const {swapInfo, privateKey} = await createLiquidToLNSwap(
          invoiceAddress,
        );

        console.log(swapInfo, privateKey);

        if (!swapInfo?.expectedAmount || !swapInfo?.address) {
          Alert.alert('Already paid or created swap with this address', '', [
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

        // toggleMasterInfoObject({
        //   liquidSwaps: [...masterInfoObject.liquidSwaps].concat(refundJSON),
        // });

        const webSocket = new WebSocket(
          `${process.env.BOLTZ_API.replace('https://', 'wss://')}/v2/ws`,
        );
        webSocket.onopen = () => {
          console.log('did un websocket open');
          webSocket.send(
            JSON.stringify({
              op: 'subscribe',
              channel: 'swap.update',
              args: [swapInfo.id],
            }),
          );
        };

        webSocket.onmessage = async rawMsg => {
          const msg = JSON.parse(rawMsg.data);

          console.log(msg);

          if (msg.args[0].status === 'transaction.mempool') {
            toggleMasterInfoObject({
              liquidSwaps: [...masterInfoObject.liquidSwaps].concat([
                refundJSON,
              ]),
            });
          } else if (msg.args[0].status === 'transaction.claim.pending') {
            getClaimSubmarineSwapJS({
              invoiceAddress,
              swapInfo,
              privateKey,
            });
          } else if (msg.args[0].status === 'transaction.claimed') {
            let newLiquidTransactions = [...masterInfoObject.liquidSwaps];
            newLiquidTransactions.pop();

            toggleMasterInfoObject({
              liquidSwaps: newLiquidTransactions,
            });

            webSocket.close();
            navigate.navigate('HomeAdmin');
            navigate.navigate('ConfirmTxPage', {
              for: 'paymentSucceed',
              information: {},
            });
          }
        };

        const didSend = await sendLiquidTransaction(
          swapInfo.expectedAmount,
          swapInfo.address,
        );

        if (!didSend) {
          webSocket.close();
          setHasError('Error sending payment. Try again.');
        }
      }
    } catch (err) {
      setHasError('Error sending payment. Try again.');
      console.log(err, 'SENDING ERRORR');
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

  async function decodeLNAdress() {
    setIsLoading(true);
    try {
      if (nodeInformation.didConnectToNode) {
        try {
          const input = await parseInput(BTCadress);

          const [boltzFee, pairSwapInfo] = await calculateBoltzFee(
            input.type != InputTypeVariant.BOLT11
              ? 1
              : input.invoice.amountMsat
              ? input.invoice.amountMsat / 1000
              : 1,
            'liquid-ln',
          );
          setSwapFee({fee: boltzFee || 0, pairSwapInfo: pairSwapInfo});

          if (input.type === InputTypeVariant.LN_URL_AUTH) {
            const result = await lnurlAuth(input.data);
            if (result.type === LnUrlCallbackStatusVariant.OK)
              Alert.alert('LNURL successfully authenticated', '', [
                {text: 'Ok', onPress: () => goBackFunction()},
              ]);
            else
              Alert.alert('Failed to authenticate LNURL', '', [
                {text: 'Ok', onPress: () => goBackFunction()},
              ]);
            return;
          } else if (input.type === InputTypeVariant.LN_URL_PAY) {
            const amountMsat = input.data.minSendable;
            setPaymentInfo(input);
            setSendingAmount(amountMsat);
            setIsLoading(false);

            return;
          } else if (input.type === InputTypeVariant.LN_URL_WITHDRAW) {
            try {
              await withdrawLnurl({
                data: input.data,
                amountMsat: input.data.minWithdrawable,
                description: input.data.defaultDescription,
              });
              setHasError('Retrieving LNURL amount');
            } catch (err) {
              console.log(err);
              setHasError('Error comnpleting withdrawl');
            }

            return;
          }

          setPaymentInfo(input);

          setSendingAmount(
            !input.invoice.amountMsat ? null : input.invoice.amountMsat,
          );
          setIsLoading(false);
        } catch (err) {
          Alert.alert(
            'Not a valid LN Address',
            'Please try again with a bolt 11 address',
            [{text: 'Ok', onPress: () => goBackFunction()}],
          );
          console.log(err);
        }
      } else {
        Alert.alert('Error not connected to node', '', [
          {text: 'Ok', onPress: () => goBackFunction()},
        ]);
      }
    } catch (err) {
      console.log(err);
    }
  }

  function goBackFunction() {
    navigate.goBack();
  }
}

const styles = StyleSheet.create({
  popupContainer: {
    flex: 1,
  },

  innerContainer: {
    flex: 1,
    width: '95%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 30,
    height: 30,
  },
  headerText: {
    fontSize: SIZES.xLarge,
    fontFamily: FONT.Title_Regular,
    ...CENTER,
  },
  subHeaderText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Regular,
    ...CENTER,
  },

  sendingAmountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  sendingAmtBTC: {
    fontSize: SIZES.huge,
    fontFamily: FONT.Title_Regular,
  },
  invoiceContainer: {
    width: '95%',
    padding: 8,
    borderRadius: 8,
    marginBottom: 20,
  },
  invoiceText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Descriptoin_Regular,
  },
  feeBreakdownContainer: {
    width: '85%',
  },
  feeBreakdownRow: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 15,
  },
  feeBreakdownItem: {
    width: '36%',
    textAlign: 'right',

    alignItems: 'flex-end',
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Bold,
  },
  feeBreakdownValue: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
  },

  buttonsContainer: {
    width: '90%',
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    width: '48%',

    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    borderRadius: 5,
    ...SHADOWS.small,
  },
  buttonText: {
    fontSize: SIZES.medium,
    color: COLORS.lightWhite,
    fontFamily: FONT.Other_Regular,
  },
});
