import {useNavigation, useTheme} from '@react-navigation/native';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {
  BTN,
  CENTER,
  COLORS,
  FONT,
  ICONS,
  LNURL_WITHDRAWL_CODES,
  SHADOWS,
  SIZES,
} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useEffect, useRef, useState} from 'react';
import {
  copyToClipboard,
  formatBalanceAmount,
  getLocalStorageItem,
  numberConverter,
  setLocalStorageItem,
} from '../../../../functions';
import {getFiatRates} from '../../../../functions/SDK';
import {sendSpontaneousPayment} from '@breeztech/react-native-breez-sdk';
import {ConfigurePushNotifications} from '../../../../hooks/setNotifications';
import {randomUUID} from 'expo-crypto';
import * as bench32 from 'bech32';

import Buffer from 'buffer';
import QRCode from 'react-native-qrcode-svg';

export default function AmountToGift() {
  const isInitialRender = useRef(true);
  const navigate = useNavigation();
  const {theme, nodeInformation, masterInfoObject} = useGlobalContextProvider();
  const expoPushToken = ConfigurePushNotifications();

  const [giftAmount, setGiftAmount] = useState('');
  const [errorText, setErrorText] = useState('');
  const [giftCode, setGiftCode] = useState('');
  return (
    <View
      style={[
        styles.globalContainer,
        {
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
        },
      ]}>
      <KeyboardAvoidingView behavior={'padding'} style={{flex: 1}}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <SafeAreaView style={{flex: 1}}>
            <View style={styles.topbar}>
              <TouchableOpacity
                onPress={() => {
                  navigate.goBack();
                  isInitialRender.current = true;
                }}>
                <Image
                  style={styles.topBarIcon}
                  source={ICONS.leftCheveronIcon}
                />
              </TouchableOpacity>
              <Text
                style={[
                  styles.topBarText,
                  {
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  },
                ]}>
                Set Gift Amount
              </Text>
            </View>

            {!giftCode ? (
              <>
                <View style={[styles.contentContainer]}>
                  <View style={styles.inputContainer}>
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
                      value={giftAmount}
                      keyboardType="numeric"
                      placeholder="0"
                      onChangeText={setGiftAmount}
                    />
                    <Text
                      style={[
                        styles.satText,
                        {
                          transform: [
                            {translateY: Platform.OS === 'ios' ? 0 : -10},
                          ],
                        },
                      ]}>
                      Sat
                    </Text>
                  </View>
                  <View>
                    <Text>
                      ={' '}
                      {(
                        Number(giftAmount) *
                        (nodeInformation.fiatStats.value / 100000000)
                      ).toFixed(2)}{' '}
                      {nodeInformation.fiatStats.coin}
                    </Text>
                  </View>
                  <Text
                    style={{
                      width: '95%',
                      fontFamily: FONT.Descriptoin_Regular,
                      color: COLORS.cancelRed,
                      marginTop: 20,
                      fontSize: SIZES.medium,
                      textAlign: 'center',
                    }}>
                    {errorText ? errorText : ' '}
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      fontFamily: FONT.Title_Regular,
                      fontSize: SIZES.medium,
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                      textAlign: 'center',
                      marginBottom: 10,
                    }}>
                    Minumum gift amount is {formatBalanceAmount(20000)} sats
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={createGiftCode}
                  style={[
                    BTN,
                    {
                      backgroundColor: COLORS.primary,
                      marginTop: 'auto',
                      marginBottom: Platform.OS === 'ios' ? 10 : 35,
                      ...CENTER,
                    },
                  ]}>
                  <Text style={styles.buttonText}>Send Gift</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <View
                  style={[
                    styles.qrCodeContainer,
                    {
                      backgroundColor: theme
                        ? COLORS.darkModeBackgroundOffset
                        : COLORS.lightModeBackgroundOffset,
                      paddingVertical: 10,
                      marginTop: 'auto',
                    },
                  ]}>
                  <QRCode
                    size={250}
                    quietZone={15}
                    value={giftCode ? giftCode : 'Genrating QR Code'}
                    color={theme ? COLORS.lightModeText : COLORS.darkModeText}
                    backgroundColor={
                      theme ? COLORS.darkModeText : COLORS.lightModeText
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.giftAmountStyle,
                    {
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    },
                  ]}>
                  {formatBalanceAmount(Number(giftAmount))} sats
                </Text>

                <View style={styles.buttonsContainer}>
                  <TouchableOpacity
                    onPress={() => openShareOptions(giftCode)}
                    style={[styles.buttonsOpacity]}>
                    <Text style={styles.buttonText}>Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      copyToClipboard(giftCode, navigate);
                    }}
                    style={[styles.buttonsOpacity]}>
                    <Text style={styles.buttonText}>Copy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );

  async function createGiftCode() {
    try {
      if (giftAmount < 20000) {
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Gift amount must be heigher than 20 000 sats',
        });
        return;
      } else if (nodeInformation.userBalance + 50 <= giftAmount) {
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Not enough funds',
        });

        return;
      }

      const giftCode = generateGiftCode(expoPushToken, giftAmount);

      setGiftCode(giftCode);
      console.log(giftCode);
      console.log('TES');

      // ADD USER FEEDBACK
    } catch (err) {
      setErrorText('Error when sending payment');
      console.log(err);
    }
  }
}

