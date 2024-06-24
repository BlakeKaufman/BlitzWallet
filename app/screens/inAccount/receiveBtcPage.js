import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';

import {
  CENTER,
  FONT,
  COLORS,
  SIZES,
  ICONS,
  SHADOWS,
  SATSPERBITCOIN,
} from '../../constants';
import {useEffect, useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';

import {formatBalanceAmount, numberConverter} from '../../functions';
import {useGlobalContextProvider} from '../../../context-store/context';
import QRCode from 'react-native-qrcode-svg';

import {
  generateBitcoinAddress,
  generateLightningAddress,
  generateLiquidAddress,
  generateUnifiedAddress,
} from '../../functions/receiveBitcoin/addressGeneration';
import {ButtonsContainer} from '../../components/admin/homeComponents/receiveBitcoin';
import {monitorSwap} from '../../functions/receiveBitcoin';

import {WebView} from 'react-native-webview';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ANDROIDSAFEAREA} from '../../constants/styles';

import {getBoltzWsUrl} from '../../functions/boltz/boltzEndpoitns';
import handleWebviewClaimMessage from '../../functions/boltz/handle-webview-claim-message';
import handleReverseClaimWSS from '../../functions/boltz/handle-reverse-claim-wss';
import WebviewForBoltzSwaps from '../../functions/boltz/webview';
import getLiquidAndBoltzFees from '../../components/admin/homeComponents/sendBitcoin/functions/getFees';
import {calculateBoltzFee} from '../../functions/boltz/calculateBoltzFee';
const webviewHTML = require('boltz-swap-web-context');

