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

export default function SendPaymentScreen(props) {
  console.log('CONFIRM SEND PAYMENT SCREEN');
  const [paymentInfo, setPaymentInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [sendingAmount, setSendingAmount] = useState(null);
  const [lnurlDescriptionInfo, setLnurlDescriptionInfo] = useState({
    didAsk: false,
    description: '',
  });
  const {theme, nodeInformation, masterInfoObject} = useGlobalContextProvider();
  const [hasError, setHasError] = useState('');
  const navigate = useNavigation();
  const BTCadress = props.route.params?.btcAdress;
  const isBTCdenominated =
    masterInfoObject.userBalanceDenomination === 'hidden' ||
    masterInfoObject.userBalanceDenomination === 'sats';

  const fiatSatValue = nodeInformation.fiatStats.value / SATSPERBITCOIN;

  useEffect(() => {
    decodeLNAdress();
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                      {alignItems: 'center'},
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
                  instant with 0 Blitz fee
                </Text>

                <SwipeButton
                  containerStyles={{
                    opacity:
                      paymentInfo.type === InputTypeVariant.LN_URL_PAY &&
                      (sendingAmount > paymentInfo.data.maxSendable ||
                        sendingAmount < paymentInfo.data.minSendable)
                        ? 0.2
                        : 1,
                    width: '90%',
                    maxWidth: 350,
                    borderColor: theme
                      ? COLORS.darkModeText
                      : COLORS.lightModeText,
                    marginTop: 'auto',
                    marginBottom: 30,
                    ...CENTER,
                  }}
                  titleStyles={{fontWeight: 'bold', fontSize: SIZES.large}}
                  swipeSuccessThreshold={100}
                  onSwipeSuccess={() => {
                    if (
                      paymentInfo.type === InputTypeVariant.LN_URL_PAY &&
                      (sendingAmount > paymentInfo.data.maxSendable ||
                        sendingAmount < paymentInfo.data.minSendable)
                    )
                      return;
                    Keyboard.dismiss();
                    sendPaymentFunction();
                  }}
                  shouldResetAfterSuccess={true}
                  railBackgroundColor={
                    theme
                      ? COLORS.darkModeBackground
                      : COLORS.lightModeBackground
                  }
                  railBorderColor={
                    theme ? COLORS.darkModeText : COLORS.lightModeText
                  }
                  height={55}
                  railStyles={{
                    backgroundColor: theme
                      ? COLORS.darkModeText
                      : COLORS.lightModeText,
                    borderColor: theme
                      ? COLORS.darkModeText
                      : COLORS.lightModeText,
                  }}
                  thumbIconBackgroundColor={
                    theme ? COLORS.darkModeText : COLORS.lightModeText
                  }
                  thumbIconBorderColor={
                    theme ? COLORS.darkModeText : COLORS.lightModeText
                  }
                  titleColor={
                    theme ? COLORS.darkModeText : COLORS.lightModeText
                  }
                  title="Slide to confirm"
                />
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

  async function sendPaymentFunction() {
    try {
      const sendingValue =
        paymentInfo.type != InputTypeVariant.LN_URL_PAY &&
        paymentInfo?.invoice.amountMsat
          ? paymentInfo?.invoice.amountMsat
          : isBTCdenominated
          ? sendingAmount
          : (sendingAmount * SATSPERBITCOIN) / nodeInformation.fiatStats.value;

      if (nodeInformation.userBalance * 1000 - 5000 < sendingValue) {
        Alert.alert(
          'Your balance is too low to send this payment',
          'Please add funds to your account',
          [{text: 'Ok', onPress: () => goBackFunction()}],
        );
        return;
      }
      if (!paymentInfo?.invoice?.amountMsat && !sendingAmount) {
        Alert.alert(
          'Cannot send a zero amount',
          'Please add an amount to send',
          [{text: 'Ok'}],
        );
        return;
      }

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

      if (response) {
        navigate.navigate('HomeAdmin');
        navigate.navigate('ConfirmTxPage', {
          for: response.type,
          information: response,
        });
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
