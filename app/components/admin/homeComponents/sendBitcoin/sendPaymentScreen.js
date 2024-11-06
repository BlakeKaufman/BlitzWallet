import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {
  CENTER,
  COLORS,
  ICONS,
  SATSPERBITCOIN,
  SIZES,
} from '../../../../constants';
import {useCallback, useEffect, useRef, useState} from 'react';
import {InputTypeVariant, parseInput} from '@breeztech/react-native-breez-sdk';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import UserTotalBalanceInfo from './components/balanceInfo';
import InvoiceInfo from './components/invoiceInfo';
import SwipeButton from 'rn-swipe-button';
import SendTransactionFeeInfo from './components/feeInfo';
import TransactionWarningText from './components/warningText';
import decodeSendAddress from './functions/decodeSendAdress';
// import sendPaymentFunction from './functions/sendPaymentFunction';
import {useNavigation} from '@react-navigation/native';
import {
  getLNAddressForLiquidPayment,
  sendLightningPayment_sendPaymentScreen,
  sendLiquidPayment_sendPaymentScreen,
  sendToLNFromLiquid_sendPaymentScreen,
  sendToLiquidFromLightning_sendPaymentScreen,
} from './functions/payments';
import {useWebView} from '../../../../../context-store/webViewContext';
import handleBackPress from '../../../../hooks/handleBackPress';
import CustomNumberKeyboard from '../../../../functions/CustomElements/customNumberKeyboard';
import {backArrow} from '../../../../constants/styles';
import {WINDOWWIDTH} from '../../../../constants/theme';
import {
  LIGHTNINGAMOUNTBUFFER,
  LIQUIDAMOUTBUFFER,
} from '../../../../constants/math';
import {getLiquidTxFee} from '../../../../functions/liquidWallet';
import {useGlobaleCash} from '../../../../../context-store/eCash';
import GetThemeColors from '../../../../hooks/themeColors';
import ThemeImage from '../../../../functions/CustomElements/themeImage';
import useDebounce from '../../../../hooks/useDebounce';
import CustomSwipButton from '../../../../functions/CustomElements/customSliderButton';

