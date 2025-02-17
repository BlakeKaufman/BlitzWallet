import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Keyboard,
} from 'react-native';
import {
  CENTER,
  COLORS,
  ICONS,
  LIQUID_DEFAULT_FEE,
  QUICK_PAY_STORAGE_KEY,
  SATSPERBITCOIN,
  SIZES,
} from '../../../../constants';
import {useCallback, useEffect, useState} from 'react';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import SwipeButton from 'rn-swipe-button';
import SendTransactionFeeInfo from './components/feeInfo';
import decodeSendAddress from './functions/decodeSendAdress';

import {useNavigation} from '@react-navigation/native';
import {
  getLNAddressForLiquidPayment,
  sendBitcoinPayment,
  sendLightningPayment_sendPaymentScreen,
  sendLiquidPayment_sendPaymentScreen,
  sendToLNFromLiquid_sendPaymentScreen,
  sendToLiquidFromLightning_sendPaymentScreen,
} from './functions/payments';
import {useWebView} from '../../../../../context-store/webViewContext';
import handleBackPress from '../../../../hooks/handleBackPress';

import {
  DUST_LIMIT_FOR_LBTC_CHAIN_PAYMENTS,
  LIGHTNINGAMOUNTBUFFER,
} from '../../../../constants/math';
import {useGlobaleCash} from '../../../../../context-store/eCash';
import GetThemeColors from '../../../../hooks/themeColors';
import ThemeImage from '../../../../functions/CustomElements/themeImage';
import {calculateBoltzFeeNew} from '../../../../functions/boltz/boltzFeeNew';

import NavbarBalance from './components/navBarBalance';
import Icon from '../../../../functions/CustomElements/Icon';
import {formatBalanceAmount} from '../../../../functions';
import FormattedSatText from '../../../../functions/CustomElements/satTextDisplay';
import CustomSearchInput from '../../../../functions/CustomElements/searchInput';
import FullLoadingScreen from '../../../../functions/CustomElements/loadingScreen';
import AcceptButtonSendPage from './components/acceptButton';
import NumberInputSendPage from './components/numberInput';
import usablePaymentNetwork from './functions/usablePaymentNetworks';
import SendMaxComponent from './components/sendMaxComponent';
import FormattedBalanceInput from '../../../../functions/CustomElements/formattedBalanceInput';
import {useGlobalThemeContext} from '../../../../../context-store/theme';