export function ReceivePaymentHome() {
  const navigate = useNavigation();
  const {
    theme,
    nodeInformation,
    masterInfoObject,
    toggleMasterInfoObject,
    contactsPrivateKey,
  } = useGlobalContextProvider();
  const webViewRef = useRef(null);
  const insets = useSafeAreaInsets();

  const [sendingAmount, setSendingAmount] = useState(1);
  const [generatingInvoiceQRCode, setGeneratingInvoiceQRCode] = useState(true);

  const [generatedAddress, setGeneratedAddress] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');
  const [selectedRecieveOption, setSelectedRecieveOption] =
    useState('lightning');

  const [isReceivingSwap, setIsReceivingSwap] = useState(false);

  const [minMaxSwapAmount, setMinMaxSwapAmount] = useState({
    min: 0,
    max: 0,
  });
  const [inProgressSwapInfo, setInProgressSwapInfo] = useState({});
  const [errorMessageText, setErrorMessageText] = useState({
    type: null,
    text: '',
  });
  const [prevSelectedReceiveOption, setPrevSelectedReceiveOption] =
    useState('');

  useEffect(() => {
    let lookForBTCSwap;
    (async () => {
      let clearPreviousRequest = false;

      if (prevSelectedReceiveOption != selectedRecieveOption) {
        console.log('IS RUNNING');
        setErrorMessageText('');
        setSendingAmount(1);
        setPaymentDescription('');
        setInProgressSwapInfo({});
        setMinMaxSwapAmount({});
        setGeneratedAddress('');
      } else {
        setErrorMessageText('');
      }
      setPrevSelectedReceiveOption(selectedRecieveOption);

      console.log(selectedRecieveOption, 'TESTING IN FUNCTION');

      const response =
        selectedRecieveOption.toLowerCase() === 'lightning'
          ? await generateLightningAddress(
              nodeInformation,
              masterInfoObject.userBalanceDenomination,
              sendingAmount,
              paymentDescription,
              setGeneratingInvoiceQRCode,
              masterInfoObject,
              setSendingAmount,
            )
          : selectedRecieveOption.toLowerCase() === 'bitcoin'
          ? await generateBitcoinAddress(
              nodeInformation,
              masterInfoObject.userBalanceDenomination,
              sendingAmount,
              paymentDescription,
              setGeneratingInvoiceQRCode,
            )
          : selectedRecieveOption.toLowerCase() === 'liquid'
          ? await generateLiquidAddress(
              nodeInformation,
              masterInfoObject.userBalanceDenomination,
              sendingAmount,
              paymentDescription,
              setGeneratingInvoiceQRCode,
              setSendingAmount,
              masterInfoObject,
            )
          : await generateUnifiedAddress(
              nodeInformation,
              masterInfoObject.userBalanceDenomination,
              sendingAmount,
              paymentDescription,
              setGeneratingInvoiceQRCode,
            );

      if (clearPreviousRequest || !response) return;

      // console.log(response.data, 'TESTING');

      setErrorMessageText({
        text: 'Error Generating Address',
        type: 'stop',
      });

      if (response.errorMessage.type === 'stop') {
        setErrorMessageText(response.errorMessage);
        return;
      } else if (response.errorMessage.type === 'warning') {
        if (
          response.errorMessage.text.includes('bank') &&
          selectedRecieveOption != 'liquid'
        ) {
          const [boltzFees, _] = await calculateBoltzFee(
            sendingAmount,
            'ln-liquid',
          );
          const {liquidFees} = await getLiquidAndBoltzFees();

          setErrorMessageText({
            type: 'warning',
            text: `${
              response.errorMessage.text
            }, swap fee of ${formatBalanceAmount(
              numberConverter(
                liquidFees + boltzFees,
                masterInfoObject.userBalanceDenomination,
                nodeInformation,
                masterInfoObject.userBalanceDenomination != 'fiat' ? 0 : 2,
              ),
            )} ${
              masterInfoObject.userBalanceDenomination != 'fiat'
                ? 'sats'
                : nodeInformation.fiatStats.coin
            }`,
          });
        } else setErrorMessageText(response.errorMessage);
      }
      if (response?.swapInfo) {
        if (response.swapInfo.minMax)
          setMinMaxSwapAmount(response.swapInfo.minMax);
        if (response.swapInfo.pairSwapInfo)
          setInProgressSwapInfo(response.swapInfo.pairSwapInfo);
      }

      // if (response.data) {
      //   setLNtoLiquidSwapInfo(response.data);

      // }

      if (!response.errorMessage.text.includes('bank')) {
        console.log('RUNNING IN FUNCTION');
        setGeneratedAddress(response.receiveAddress);
      }

      console.log(response.data, 'PUITSIDE FUND');

      if (
        selectedRecieveOption === 'Bitcoin' ||
        selectedRecieveOption === 'Unified QR'
      ) {
        lookForBTCSwap = setInterval(async () => {
          console.log('a');
          const swapinfo = await monitorSwap();
          if (!swapinfo) return;

          setInProgressSwapInfo(swapinfo);
        }, 5000);
      }

      if (selectedRecieveOption === 'Bitcoin' || !response.data) return;
      if (selectedRecieveOption === 'liquid' && !response.data) return;
      if (
        selectedRecieveOption === 'lightning' &&
        !response.data.liquidAddress &&
        !response.data.initSwapInfo &&
        !response.data.preimage &&
        !response.data.keys?.privateKey?.toString('hex')
      )
        return;

      const webSocket = new WebSocket(
        `${getBoltzWsUrl(process.env.BOLTZ_ENVIRONMENT)}`,
      );
      console.log('CRETE WSS CONNECTION');
      const didHandle = await handleReverseClaimWSS({
        ref: webViewRef,
        webSocket,
        liquidAddress: response.data.liquidAddress,
        swapInfo: response.data.initSwapInfo,
        preimage: response.data.preimage,
        privateKey: response.data.keys.privateKey.toString('hex'),
        isReceivingSwapFunc: setIsReceivingSwap,
      });

      console.log(didHandle, 'DID CERAET WSS CONNECTION');

      didHandle && setGeneratedAddress(response.receiveAddress);
    })();
    return () => {
      try {
        clearInterval(lookForBTCSwap);
        clearPreviousRequest = true;
      } catch (err) {
        clearPreviousRequest = true;
        console.log(err);
      }
    };
  }, [sendingAmount, paymentDescription, selectedRecieveOption]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        backgroundColor: theme
          ? COLORS.darkModeBackground
          : COLORS.lightModeBackground,
        paddingTop: insets.top === 0 ? ANDROIDSAFEAREA : 0,
        paddingBottom: insets.bottom === 0 ? ANDROIDSAFEAREA : 0,
      }}>
      {/* This webview is used to call WASM code in browser as WASM code cannot be called in react-native */}
      <WebviewForBoltzSwaps
        navigate={navigate}
        webViewRef={webViewRef}
        page={'receivePage'}
      />
      <SafeAreaView style={{flex: 1, alignItems: 'center', width: '95%'}}>
        {!isReceivingSwap && (
          <TouchableOpacity
            style={{marginRight: 'auto'}}
            activeOpacity={0.6}
            onPress={clear}>
            <Image
              source={ICONS.smallArrowLeft}
              style={{width: 30, height: 30}}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}

        <Text
          style={[
            styles.title,
            {
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
            },
          ]}>
          {selectedRecieveOption}
        </Text>

        <View
          style={[
            styles.qrCodeContainer,
            {
              backgroundColor: theme
                ? COLORS.darkModeBackgroundOffset
                : COLORS.lightModeBackgroundOffset,
              paddingVertical: errorMessageText.text ? 10 : 0,
            },
          ]}>
          {generatingInvoiceQRCode || !generatedAddress || isReceivingSwap ? (
            <>
              <ActivityIndicator
                size="large"
                color={theme ? COLORS.darkModeText : COLORS.lightModeText}
              />
              {errorMessageText.type === 'stop' ||
                (isReceivingSwap && (
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.errorText,
                      {
                        color: theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                        fontSize: isReceivingSwap ? SIZES.large : SIZES.small,
                      },
                    ]}>
                    {isReceivingSwap
                      ? 'Confirming swap'
                      : errorMessageText.text
                      ? errorMessageText.text
                      : ''}
                  </Text>
                ))}
            </>
          ) : (
            <>
              <QRCode
                size={250}
                quietZone={15}
                value={
                  generatedAddress ? generatedAddress : 'Genrating QR Code'
                }
                color={theme ? COLORS.lightModeText : COLORS.darkModeText}
                backgroundColor={
                  theme ? COLORS.darkModeText : COLORS.lightModeText
                }
              />
              {errorMessageText.type === 'warning' && (
                <Text
                  style={[
                    styles.errorText,
                    {
                      marginBottom: 0,
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    },
                  ]}>
                  {errorMessageText.text ? errorMessageText.text : ''}
                </Text>
              )}
            </>
          )}
        </View>
        <Text
          style={[
            styles.amountText,
            {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
          ]}>{`${formatBalanceAmount(sendingAmount)} ${
          masterInfoObject.userBalanceDenomination === 'sats' ||
          masterInfoObject.userBalanceDenomination === 'hidden'
            ? 'sats'
            : nodeInformation.fiatStats.coin
        }`}</Text>

        {!isReceivingSwap && (
          <ButtonsContainer
            generatingInvoiceQRCode={generatingInvoiceQRCode}
            generatedAddress={generatedAddress}
            setSendingAmount={setSendingAmount}
            setPaymentDescription={setPaymentDescription}
            setSelectedRecieveOption={setSelectedRecieveOption}
          />
        )}

        <View style={{marginBottom: 'auto'}}></View>

        {selectedRecieveOption.toLowerCase() != 'lightning' &&
          Object.keys(minMaxSwapAmount).length != 0 && (
            <>
              <Text
                style={[
                  styles.title,
                  {
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    marginTop: 0,
                    marginBottom: 0,
                  },
                ]}>
                {generatingInvoiceQRCode
                  ? ' '
                  : `Min/Max receive via ${
                      selectedRecieveOption.toLowerCase() === 'liquid'
                        ? 'liquid'
                        : 'onchain'
                    }:`}
              </Text>
              <Text
                style={[
                  styles.title,
                  {
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    marginTop: 0,
                    marginBottom: 'auto',
                  },
                ]}>
                {generatingInvoiceQRCode
                  ? ' '
                  : ` ${
                      masterInfoObject.userBalanceDenomination != 'fiat'
                        ? formatBalanceAmount(minMaxSwapAmount.min)
                        : Math.ceil(
                            minMaxSwapAmount.min *
                              (nodeInformation.fiatStats.value /
                                SATSPERBITCOIN),
                          )
                    } - ${
                      masterInfoObject.userBalanceDenomination != 'fiat'
                        ? formatBalanceAmount(minMaxSwapAmount.max)
                        : Math.ceil(
                            minMaxSwapAmount.max *
                              (nodeInformation.fiatStats.value /
                                SATSPERBITCOIN),
                          )
                    } ${
                      masterInfoObject.userBalanceDenomination != 'fiat'
                        ? 'sats'
                        : nodeInformation.fiatStats.coin
                    }`}
              </Text>
            </>
          )}
        {(selectedRecieveOption.toLowerCase() === 'bitcoin' ||
          selectedRecieveOption.toLowerCase() === 'unified qr') &&
          Object.keys(inProgressSwapInfo).length != 0 && (
            <TouchableOpacity
              onPress={() => {
                navigate.navigate('viewInProgressSwap', {
                  inProgressSwapInfo: inProgressSwapInfo,
                  type: 'bitcoin',
                });
              }}
              style={[
                styles.secondaryButton,
                {
                  borderColor: theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                },
              ]}>
              <Text
                style={[
                  styles.secondaryButtonText,
                  {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                ]}>
                View swap info
              </Text>
            </TouchableOpacity>
          )}
      </SafeAreaView>
    </View>
  );

  function clear() {
    setSendingAmount(1);
    setPaymentDescription('');
    setGeneratedAddress('');
    navigate.goBack();
  }

  // function getClaimSubmarineSwapJS({invoiceAddress, swapInfo, privateKey}) {
  //   const args = JSON.stringify({
  //     apiUrl: getBoltzApiUrl(process.env.BOLTZ_ENVIRONMENT),
  //     network: process.env.BOLTZ_ENVIRONMENT,
  //     invoice: invoiceAddress,
  //     swapInfo,
  //     privateKey,
  //   });

  //   webViewRef.current.injectJavaScript(
  //     `window.claimSubmarineSwap(${args}); void(0);`,
  //   );
  // }
}

const styles = StyleSheet.create({
  title: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
    marginBottom: 10,
    marginTop: 'auto',
  },
  qrCodeContainer: {
    width: 275,
    height: 'auto',
    minHeight: 275,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.large,
    marginTop: 10,
  },
  errorText: {
    width: '90%',
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.small,
    color: COLORS.cancelRed,
    textAlign: 'center',
    marginTop: 20,
  },

  secondaryButton: {
    width: 'auto',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    ...CENTER,
  },
  secondaryButtonText: {
    fontFamily: FONT.Other_Regular,
    fontSize: SIZES.medium,
  },
});
