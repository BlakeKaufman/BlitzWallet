import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';

import {useCallback, useEffect, useRef, useState} from 'react';
import SwipeButton from 'rn-swipe-button';

import {useNavigation} from '@react-navigation/native';

import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {
  GlobalThemeView,
  ThemeText,
} from '../../../../../functions/CustomElements';
import {useWebView} from '../../../../../../context-store/webViewContext';
import handleBackPress from '../../../../../hooks/handleBackPress';
import CustomNumberKeyboard from '../../../../../functions/CustomElements/customNumberKeyboard';
import {COLORS, FONT, SIZES, WINDOWWIDTH} from '../../../../../constants/theme';
import {
  LIGHTNINGAMOUNTBUFFER,
  SATSPERBITCOIN,
} from '../../../../../constants/math';
import {useGlobaleCash} from '../../../../../../context-store/eCash';
import GetThemeColors from '../../../../../hooks/themeColors';
import ThemeImage from '../../../../../functions/CustomElements/themeImage';
import FormattedSatText from '../../../../../functions/CustomElements/satTextDisplay';
import {formatBalanceAmount, numberConverter} from '../../../../../functions';
import Icon from '../../../../../functions/CustomElements/Icon';
import {CENTER, ICONS} from '../../../../../constants';
import {contactsLNtoLiquidSwapInfo} from '../../contacts/internalComponents/LNtoLiquidSwap';
import {createLiquidReceiveAddress} from '../../../../../functions/liquidWallet';
import {getBoltzWsUrl} from '../../../../../functions/boltz/boltzEndpoitns';
import handleReverseClaimWSS from '../../../../../functions/boltz/handle-reverse-claim-wss';
import {parseInput} from '@breeztech/react-native-breez-sdk';
import {breezPaymentWrapper} from '../../../../../functions/SDK';
import FullLoadingScreen from '../../../../../functions/CustomElements/loadingScreen';

