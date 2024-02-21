import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {
  BTN,
  CENTER,
  COLORS,
  FONT,
  ICONS,
  SIZES,
} from '../../../../../constants';
import {useEffect, useState} from 'react';
import {listRefundables, refund} from '@breeztech/react-native-breez-sdk';
import {useNavigation} from '@react-navigation/native';
import mempoolJS from '@mempool/mempool.js';
import * as Clipboard from 'expo-clipboard';

export default function RefundBitcoinTransactionPage() {
  const {theme} = useGlobalContextProvider();
  const navigate = useNavigation();
  const [refundableInfo, setRefundableInfo] = useState({});
  const [hasRefundableTx, setHasRefundableTx] = useState(null);
  const [lookingForTx, setLookingForTx] = useState(true);
  const [bitcoinAddress, setBitcoinAddress] = useState('');
  const [bitcoinTxFee, setBitcoinTxFee] = useState(0);
  const [isBeingRefunded, setIsBeingRefunded] = useState({
    isDisplayed: false,
    txID: '',
    isbeingIssued: false,
  });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const refundables = await listRefundables();
        getRecommendedFee();
        if (refundables.length === 0) {
          setHasRefundableTx(false);
        } else {
          setRefundableInfo(refundables);
          hasRefundableTx(true);
        }
        setLookingForTx(false);
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme
          ? COLORS.darkModeBackground
          : COLORS.lightModeBackground,
        paddingVertical: Platform.OS === 'ios' ? 0 : 10,
      }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <SafeAreaView style={{flex: 1}}>
            <View style={styles.topbar}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  Keyboard.dismiss();
                  navigate.goBack();
                }}>
                <Image
                  source={ICONS.leftCheveronIcon}
                  style={{width: 30, height: 30}}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text
                style={[
                  styles.navText,
                  {
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  },
                ]}>
                Refund Transaction
              </Text>
            </View>
            {!hasRefundableTx ? (
              <View
                style={{
                  flex: 1,
                  width: '95%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...CENTER,
                }}>
                <Text
                  style={{
                    fontFamily: FONT.Title_Bold,
                    fontSize: SIZES.large,
                    color: COLORS.primary,
                    textAlign: 'center',
                    marginBottom: 20,
                  }}>
                  You currently do not have any refundable swaps.
                </Text>
                <Text
                  style={{
                    fontFamily: FONT.Descriptoin_Regular,
                    fontSize: SIZES.medium,
                    marginBottom: 10,
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  }}>
                  If you used the swap feature, the proper time has passed, and
                  your swap did not go through, check the mempool to see if your
                  transaction was confirmed.
                </Text>

                <Text
                  style={{
                    fontFamily: FONT.Descriptoin_Regular,
                    fontSize: SIZES.medium,
                    marginBottom: 10,
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  }}>
                  If your transaction was confirmed, reach out to
                  blake@blitz-wallet.com
                </Text>
                <Text
                  style={{
                    fontFamily: FONT.Descriptoin_Regular,
                    fontSize: SIZES.medium,
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  }}>
                  Otherwise, please wait till your transaction has been
                  confirmed.
                </Text>
              </View>
            ) : lookingForTx ? (
              <ActivityIndicator
                size="large"
                color={theme ? COLORS.darkModeText : COLORS.lightModeText}
                style={{marginTop: 'auto', marginBottom: 'auto'}}
              />
            ) : !isBeingRefunded.isDisplayed ? (
              !isBeingRefunded.isbeingIssued ? (
                <>
                  <View style={[styles.btcAdressContainer]}>
                    <Text
                      style={[
                        styles.btcAdressHeader,
                        {
                          color: theme
                            ? COLORS.darkModeText
                            : COLORS.lightModeText,
                        },
                      ]}>
                      Enter BTC address
                    </Text>
                    <View style={[styles.inputContainer]}>
                      <TextInput
                        value={bitcoinAddress}
                        onChangeText={setBitcoinAddress}
                        style={[
                          styles.input,
                          {
                            borderColor: theme
                              ? COLORS.darkModeText
                              : COLORS.lightModeText,
                            color: theme
                              ? COLORS.darkModeText
                              : COLORS.lightModeText,
                          },
                        ]}
                      />
                      <TouchableOpacity
                        onPress={() => {
                          navigate.navigate('CameraModal', {
                            updateBitcoinAdressFunc: setBitcoinAddress,
                          });
                        }}>
                        <Image
                          style={styles.scanIcon}
                          source={ICONS.faceIDIcon}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      if (!bitcoinAddress && bitcoinTxFee === 0) return;
                      sendRefund();
                    }}
                    style={[
                      BTN,
                      {
                        backgroundColor: COLORS.primary,
                        ...CENTER,
                        opacity: bitcoinAddress && bitcoinTxFee != 0 ? 1 : 0.5,
                        marginBottom: 30,
                      },
                    ]}>
                    <Text
                      style={{
                        fontFamily: FONT.Descriptoin_Regular,
                        color: COLORS.darkModeText,
                      }}>
                      Send Refund
                    </Text>
                  </TouchableOpacity>
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
                    style={{marginBottom: 20}}
                  />
                  <Text
                    style={{
                      fontFamily: FONT.Title_Bold,
                      fontSize: SIZES.large,
                      color: COLORS.cancelRed,
                    }}>
                    {errorMessage}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setBitcoinAddress('');
                      setIsBeingRefunded({
                        isDisplayed: false,
                        txID: '',
                        isbeingIssued: false,
                      });
                    }}
                    style={[BTN, {backgroundColor: COLORS.primary}]}>
                    <Text
                      style={{
                        fontFamily: FONT.Descriptoin_Regular,
                        fontSize: SIZES.medium,
                        color: COLORS.darkModeText,
                      }}>
                      Try Again
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            ) : (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    fontFamily: FONT.Title_Bold,
                    fontSize: SIZES.large,
                    color: COLORS.primary,
                    marginBottom: 10,
                  }}>
                  Your refund transaction ID is:
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    copyToClipboard(isBeingRefunded.txID);
                  }}>
                  <Text
                    style={{
                      fontFamily: FONT.Descriptoin_Regular,
                      fontSize: SIZES.medium,
                    }}>
                    {isBeingRefunded.txID}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );

  async function copyToClipboard(txID) {
    try {
      await Clipboard.setStringAsync(txID);
      navigate.navigate('ClipboardCopyPopup', {didCopy: true});
      return;
    } catch (err) {
      navigate.navigate('ClipboardCopyPopup', {didCopy: false});
    }
  }

  async function getRecommendedFee() {
    try {
      const {
        bitcoin: {fees},
      } = mempoolJS({hostname: 'mempool.space'});
      const feesRecommended = await fees.getFeesRecommended();
      setBitcoinTxFee(feesRecommended.halfHourFee);
    } catch (err) {
      console.log(err);
    }
  }

  async function sendRefund() {
    try {
      setIsBeingRefunded(prev => {
        return {
          ...prev,
          isbeingIssued: true,
        };
      });
      const refundResponse = await refund({
        swapAddress: refundableInfo[0]?.bitcoinAddress,
        toAddress: bitcoinAddress,
        satPerVbyte: bitcoinTxFee,
      });
      setIsBeingRefunded({
        txID: refundResponse.refundTxId,
        isDisplayed: true,
        isbeingIssued: false,
      });
    } catch (err) {
      setErrorMessage('Error with swap. ');
      console.log(err);
    }
  }
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navText: {
    fontFamily: FONT.Title_Bold,
    fontSize: SIZES.large,
    ...CENTER,
    transform: [{translateX: -15}],
  },

  btcAdressContainer: {
    width: '90%',
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.offsetBackground,
    ...CENTER,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  btcAdressHeader: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
    marginBottom: 10,
  },

  inputContainer: {
    width: '100%',
    height: 35,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    width: '80%',
    height: '100%',
    borderRadius: 8,
    borderWidth: 2,
    paddingHorizontal: 10,
  },
  scanIcon: {
    width: 35,
    height: 35,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontFamily: FONT.Other_Regular,
  },
});
