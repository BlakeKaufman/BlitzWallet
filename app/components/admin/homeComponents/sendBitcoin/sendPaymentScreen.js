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
  ReportIssueRequestVariant,
  parseInput,
  reportIssue,
  sendPayment,
} from '@breeztech/react-native-breez-sdk';
import {getLocalStorageItem} from '../../../../functions';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../context-store/context';

export default function SendPaymentScreen(props) {
  console.log('CONFIRM SEND PAYMENT SCREEN');
  const [paymentInfo, setPaymentInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [sendingAmount, setSendingAmount] = useState(0);
  const {theme, nodeInformation, userBalanceDenomination} =
    useGlobalContextProvider();
  const [hasError, setHasError] = useState('');
  const navigate = useNavigation();
  const BTCadress = props.route.params?.btcAdress;
  const setScanned = props.route.params?.setDidScan;
  const isBTCdenominated =
    userBalanceDenomination === 'hidden' || userBalanceDenomination === 'sats';

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
          <SafeAreaView style={{flex: 1, position: 'relative'}}>
            <View style={styles.topBar}>
              <TouchableOpacity onPress={() => goBackFunction()}>
                <Image
                  style={styles.backButton}
                  source={ICONS.leftCheveronIcon}
                />
              </TouchableOpacity>
            </View>
            {hasError ? (
              <View style={styles.innerContainer}>
                <Text
                  style={{
                    fontFamily: FONT.Descriptoin_Regular,
                    fontSize: SIZES.medium,
                    color: COLORS.cancelRed,
                  }}>
                  {hasError}
                </Text>
              </View>
            ) : !isLoading ? (
              <>
                <ScrollView
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={[
                    styles.innerContainer,
                    {justifyContent: 'flex-start'},
                  ]}>
                  <Text
                    style={[
                      styles.headerText,
                      {
                        color: theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                      },
                    ]}>
                    Account Balance
                  </Text>
                  <Text
                    style={[
                      styles.headerText,
                      {
                        color: theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
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
                        color: theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                      },
                    ]}>
                    Amount that will be sent:
                  </Text>

                  {paymentInfo.invoice.amountMsat ? (
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
                        : (paymentInfo?.invoice?.amountMsat / 1000) *
                          fiatSatValue
                      ).toLocaleString()}{' '}
                      {isBTCdenominated
                        ? 'sats'
                        : nodeInformation.fiatStats.coin}
                    </Text>
                  ) : (
                    <View style={styles.sendingAmountInputContainer}>
                      <TextInput
                        style={[
                          styles.sendingAmtBTC,
                          {
                            color: theme
                              ? COLORS.darkModeText
                              : COLORS.lightModeText,
                            marginTop: 0,
                          },
                        ]}
                        placeholderTextColor={
                          theme ? COLORS.darkModeText : COLORS.lightModeText
                        }
                        // value={String(sendingAmount / 1000)}
                        keyboardType="number-pad"
                        placeholder="0"
                        onChangeText={e => {
                          if (isNaN(e)) return;
                          setSendingAmount(Number(e) * 1000);
                        }}
                      />

                      <Text
                        style={[
                          styles.sendingAmtBTC,
                          {
                            color: theme
                              ? COLORS.darkModeText
                              : COLORS.lightModeText,
                            marginTop: 0,
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
                        },
                      ]}>
                      {paymentInfo?.invoice?.bolt11.slice(0, 100)}...
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.headerText,
                      {
                        color: theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                      },
                    ]}>
                    Fee and Speed
                  </Text>
                  <Text
                    style={[
                      styles.subHeaderText,
                      {
                        color: theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                        fontSize: 13,
                      },
                    ]}>
                    instant with 0 Blitz fee
                  </Text>
                </ScrollView>
                <SwipeButton
                  containerStyles={{
                    width: '90%',
                    maxWidth: 350,
                    borderColor: theme
                      ? COLORS.darkModeText
                      : COLORS.lightModeText,
                    marginTop: 'auto',
                    ...CENTER,
                  }}
                  swipeSuccessThreshold={100}
                  onSwipeSuccess={() => {
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
                  railStyles={{
                    backgroundColor: COLORS.primary,
                    borderColor: COLORS.primary,
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
            {/* popups */}
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );

  async function sendPaymentFunction() {
    try {
      const sendingValue = paymentInfo?.invoice.amountMsat
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
        Alert.alert('Cannot send 0 amount', [{text: 'Ok'}]);
        return;
      }

      setIsLoading(true);
      paymentInfo?.invoice?.amountMsat
        ? await sendPayment({
            bolt11: paymentInfo?.invoice?.bolt11,
          })
        : await sendPayment({
            bolt11: paymentInfo?.invoice?.bolt11,
            amountMsat: Number(sendingAmount),
          });
      // if (response) {
      //   // goBackFunction();
      //   //
      //   // goBackFunction();
      // }
    } catch (err) {
      setHasError('Error sending payment. Try again.');
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
    // try {
    if (nodeInformation.didConnectToNode) {
      try {
        const input = await parseInput(BTCadress);
        // const currency = await getLocalStorageItem('currency');

        // const bitcoinPrice = (await fetchFiatRates()).filter(
        //   coin => coin.coin === currency,
        // );

        setPaymentInfo(input);
        // setUserSelectedCurrency(currency);
        setSendingAmount(input.invoice.amountMsat);
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
  }

  function goBackFunction() {
    navigate.goBack();
    setScanned(false);
  }
}

const styles = StyleSheet.create({
  popupContainer: {
    flex: 1,
  },

  innerContainer: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    padding: 20,
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
  },
  subHeaderText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Regular,
  },

  sendingAmountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sendingAmtBTC: {
    fontSize: SIZES.huge,
    fontFamily: FONT.Title_Regular,
    marginBottom: 30,
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