export default function SendPaymentScreen({
  route: {
    params: {btcAdress, fromPage, publishMessageFunc},
  },
}) {
  const {
    theme,
    nodeInformation,
    masterInfoObject,
    liquidNodeInformation,
    toggleMasterInfoObject,
    contactsPrivateKey,
    minMaxLiquidSwapAmounts,
  } = useGlobalContextProvider();
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
  const [paymentInfo, setPaymentInfo] = useState({});
  const [sendingAmount, setSendingAmount] = useState('');
  const [isSendingPayment, setIsSendingPayment] = useState(false);
  const [hasError, setHasError] = useState('');
  const [liquidTxFee, setLiquidTxFee] = useState(250);
  const [isCalculatingFees, setIsCalculatingFees] = useState(false);
  const {textColor, backgroundOffset, backgroundColor} = GetThemeColors();
  const didSend = useRef(false);

  // const [isLoading, setIsLoading] = useState(true);
  // const [isLightningPayment, setIsLightningPayment] = useState(null);

  // const {keyboardHeight} = getKeyboardHeight();
  // const isShwoing = keyboardHeight != 0;
  // Reqiured information to load before content is shown

  // const [fees, setFees] = useState({
  //   liquidFees: 0,
  //   boltzFee: 0,
  // });
  // const [boltzSwapInfo, setBoltzSwapInfo] = useState({});
  // Reqiured information to load before content is shown

  // const webViewRef = useRef(null);

  const isBTCdenominated =
    masterInfoObject.userBalanceDenomination === 'hidden' ||
    masterInfoObject.userBalanceDenomination === 'sats';

  const initialSendingAmount =
    paymentInfo?.type === InputTypeVariant.LN_URL_PAY
      ? paymentInfo?.data?.minSendable
      : paymentInfo.type === 'bolt11'
      ? paymentInfo?.invoice?.amountMsat
      : paymentInfo?.addressInfo?.amount;

  const convertedSendAmount =
    initialSendingAmount && paymentInfo?.type != InputTypeVariant.LN_URL_PAY
      ? initialSendingAmount / 1000
      : masterInfoObject.userBalanceDenomination != 'fiat'
      ? Math.round(Number(sendingAmount))
      : Math.round(
          (SATSPERBITCOIN / (nodeInformation.fiatStats?.value || 65000)) *
            Number(sendingAmount),
        );

  console.log(
    initialSendingAmount,
    sendingAmount,
    initialSendingAmount / 1000,
    masterInfoObject.userBalanceDenomination != 'fiat',
    Math.round(Number(sendingAmount)),
    Math.round(
      (SATSPERBITCOIN / (nodeInformation.fiatStats?.value || 65000)) *
        Number(sendingAmount),
    ),
  );
  const isUsingBank =
    masterInfoObject.liquidWalletSettings.regulatedChannelOpenSize &&
    nodeInformation.userBalance * 1000 - LIGHTNINGAMOUNTBUFFER * 1000 <
      sendingAmount &&
    liquidNodeInformation.userBalance * 1000 - LIGHTNINGAMOUNTBUFFER * 1000 >
      sendingAmount;

  const LntoLiquidSwapFee =
    minMaxLiquidSwapAmounts.reverseSwapStats?.fees?.minerFees?.claim +
    minMaxLiquidSwapAmounts.reverseSwapStats?.fees?.minerFees?.lockup +
    Math.round(convertedSendAmount * 0.0025);

  const LiquidtoLNSwapFee =
    minMaxLiquidSwapAmounts.submarineSwapStats?.fees?.minerFees +
    Math.round(convertedSendAmount * 0.001);

  const swapFee =
    paymentInfo.type === 'liquid' ? LntoLiquidSwapFee : LiquidtoLNSwapFee;

  const isLightningPayment =
    paymentInfo?.type === 'bolt11' ||
    paymentInfo?.type === InputTypeVariant.LN_URL_PAY;

  const canUseLiquid =
    liquidNodeInformation.userBalance >
      convertedSendAmount + liquidTxFee + LIQUIDAMOUTBUFFER &&
    convertedSendAmount >= 1000;

  const canUseEcash =
    nodeInformation.userBalance === 0 &&
    masterInfoObject.enabledEcash &&
    eCashBalance > convertedSendAmount + 2 &&
    (!!paymentInfo.invoice?.amountMsat ||
      paymentInfo?.type === InputTypeVariant.LN_URL_PAY);

  console.log(canUseEcash, 'CSN USE ECAHS');

  const canUseLightning =
    canUseEcash ||
    nodeInformation.userBalance > convertedSendAmount + LIGHTNINGAMOUNTBUFFER;

  const fetchLiquidTxFee = async () => {
    try {
      setIsCalculatingFees(true);
      const fee = await getLiquidTxFee({
        amountSat: convertedSendAmount,
      });
      if (!fee) throw Error('not able to get fees');

      if (fee === liquidTxFee) {
        setIsCalculatingFees(false);
        return;
      }

      if (Number(fee)) setLiquidTxFee(Number(fee) || 250);
    } catch (error) {
      setLiquidTxFee(250); // Fallback value
    } finally {
      setIsCalculatingFees(false);
    }
  };
  // Use the debounce hook with a 500ms delay
  const debouncedFetchLiquidTxFee = useDebounce(fetchLiquidTxFee, 500);
  useEffect(() => {
    if (initialSendingAmount == undefined) return;
    if (
      Number(convertedSendAmount) < 1000 ||
      liquidNodeInformation.userBalance < convertedSendAmount ||
      (canUseLightning && !canUseLiquid)
    )
      return;

    // Call the debounced function whenever `convertedSendAmount` changes
    debouncedFetchLiquidTxFee();
  }, [convertedSendAmount, sendingAmount, initialSendingAmount]);

  // isLightningPayment
  //   ? liquidNodeInformation.userBalance >
  //     convertedSendAmount + fees.liquidFees + LIQUIDAMOUTBUFFER
  //   : //   &&
  //     // convertedSendAmount + 100 > boltzSwapInfo?.minimal
  //     convertedSendAmount + fees.liquidFees + LIQUIDAMOUTBUFFER <
  //     liquidNodeInformation.userBalance;

  // isLightningPayment
  //   ? nodeInformation.userBalance > convertedSendAmount + LIGHTNINGAMOUNTBUFFER
  //   : nodeInformation.userBalance > convertedSendAmount + LIGHTNINGAMOUNTBUFFER;
  console.log(canUseLightning);
  const canSendPayment =
    (canUseLiquid || canUseLightning) && sendingAmount != 0;

  const isUsingLiquidWithZeroInvoice =
    paymentInfo.type === 'bolt11' &&
    paymentInfo.type != InputTypeVariant.LN_URL_PAY &&
    !paymentInfo.invoice?.amountMsat;

  const handleBackPressFunction = useCallback(() => {
    if (fromPage === 'slideCamera') {
      navigate.replace('HomeAdmin');
      return true;
    }
    if (navigate.canGoBack()) goBackFunction();
    else navigate.replace('HomeAdmin');
    return true;
  }, [navigate, fromPage]);

  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, [handleBackPressFunction]);

  useEffect(() => {
    // (async () => {
    //   const liquidFees = await getLiquidFees();
    //   const txSize = (148 + 3 * 34 + 10.5) / 100;

    //   setFees({
    //     liquidFees: Math.round(liquidFees.fees[0] * txSize),
    //   });
    // })();

    // useEffect(() => {
    //   (async () => {
    //     const {liquidFees, boltzFee, boltzSwapInfo} =
    //       await getLiquidAndBoltzFees();
    //     setFees({
    //       liquidFees: liquidFees,
    //       boltzFee: boltzFee,
    //     });
    //     setBoltzSwapInfo(boltzSwapInfo);
    //   })();

    decodeSendAddress({
      nodeInformation,
      btcAdress,
      goBackFunction,
      // setIsLightningPayment,
      setSendingAmount,
      setPaymentInfo,
      // setIsLoading,
      liquidNodeInformation,
      masterInfoObject,
      setWebViewArgs,
      webViewRef,
      navigate,
      setHasError,
      maxZeroConf:
        minMaxLiquidSwapAmounts?.submarineSwapStats?.limits?.maximalZeroConf,
    });
  }, []);

  return (
    <GlobalThemeView>
      {Object.keys(paymentInfo).length === 0 || hasError || isSendingPayment ? ( // || !liquidTxFee
        // || !fees.boltzFee
        <View style={styles.isLoadingContainer}>
          <ActivityIndicator size={'large'} color={textColor} />
          <ThemeText
            styles={{...styles.loadingText}}
            content={
              isSendingPayment
                ? 'Sending payment'
                : hasError
                ? hasError
                : 'Getting payment details'
            }
          />
        </View>
      ) : (
        <>
          <TouchableWithoutFeedback onPress={() => setIsAmountFocused(false)}>
            <View style={styles.paymentInfoContainer}>
              <View style={styles.topBar}>
                <TouchableOpacity
                  onPress={() => {
                    if (fromPage === 'slideCamera') {
                      navigate.replace('HomeAdmin');
                      return true;
                    }
                    if (navigate.canGoBack()) goBackFunction();
                    else navigate.replace('HomeAdmin');
                  }}>
                  <ThemeImage
                    lightModeIcon={ICONS.smallArrowLeft}
                    darkModeIcon={ICONS.smallArrowLeft}
                    lightsOutIcon={ICONS.arrow_small_left_white}
                  />
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={{flex: 1}}>
                <UserTotalBalanceInfo
                  setIsAmountFocused={setIsAmountFocused}
                  sendingAmount={sendingAmount}
                  isBTCdenominated={isBTCdenominated}
                  paymentInfo={paymentInfo}
                  initialSendingAmount={initialSendingAmount}
                />
                {/* <InvoiceInfo
                  isLightningPayment={paymentInfo.type === 'bolt11'}
                  paymentInfo={paymentInfo}
                  btcAdress={btcAdress}
                /> */}
                <SendTransactionFeeInfo
                  canUseLightning={canUseLightning}
                  canUseLiquid={canUseLiquid}
                  isLightningPayment={isLightningPayment}
                  // fees={fees}
                  swapFee={swapFee}
                  liquidTxFee={liquidTxFee}
                  canSendPayment={canSendPayment}
                  convertedSendAmount={convertedSendAmount}
                  canUseEcash={canUseEcash}
                  sendingAmount={sendingAmount}
                />
              </ScrollView>
              <TransactionWarningText
                isUsingLiquidWithZeroInvoice={isUsingLiquidWithZeroInvoice}
                canSendPayment={canSendPayment}
                canUseLightning={canUseLightning}
                canUseLiquid={canUseLiquid}
                isLightningPayment={isLightningPayment}
                sendingAmount={sendingAmount}
                paymentInfo={paymentInfo}
                isCalculatingFees={isCalculatingFees}
                // fees={fees}
                // boltzSwapInfo={boltzSwapInfo}
              />

              {/* {!isAmountFocused && (
                <View
                  style={{
                    opacity: isCalculatingFees
                      ? 0.2
                      : canSendPayment
                      ? isLightningPayment
                        ? canUseLightning
                          ? 1
                          : convertedSendAmount >=
                              minMaxLiquidSwapAmounts.min &&
                            !isUsingLiquidWithZeroInvoice
                          ? 1
                          : 0.2
                        : canUseLiquid
                        ? convertedSendAmount >= 1000
                          ? 1
                          : 0.2
                        : canUseLightning &&
                          convertedSendAmount >= minMaxLiquidSwapAmounts.min
                        ? 1
                        : 0.2
                      : 0.2,

                    ...CENTER,
                  }}>
                  <CustomSwipButton
                    sliderSize={55}
                    onComplete={async () => {
                      if (isCalculatingFees) return false;
                      if (!canSendPayment) return false;
                      if (didSend.current) return false;
                      didSend.current = true;

                      if (canUseEcash) {
                        setIsSendingPayment(true);
                        const sendingInvoice =
                          await getLNAddressForLiquidPayment(
                            paymentInfo,
                            convertedSendAmount,
                          );

                        if (!sendingInvoice) {
                          navigate.navigate('ErrorScreen', {
                            errorMessage:
                              'Unable to create an invoice for the lightning address.',
                          });
                          setIsSendingPayment(false);
                          return true;
                        }

                        const didSendEcashPayment = await sendEcashPayment(
                          sendingInvoice,
                        );
                        if (
                          didSendEcashPayment.proofsToUse &&
                          didSendEcashPayment.quote
                        ) {
                          if (fromPage === 'contacts') {
                            publishMessageFunc();
                          }

                          seteCashNavigate(navigate);
                          setEcashPaymentInformation({
                            quote: didSendEcashPayment.quote,
                            invoice: sendingInvoice,
                            proofsToUse: didSendEcashPayment.proofsToUse,
                          });
                        } else {
                          navigate.navigate('HomeAdmin');
                          navigate.navigate('ConfirmTxPage', {
                            for: 'paymentFailed',
                            information: {},
                          });
                        }
                        console.log(didSendEcashPayment);
                        return true;
                      }

                      setWebViewArgs({
                        navigate: navigate,
                        page: 'sendingPage',
                      });

                      if (isLightningPayment) {
                        if (canUseLightning) {
                          setIsSendingPayment(true);
                          sendLightningPayment_sendPaymentScreen({
                            sendingAmount: convertedSendAmount,
                            paymentInfo,
                            navigate,
                            fromPage,
                            publishMessageFunc,
                          });
                          return true;
                        } else if (
                          convertedSendAmount >= minMaxLiquidSwapAmounts.min &&
                          !isUsingLiquidWithZeroInvoice &&
                          convertedSendAmount <= minMaxLiquidSwapAmounts.max
                        ) {
                          setIsSendingPayment(true);
                          sendToLNFromLiquid_sendPaymentScreen({
                            paymentInfo,
                            webViewRef,
                            setHasError,
                            toggleMasterInfoObject,
                            masterInfoObject,
                            contactsPrivateKey,
                            goBackFunction,
                            navigate,
                            sendingAmount: convertedSendAmount,
                            fromPage,
                            publishMessageFunc,
                          });
                          return true;
                        } else {
                          setIsSendingPayment(false);
                          navigate.navigate('ErrorScreen', {
                            errorMessage: 'Cannot send lightning payment.',
                          });
                          return false;
                        }
                      } else {
                        if (canUseLiquid) {
                          setIsSendingPayment(true);
                          sendLiquidPayment_sendPaymentScreen({
                            sendingAmount: convertedSendAmount,
                            paymentInfo,
                            navigate,
                            fromPage,
                            publishMessageFunc,
                          });
                          return true;
                        } else if (
                          nodeInformation.userBalance >
                            convertedSendAmount +
                              LIGHTNINGAMOUNTBUFFER +
                              swapFee +
                              liquidTxFee &&
                          convertedSendAmount >= minMaxLiquidSwapAmounts.min
                        ) {
                          setIsSendingPayment(true);
                          sendToLiquidFromLightning_sendPaymentScreen({
                            paymentInfo,
                            sendingAmount: convertedSendAmount,
                            navigate,
                            webViewRef,
                            fromPage,
                            publishMessageFunc,
                          });
                          return true;
                        } else {
                          setIsSendingPayment(false);
                          navigate.navigate('ErrorScreen', {
                            errorMessage: 'Cannot send liquid payment.',
                          });
                          return false;
                        }
                      }
                    }}
                  />
                </View>
              )} */}

              {!isAmountFocused && (
                <SwipeButton
                  containerStyles={{
                    opacity: isCalculatingFees
                      ? 0.2
                      : canSendPayment
                      ? isLightningPayment
                        ? canUseLightning
                          ? 1
                          : convertedSendAmount >=
                              minMaxLiquidSwapAmounts.min &&
                            !isUsingLiquidWithZeroInvoice
                          ? 1
                          : 0.2
                        : canUseLiquid
                        ? convertedSendAmount >= 1000
                          ? 1
                          : 0.2
                        : canUseLightning &&
                          convertedSendAmount >= minMaxLiquidSwapAmounts.min
                        ? 1
                        : 0.2
                      : 0.2,
                    width: '100%',
                    maxWidth: 350,
                    borderColor: textColor,
                    ...CENTER,
                  }}
                  titleStyles={{fontWeight: '500', fontSize: SIZES.large}}
                  swipeSuccessThreshold={100}
                  onSwipeSuccess={async () => {
                    if (isCalculatingFees) return;
                    if (!canSendPayment) return;

                    if (canUseEcash) {
                      setIsSendingPayment(true);
                      const sendingInvoice = await getLNAddressForLiquidPayment(
                        paymentInfo,
                        convertedSendAmount,
                      );

                      if (!sendingInvoice) {
                        navigate.navigate('ErrorScreen', {
                          errorMessage:
                            'Unable to create an invoice for the lightning address.',
                        });
                        setIsSendingPayment(false);
                        return;
                      }

                      const didSendEcashPayment = await sendEcashPayment(
                        sendingInvoice,
                      );
                      if (
                        didSendEcashPayment.proofsToUse &&
                        didSendEcashPayment.quote
                      ) {
                        if (fromPage === 'contacts') {
                          publishMessageFunc();
                        }

                        seteCashNavigate(navigate);
                        setEcashPaymentInformation({
                          quote: didSendEcashPayment.quote,
                          invoice: sendingInvoice,
                          proofsToUse: didSendEcashPayment.proofsToUse,
                        });
                      } else {
                        navigate.navigate('HomeAdmin');
                        navigate.navigate('ConfirmTxPage', {
                          for: 'paymentFailed',
                          information: {},
                        });
                      }
                      console.log(didSendEcashPayment);
                      return;
                    }

                    setWebViewArgs({
                      navigate: navigate,
                      page: 'sendingPage',
                    });

                    if (isLightningPayment) {
                      if (canUseLightning) {
                        setIsSendingPayment(true);
                        sendLightningPayment_sendPaymentScreen({
                          sendingAmount: convertedSendAmount,
                          paymentInfo,
                          navigate,
                          fromPage,
                          publishMessageFunc,
                        });
                      } else if (
                        convertedSendAmount >= minMaxLiquidSwapAmounts.min &&
                        !isUsingLiquidWithZeroInvoice &&
                        convertedSendAmount <= minMaxLiquidSwapAmounts.max
                      ) {
                        setIsSendingPayment(true);
                        sendToLNFromLiquid_sendPaymentScreen({
                          paymentInfo,
                          webViewRef,
                          setHasError,
                          toggleMasterInfoObject,
                          masterInfoObject,
                          contactsPrivateKey,
                          goBackFunction,
                          navigate,
                          sendingAmount: convertedSendAmount,
                          fromPage,
                          publishMessageFunc,
                        });
                      } else {
                        setIsSendingPayment(false);
                        navigate.navigate('ErrorScreen', {
                          errorMessage: 'Cannot send lightning payment.',
                        });
                      }
                    } else {
                      if (canUseLiquid) {
                        setIsSendingPayment(true);
                        sendLiquidPayment_sendPaymentScreen({
                          sendingAmount: convertedSendAmount,
                          paymentInfo,
                          navigate,
                          fromPage,
                          publishMessageFunc,
                        });
                      } else if (
                        nodeInformation.userBalance >
                          convertedSendAmount +
                            LIGHTNINGAMOUNTBUFFER +
                            swapFee +
                            liquidTxFee &&
                        convertedSendAmount >= minMaxLiquidSwapAmounts.min
                      ) {
                        setIsSendingPayment(true);
                        sendToLiquidFromLightning_sendPaymentScreen({
                          paymentInfo,
                          sendingAmount: convertedSendAmount,
                          navigate,
                          webViewRef,
                          fromPage,
                          publishMessageFunc,
                        });
                      } else {
                        setIsSendingPayment(false);
                        navigate.navigate('ErrorScreen', {
                          errorMessage: 'Cannot send liquid payment.',
                        });
                      }
                    }
                  }}
                  shouldResetAfterSuccess={
                    isUsingBank && canSendPayment ? false : true
                  }
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
            </View>
          </TouchableWithoutFeedback>
        </>
      )}
    </GlobalThemeView>
  );

  function goBackFunction() {
    navigate.goBack();
  }
}

const styles = StyleSheet.create({
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
});