export default function SendPaymentScreen(props) {
  const {
    btcAdress,
    fromPage,
    publishMessageFunc,
    comingFromAccept,
    enteredPaymentInfo,
  } = props.route.params;
  const {
    nodeInformation,
    masterInfoObject,
    liquidNodeInformation,
    toggleMasterInfoObject,
    contactsPrivateKey,
    minMaxLiquidSwapAmounts,
  } = useGlobalContextProvider();
  const {theme, darkModeType} = useGlobalThemeContext();
  const {
    setEcashPaymentInformation,
    seteCashNavigate,
    eCashBalance,
    sendEcashPayment,
  } = useGlobaleCash();
  const {webViewRef, setWebViewArgs, toggleSavedIds} = useWebView();
  console.log('CONFIRM SEND PAYMENT SCREEN');
  const navigate = useNavigation();
  const [isAmountFocused, setIsAmountFocused] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState({});
  const sendingAmount = paymentInfo?.sendAmount;
  //Combine these two add sending amount to payment info
  const [isSendingPayment, setIsSendingPayment] = useState(false);
  const liquidTxFee = LIQUID_DEFAULT_FEE;
  const isCalculatingFees = false;
  const [paymentDescription, setPaymentDescription] = useState('');
  const {textColor, backgroundOffset, backgroundColor} = GetThemeColors();

  const isBTCdenominated =
    masterInfoObject.userBalanceDenomination === 'hidden' ||
    masterInfoObject.userBalanceDenomination === 'sats';

  const canEditPaymentAmount = paymentInfo?.canEditPayment;

  const convertedSendAmount = isBTCdenominated
    ? Math.round(Number(sendingAmount))
    : Math.round(
        (SATSPERBITCOIN / nodeInformation.fiatStats?.value) *
          Number(sendingAmount),
      );

  const swapFee = calculateBoltzFeeNew(
    Number(convertedSendAmount),
    paymentInfo.type === 'liquid' ? 'ln-liquid' : 'liquid-ln',
    minMaxLiquidSwapAmounts[
      paymentInfo.type === 'liquid' ? 'reverseSwapStats' : 'submarineSwapStats'
    ],
  );

  console.log(convertedSendAmount, 'CONVETTED SEND AMOUNT');

  const isLightningPayment = paymentInfo?.paymentNetwork === 'lightning';
  const isLiquidPayment = paymentInfo?.paymentNetwork === 'liquid';
  const isBitcoinPayment = paymentInfo?.paymentNetwork === 'Bitcoin';

  const {canUseEcash, canUseLiquid, canUseLightning} = usablePaymentNetwork({
    liquidNodeInformation,
    nodeInformation,
    eCashBalance,
    masterInfoObject,
    convertedSendAmount,
    liquidTxFee,
    swapFee,
    minMaxLiquidSwapAmounts,
    isLiquidPayment,
    isLightningPayment,
    paymentInfo,
    lightningFee,
    isBitcoinPayment,
  });
  const lightningFee = canUseEcash
    ? 5
    : masterInfoObject.useTrampoline
    ? Math.round(convertedSendAmount * 0.005) + 4
    : null;

  console.log(lightningFee);
  const isReverseSwap =
    canUseLightning &&
    (!canUseLiquid || !canUseEcash) &&
    paymentInfo?.paymentNetwork === 'liquid';
  const isSubmarineSwap =
    canUseLiquid &&
    (!canUseLightning || !canUseEcash) &&
    paymentInfo?.paymentNetwork === 'lightning';
  const isSendingSwap = isReverseSwap || isSubmarineSwap;

  const canSendPayment =
    (canUseLiquid || canUseLightning) && sendingAmount != 0;

  const isUsingSwapWithZeroInvoice =
    canUseLiquid &&
    paymentInfo?.paymentNetwork === 'lightning' &&
    paymentInfo.type === 'bolt11' &&
    !paymentInfo?.data?.invoice.amountMsat;

  // paymentInfo.type === 'bolt11' &&
  // paymentInfo.type != InputTypeVariant.LN_URL_PAY &&
  // !paymentInfo.invoice?.amountMsat;

  const handleBackPressFunction = useCallback(() => {
    goBackFunction();
    return true;
  }, []);

  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, [handleBackPressFunction]);

  useEffect(() => {
    async function decodePayment() {
      await decodeSendAddress({
        nodeInformation,
        btcAdress,
        goBackFunction: errorMessageNavigation,
        // setIsLightningPayment,
        // setSendingAmount,
        setPaymentInfo,
        // setIsLoading,
        liquidNodeInformation,
        masterInfoObject,
        setWebViewArgs,
        webViewRef,
        navigate,
        maxZeroConf:
          minMaxLiquidSwapAmounts?.submarineSwapStats?.limits?.maximalZeroConf,
        comingFromAccept,
        enteredPaymentInfo,
      });
    }
    setTimeout(decodePayment, 150);
  }, []);

  useEffect(() => {
    console.log(
      !Object.keys(paymentInfo).length,
      '|',
      !masterInfoObject[QUICK_PAY_STORAGE_KEY].isFastPayEnabled,
      '|',
      !canSendPayment,
      '|',
      // paymentInfo.type === InputTypeVariant.LN_URL_PAY,
      // '|',
      !(
        masterInfoObject[QUICK_PAY_STORAGE_KEY].fastPayThresholdSats >=
        convertedSendAmount
      ),
      '|',
      // paymentInfo.type === 'liquid' && !paymentInfo.data.isBip21,
      'FAST PAY SETTINGS',
      masterInfoObject[QUICK_PAY_STORAGE_KEY].fastPayThresholdSats,
      convertedSendAmount,
    );

    if (!Object.keys(paymentInfo).length) return;
    if (!masterInfoObject[QUICK_PAY_STORAGE_KEY].isFastPayEnabled) return;
    if (!canSendPayment) return;
    if (canEditPaymentAmount) return;
    // if (paymentInfo.type === InputTypeVariant.LN_URL_PAY) return;
    if (
      !(
        masterInfoObject[QUICK_PAY_STORAGE_KEY].fastPayThresholdSats >=
        convertedSendAmount
      )
    )
      return;
    // if (paymentInfo.type === 'liquid' && !paymentInfo.data.isBip21) return;

    setTimeout(() => {
      sendPayment();
    }, 150);
  }, [paymentInfo, canEditPaymentAmount]);

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

  console.log(
    'LOADNIG OPTIONS',
    !Object.keys(paymentInfo).length ||
      (!liquidTxFee &&
        !canEditPaymentAmount &&
        (isLiquidPayment || (isSendingSwap && canUseLiquid))),
    Object.keys(paymentInfo).length,
    liquidTxFee,
    canEditPaymentAmount,
    isLiquidPayment,
    isSendingSwap,
    canUseLiquid,
    paymentInfo,
  );
  if (
    !Object.keys(paymentInfo).length ||
    (!liquidTxFee &&
      !canEditPaymentAmount &&
      ((isLiquidPayment && canUseLiquid) || (isSendingSwap && canUseLiquid)))
  )
    return <FullLoadingScreen text={'Getting invoice information'} />;

  return (
    <GlobalThemeView useStandardWidth={true}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={{position: 'absolute', zIndex: 99, left: 0}}
            onPress={() => {
              goBackFunction();
              // if (fromPage === 'slideCamera') {
              //   navigate.replace('HomeAdmin');
              //   return true;
              // }
              // if (navigate.canGoBack()) goBackFunction();
              // else navigate.replace('HomeAdmin');
            }}>
            <ThemeImage
              lightModeIcon={ICONS.smallArrowLeft}
              darkModeIcon={ICONS.smallArrowLeft}
              lightsOutIcon={ICONS.arrow_small_left_white}
            />
          </TouchableOpacity>

          <NavbarBalance />
        </View>
        <ScrollView
          contentContainerStyle={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <TouchableOpacity
            activeOpacity={canEditPaymentAmount ? 0.2 : 1}
            onPress={() => {
              if (!canEditPaymentAmount) return;
              Keyboard.dismiss();
              setTimeout(() => {
                setIsAmountFocused(true);
              }, 200);
            }}
            style={[
              styles.textInputContainer,
              {
                alignItems: 'center',
                opacity: !paymentInfo.sendAmount ? 0.5 : 1,
              },
            ]}>
            <FormattedBalanceInput
              amountValue={paymentInfo?.sendAmount || 0}
              inputDenomination={masterInfoObject.userBalanceDenomination}
              activeOpacity={!paymentInfo.sendAmount ? 0.5 : 1}
            />

            <FormattedSatText
              containerStyles={{opacity: !sendingAmount ? 0.5 : 1}}
              neverHideBalance={true}
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

          {!canEditPaymentAmount && (
            <SendTransactionFeeInfo
              canUseLightning={canUseLightning}
              canUseLiquid={canUseLiquid}
              canUseEcash={canUseEcash}
              isLightningPayment={isLightningPayment}
              swapFee={swapFee}
              lightningFee={lightningFee}
              liquidTxFee={liquidTxFee}
              canSendPayment={canSendPayment}
              convertedSendAmount={convertedSendAmount}
              sendingAmount={sendingAmount}
              isSendingSwap={isSendingSwap}
              isReverseSwap={isReverseSwap}
              isSubmarineSwap={isSubmarineSwap}
              isLiquidPayment={isLiquidPayment}
              paymentInfo={paymentInfo}
            />
          )}
        </ScrollView>
        {canEditPaymentAmount && (
          <>
            <SendMaxComponent
              nodeInformation={nodeInformation}
              eCashBalance={eCashBalance}
              paymentInfo={paymentInfo}
              navigate={navigate}
              setPaymentInfo={setPaymentInfo}
              isLiquidPayment={isLiquidPayment}
              isLightningPayment={isLightningPayment}
              minMaxLiquidSwapAmounts={minMaxLiquidSwapAmounts}
              masterInfoObject={masterInfoObject}
              isBitcoinPayment={isBitcoinPayment}
              liquidNodeInformation={liquidNodeInformation}
            />

            <CustomSearchInput
              onFocusFunction={() => {
                setIsAmountFocused(false);
              }}
              onBlurFunction={() => {
                setTimeout(() => {
                  setIsAmountFocused(true);
                }, 150);
              }}
              placeholderText={'Description..'}
              setInputText={setPaymentDescription}
              inputText={paymentDescription}
              textInputMultiline={true}
              textAlignVertical={'center'}
              maxLength={paymentInfo?.data?.commentAllowed || 150}
              containerStyles={{
                width: '90%',
                marginBottom: Platform.OS === 'ios' ? 15 : 0,
              }}
            />
            {isAmountFocused && (
              <NumberInputSendPage
                paymentInfo={paymentInfo}
                setPaymentInfo={setPaymentInfo}
              />
            )}
            <AcceptButtonSendPage
              canSendPayment={canSendPayment}
              isCalculatingFees={isCalculatingFees}
              decodeSendAddress={decodeSendAddress}
              errorMessageNavigation={errorMessageNavigation}
              btcAdress={btcAdress}
              paymentInfo={paymentInfo}
              convertedSendAmount={convertedSendAmount}
              paymentDescription={paymentDescription}
              // setSendingAmount={setSendingAmount}
              setPaymentInfo={setPaymentInfo}
              isSendingSwap={isSendingSwap}
              canUseLightning={canUseLightning}
              canUseLiquid={canUseLiquid}
            />
          </>
        )}
        {!canEditPaymentAmount && (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              position: 'relative',
            }}>
            <SwipeButton
              containerStyles={{
                opacity: isCalculatingFees
                  ? 0.5
                  : isSendingPayment
                  ? 1
                  : canSendPayment
                  ? isBitcoinPayment
                    ? canUseLightning || canUseLiquid
                      ? 1
                      : 0.2
                    : isLightningPayment
                    ? canUseLightning
                      ? 1
                      : convertedSendAmount >= minMaxLiquidSwapAmounts.min &&
                        !isUsingSwapWithZeroInvoice
                      ? 1
                      : 0.2
                    : canUseLiquid
                    ? convertedSendAmount >= DUST_LIMIT_FOR_LBTC_CHAIN_PAYMENTS
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
              onSwipeSuccess={sendPayment}
              shouldResetAfterSuccess={false}
              railBackgroundColor={
                isSendingPayment
                  ? COLORS.darkModeText
                  : theme
                  ? backgroundOffset
                  : COLORS.primary
              }
              railBorderColor={
                theme ? backgroundOffset : COLORS.lightModeBackground
              }
              height={55}
              railStyles={{
                backgroundColor: COLORS.darkModeText,
                borderColor: COLORS.darkModeText,
              }}
              thumbIconBackgroundColor={COLORS.darkModeText}
              thumbIconBorderColor={COLORS.darkModeText}
              titleColor={COLORS.darkModeText}
              title={
                isCalculatingFees ? 'Calculating Fees' : 'Slide to confirm'
              }
            />
            {isSendingPayment && (
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  position: 'absolute',
                  zIndex: 1,
                }}>
                <ThemeText
                  styles={{
                    color: theme ? backgroundColor : COLORS.lightModeText,
                    fontWeight: '500',
                    fontSize: SIZES.large,
                    includeFontPadding: false,
                    marginRight: 10,
                  }}
                  content={'Sending payment'}
                />
                <FullLoadingScreen
                  containerStyles={{flex: 0}}
                  size="small"
                  loadingColor={theme ? backgroundColor : COLORS.lightModeText}
                  showText={false}
                />
              </View>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </GlobalThemeView>
  );

  async function sendPayment() {
    if (isCalculatingFees) return;
    if (!canSendPayment) return;
    if (isSendingPayment) return;
    setIsSendingPayment(true);

    if (paymentInfo.type === 'Bitcoin') {
      if (!(canUseLightning || canUseLiquid)) return;

      const from = canUseLiquid ? 'liquid' : 'lightning';
      const sendOnChainPayment = await sendBitcoinPayment({
        paymentInfo,
        sendingValue: convertedSendAmount,
        from,
      });

      if (!sendOnChainPayment.didWork) {
        navigate.reset({
          index: 0, // The top-level route index
          routes: [
            {
              name: 'HomeAdmin', // Navigate to HomeAdmin
              params: {
                screen: 'Home',
              },
            },
            {
              name: 'ConfirmTxPage',
              params: {
                for: 'paymentFailed',
                information: {
                  status: 'failed',
                  feeSat: 0,
                  amountSat: 0,
                  details: {error: sendOnChainPayment.error},
                },
                formattingType: 'liquidNode', //chose for more control, this is actualy a lighting payment
              },
            },
          ],
        });
      } else {
        navigate.reset({
          index: 0,
          routes: [
            {
              name: 'HomeAdmin',
              params: {
                screen: 'Home',
              },
            },
            {
              name: 'ConfirmTxPage',
              params: {
                for: 'paymentSucceed',
                information: {
                  details: {type: 'Bitcoin'},
                  status: 'pending',
                  feesSat: sendOnChainPayment.fees,
                  amountSat: sendOnChainPayment.amount,
                },
                formattingType: 'liquidNode', //chose for more control, this is actualy a lighting payment
              },
            },
          ],
        });
      }
      return;
    }

    if (canUseEcash) {
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

      const didSendEcashPayment = await sendEcashPayment(sendingInvoice);
      if (didSendEcashPayment.proofsToUse && didSendEcashPayment.quote) {
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
        navigate.reset({
          index: 0, // The top-level route index
          routes: [
            {
              name: 'HomeAdmin', // Navigate to HomeAdmin
              params: {
                screen: 'Home',
              },
            },
            {
              name: 'ConfirmTxPage',
              params: {
                for: 'paymentFailed',
                information: {
                  status: 'failed',
                  fee: 0,
                  amountSat: 0,
                  details: {
                    error: 'Not able to generate ecash quote or proofs',
                  },
                },
                formattingType: 'ecash',
              },
            },
          ],
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
        sendLightningPayment_sendPaymentScreen({
          sendingAmount: convertedSendAmount,
          paymentInfo,
          navigate,
          fromPage,
          publishMessageFunc,
          paymentDescription:
            paymentDescription || paymentInfo?.data.message || '',
        });
      } else if (
        convertedSendAmount >= minMaxLiquidSwapAmounts.min &&
        !isUsingSwapWithZeroInvoice &&
        convertedSendAmount <= minMaxLiquidSwapAmounts.max
      ) {
        sendToLNFromLiquid_sendPaymentScreen({
          paymentInfo,
          webViewRef,
          toggleMasterInfoObject,
          masterInfoObject,
          contactsPrivateKey,
          goBackFunction: errorMessageNavigation,
          navigate,
          sendingAmount: convertedSendAmount,
          fromPage,
          publishMessageFunc,
          toggleSavedIds,
          paymentDescription:
            paymentDescription || paymentInfo?.data.message || '',
        });
      } else {
        setIsSendingPayment(false);
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Cannot send payment.',
        });
      }
    } else {
      if (canUseLiquid) {
        sendLiquidPayment_sendPaymentScreen({
          sendingAmount: convertedSendAmount,
          paymentInfo,
          navigate,
          fromPage,
          publishMessageFunc,
          paymentDescription:
            paymentDescription || paymentInfo?.data.message || '',
        });
      } else if (
        nodeInformation.userBalance >
          convertedSendAmount + LIGHTNINGAMOUNTBUFFER + swapFee &&
        convertedSendAmount >= minMaxLiquidSwapAmounts.min &&
        convertedSendAmount <= minMaxLiquidSwapAmounts.max
      ) {
        sendToLiquidFromLightning_sendPaymentScreen({
          paymentInfo,
          sendingAmount: convertedSendAmount,
          navigate,
          webViewRef,
          fromPage,
          publishMessageFunc,
          paymentDescription:
            paymentDescription || paymentInfo?.data.message || '',
        });
      } else {
        setIsSendingPayment(false);
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Cannot send payment.',
        });
      }
    }
  }

  function goBackFunction() {
    navigate.goBack();
  }
  function errorMessageNavigation() {
    navigate.reset({
      index: 0,
      routes: [
        {
          name: 'HomeAdmin', // Navigate to HomeAdmin
          params: {
            screen: 'Home',
          },
        },
      ],
    });
  }
}

const styles = StyleSheet.create({
  paymentInfoContainer: {
    flex: 1,
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
  memoInput: {
    width: 'auto',
    maxWidth: '60%',
    includeFontPadding: false,
    fontSize: 50,
    padding: 0,
    pointerEvents: 'none',
  },
});
