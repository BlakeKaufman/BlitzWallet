import {
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {useEffect, useRef, useState} from 'react';

import {
  CENTER,
  COLORS,
  FONT,
  ICONS,
  LIQUID_DEFAULT_FEE,
  SATSPERBITCOIN,
  SIZES,
} from '../../../../../constants';
import {
  GlobalThemeView,
  ThemeText,
} from '../../../../../functions/CustomElements';
import CustomButton from '../../../../../functions/CustomElements/button';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import GetThemeColors from '../../../../../hooks/themeColors';
import ThemeImage from '../../../../../functions/CustomElements/themeImage';
import CustomNumberKeyboard from '../../../../../functions/CustomElements/customNumberKeyboard';
import {nodeInfo, parseInput} from '@breeztech/react-native-breez-sdk';
import {getInfo} from '@breeztech/react-native-breez-sdk-liquid';
import FullLoadingScreen from '../../../../../functions/CustomElements/loadingScreen';
import FormattedSatText from '../../../../../functions/CustomElements/satTextDisplay';
import {formatBalanceAmount, numberConverter} from '../../../../../functions';
import Icon from '../../../../../functions/CustomElements/Icon';
import {useGlobaleCash} from '../../../../../../context-store/eCash';
import {calculateBoltzFeeNew} from '../../../../../functions/boltz/boltzFeeNew';
import {breezLiquidPaymentWrapper} from '../../../../../functions/breezLiquid';
import {breezPaymentWrapper} from '../../../../../functions/SDK';

export default function ManualSwapPopup() {
  const navigate = useNavigation();
  const {masterInfoObject, nodeInformation, minMaxLiquidSwapAmounts} =
    useGlobalContextProvider();
  const [isAmountFocused, setIsAmountFocused] = useState(true);
  const [sendingAmount, setSendingAmount] = useState('');
  const {backgroundOffset, textColor} = GetThemeColors();
  const [userBalanceInformation, setUserBalanceInformation] = useState({});
  const [transferInfo, setTransferInfo] = useState({from: '', to: ''});
  const [isDoingTransfer, setIsDoingTransfer] = useState(false);
  const {eCashBalance} = useGlobaleCash();

  const convertedSendAmount =
    masterInfoObject.userBalanceDenomination != 'fiat'
      ? Math.round(Number(sendingAmount))
      : Math.round(
          (SATSPERBITCOIN / nodeInformation?.fiatStats?.value) *
            Number(sendingAmount),
        );

  const maxTransferAmountFromBalance =
    transferInfo.from.toLowerCase() === 'bank'
      ? userBalanceInformation.lightningInboundAmount >
        userBalanceInformation.liquidBalance
        ? userBalanceInformation.liquidBalance - 5
        : userBalanceInformation.lightningInboundAmount - 5
      : transferInfo.from.toLowerCase() === 'ecash'
      ? eCashBalance - 5
      : userBalanceInformation.lightningBalance - 5;

  const lnFee = Math.round(maxTransferAmountFromBalance * 0.005) + 4;
  const maxAmountCaluclation =
    maxTransferAmountFromBalance > minMaxLiquidSwapAmounts.max
      ? minMaxLiquidSwapAmounts.max -
        calculateBoltzFeeNew(
          maxTransferAmountFromBalance,
          transferInfo.from.toLowerCase() === 'bank'
            ? 'liquid-ln'
            : 'ln-liquid',
          minMaxLiquidSwapAmounts[
            transferInfo.from.toLowerCase() === 'bank'
              ? 'submarineSwapStats'
              : 'reverseSwapStats'
          ],
        )
      : maxTransferAmountFromBalance -
        calculateBoltzFeeNew(
          maxTransferAmountFromBalance,
          transferInfo.from.toLowerCase() === 'bank'
            ? 'liquid-ln'
            : 'ln-liquid',
          minMaxLiquidSwapAmounts[
            transferInfo.from.toLowerCase() === 'bank'
              ? 'submarineSwapStats'
              : 'reverseSwapStats'
          ],
        );

  const maxTransferAmount =
    transferInfo.from.toLowerCase() === 'lightning'
      ? maxAmountCaluclation - lnFee
      : transferInfo.from.toLowerCase() === 'bank'
      ? maxAmountCaluclation - LIQUID_DEFAULT_FEE
      : maxAmountCaluclation - 5;

  const canDoTransfer =
    maxTransferAmount >= minMaxLiquidSwapAmounts.min &&
    convertedSendAmount < maxTransferAmount &&
    convertedSendAmount >= minMaxLiquidSwapAmounts.min &&
    convertedSendAmount <= minMaxLiquidSwapAmounts.max;

  console.log(
    calculateBoltzFeeNew(
      convertedSendAmount,
      transferInfo.from.toLowerCase() === 'bank' ? 'liquid-ln' : 'ln-liquid',
      minMaxLiquidSwapAmounts[
        transferInfo.from.toLowerCase() === 'bank'
          ? 'submarineSwapStats'
          : 'reverseSwapStats'
      ],
    ),
  );
  useEffect(() => {
    async function loadUserBalanceInformation() {
      const node_info = await nodeInfo();
      const liquid_info = await getInfo();

      setUserBalanceInformation({
        lightningInboundAmount: node_info.totalInboundLiquidityMsats / 1000,
        lightningBalance: node_info.channelsBalanceMsat / 1000,
        liquidBalance: liquid_info.walletInfo.balanceSat,
        ecashBalance: eCashBalance,
      });
    }
    loadUserBalanceInformation();
  }, []);
  console.log(userBalanceInformation);
  const convertedValue = () => {
    return masterInfoObject.userBalanceDenomination === 'fiat'
      ? Math.round(
          (SATSPERBITCOIN / (nodeInformation.fiatStats?.value || 65000)) *
            Number(sendingAmount),
        )
      : String(
          (
            ((nodeInformation.fiatStats?.value || 65000) / SATSPERBITCOIN) *
            Number(sendingAmount)
          ).toFixed(2),
        );
  };

  return (
    <GlobalThemeView useStandardWidth={true}>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          setTimeout(() => {
            setIsAmountFocused(true);
          }, 200);
        }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          style={{flex: 1}}>
          <View style={styles.topbar}>
            <TouchableOpacity
              style={{position: 'absolute', top: 0, left: 0, zIndex: 1}}
              onPress={() => {
                navigate.goBack();
              }}>
              <ThemeImage
                lightsOutIcon={ICONS.arrow_small_left_white}
                darkModeIcon={ICONS.smallArrowLeft}
                lightModeIcon={ICONS.smallArrowLeft}
              />
            </TouchableOpacity>
            <ThemeText
              CustomEllipsizeMode={'tail'}
              CustomNumberOfLines={1}
              content={'Internal transfer'}
              styles={{...styles.topBarText}}
            />
          </View>
          {!Object.keys(userBalanceInformation).length || isDoingTransfer ? (
            <FullLoadingScreen
              textStyles={{textAlign: 'center'}}
              text={
                isDoingTransfer
                  ? 'Handling transfer, please do not leave the page.'
                  : ''
              }
            />
          ) : (
            <>
              <ScrollView style={{}}>
                <View style={styles.transferAccountRow}>
                  <ThemeText content={'Transfer from:'} />
                  <TouchableOpacity
                    onPress={() =>
                      navigate.navigate('AccountInformationPage', {
                        setTransferInfo: setTransferInfo,
                        transferType: 'from',
                        userBalanceInformation: userBalanceInformation,
                      })
                    }
                    style={styles.chooseAccountBTN}>
                    <ThemeText
                      content={
                        !transferInfo.from
                          ? 'Select from account'
                          : transferInfo.from
                      }
                    />
                    <ThemeImage
                      styles={styles.chooseAccountImage}
                      lightModeIcon={ICONS.leftCheveronIcon}
                      darkModeIcon={ICONS.leftCheveronIcon}
                      lightsOutIcon={ICONS.left_cheveron_white}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.transferAccountRow}>
                  <ThemeText content={'Transfer to:'} />
                  <TouchableOpacity
                    activeOpacity={1}
                    style={styles.chooseAccountBTN}>
                    <ThemeText
                      content={!transferInfo.to ? '* * * * *' : transferInfo.to}
                    />
                    {/* <View style={{width: 20, height: 20}} /> */}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    Keyboard.dismiss();
                    setTimeout(() => {
                      setIsAmountFocused(true);
                    }, 200);
                  }}
                  style={[
                    styles.textInputContainer,
                    {
                      alignItems: 'center',
                      opacity: !sendingAmount ? 0.5 : 1,
                    },
                  ]}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {masterInfoObject.satDisplay === 'symbol' &&
                      (masterInfoObject.userBalanceDenomination === 'sats' ||
                        (masterInfoObject.userBalanceDenomination ===
                          'hidden' &&
                          true)) && (
                        <Icon
                          color={textColor}
                          width={35}
                          height={35}
                          name={'bitcoinB'}
                        />
                      )}
                    <TextInput
                      style={{
                        ...styles.memoInput,
                        width: 'auto',
                        maxWidth: '70%',
                        includeFontPadding: false,
                        color: textColor,
                        fontSize: 50,
                        padding: 0,
                        pointerEvents: 'none',
                      }}
                      value={formatBalanceAmount(sendingAmount)}
                      readOnly={true}
                      maxLength={150}
                    />
                    <ThemeText
                      content={`${
                        masterInfoObject.satDisplay === 'symbol' &&
                        (masterInfoObject.userBalanceDenomination === 'sats' ||
                          (masterInfoObject.userBalanceDenomination ===
                            'hidden' &&
                            true))
                          ? ''
                          : masterInfoObject.userBalanceDenomination === 'fiat'
                          ? ` ${nodeInformation.fiatStats.coin || 'USD'}`
                          : masterInfoObject.userBalanceDenomination ===
                              'hidden' && !true
                          ? '* * * * *'
                          : ' sats'
                      }`}
                      styles={{
                        fontSize: SIZES.xxLarge,
                        includeFontPadding: false,
                      }}
                    />
                  </View>

                  <FormattedSatText
                    containerStyles={{opacity: !sendingAmount ? 0.5 : 1}}
                    neverHideBalance={true}
                    iconHeight={15}
                    iconWidth={15}
                    styles={{includeFontPadding: false, ...styles.satValue}}
                    globalBalanceDenomination={
                      masterInfoObject.userBalanceDenomination === 'sats' ||
                      masterInfoObject.userBalanceDenomination === 'hidden'
                        ? 'fiat'
                        : 'sats'
                    }
                    formattedBalance={formatBalanceAmount(convertedValue())}
                  />
                </TouchableOpacity>
              </ScrollView>
              {transferInfo.from && transferInfo.to && (
                <FormattedSatText
                  frontText={`${
                    convertedSendAmount < minMaxLiquidSwapAmounts.min
                      ? 'Minimum'
                      : 'Maximum'
                  } transfer amount is  `}
                  formattedBalance={formatBalanceAmount(
                    numberConverter(
                      convertedSendAmount < minMaxLiquidSwapAmounts.min
                        ? minMaxLiquidSwapAmounts.min
                        : maxTransferAmount,
                      masterInfoObject.userBalanceDenomination,
                      nodeInformation,
                      masterInfoObject.userBalanceDenomination === 'fiat'
                        ? 2
                        : 0,
                    ),
                  )}
                  styles={{textAlign: 'center'}}
                  containerStyles={{
                    marginBottom: 10,
                    width: '100%',
                    flexWrap: 'wrap',
                    ...CENTER,
                  }}
                />
              )}
              {isAmountFocused && (
                <CustomNumberKeyboard
                  showDot={masterInfoObject.userBalanceDenomination === 'fiat'}
                  frompage="sendContactsPage"
                  setInputValue={setSendingAmount}
                />
              )}
              <CustomButton
                textContent={'Confirm'}
                buttonStyles={{
                  ...CENTER,
                  opacity:
                    !transferInfo.from ||
                    !transferInfo.to ||
                    !canDoTransfer ||
                    !sendingAmount
                      ? 0.2
                      : 1,
                }}
                actionFunction={() => {
                  if (!transferInfo.from || !transferInfo.to) return;
                  if (!canDoTransfer) return;
                  if (!sendingAmount) return;
                  navigate.navigate('CustomHalfModal', {
                    wantedContent: 'confirmInternalTransferHalfModal',
                    amount: convertedSendAmount,
                    transferInfo: transferInfo,
                    startTransferFunction: initiateTransfer,
                    sliderHight: 0.5,
                  });
                }}
              />
            </>
          )}
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </GlobalThemeView>
  );
  async function initiateTransfer({invoice, transferInfo}) {
    try {
      setIsDoingTransfer(true);
      if (transferInfo.from.toLowerCase() === 'lightning') {
        const parsedInvoice = await parseInput(invoice);
        await breezPaymentWrapper({
          paymentInfo: parsedInvoice,
          paymentDescription: 'Internal_Transfer',
          failureFunction: response => {
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
                    for: 'paymentFailed',
                    information: response,
                    formattingType: 'lightningNode',
                  },
                },
              ],
            });
          },
          confirmFunction: response => {
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
                    for: 'paymentSucceed',
                    information: response,
                    formattingType: 'lightningNode',
                  },
                },
              ],
            });
          },
        });
      } else if (transferInfo.from.toLowerCase() === 'ecash') {
        navigate.navigate('ErrorScreen', {
          errorMessage: 'eCash transfers are not set up yet',
        });
      } else {
        const paymentResponse = await breezLiquidPaymentWrapper({
          invoice: invoice,
          paymentType: 'bolt11',
        });
        if (!paymentResponse.didWork) {
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
                  for: 'paymentFailed',
                  information: {
                    details: {
                      error: paymentResponse.error,
                      amountSat: convertedSendAmount,
                    },
                  },
                  formattingType: 'liquidNode',
                },
              },
            ],
          });
          return;
        }
        const {payment, fee} = paymentResponse;
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
                for: 'paymentSucceed',
                information: payment,
                formattingType: 'liquidNode',
              },
            },
          ],
        });
      }
    } catch (err) {
      console.log(err, 'TRANSFER ERROR');
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Unable to perform transfer',
      });
    }
  }
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBarText: {
    fontSize: SIZES.xLarge,
    width: '100%',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.halfModalBackgroundColor,
  },
  absolute: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  contentContainer: {
    width: '90%',
    backgroundColor: COLORS.darkModeText,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  transferAccountRow: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    alignItems: 'center',
    ...CENTER,
  },
  chooseAccountBTN: {
    flexDirection: 'row',
    alignItems: 'center',
    includeFontPadding: false,
  },
  chooseAccountImage: {
    height: 20,
    width: 10,
    transform: [{rotate: '180deg'}],
    marginLeft: 5,
  },
  textInputContainer: {
    flex: 1,
    width: '95%',
    margin: 0,
    marginTop: 10,
    ...CENTER,
  },
});
