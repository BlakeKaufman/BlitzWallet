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

import {useEffect, useRef, useState} from 'react';
import {InputTypeVariant} from '@breeztech/react-native-breez-sdk';
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
  } = useGlobalContextProvider();
  const {webViewRef, setWebViewArgs} = useWebView();
  console.log('CONFIRM SEND PAYMENT SCREEN');
  const navigate = useNavigation();
  const [isAmountFocused, setIsAmountFocused] = useState(false);

  const [paymentInfo, setPaymentInfo] = useState({});
  const [sendingAmount, setSendingAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingPayment, setIsSendingPayment] = useState(false);
  const [hasError, setHasError] = useState('');

  // const {keyboardHeight} = getKeyboardHeight();
  // const isShwoing = keyboardHeight != 0;
  // Reqiured information to load before content is shown
  const [isLightningPayment, setIsLightningPayment] = useState(null);
  const [fees, setFees] = useState({
    liquidFees: 0,
    boltzFee: 0,
  });
  const [boltzSwapInfo, setBoltzSwapInfo] = useState({});
  // Reqiured information to load before content is shown
  const totalSwapFees =
    boltzSwapInfo?.minimal + fees.liquidFees + fees.boltzFee;

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

  const convertedSendAmount = isBTCdenominated
    ? sendingAmount / 1000
    : initialSendingAmount
    ? sendingAmount / 1000
    : Math.round(
        (SATSPERBITCOIN / nodeInformation?.fiatStats?.value) *
          (sendingAmount / 1000),
      );

  const isUsingBank =
    masterInfoObject.liquidWalletSettings.regulatedChannelOpenSize &&
    nodeInformation.userBalance * 1000 - 5000 < sendingAmount &&
    liquidNodeInformation.userBalance * 1000 - 5000 > sendingAmount;

  const canUseLiquid = isLightningPayment
    ? liquidNodeInformation.userBalance - 50 >
      convertedSendAmount + totalSwapFees
    : //   &&
      // convertedSendAmount + 100 > boltzSwapInfo?.minimal
      convertedSendAmount <
      liquidNodeInformation.userBalance - 50 - fees.liquidFees;

  const canUseLightning = isLightningPayment
    ? nodeInformation.userBalance - 50 > convertedSendAmount
    : nodeInformation.userBalance - 50 > convertedSendAmount + fees.boltzFee;

  const canSendPayment =
    (canUseLiquid || canUseLightning) && sendingAmount != 0;

  const isUsingLiquidWithZeroInvoice =
    !isLightningPayment &&
    paymentInfo.type != InputTypeVariant.LN_URL_PAY &&
    !paymentInfo.invoice?.amountMsat;

  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

  useEffect(() => {
    (async () => {
      const {liquidFees, boltzFee, boltzSwapInfo} =
        await getLiquidAndBoltzFees();
      setFees({
        liquidFees: liquidFees,
        boltzFee: boltzFee,
      });
      setBoltzSwapInfo(boltzSwapInfo);
    })();

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

  return (
    <GlobalThemeView>
      {/* <WebviewForBoltzSwaps
            navigate={navigate}
            webViewRef={webViewRef}
            page={'sendingPage'}
          /> */}

      {isLoading ||
      hasError ||
      isSendingPayment ||
      !fees.liquidFees ||
      !fees.boltzFee ? (
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
                <TouchableOpacity onPress={goBack}>
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
                  fees={fees}
                />
              </ScrollView>
              <TransactionWarningText
                isUsingLiquidWithZeroInvoice={isUsingLiquidWithZeroInvoice}
                canSendPayment={canSendPayment}
                canUseLightning={canUseLightning}
                canUseLiquid={canUseLiquid}
                isLightningPayment={isLightningPayment}
                sendingAmount={sendingAmount}
                fees={fees}
                boltzSwapInfo={boltzSwapInfo}
              />

              {!isAmountFocused && (
                <SwipeButton
                  containerStyles={{
                    opacity: canSendPayment
                      ? isLightningPayment
                        ? canUseLightning
                          ? 1
                          : convertedSendAmount > boltzSwapInfo.minimal &&
                            !isUsingLiquidWithZeroInvoice
                          ? 1
                          : 0.2
                        : canUseLiquid
                        ? convertedSendAmount > 1000
                          ? 1
                          : 0.2
                        : canUseLightning &&
                          convertedSendAmount >
                            boltzSwapInfo.minimal +
                              fees.boltzFee +
                              fees.liquidFees
                        ? 1
                        : 0.2
                      : 0.2,
                    width: '90%',
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
                        convertedSendAmount > boltzSwapInfo.minimal + 50 &&
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
                      if (canUseLiquid && convertedSendAmount > 1000) {
                        setIsSendingPayment(true);
                        sendLiquidPayment_sendPaymentScreen({
                          sendingAmount: convertedSendAmount,
                          paymentInfo,
                          navigate,
                        });
                      } else if (
                        canUseLightning &&
                        convertedSendAmount >
                          boltzSwapInfo.minimal +
                            fees.boltzFee +
                            fees.liquidFees
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
                  frompage={'sendingPage'}
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