export default function PegOutTransferPage() {
  const {theme, nodeInformation, masterInfoObject, minMaxLiquidSwapAmounts} =
    useGlobalContextProvider();
  const {
    setEcashPaymentInformation,
    seteCashNavigate,
    eCashBalance,
    sendEcashPayment,
  } = useGlobaleCash();
  const {webViewRef, setWebViewArgs} = useWebView();
  console.log('CONFIRM SEND PAYMENT SCREEN');
  const navigate = useNavigation();
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [sendingAmount, setSendingAmount] = useState('');
  const [isSendingPayment, setIsSendingPayment] = useState(false);
  const [hasError, setHasError] = useState('');
  const [didComplete, setDidComplete] = useState(false);
  const {textColor, backgroundOffset, backgroundColor} = GetThemeColors();

  const isBTCdenominated =
    masterInfoObject.userBalanceDenomination === 'hidden' ||
    masterInfoObject.userBalanceDenomination === 'sats';

  const convertedSendAmount =
    masterInfoObject.userBalanceDenomination != 'fiat'
      ? Math.round(Number(sendingAmount))
      : Math.round(
          (SATSPERBITCOIN / (nodeInformation.fiatStats?.value || 65000)) *
            Number(sendingAmount),
        );

  const LntoLiquidSwapFee =
    minMaxLiquidSwapAmounts.reverseSwapStats?.fees?.minerFees?.claim +
    minMaxLiquidSwapAmounts.reverseSwapStats?.fees?.minerFees?.lockup +
    Math.round(convertedSendAmount * 0.0025);

  const swapFee = LntoLiquidSwapFee;

  const canUseEcash =
    nodeInformation.userBalance === 0 &&
    masterInfoObject.enabledEcash &&
    eCashBalance > convertedSendAmount + 2;

  const canUseLightning =
    canUseEcash ||
    nodeInformation.userBalance > convertedSendAmount + LIGHTNINGAMOUNTBUFFER;

  const sendingAmountIsBetweenLimits =
    sendingAmount >=
      (minMaxLiquidSwapAmounts?.reverseSwapStats?.limits?.minimal || 1000) &&
    sendingAmount <=
      (minMaxLiquidSwapAmounts?.reverseSwapStats?.limits?.maximal || 25000000);

  const canSendPayment =
    canUseLightning && sendingAmount != 0 && sendingAmountIsBetweenLimits;

  const handleBackPressFunction = useCallback(() => {
    goBackFunction();
    return true;
  }, [navigate]);

  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, [handleBackPressFunction]);

  return (
    <GlobalThemeView>
      <TouchableWithoutFeedback onPress={() => setIsAmountFocused(false)}>
        <View style={styles.paymentInfoContainer}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={{position: 'absolute', left: 0, zIndex: 99}}
              onPress={() => {
                goBackFunction();
              }}>
              <ThemeImage
                lightModeIcon={ICONS.smallArrowLeft}
                darkModeIcon={ICONS.smallArrowLeft}
                lightsOutIcon={ICONS.arrow_small_left_white}
              />
            </TouchableOpacity>
            <ThemeText content={'Transfer'} styles={{...styles.topBarText}} />
          </View>
          {didComplete ? (
            <FullLoadingScreen
              showLoadingIcon={false}
              textStyles={{textAlign: 'center'}}
              text={'Transfor complete. It will take 1-2 minuts to confirm.'}
            />
          ) : hasError || isSendingPayment ? (
            <View style={styles.isLoadingContainer}>
              <ActivityIndicator size={'large'} color={textColor} />
              <ThemeText
                styles={{...styles.loadingText}}
                content={
                  isSendingPayment
                    ? 'Handling Transfer, Stay on page.'
                    : !!hasError.length
                    ? hasError
                    : 'Transfor complete. It will take 1-2 minuts to confirm.'
                }
              />
            </View>
          ) : (
            <>
              <ScrollView contentContainerStyle={{flex: 1}}>
                <View style={{...styles.infoContainer, marginTop: 20}}>
                  <ThemeText
                    styles={{marginRight: 5}}
                    content={'Available balance to transfer'}
                  />
                </View>
                <FormattedSatText
                  containerStyles={{...CENTER}}
                  neverHideBalance={true}
                  iconHeight={15}
                  iconWidth={15}
                  styles={{includeFontPadding: false, ...styles.balanceText}}
                  formattedBalance={formatBalanceAmount(
                    numberConverter(
                      nodeInformation.userBalance,
                      masterInfoObject.userBalanceDenomination,
                      nodeInformation,
                      masterInfoObject.userBalanceDenomination != 'fiat'
                        ? 0
                        : 2,
                    ),
                  )}
                />
                <ThemeText
                  styles={{...styles.subHeaderText, marginTop: 30, ...CENTER}}
                  content={'Amount that will be sent:'}
                />
                <TouchableOpacity
                  onPress={() => {
                    setIsAmountFocused(true);
                  }}
                  style={[
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: !sendingAmount ? 0.5 : 1,
                    },
                  ]}>
                  {masterInfoObject.satDisplay === 'symbol' &&
                    masterInfoObject.userBalanceDenomination === 'sats' && (
                      <Icon
                        color={
                          theme ? COLORS.darkModeText : COLORS.lightModeText
                        }
                        width={25}
                        height={25}
                        name={'bitcoinB'}
                      />
                    )}
                  <TextInput
                    style={{
                      ...styles.sendingAmtBTC,
                      width: 'auto',
                      maxWidth: '70%',
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                      zIndex: -1,
                      marginRight: 5,
                      pointerEvents: 'none',
                    }}
                    value={formatBalanceAmount(sendingAmount)}
                    readOnly={true}
                  />
                  <ThemeText
                    content={`${
                      masterInfoObject.satDisplay === 'symbol' &&
                      masterInfoObject.userBalanceDenomination === 'sats'
                        ? ''
                        : masterInfoObject.userBalanceDenomination === 'fiat'
                        ? `${nodeInformation.fiatStats.coin}`
                        : masterInfoObject.userBalanceDenomination === 'hidden'
                        ? '* * * * *'
                        : 'sats'
                    }`}
                    styles={{fontSize: SIZES.xLarge, includeFontPadding: false}}
                  />
                </TouchableOpacity>

                <ThemeText
                  styles={{...styles.subHeaderText, marginTop: 30}}
                  content={'Fee and Speed'}
                />
                <FormattedSatText
                  frontText={`Fee: `}
                  neverHideBalance={true}
                  iconHeight={20}
                  iconWidth={20}
                  styles={{includeFontPadding: false}}
                  formattedBalance={formatBalanceAmount(
                    numberConverter(
                      sendingAmount.length === 0 ? 0 : swapFee,
                      masterInfoObject.userBalanceDenomination,
                      nodeInformation,
                      masterInfoObject.userBalanceDenomination != 'fiat'
                        ? 0
                        : 2,
                    ),
                  )}
                />
              </ScrollView>

              {canSendPayment ? (
                <ThemeText content={''} />
              ) : sendingAmount.length === 0 ? (
                <ThemeText
                  styles={{includeFontPadding: false, textAlign: 'center'}}
                  content={'Please enter a send amount'}
                />
              ) : !sendingAmountIsBetweenLimits ? (
                <ThemeText
                  styles={{includeFontPadding: false, textAlign: 'center'}}
                  content={'Payment not within swap limits'}
                />
              ) : (
                <ThemeText
                  styles={{includeFontPadding: false, textAlign: 'center'}}
                  content={'Not enough funds to cover payment'}
                />
              )}

              {!isAmountFocused && (
                <SwipeButton
                  containerStyles={{
                    opacity: canSendPayment ? 1 : 0.2,
                    width: '100%',
                    maxWidth: 350,
                    borderColor: textColor,
                    ...CENTER,
                  }}
                  titleStyles={{fontWeight: '500', fontSize: SIZES.large}}
                  swipeSuccessThreshold={100}
                  onSwipeSuccess={async () => {
                    try {
                      setWebViewArgs({
                        navigate: navigate,
                        page: 'peg-out-transfer',
                      });
                      setIsSendingPayment(true);
                      if (!canSendPayment) return;
                      const {address: interanalLiquidAddress} =
                        await createLiquidReceiveAddress();

                      const [
                        data,
                        swapPublicKey,
                        privateKeyString,
                        keys,
                        preimage,
                        liquidAddress,
                      ] = await contactsLNtoLiquidSwapInfo(
                        interanalLiquidAddress,
                        Number(sendingAmount),
                        'Peg-out internal transfer',
                      );

                      if (!data?.invoice)
                        throw new Error('No Invoice genereated');
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
                        fromPage: 'peg-out-transfer',
                        contactsFunction: () => {
                          setDidComplete(true);
                        },
                      });
                      if (didHandle) {
                        try {
                          const prasedInput = await parseInput(data.invoice);
                          // console.log(data);
                          breezPaymentWrapper({
                            paymentInfo: prasedInput,
                            amountMsat: prasedInput?.invoice?.amountMsat,
                            failureFunction: () => {
                              setHasError('Error when paying invoice');
                              setIsSendingPayment(false);
                            },
                            confirmFunction: () => {
                              console.log('CONFIRMED');
                            },
                          });
                        } catch (err) {
                          console.log(err);
                          webSocket.close();
                          setHasError('Unable to pay at this moment');
                        }
                      }
                    } catch (err) {
                      setHasError('Error when paying invoice');
                      setIsSendingPayment(false);
                    }
                  }}
                  shouldResetAfterSuccess={canSendPayment ? false : true}
                  railBackgroundColor={
                    theme ? COLORS.darkModeText : COLORS.primary
                  }
                  railBorderColor={
                    theme ? backgroundColor : COLORS.lightModeBackground
                  }
                  height={55}
                  railStyles={{
                    backgroundColor: theme
                      ? backgroundColor
                      : COLORS.darkModeText,
                    borderColor: theme ? backgroundColor : COLORS.darkModeText,
                  }}
                  thumbIconBackgroundColor={
                    theme ? backgroundColor : COLORS.darkModeText
                  }
                  thumbIconBorderColor={
                    theme ? backgroundColor : COLORS.darkModeText
                  }
                  titleColor={theme ? backgroundColor : COLORS.darkModeText}
                  title="Slide to confirm"
                />
              )}
              {isAmountFocused && (
                <CustomNumberKeyboard
                  showDot={masterInfoObject.userBalanceDenomination === 'fiat'}
                  // frompage={'sendingPage'}
                  setInputValue={setSendingAmount}
                />
              )}
            </>
          )}
        </View>
      </TouchableWithoutFeedback>
    </GlobalThemeView>
  );

  function goBackFunction() {
    navigate.goBack();
  }
}

const styles = StyleSheet.create({
  topBarText: {
    fontSize: SIZES.xLarge,
    width: '100%',
    textAlign: 'center',
    fontFamily: FONT.Title_Regular,
  },
  paymentInfoContainer: {
    flex: 1,
    width: WINDOWWIDTH,
    ...CENTER,
  },
  isLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 15,
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    alignItems: 'center',
  },
  balanceText: {
    fontSize: SIZES.xxLarge,
  },
  buttonGlobalContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',

    marginTop: 50,
  },
  //   NEW STYLES
  headerText: {
    fontSize: SIZES.large,

    ...CENTER,
  },
  subHeaderText: {
    textAlign: 'center',
  },
  balanceInfoContainer: {
    // marginBottom: 10,
  },
  headerText: {
    fontSize: SIZES.large,
    // ...CENTER,
  },
  sendingAmountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'left',

    ...CENTER,
  },
  sendingAmtBTC: {
    fontSize: SIZES.huge,
    includeFontPadding: false,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    alignItems: 'center',
  },

  warningText: {
    textAlign: 'center',
  },
});
