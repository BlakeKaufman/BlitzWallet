import {useNavigation, useTheme} from '@react-navigation/native';
import {
  ActivityIndicator,
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
import {getRandomBytes, randomUUID} from 'expo-crypto';
import * as bench32 from 'bech32';

import Buffer from 'buffer';
import QRCode from 'react-native-qrcode-svg';
import getKeyboardHeight from '../../../../hooks/getKeyboardHeight';
import {gdk, sendLiquidTransaction} from '../../../../functions/liquidWallet';
import generateGiftLiquidAddress from './generateLiquidAddress';
import {deriveKey, xorEncodeDecode} from './encodeDecode';
import {generateMnemonic} from '@dreson4/react-native-quick-bip39';
import {findDuplicates} from '../../../../functions/seed';
import {generateSecureRandom} from 'react-native-securerandom';
import {t} from 'i18next';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ANDROIDSAFEAREA} from '../../../../constants/styles';

export default function AmountToGift() {
  const isInitialRender = useRef(true);
  const navigate = useNavigation();
  const {theme, nodeInformation, masterInfoObject, liquidNodeInformation} =
    useGlobalContextProvider();

  const acceptedSendRisk = useRef(false);

  const [giftAmount, setGiftAmount] = useState('');
  const [errorText, setErrorText] = useState('');
  const [giftContent, setGiftContent] = useState({
    code: '',
    content: '',
  });
  const [isLoading, setIsLoading] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');

  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.globalContainer,
        {
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
          paddingTop: insets.top < 20 ? ANDROIDSAFEAREA : insets.top,
          paddingBottom: insets.bottom < 20 ? ANDROIDSAFEAREA : insets.bottom,
        },
      ]}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          style={{flex: 1}}>
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
                {Object.entries(giftContent).filter(obj => {
                  return !!obj[1];
                }).length > 1
                  ? 'Claim Gift'
                  : 'Set Gift Amount'}
              </Text>
            </View>

            {isLoading ? (
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
                <Text
                  style={{
                    marginTop: 10,
                    fontSize: SIZES.medium,
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    fontFamily: FONT.Title_Regular,
                  }}>
                  {loadingMessage}
                </Text>
              </View>
            ) : Object.entries(giftContent).filter(obj => {
                return !!obj[1];
              }).length < 1 ? (
              <>
                <View style={[styles.contentContainer]}>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        alignItems: Platform.OS == 'ios' ? 'baseline' : null,
                      },
                    ]}>
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
                    {Platform.OS === 'ios' ? (
                      <>
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
                      </>
                    ) : (
                      <View style={{justifyContent: 'flex-end'}}>
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
                    )}
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: SIZES.small,
                        fontFamily: FONT.Title_Regular,
                        color: theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                      }}>
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
                    Minumum gift amount is {formatBalanceAmount(10000)} sats
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => createGiftCode()}
                  style={[
                    BTN,
                    {
                      opacity: giftAmount < 10000 ? 0.5 : 1,
                      backgroundColor: COLORS.primary,
                      marginTop: 0,
                      marginBottom: 10,
                      ...CENTER,
                    },
                  ]}>
                  <Text style={styles.buttonText}>Create Gift</Text>
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
                    value={
                      giftContent.content
                        ? giftContent.content
                        : 'Genrating QR Code'
                    }
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
                      marginBottom: 10,
                    },
                  ]}>
                  {formatBalanceAmount(Number(giftAmount))} sats
                </Text>

                <View
                  style={[
                    styles.giftAmountStyle,
                    {
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                      alignItems: 'center',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.giftAmountStyle,
                      {
                        color: theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                        marginBottom: 0,
                        marginTop: 0,
                      },
                    ]}>
                    Unlock Code:{' '}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      copyToClipboard(giftContent.code, navigate);
                    }}>
                    <Text
                      style={[
                        styles.giftAmountStyle,
                        {
                          color: theme
                            ? COLORS.darkModeText
                            : COLORS.lightModeText,
                          marginTop: 0,
                        },
                      ]}>
                      {giftContent.code}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.buttonsContainer}>
                  <TouchableOpacity
                    onPress={() => openShareOptions(giftContent.content)}
                    style={[styles.buttonsOpacity]}>
                    <Text style={styles.buttonText}>Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      copyToClipboard(giftContent.content, navigate);
                    }}
                    style={[styles.buttonsOpacity]}>
                    <Text style={styles.buttonText}>Copy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </SafeAreaView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );

  function createGiftCode() {
    try {
      if (giftAmount < 10000) {
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Gift amount must be heigher than 10 000 sats',
        });
        return;
      } else if (
        nodeInformation.userBalance + 50 <= giftAmount &&
        liquidNodeInformation.userBalance + 50 <= giftAmount
      ) {
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Not enough funds',
        });

        return;
      } else if (!acceptedSendRisk.current) {
        navigate.navigate('giftWalletConfirmation', {
          didConfirm: acceptedSendRisk,
          createGiftCode: createGiftCode,
        });
        return;
      }

      setIsLoading(true);
      setErrorText('');
      setLoadingMessage('Generating new seedphrase');

      generateGiftCode(giftAmount);
    } catch (err) {
      setErrorText('Error when sending payment');
      console.log(err);
    }
  }

  function createGiftCardCode() {
    const randomNumArray = getRandomBytes(32);
    const randomNumArrayLen = randomNumArray.length;
    const randomPosition = Math.floor(Math.random() * (randomNumArrayLen - 16));

    const unformattedUUID = randomNumArray
      .join('')
      .substring(randomPosition, randomPosition + 16);

    let UUID = ``;
    for (let index = 0; index < unformattedUUID.length; index++) {
      if (index % 4 === 0 && index != 0) UUID += '-';
      UUID += unformattedUUID[index];
    }

    return UUID;
  }

  function createValidMnemonic() {
    let mnemoinc = '';
    let isValidMnemoinc = false;
    let generations = 0;

    while (!isValidMnemoinc && generations < 10) {
      const generatedMnemonic = generateMnemnoic();
      const validated = gdk.validateMnemonic(mnemoinc);

      mnemoinc = generatedMnemonic;
      isValidMnemoinc = validated;
      generations += 1;
      console.log('RUNNING');
    }

    if (isValidMnemoinc && generations < 10) return mnemoinc;
    else return false;
  }

  async function createEncripedMessage(mnemoinc, UUID) {
    setLoadingMessage('Encrypting message');
    // const salt = (await generateSecureRandom(32)).toString('hex'); // In a real scenario, use a securely generated salt
    // const iterations = 500;
    // const keyLength = 32;

    // Derive the key asynchronously
    // const derivedKey = await deriveKey(UUID, salt, iterations, keyLength);

    const encryptedText = xorEncodeDecode(mnemoinc, UUID);
    // const decryptedText = xorEncodeDecode(encryptedText, derivedKey);

    return {
      // derivedKey,
      encryptedText,
    };
  }

  async function generateGiftCode(giftAmount) {
    try {
      const UUID = createGiftCardCode();

      const mnemoinc = createValidMnemonic();
      if (mnemoinc) {
        const liquidAddress = await generateGiftLiquidAddress(mnemoinc);

        const {encryptedText} = await createEncripedMessage(mnemoinc, UUID);
        console.log(encryptedText);

        if (liquidAddress && encryptedText) {
          setLoadingMessage('Sending gift');
          const didSend = await sendLiquidTransaction(
            Number(giftAmount),
            liquidAddress,
          );

          if (didSend) {
            setGiftContent({code: UUID, content: encryptedText});
            setIsLoading(false);
          } else {
            setErrorText('Error sending gift');
          }
        } else {
          setErrorText('Error generating claim code');
        }

        console.log('DID RUN ');
      } else {
        setErrorText('Error generating new seedphrase');
      }

      return;

      const data = `https://blitz-wallet.com/.netlify/functions/lnurlwithdrawl?platform=${
        Platform.OS
      }&token=${expoPushToken?.data}&amount=${giftAmount}&uuid=${UUID}&desc=${
        LNURL_WITHDRAWL_CODES[0]
      }&totalAmount=${1}`;

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
}
async function openShareOptions(giftContent) {
  try {
    await Share.share({
      title: 'Receive Faucet Address',
      message: giftContent,
    });
  } catch {
    window.alert('ERROR with sharing');
  }
}

function generateMnemnoic() {
  // Generate a random 32-byte entropy
  try {
    let validMnemonic = '';
    for (let index = 0; index < 5; index++) {
      const generatedMnemonic = generateMnemonic()
        .split(' ')
        .filter(word => word.length > 2)
        .join(' ');

      if (findDuplicates(generatedMnemonic)) continue;

      validMnemonic = generatedMnemonic;
      break;
    }

    return validMnemonic;
  } catch (err) {
    console.log(err);
    return false;
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
    // alignItems: 'baseline',
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