function generateGiftCode(expoPushToken, giftAmount) {
  try {
    if (!expoPushToken) return;
    const UUID = randomUUID();

    const data = `https://blitz-wallet.com/.netlify/functions/lnurlwithdrawl?platform=${Platform.OS}&token=${expoPushToken?.data}&amount=${giftAmount}&uuid=${UUID}&desc=${LNURL_WITHDRAWL_CODES[0]}`;

    const byteArr = Buffer.Buffer.from(data, 'utf8');

    const words = bench32.bech32.toWords(byteArr);

    const encoded = bench32.bech32.encode('lnurl', words, 1500);

    const withdrawLNURL = encoded.toUpperCase();

    return withdrawLNURL;
  } catch (err) {
    return false;
    console.log(err);
  }
}
async function openShareOptions(giftCode) {
  try {
    await Share.share({
      title: 'Receive Faucet Address',
      message: giftCode,
    });
  } catch {
    window.alert('ERROR with sharing');
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },

  topbar: {
    width: '95%',
    flexDirection: 'row',
    alignItems: 'center',
    ...CENTER,
  },
  topBarIcon: {
    width: 25,
    height: 25,
  },
  topBarText: {
    fontSize: SIZES.large,
    marginRight: 'auto',
    marginLeft: 'auto',
    transform: [{translateX: -12.5}],
    fontFamily: FONT.Title_Bold,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentItem: {
    width: '90%',
    marginVertical: 10,
  },
  contentHeader: {
    fontFamily: FONT.Title_Bold,
    fontSize: SIZES.medium,
    marginBottom: 10,
  },
  contentDescriptionContainer: {
    padding: 10,
    borderRadius: 8,
  },
  contentDescription: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
    marginBottom: 10,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  sendingAmtBTC: {
    fontSize: SIZES.xxLarge,
    fontFamily: FONT.Title_Regular,

    padding: 0,
  },

  satText: {
    fontSize: SIZES.large,
    fontFamily: FONT.Title_Regular,
    color: COLORS.primary,
    marginLeft: 10,
  },

  buttonText: {
    color: COLORS.white,
    fontFamily: FONT.Other_Regular,
  },

  qrCodeContainer: {
    width: 275,
    height: 'auto',
    minHeight: 275,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  giftAmountStyle: {
    marginBottom: 'auto',
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.large,
    marginTop: 10,
  },

  button: {
    width: 150,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginTop: 50,
  },
  buttonText: {color: COLORS.white, fontFamily: FONT.Other_Regular},

  buttonsContainer: {
    width: '90%',
    maxWidth: 250,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...CENTER,
  },

  buttonsOpacity: {
    height: '100%',
    width: 100,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    // overflow: "hidden",
    ...SHADOWS.medium,
  },
  buttonText: {
    fontFamily: FONT.Other_Regular,
    fontSize: SIZES.medium,
    color: COLORS.background,
  },
});
