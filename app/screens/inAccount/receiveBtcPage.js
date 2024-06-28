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

import {
  copyToClipboard,
  formatBalanceAmount,
  getLocalStorageItem,
  numberConverter,
} from '../../functions';
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
import {useWebView} from '../../../context-store/webViewContext';
import {getSideSwapApiUrl} from '../../functions/sideSwap/sideSwapEndpoitns';
import {removeLocalStorageItem} from '../../functions/localStorage';
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
  const {webViewRef, setWebViewArgs} = useWebView();

  // const webViewRef = useRef(null);
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

  const sideSwapWebSocketRef = useRef(null);

  const [inProgressSwapInfo, setInProgressSwapInfo] = useState({});
  const [errorMessageText, setErrorMessageText] = useState({
    type: null,
    text: '',
  });
  const [prevSelectedReceiveOption, setPrevSelectedReceiveOption] =
    useState('');

  useEffect(() => {
    // let lookForBTCSwap;

    (async () => {
      let clearPreviousRequest = false;

      if (prevSelectedReceiveOption != selectedRecieveOption) {
        console.log('IS RUNNING');
        setErrorMessageText('');
        setSendingAmount(1);
        setIsReceivingSwap(false);
        setPaymentDescription('');
        setInProgressSwapInfo({});
        setMinMaxSwapAmount({
          min: 0,
          max: 0,
        });
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

          const txSize = (148 + 3 * 34 + 10.5) / 100;

          setErrorMessageText({
            type: 'warning',
            text: `${
              response.errorMessage.text
            }, swap fee of ${formatBalanceAmount(
              numberConverter(
                (txSize * process.env.BOLTZ_ENVIRONMENT === 'liquid'
                  ? 0.01
                  : 0.11) + boltzFees,
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

      if (selectedRecieveOption === 'Bitcoin') {
        sideSwapWebSocketRef.current = new WebSocket(
          `${getSideSwapApiUrl(process.env.BOLTZ_ENVIRONMENT)}`,
        );

        // const sideSwapWebSocket = new WebSocket(
        //   `${getSideSwapApiUrl(process.env.BOLTZ_ENVIRONMENT)}`,
        // );

        sideSwapWebSocketRef.current.onopen = () => {
          console.log('did un websocket open');
          if (sideSwapWebSocketRef.current.readyState != WebSocket.OPEN) return;

          sideSwapWebSocketRef.current.send(
            JSON.stringify({
              id: 1,
              method: 'peg_status',
              params: {
                peg_in: true,
                order_id: response.swapPegInfo.order_id,
              },
            }),
          );
          sideSwapWebSocketRef.current.send(
            JSON.stringify({
              id: 1,
              method: 'server_status',
              params: null,
            }),
          );
        };

        sideSwapWebSocketRef.current.onmessage = rawMsg => {
          const msg = JSON.parse(rawMsg.data);
          console.log(msg);
          if (msg.method === 'server_status') {
            setMinMaxSwapAmount({
              min: msg.result.min_peg_in_amount,
              max: 0,
            });
          } else if (msg.method === 'peg_status') {
            if (msg.result.list.length > 0) {
              const isConfirming = msg.result.list.filter(
                item => item.tx_state_code === 3 || item.tx_state_code === 2,
              );
              if (isConfirming.length > 0) {
                console.log(isConfirming);
                setInProgressSwapInfo(isConfirming[0]);
                setIsReceivingSwap(true);
              } else if (
                (msg.result.list.filter(
                  item => item.tx_state_code === 4,
                ).length = 1)
              ) {
                navigate.navigate('HomeAdmin');
                navigate.navigate('ConfirmTxPage', {
                  for: 'paymentSuceed',
                  information: {},
                });
              }
            }
          }
        };

        return;
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
      setWebViewArgs({navigate: navigate, page: 'receivePage'});
      // webViewRef.current.injectJavaScript('alert("Hello from HomeScreen");');

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
        if (sideSwapWebSocketRef.current) {
          sideSwapWebSocketRef.current.close();
        }
        // clearInterval(lookForBTCSwap);
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
      {/* <WebviewForBoltzSwaps
        navigate={navigate}
        webViewRef={webViewRef}
        page={'receivePage'}
      /> */}
      <SafeAreaView style={{flex: 1, alignItems: 'center', width: '95%'}}>
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
              {(errorMessageText.type === 'stop' || isReceivingSwap) && (
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.errorText,
                    {
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                      fontSize: isReceivingSwap ? SIZES.large : SIZES.small,
                    },
                  ]}>
                  {isReceivingSwap
                    ? 'Confirming swap'
                    : errorMessageText.text
                    ? errorMessageText.text
                    : ''}
                </Text>
              )}
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

        {selectedRecieveOption.toLowerCase() != 'bitcoin' && (
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
        )}

        {(!isReceivingSwap ||
          selectedRecieveOption.toLowerCase() != 'lightning') && (
          <ButtonsContainer
            generatingInvoiceQRCode={generatingInvoiceQRCode}
            generatedAddress={generatedAddress}
            setSendingAmount={setSendingAmount}
            setPaymentDescription={setPaymentDescription}
            setSelectedRecieveOption={setSelectedRecieveOption}
          />
        )}

        <View style={{marginBottom: 'auto'}}></View>

        {(minMaxSwapAmount.min != 0 || minMaxSwapAmount.max != 0) && (
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
              {generatingInvoiceQRCode ? ' ' : `Min/Max receive to bank:`}
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
                : `${
                    masterInfoObject.userBalanceDenomination != 'fiat'
                      ? formatBalanceAmount(minMaxSwapAmount.min)
                      : Math.ceil(
                          minMaxSwapAmount.min *
                            (nodeInformation.fiatStats.value / SATSPERBITCOIN),
                        )
                  }${minMaxSwapAmount.max != 0 ? ' - ' : ''}${
                    minMaxSwapAmount.max != 0
                      ? masterInfoObject.userBalanceDenomination != 'fiat'
                        ? formatBalanceAmount(minMaxSwapAmount.max)
                        : Math.ceil(
                            minMaxSwapAmount.max *
                              (nodeInformation.fiatStats.value /
                                SATSPERBITCOIN),
                          )
                      : ''
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
          isReceivingSwap && (
            <TouchableOpacity
              onPress={() => {
                copyToClipboard(
                  inProgressSwapInfo?.tx_hash || 'No Txhash',
                  navigate,
                );
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
                Copy transaction id
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
