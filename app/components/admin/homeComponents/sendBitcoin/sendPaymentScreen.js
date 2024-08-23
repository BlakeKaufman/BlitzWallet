import {
  StyleSheet,
  View,
  Alert,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Image,
  ActivityIndicator,
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
  WEBSITE_REGEX,
} from '../../../../constants';

import {useEffect, useMemo, useRef, useState} from 'react';
import {InputTypeVariant, parseInput} from '@breeztech/react-native-breez-sdk';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import WebView from 'react-native-webview';
import handleWebviewClaimMessage from '../../../../functions/boltz/handle-webview-claim-message';
import UserTotalBalanceInfo from './components/balanceInfo';
import InvoiceInfo from './components/invoiceInfo';

import SwipeButton from 'rn-swipe-button';
import getKeyboardHeight from '../../../../hooks/getKeyboardHeight';
import getLiquidAndBoltzFees from './functions/getFees';
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
import {numberConverter} from '../../../../functions';
import WebviewForBoltzSwaps from '../../../../functions/boltz/webview';
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
import {checkFees, sendEcashPayment} from '../../../../functions/eCash';
import {getStoredProofs} from '../../../../functions/eCash/proofStorage';
import {useGlobaleCash} from '../../../../../context-store/eCash';

export default function SendPaymentScreen({
  navigation: {goBack},
  route: {
    params: {btcAdress},
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
  const {setEcashPaymentInformation, seteCashNavigate} = useGlobaleCash();
  const {webViewRef, setWebViewArgs} = useWebView();
  const {eCashBalance} = useGlobaleCash();
  console.log('CONFIRM SEND PAYMENT SCREEN');
  const navigate = useNavigation();
  const [isAmountFocused, setIsAmountFocused] = useState(false);

  const [paymentInfo, setPaymentInfo] = useState({});
  const [sendingAmount, setSendingAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingPayment, setIsSendingPayment] = useState(false);
  const [hasError, setHasError] = useState('');
  const [liquidTxFee, setLiquidTxFee] = useState(300);

  // const {keyboardHeight} = getKeyboardHeight();
  // const isShwoing = keyboardHeight != 0;
  // Reqiured information to load before content is shown
  const [isLightningPayment, setIsLightningPayment] = useState(null);
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
      : isLightningPayment
      ? paymentInfo?.invoice?.amountMsat
      : paymentInfo?.addressInfo?.amount;

  console.log(sendingAmount, initialSendingAmount, paymentInfo);

  const convertedSendAmount =
    initialSendingAmount === sendingAmount
      ? initialSendingAmount / 1000
      : masterInfoObject.userBalanceDenomination != 'fiat'
      ? Math.round(sendingAmount)
      : Math.round(
          (SATSPERBITCOIN / (nodeInformation.fiatStats?.value || 65000)) *
            sendingAmount,
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

  useEffect(() => {
    const fetchLiquidTxFee = async () => {
      if (paymentInfo.type !== 'liquid') {
        setLiquidTxFee(300);
        return;
      }

      console.log(convertedSendAmount, paymentInfo.addressInfo.addres);
      try {
        const fee = await getLiquidTxFee({
          amountSat: convertedSendAmount,
          address: paymentInfo.addressInfo.address,
        });

        setLiquidTxFee(fee || 300);
      } catch (error) {
        console.error('Error fetching liquid transaction fee:', error);
        setLiquidTxFee(300); // Fallback value
      }
    };

    fetchLiquidTxFee();
  }, [convertedSendAmount]);

  console.log(liquidTxFee);
  const canUseLiquid =
    liquidNodeInformation.userBalance >
    convertedSendAmount + liquidTxFee + LIQUIDAMOUTBUFFER;

  // isLightningPayment
  //   ? liquidNodeInformation.userBalance >
  //     convertedSendAmount + fees.liquidFees + LIQUIDAMOUTBUFFER
  //   : //   &&
  //     // convertedSendAmount + 100 > boltzSwapInfo?.minimal
  //     convertedSendAmount + fees.liquidFees + LIQUIDAMOUTBUFFER <
  //     liquidNodeInformation.userBalance;

  const canUseLightning =
    (nodeInformation.userBalance === 0 &&
      masterInfoObject.enabledEcash &&
      eCashBalance > convertedSendAmount + 2) ||
    nodeInformation.userBalance > convertedSendAmount + LIGHTNINGAMOUNTBUFFER;

  // isLightningPayment
  //   ? nodeInformation.userBalance > convertedSendAmount + LIGHTNINGAMOUNTBUFFER
  //   : nodeInformation.userBalance > convertedSendAmount + LIGHTNINGAMOUNTBUFFER;

  const canSendPayment =
    (canUseLiquid || canUseLightning) && sendingAmount != 0;

  const isUsingLiquidWithZeroInvoice =
    !isLightningPayment &&
    paymentInfo.type != InputTypeVariant.LN_URL_PAY &&
    !paymentInfo.invoice?.amountMsat;

  function handleBackPressFunction() {
    if (navigate.canGoBack()) goBack();
    else navigate.replace('HomeAdmin');
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

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
      setIsLightningPayment,
      setSendingAmount,
      setPaymentInfo,
      setIsLoading,
      liquidNodeInformation,
      masterInfoObject,
      setWebViewArgs,
      webViewRef,
      navigate,
      setHasError,
    });
  }, []);

  console.log(canSendPayment, 'CAN SEND PAYMNET');

  return (
    <GlobalThemeView>
      {/* <WebviewForBoltzSwaps
            navigate={navigate}
            webViewRef={webViewRef}
            page={'sendingPage'}
          /> */}

      {isLoading || hasError || isSendingPayment ? ( // || !liquidTxFee
        // || !fees.boltzFee
        <View style={styles.isLoadingContainer}>
          <ActivityIndicator
            size={'large'}
            color={theme ? COLORS.darkModeText : COLORS.lightModeText}
          />
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
                    if (navigate.canGoBack()) goBack();
                    else navigate.replace('HomeAdmin');
                  }}>
                  <Image style={[backArrow]} source={ICONS.smallArrowLeft} />
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={{flex: 1}}>
                <UserTotalBalanceInfo
                  setIsAmountFocused={setIsAmountFocused}
                  sendingAmount={sendingAmount}
                  isBTCdenominated={isBTCdenominated}
                  paymentInfo={paymentInfo}
                  initialSendingAmount={
                    paymentInfo?.type === InputTypeVariant.LN_URL_PAY
                      ? paymentInfo?.data?.minSendable
                      : isLightningPayment
                      ? paymentInfo?.invoice.amountMsat
                      : paymentInfo?.addressInfo.amount
                  }
                />
                <InvoiceInfo
                  isLightningPayment={isLightningPayment}
                  paymentInfo={paymentInfo}
                  btcAdress={btcAdress}
                />
                <SendTransactionFeeInfo
                  canUseLightning={canUseLightning}
                  canUseLiquid={canUseLiquid}
                  isLightningPayment={isLightningPayment}
                  // fees={fees}
                  swapFee={swapFee}
                  liquidTxFee={liquidTxFee}
                  canSendPayment={canSendPayment}
                  convertedSendAmount={convertedSendAmount}
                />
              </ScrollView>
              <TransactionWarningText
                isUsingLiquidWithZeroInvoice={isUsingLiquidWithZeroInvoice}
                canSendPayment={canSendPayment}
                canUseLightning={canUseLightning}
                canUseLiquid={canUseLiquid}
                isLightningPayment={isLightningPayment}
                sendingAmount={sendingAmount}
                // fees={fees}
                // boltzSwapInfo={boltzSwapInfo}
              />

              {!isAmountFocused && (
                <SwipeButton
                  containerStyles={{
                    opacity: canSendPayment
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
                          convertedSendAmount >=
                            minMaxLiquidSwapAmounts.min + swapFee + liquidTxFee
                        ? 1
                        : 0.2
                      : 0.2,
                    width: '100%',
                    maxWidth: 350,
                    borderColor: theme
                      ? COLORS.darkModeText
                      : COLORS.lightModeText,

                    ...CENTER,
                  }}
                  titleStyles={{fontWeight: 'bold', fontSize: SIZES.large}}
                  swipeSuccessThreshold={100}
                  onSwipeSuccess={async () => {
                    // LIST OF PAYMENTS TO COMPLETE
                    // LN -> LIQUID: payments fail -> but might be boltz issue becuase aqua payments also did't work
                    // LN -> LN: completed
                    // Liquid -> LIQUID: Completed
                    // Liquid -> ln: completed
                    if (!canSendPayment) return;

                    if (
                      nodeInformation.userBalance === 0 &&
                      masterInfoObject.enabledEcash &&
                      eCashBalance > convertedSendAmount + 2
                    ) {
                      setIsSendingPayment(true);
                      console.log(paymentInfo.invoice.bolt11);

                      const didSendEcashPayment = await sendEcashPayment(
                        paymentInfo.invoice.bolt11,
                      );
                      if (
                        didSendEcashPayment.proofsToUse &&
                        didSendEcashPayment.quote
                      ) {
                        seteCashNavigate(navigate);
                        setEcashPaymentInformation({
                          quote: didSendEcashPayment.quote,
                          invoice: paymentInfo.invoice.bolt11,
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
                        });
                      } else if (
                        convertedSendAmount >= minMaxLiquidSwapAmounts.min &&
                        !isUsingLiquidWithZeroInvoice
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
                        });
                      } else return;
                    } else {
                      if (canUseLiquid && convertedSendAmount >= 1000) {
                        setIsSendingPayment(true);
                        sendLiquidPayment_sendPaymentScreen({
                          sendingAmount: convertedSendAmount,
                          paymentInfo,
                          navigate,
                        });
                      } else if (
                        canUseLightning &&
                        convertedSendAmount >
                          minMaxLiquidSwapAmounts.min + swapFee + liquidTxFee
                      ) {
                        setIsSendingPayment(true);
                        sendToLiquidFromLightning_sendPaymentScreen({
                          paymentInfo,
                          sendingAmount: convertedSendAmount,
                          navigate,
                          webViewRef,
                        });
                      }
                    }
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
                      ? COLORS.darkModeBackground
                      : COLORS.lightModeBackground
                  }
                  height={55}
                  railStyles={{
                    backgroundColor: theme
                      ? COLORS.darkModeBackground
                      : COLORS.lightModeBackground,
                    borderColor: theme
                      ? COLORS.darkModeBackground
                      : COLORS.lightModeBackground,
                  }}
                  thumbIconBackgroundColor={
                    theme
                      ? COLORS.darkModeBackground
                      : COLORS.lightModeBackground
                  }
                  thumbIconBorderColor={
                    theme
                      ? COLORS.lightModeBackground
                      : COLORS.lightModeBackground
                  }
                  titleColor={
                    theme
                      ? COLORS.darkModeBackground
                      : COLORS.lightModeBackground
                  }
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
    goBack();
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
