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
import {useEffect, useState} from 'react';
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
      if (convertedSendAmount < 1000) return;
      // setIsCalculatingFees(true);

      try {
        return;
        const fee = await getLiquidTxFee({
          amountSat: convertedSendAmount,
          // address:  paymentInfo.addressInfo.address,
        });
        if (!fee) throw Error('not able to get fees');

        if (fee === liquidTxFee) {
          isCalculatingFees(false);
          return;
        }
        console.log(fee, 'LIQUID TX FEE');
        if (Number(fee)) setLiquidTxFee(Number(fee) || 250);
      } catch (error) {
        console.error('Error fetching liquid transaction fee:', error);
        setLiquidTxFee(250); // Fallback value
      } finally {
        setIsCalculatingFees(false);
      }
    };

    fetchLiquidTxFee();
  }, [convertedSendAmount]);

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

  const canUseEcash =
    nodeInformation.userBalance === 0 &&
    masterInfoObject.enabledEcash &&
    eCashBalance > convertedSendAmount + 2 &&
    (!!paymentInfo.invoice?.amountMsat ||
      paymentInfo?.type === InputTypeVariant.LN_URL_PAY);

  const canUseLightning =
    canUseEcash ||
    nodeInformation.userBalance > convertedSendAmount + LIGHTNINGAMOUNTBUFFER;

  // isLightningPayment
  //   ? nodeInformation.userBalance > convertedSendAmount + LIGHTNINGAMOUNTBUFFER
  //   : nodeInformation.userBalance > convertedSendAmount + LIGHTNINGAMOUNTBUFFER;

  const canSendPayment =
    (canUseLiquid || canUseLightning) && sendingAmount != 0;

  const isUsingLiquidWithZeroInvoice =
    paymentInfo.type === 'bolt11' &&
    paymentInfo.type != InputTypeVariant.LN_URL_PAY &&
    !paymentInfo.invoice?.amountMsat;

  function handleBackPressFunction() {
    if (fromPage === 'slideCamera') {
      navigate.replace('HomeAdmin');
      return true;
    }
    if (navigate.canGoBack()) goBackFunction();
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
                  initialSendingAmount={
                    paymentInfo?.type === InputTypeVariant.LN_URL_PAY
                      ? paymentInfo?.data?.minSendable
                      : paymentInfo.type === 'bolt11'
                      ? paymentInfo?.invoice.amountMsat
                      : paymentInfo?.addressInfo.amount
                  }
                />
                {/* <InvoiceInfo
                  isLightningPayment={paymentInfo.type === 'bolt11'}
                  paymentInfo={paymentInfo}
                  btcAdress={btcAdress}
                /> */}
                <SendTransactionFeeInfo
                  canUseLightning={canUseLightning}
                  canUseLiquid={canUseLiquid}
                  isLightningPayment={paymentInfo.type === 'bolt11'}
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
                isLightningPayment={paymentInfo.type === 'bolt11'}
                sendingAmount={sendingAmount}
                paymentInfo={paymentInfo}
                // fees={fees}
                // boltzSwapInfo={boltzSwapInfo}
              />

              {!isAmountFocused && (
                <SwipeButton
                  containerStyles={{
                    opacity: isCalculatingFees
                      ? 0.2
                      : canSendPayment
                      ? paymentInfo.type === 'bolt11' ||
                        paymentInfo?.type === InputTypeVariant.LN_URL_PAY
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
                    borderColor: textColor,
                    ...CENTER,
                  }}
                  titleStyles={{fontWeight: '500', fontSize: SIZES.large}}
                  swipeSuccessThreshold={100}
                  onSwipeSuccess={async () => {
                    // LIST OF PAYMENTS TO COMPLETE
                    // LN -> LIQUID: payments fail -> but might be boltz issue becuase aqua payments also did't work
                    // LN -> LN: completed
                    // Liquid -> LIQUID: Completed
                    // Liquid -> ln: completed
                    if (isCalculatingFees) return;
                    if (!canSendPayment) return;

                    if (canUseEcash) {
                      setIsSendingPayment(true);
                      const sendingInvoice = await getLNAddressForLiquidPayment(
                        paymentInfo,
                        convertedSendAmount,
                      );

                      const didSendEcashPayment = await sendEcashPayment(
                        sendingInvoice,
                      );
                      if (
                        didSendEcashPayment.proofsToUse &&
                        didSendEcashPayment.quote
                      ) {
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

                    if (
                      paymentInfo.type === 'bolt11' ||
                      paymentInfo.type === InputTypeVariant.LN_URL_PAY
                    ) {
                      if (canUseLightning) {
                        setIsSendingPayment(true);
                        sendLightningPayment_sendPaymentScreen({
                          sendingAmount: convertedSendAmount,
                          paymentInfo,
                          navigate,
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
                        convertedSendAmount > minMaxLiquidSwapAmounts.min
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
