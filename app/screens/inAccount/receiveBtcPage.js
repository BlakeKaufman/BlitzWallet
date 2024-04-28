import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
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
import * as Device from 'expo-device';

import {formatBalanceAmount} from '../../functions';
import {useGlobalContextProvider} from '../../../context-store/context';
import QRCode from 'react-native-qrcode-svg';
import EventSource from 'react-native-sse';

import {
  generateBitcoinAddress,
  generateLightningAddress,
  generateLiquidAddress,
  generateUnifiedAddress,
} from '../../functions/receiveBitcoin/addressGeneration';
import {ButtonsContainer} from '../../components/admin/homeComponents/receiveBitcoin';
import {monitorSwap} from '../../functions/receiveBitcoin';

import ecc from '@bitcoinerlab/secp256k1';
import ECPairFactory from 'ecpair';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
import axios from 'axios';
import createLNToLiquidSwap from '../../functions/boltz/LNtoLiquidSwap';

export const ECPair = ECPairFactory(ecc);
const webviewHTML = require('boltz-swap-web-context');

export function ReceivePaymentHome() {
  const navigate = useNavigation();
  const {theme, nodeInformation, masterInfoObject, toggleMasterInfoObject} =
    useGlobalContextProvider();
  const webViewRef = useRef();

  const [sendingAmount, setSendingAmount] = useState(1);
  const [generatingInvoiceQRCode, setGeneratingInvoiceQRCode] = useState(true);

  const [generatedAddress, setGeneratedAddress] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');
  const [selectedRecieveOption, setSelectedRecieveOption] =
    useState('lightning');
  const [lntoLiquidSwapInfo, setLNtoLiquidSwapInfo] = useState({});
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

  const handleClaimMessage = event => {
    if (selectedRecieveOption === 'liquid') return;
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.error) throw Error(data.error);
      console.log(data, 'DATA FROM WEBVIEW');

      (async () => {
        try {
          await axios.post(
            `${process.env.BOLTZ_API}/v2/chain/L-BTC/transaction`,
            {
              hex: data,
            },
          );
        } catch (err) {
          console.log(err);
        }
      })();
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    let clearPreviousRequest = false;
    let lookForBTCSwap;
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
    (async () => {
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

      console.log(response, 'TESTING');

      setErrorMessageText({
        text: 'Error Generating Address',
        type: 'stop',
      });

      if (response.errorMessage.type === 'stop') {
        setErrorMessageText(response.errorMessage);
        return;
      } else if (response.errorMessage.type === 'warning')
        setErrorMessageText(response.errorMessage);

      if (response?.swapInfo) {
        if (response.swapInfo.minMax)
          setMinMaxSwapAmount(response.swapInfo.minMax);
        if (response.swapInfo.pairSwapInfo)
          setInProgressSwapInfo(response.swapInfo.pairSwapInfo);
      }
      if (response.data) {
        setLNtoLiquidSwapInfo(response.data);
      }

      setGeneratedAddress(response.receiveAddress);
    })();

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

  console.log(process.env.BOLTZ_API);

  useEffect(() => {
    if (selectedRecieveOption === 'Bitcoin' || !inProgressSwapInfo.id) return;

    if (
      selectedRecieveOption === 'lightning' &&
      !lntoLiquidSwapInfo.liquidAddress &&
      !lntoLiquidSwapInfo.initSwapInfo &&
      !lntoLiquidSwapInfo.preimage &&
      !lntoLiquidSwapInfo.keys?.privateKey?.toString('hex')
    )
      return;

    if (selectedRecieveOption === 'liquid' && !inProgressSwapInfo.id) return;

    const webSocket = new WebSocket(
      `${process.env.BOLTZ_API.replace('https://', 'wss://')}/v2/ws`,
    );
    webSocket.onopen = () => {
      console.log('did un websocket open');
      webSocket.send(
        JSON.stringify({
          op: 'subscribe',
          channel: 'swap.update',
          args: [inProgressSwapInfo.id],
        }),
      );
    };

    webSocket.onmessage = async rawMsg => {
      const msg = JSON.parse(rawMsg.data);
      console.log(msg);

      if (selectedRecieveOption === 'lightning') {
        if (msg.args[0].status === 'transaction.mempool') {
          getClaimReverseSubmarineSwapJS({
            address: lntoLiquidSwapInfo.liquidAddress,
            swapInfo: lntoLiquidSwapInfo.initSwapInfo,
            preimage: lntoLiquidSwapInfo.preimage,
            privateKey: lntoLiquidSwapInfo.keys.privateKey.toString('hex'),
          });
        } else if (msg.args[0].status === 'invoice.settled') {
          webSocket.close();
          navigate.navigate('HomeAdmin');
          navigate.navigate('ConfirmTxPage', {
            for: 'paymentSucceed',
            information: {},
          });
        }
      } else if (selectedRecieveOption === 'Liquid') {
        if (msg.args[0].status === 'transaction.mempool') {
          if (selectedRecieveOption === 'Liquid') {
            let prevFailedSwaps = [...masterInfoObject.liquidSwaps];

            prevFailedSwaps.push(inProgressSwapInfo);

            toggleMasterInfoObject({liquidSwaps: prevFailedSwaps});
          }
        } else if (msg.args[0].status === 'transaction.claim.pending') {
          getClaimSubmarineSwapJS({
            invoiceAddress,
            swapInfo,
            privateKey,
          });
        } else if (msg.args[0].status === 'transaction.claimed') {
          webSocket.close();
          navigate.navigate('HomeAdmin');
          navigate.navigate('ConfirmTxPage', {
            for: 'paymentSucceed',
            information: {},
          });
        }
      }
    };

    // console.log(await zkpInit(), 'TTTTT');

    // if (msg.args[0].status === 'transaction.mempool') {
    // }

    // console.log('Got WebSocket update');
    // console.log(msg);
    // console.log();

    // const es = new EventSource(
    //   `https://api.boltz.exchange/streamswapstatus?id=${inProgressSwapInfo.id}`,
    // );

    // const eventSourceEventListener = async event => {
    //   console.log(event.data);
    //   if (event.data === '{"status":"transaction.mempool"}') {
    //     if (errorMessageText.text === 'Transaction seen') return;
    //     setErrorMessageText({type: 'stop', text: 'Transaction seen'});
    //     setGeneratedAddress(false);
    //   } else if (event.data === '{"status":"invoice.pending"}') {
    //     if (errorMessageText.text === 'Payment pending') return;
    //     setErrorMessageText({type: 'stop', text: 'Payment pending'});
    //     (async () => {
    //       let prevFailedSwaps = [...masterInfoObject.failedLiquidSwaps];

    //       prevFailedSwaps.push(inProgressSwapInfo);

    //       toggleMasterInfoObject({failedLiquidSwaps: prevFailedSwaps});
    //     })();
    //     setGeneratedAddress(false);
    //   }
    // };

    // es.addEventListener('message', eventSourceEventListener);

    return () => {
      // es.removeAllEventListeners();
      webSocket.close();
    };
  }, [selectedRecieveOption, inProgressSwapInfo, lntoLiquidSwapInfo]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        backgroundColor: theme
          ? COLORS.darkModeBackground
          : COLORS.lightModeBackground,
        paddingVertical: Device.osName === 'ios' ? 0 : 10,
      }}>
      {/* This webview is used to call WASM code in brosers as WASM code cannot be called in react-native */}
      <WebView
        ref={webViewRef}
        containerStyle={{position: 'absolute', top: 1000, left: 1000}}
        source={webviewHTML}
        originWhitelist={['*']}
        onMessage={handleClaimMessage}
      />
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
          {generatingInvoiceQRCode || !generatedAddress ? (
            <>
              <ActivityIndicator
                size="large"
                color={theme ? COLORS.darkModeText : COLORS.lightModeText}
              />
              {errorMessageText.type === 'stop' && (
                <Text
                  style={[
                    styles.errorText,
                    {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                  ]}>
                  {errorMessageText.text ? errorMessageText.text : ''}
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

        <ButtonsContainer
          generatingInvoiceQRCode={generatingInvoiceQRCode}
          generatedAddress={generatedAddress}
          setSendingAmount={setSendingAmount}
          setPaymentDescription={setPaymentDescription}
          setSelectedRecieveOption={setSelectedRecieveOption}
        />

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

  function getClaimReverseSubmarineSwapJS({
    address,
    swapInfo,
    preimage,
    privateKey,
  }) {
    const args = JSON.stringify({
      apiUrl: process.env.BOLTZ_API,
      network: 'testnet',
      address,
      feeRate: 1,
      swapInfo,
      privateKey,
      preimage,
    });

    console.log('SENDING CLAIM TO WEBVIEW', args);

    webViewRef.current.injectJavaScript(
      `window.claimReverseSubmarineSwap(${args}); void(0);`,
    );
  }
  function getClaimSubmarineSwapJS({invoiceAddress, swapInfo, privateKey}) {
    const args = JSON.stringify({
      apiUrl: process.env.BOLTZ_API,
      network: 'testnet',
      invoice: invoiceAddress,
      swapInfo,
      privateKey,
    });

    webViewRef.current.injectJavaScript(
      `window.claimSubmarineSwap(${args}); void(0);`,
    );
  }
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
