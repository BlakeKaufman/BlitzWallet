import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
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
  SATSPERBITCOIN,
  SHADOWS,
  SIZES,
} from '../../../../constants';
import {useEffect, useRef, useState} from 'react';
import {
  inProgressOnchainPayments,
  nodeInfo,
  prepareRedeemOnchainFunds,
  redeemOnchainFunds,
} from '@breeztech/react-native-breez-sdk';
import * as WebBrowser from 'expo-web-browser';
import {
  copyToClipboard,
  formatBalanceAmount,
  getLocalStorageItem,
  numberConverter,
  setLocalStorageItem,
} from '../../../../functions';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useNavigation} from '@react-navigation/native';
import FormattedSatText from '../../../../functions/CustomElements/satTextDisplay';
import CustomButton from '../../../../functions/CustomElements/button';
import SendOnChainBitcoinFeeSlider from './onChainComponents/txFeeSlider';
import {WINDOWWIDTH} from '../../../../constants/theme';
import {ThemeText} from '../../../../functions/CustomElements';
import GetThemeColors from '../../../../hooks/themeColors';
import ThemeImage from '../../../../functions/CustomElements/themeImage';
import FullLoadingScreen from '../../../../functions/CustomElements/loadingScreen';

export default function SendOnChainBitcoin() {
  const isInitialRender = useRef(true);
  const [wantsToDrain, setWantsToDrain] = useState(false);
  const {theme, nodeInformation, masterInfoObject, darkModeType} =
    useGlobalContextProvider();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigation();
  const [bitcoinAddress, setBitcoinAddress] = useState('');
  const [isSendingPayment, setIsSendingPayment] = useState({
    sendingBTCpayment: false,
    didSend: false,
  });
  const [onChainBalance, setOnChainBalance] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [feeInfo, setFeeInfo] = useState([]);
  const [bitcoinTxId, setBitcoinTxId] = useState('');
  const [txFeeSat, setTxFeeSat] = useState(0);
  const {backgroundOffset, textInputBackground, textInputColor} =
    GetThemeColors();

  useEffect(() => {
    getMempoolTxFee();
    if (isInitialRender.current) {
      initPage();
      console.log('INIT PAGE');
      isInitialRender.current = false;
    }
    console.log(wantsToDrain, 'watns to drain');
    if (!wantsToDrain) return;
    // Alert.alert('This function does not work yet', '', [
    //   {text: 'Ok', onPress: () => navigate.goBack()},
    // ]);
    sendOnChain();

    // Alert.alert('This function does not work yet', '', [
    //   {text: 'Ok', onPress: () => navigate.goBack()},
    // ]);

    // console.log('DRAINING WALLET');
  }, [wantsToDrain]);

  // const feeElements =
  //   feeInfo.length != 0 &&
  //   feeInfo.map((item, id) => {
  //     return (
  //       <TouchableOpacity
  //         onPress={() => {
  //           if (!bitcoinAddress) {
  //             navigate.navigate('ErrorScreen', {
  //               errorMessage: 'Please enter a bitcoin address',
  //             });
  //             return;
  //           }
  //           changeSelectedFee(item.feeType);
  //         }}
  //         key={id}>
  //         <View
  //           style={{
  //             width: 120,
  //             height: 'auto',
  //             borderWidth: 2,
  //             margin: 10,
  //             borderRadius: 8,
  //             padding: 10,
  //             backgroundColor: item.isSelected
  //               ? COLORS.primary
  //               : theme
  //               ? COLORS.darkModeBackground
  //               : COLORS.lightModeBackground,
  //           }}>
  //           <Text
  //             style={{
  //               textAlign: 'center',
  //               fontSize: SIZES.large,
  //               fontWeight: 'bold',
  //               marginBottom: 10,
  //               fontFamily: FONT.Title_Regular,
  //               color: item.isSelected
  //                 ? COLORS.lightModeBackground
  //                 : theme
  //                 ? COLORS.darkModeText
  //                 : COLORS.lightModeText,
  //             }}>
  //             {id === 0 ? 'Fastest' : id === 1 ? 'Half Hour' : 'Hour'}
  //           </Text>
  //           <Text
  //             style={{
  //               textAlign: 'center',
  //               fontSize: SIZES.medium,

  //               fontFamily: FONT.Title_Regular,
  //               color: item.isSelected
  //                 ? COLORS.lightModeBackground
  //                 : theme
  //                 ? COLORS.darkModeText
  //                 : COLORS.lightModeText,
  //             }}>
  //             {item.feeAmount} sat/vB
  //           </Text>
  //         </View>
  //       </TouchableOpacity>
  //     );
  //   });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      style={{flex: 1}}>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            width: WINDOWWIDTH,
            ...CENTER,
          }}>
          {isLoading || onChainBalance === 0 ? (
            <View style={{flex: 1}}>
              {onChainBalance === 0 && !isLoading && (
                <ThemeText
                  styles={{
                    ...styles.noOnChainFunds,
                    marginTop: 'auto',
                    marginBottom: 'auto',
                  }}
                  content={'You currently do not have any on-chain funds'}
                />
              )}
            </View>
          ) : isSendingPayment.sendingBTCpayment ? (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {isSendingPayment.didSend ? (
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                  }}>
                  <ThemeText
                    styles={{fontSize: SIZES.large}}
                    content={'Txid'}
                  />
                  {/* <Text
                  style={{
                    fontFamily: FONT.Title_Regular,
                    fontSize: SIZES.large,
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  }}>
                  Txid:
                </Text> */}
                  <TouchableOpacity
                    onPress={() => {
                      copyToClipboard(String(bitcoinTxId), navigate);
                    }}
                    style={{width: '95%'}}>
                    <ThemeText
                      styles={{textAlign: 'center'}}
                      content={bitcoinTxId}
                    />
                  </TouchableOpacity>
                  <ThemeText
                    styles={{marginVertical: 10}}
                    content={'Save this ID to check up on your transaction'}
                  />

                  <TouchableOpacity
                    onPress={() => {
                      (async () => {
                        try {
                          await WebBrowser.openBrowserAsync(
                            `https://mempool.space/tx/${bitcoinTxId}`,
                          );
                        } catch (err) {
                          console.log(err, 'OPENING LINK ERROR');
                        }
                      })();
                    }}>
                    <ThemeText
                      styles={{
                        color:
                          theme && darkModeType
                            ? COLORS.darkModeText
                            : COLORS.primary,
                        textAlign: 'center',
                      }}
                      content={'View Transaction'}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <FullLoadingScreen text={'Sending transaction'} />
              )}
            </View>
          ) : (
            <>
              <ScrollView style={{flex: 1, width: '100%'}}>
                <View style={styles.balanceContainer}>
                  <ThemeText content={'Current balance'} />
                  <FormattedSatText
                    iconHeight={25}
                    iconWidth={25}
                    neverHideBalance={true}
                    styles={{...styles.balanceNum}}
                    formattedBalance={formatBalanceAmount(
                      numberConverter(
                        onChainBalance / 1000,
                        masterInfoObject.userBalanceDenomination,
                        nodeInformation,
                      ),
                    )}
                  />
                </View>
                <View
                  style={[
                    styles.btcAdressContainer,
                    {
                      backgroundColor: backgroundOffset,
                    },
                  ]}>
                  <ThemeText
                    styles={{marginBottom: 10}}
                    content={'Enter BTC address'}
                  />
                  <View style={[styles.inputContainer]}>
                    <TextInput
                      value={bitcoinAddress}
                      onChangeText={setBitcoinAddress}
                      style={[
                        styles.input,
                        {
                          // borderColor: theme
                          //   ? COLORS.darkModeText
                          //   : COLORS.lightModeText,
                          backgroundColor: COLORS.darkModeText,
                          color: COLORS.lightModeText,
                        },
                      ]}
                      placeholder="bc1..."
                      placeholderTextColor={COLORS.opaicityGray}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        navigate.navigate('CameraModal', {
                          updateBitcoinAdressFunc: setBitcoinAddress,
                        });
                      }}>
                      <ThemeImage
                        darkModeIcon={ICONS.faceIDIcon}
                        lightModeIcon={ICONS.faceIDIcon}
                        lightsOutIcon={ICONS.faceIDIconWhite}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <SendOnChainBitcoinFeeSlider
                  changeSelectedFee={changeSelectedFee}
                  feeInfo={feeInfo}
                  bitcoinAddress={bitcoinAddress}
                  txFeeSat={txFeeSat}
                />

                {/* <View style={styles.feeAmountContainer}>
                  {isChangingFee ? (
                    <ActivityIndicator
                      size="large"
                      color={theme ? COLORS.darkModeText : COLORS.lightModeText}
                    />
                  ) : (
                    <ScrollView
                      showsVerticalScrollIndicator={true}
                      contentContainerStyle={styles.feeScrollViewContainer}>
                      {feeElements}
                    </ScrollView>
                  )}
                </View> */}

                {/* {!bitcoinAddress ||
                feeInfo.filter(item => item.isSelected).length === 0 ? (
                  <Text> </Text>
                ) : (
                  <FormattedSatText
                    iconHeight={25}
                    iconWidth={25}
                    frontText={'Transaction fee:'}
                    neverHideBalance={true}
                    formattedBalance={formatBalanceAmount(
                      numberConverter(
                        txFeeSat || 10,
                        masterInfoObject.userBalanceDenomination,
                        nodeInformation,
                      ),
                    )}
                  />
                
                )} */}
              </ScrollView>
              <ThemeText
                styles={{width: '95%', textAlign: 'center'}}
                content={errorMessage}
              />

              <CustomButton
                buttonStyles={{
                  width: 'auto',
                  marginTop: 'auto',
                  ...CENTER,
                }}
                actionFunction={() => {
                  if (
                    !bitcoinAddress ||
                    feeInfo.filter(item => item.isSelected).length === 0 ||
                    txFeeSat > onChainBalance
                  )
                    return;

                  navigate.navigate('ConfirmActionPage', {
                    wantsToDrainFunc: setWantsToDrain,
                    confirmMessage:
                      'Are you sure you want to send this payment?',
                  });
                }}
                textContent={'Send transaction'}
              />
            </>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

  async function initPage() {
    try {
      const node_info = (await nodeInfo()).onchainBalanceMsat;

      // const swaps = await inProgressOnchainPayments();
      // console.log(swaps);
      // for (const swap of swaps) {
      //   console.log(
      //     `Onchain payment ${swap.id} in progress, status is ${swap.status}`,
      //   );
      // }

      const didLoad = await getMempoolTxFee();
      setOnChainBalance(node_info);
      // setOnChainBalance(0);

      didLoad && setIsLoading(false);
    } catch (err) {
      console.log(err);
    }
  }

  async function calculateTxFee(globalItem) {
    try {
      const [satPerVbyte] = feeInfo.filter(item => item.feeType === globalItem);

      const prepareRedeemOnchainFundsResp = await prepareRedeemOnchainFunds({
        toAddress: bitcoinAddress,
        satPerVbyte: satPerVbyte.feeAmount,
      });

      return new Promise(resolve => {
        resolve({
          didRunError: prepareRedeemOnchainFundsResp.txFeeSat > onChainBalance,
          content: prepareRedeemOnchainFundsResp.txFeeSat,
        });
      });
    } catch (err) {
      console.error(err);
      setErrorMessage('Error calculating transaction fee');
      return new Promise(resolve => {
        resolve({didRunError: true, content: ''});
      });
    }
  }

  async function sendOnChain() {
    setIsSendingPayment(prev => {
      return {...prev, sendingBTCpayment: true};
    });
    const [satPerVbyte] = feeInfo.filter(item => item.isSelected);
    try {
      const redeemOnchainFundsResp = await redeemOnchainFunds({
        toAddress: bitcoinAddress,
        satPerVbyte: satPerVbyte.feeAmount,
      });

      const sentBTCPayments =
        JSON.parse(await getLocalStorageItem('refundedBTCtransactions')) || [];
      setBitcoinTxId(redeemOnchainFundsResp.txid);
      setLocalStorageItem(
        'refundedBTCtransactions',
        JSON.stringify([
          ...sentBTCPayments,
          {
            date: new Date(),
            txid: redeemOnchainFundsResp.txid,
            toAddress: bitcoinAddress,
            satPerVbyte: satPerVbyte.feeAmount,
          },
        ]),
      );
      setIsSendingPayment(prev => {
        return {...prev, didSend: true};
      });
    } catch (err) {
      console.error(err);
      setIsSendingPayment(prev => {
        return {...prev, sendingBTCpayment: false};
      });
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Unable to send transaction',
      });
    }
  }
  async function getMempoolTxFee() {
    try {
      const data = await fetch('https://mempool.space/api/v1/fees/recommended');
      const {fastestFee, halfHourFee, hourFee} = await data.json();

      setFeeInfo([
        {feeType: 'fastest', isSelected: true, feeAmount: fastestFee},
        {feeType: 'halfHour', isSelected: false, feeAmount: halfHourFee},
        {feeType: 'hour', isSelected: false, feeAmount: hourFee},
      ]);

      return new Promise(resolve => {
        resolve(true);
      });
    } catch (err) {
      setErrorMessage('Error getting transaction fee amount');
      return new Promise(resolve => {
        resolve(false);
      });
      console.log(err);
    }
  }
  async function changeSelectedFee(item, sliderFunction) {
    if (!bitcoinAddress) {
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Please enter a bitcoin address',
      });
      return;
    }

    setErrorMessage('');
    console.log(item);

    const txFee = await calculateTxFee(item);

    if (txFee.didRunError) {
      setErrorMessage('Insufficent Funds');
      return;
    }

    console.log(item);
    sliderFunction();
    setFeeInfo(prev => {
      return prev.map(prevItem => {
        console.log(prevItem.feeType, item);
        return {
          ...prevItem,
          isSelected: item === prevItem.feeType ? true : false,
        };
      });
    });

    setTxFeeSat(txFee.content);
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
    alignItems: 'center',
  },
  noOnChainFunds: {
    width: '95%',
    maxWidth: 250,
    textAlign: 'center',
  },

  balanceContainer: {
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 50,
  },
  balanceNum: {
    fontSize: SIZES.xxLarge,
  },
  fiatBalanceNum: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
  },
  balanceDescription: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
  },

  btcAdressContainer: {
    width: '100%',
    padding: 8,
    borderRadius: 8,
  },
  btcAdressHeader: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
    marginBottom: 10,
  },

  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    width: '80%',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },

  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontFamily: FONT.Other_Regular,
  },

  errorText: {
    fontFamily: FONT.Descriptoin_Regular,

    fontSize: SIZES.medium,
    color: COLORS.cancelRed,
  },

  textBreakdown: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
  },

  feeAmountContainer: {
    width: '100%',
    marginBottom: 'auto',
    flex: 1,
    marginTop: 20,
    paddingBottom: 10,
  },
  feeScrollViewContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
