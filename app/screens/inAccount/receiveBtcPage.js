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
import RNEventSource from 'react-native-event-source';
import {formatBalanceAmount, getLocalStorageItem} from '../../functions';
import {useGlobalContextProvider} from '../../../context-store/context';
import QRCode from 'react-native-qrcode-svg';

import {
  generateBitcoinAddress,
  generateLightningAddress,
  generateLiquidAddress,
  generateUnifiedAddress,
} from '../../functions/receiveBitcoin/addressGeneration';
import {ButtonsContainer} from '../../components/admin/homeComponents/receiveBitcoinNew';
import {monitorSwap} from '../../functions/receiveBitcoin';

export function ReceivePaymentHome() {
  const navigate = useNavigation();
  const [generatedAddress, setGeneratedAddress] = useState('');
  const [sendingAmount, setSendingAmount] = useState(1);
  const [paymentDescription, setPaymentDescription] = useState('');
  const [selectedRecieveOption, setSelectedRecieveOption] =
    useState('Unified QR');

  const [generatingInvoiceQRCode, setGeneratingInvoiceQRCode] = useState(true);
  const {theme, nodeInformation, userBalanceDenomination} =
    useGlobalContextProvider();
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
    (async () => {
      console.log(prevSelectedReceiveOption != selectedRecieveOption);
      if (prevSelectedReceiveOption != selectedRecieveOption) {
        console.log('IS RUNNING');
        setErrorMessageText('');
        setSendingAmount(1);
        setPaymentDescription('');
        setInProgressSwapInfo({});
        setMinMaxSwapAmount({});
      }
      setPrevSelectedReceiveOption(selectedRecieveOption);
      setGeneratingInvoiceQRCode(true);
      setErrorMessageText('');
      const receiveAddress =
        selectedRecieveOption.toLowerCase() === 'lightning'
          ? await generateLightningAddress(
              nodeInformation,
              userBalanceDenomination,
              sendingAmount,
              paymentDescription,
              setGeneratingInvoiceQRCode,
              setErrorMessageText,
            )
          : selectedRecieveOption.toLowerCase() === 'bitcoin'
          ? await generateBitcoinAddress(
              nodeInformation,
              userBalanceDenomination,
              sendingAmount,
              paymentDescription,
              setGeneratingInvoiceQRCode,
              setMinMaxSwapAmount,
              setErrorMessageText,
            )
          : selectedRecieveOption.toLowerCase() === 'liquid'
          ? await generateLiquidAddress(
              nodeInformation,
              userBalanceDenomination,
              sendingAmount,
              paymentDescription,
              setGeneratingInvoiceQRCode,
              setMinMaxSwapAmount,
              setErrorMessageText,
              setSendingAmount,
              setInProgressSwapInfo,
            )
          : await generateUnifiedAddress(
              nodeInformation,
              userBalanceDenomination,
              sendingAmount,
              paymentDescription,
              setGeneratingInvoiceQRCode,
              setMinMaxSwapAmount,
              setErrorMessageText,
            );

      if (receiveAddress === 'in function error') return;

      if (!receiveAddress) {
        setErrorMessageText('Error generating address');
        return;
      }
      console.log(receiveAddress);
      setGeneratedAddress(receiveAddress);
    })();

    if (
      selectedRecieveOption != 'Bitcoin' &&
      selectedRecieveOption != 'Unified QR'
    )
      return;
    let lookForBTCSwap = setInterval(async () => {
      console.log('a');
      const swapinfo = await monitorSwap();
      if (!swapinfo) return;

      setInProgressSwapInfo(swapinfo);
    }, 5000);
    return () => {
      clearInterval(lookForBTCSwap);
    };
  }, [sendingAmount, paymentDescription, selectedRecieveOption]);

  useEffect(() => {
    if (selectedRecieveOption != 'Liquid') return;
    const eventSource = new RNEventSource(
      'https://api.boltz.exchange/streamswapstatus?id=' + inProgressSwapInfo.id,
    );
    eventSource.addEventListener('message', event => {
      if (event.data === '{"status":"transaction.mempool"}') {
        setErrorMessageText({type: 'stop', text: 'Transaction seen'});
      } else if (event.data === '{"status":"invoice.pending"}') {
        setErrorMessageText({type: 'stop', text: 'Payment pending'});
      }
      console.log(event.data);
    });
    console.log(inProgressSwapInfo, 'use effect');
  }, [inProgressSwapInfo]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme
          ? COLORS.darkModeBackground
          : COLORS.lightModeBackground,
        paddingVertical: Device.osName === 'ios' ? 0 : 10,
      }}>
      <SafeAreaView style={{flex: 1, alignItems: 'center'}}>
        <TouchableOpacity
          style={{marginRight: 'auto'}}
          activeOpacity={0.6}
          onPress={clear}>
          <Image
            source={ICONS.leftCheveronIcon}
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
            },
          ]}>
          {generatingInvoiceQRCode || errorMessageText.type === 'stop' ? (
            <>
              <ActivityIndicator
                size="large"
                color={theme ? COLORS.darkModeText : COLORS.lightModeText}
              />
              <Text style={styles.errorText}>
                {errorMessageText.text ? errorMessageText.text : ''}
              </Text>
            </>
          ) : (
            <>
              <QRCode
                size={250}
                value={
                  generatedAddress ? generatedAddress : 'Genrating QR Code'
                }
                color={theme ? COLORS.darkModeText : COLORS.lightModeText}
                backgroundColor={
                  theme ? COLORS.black : COLORS.lightModeBackground
                }
              />
              {errorMessageText.type === 'warning' && (
                <Text style={[styles.errorText, {marginBottom: 0}]}>
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
          userBalanceDenomination === 'sats' ||
          userBalanceDenomination === 'hidden'
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
        {(selectedRecieveOption.toLowerCase() === 'lightning' ||
          selectedRecieveOption.toLowerCase() === 'liquid') && (
          <View style={{marginBottom: 'auto'}}></View>
        )}
        {selectedRecieveOption.toLowerCase() != 'lightning' && (
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
                    userBalanceDenomination != 'fiat'
                      ? formatBalanceAmount(minMaxSwapAmount.min)
                      : Math.ceil(
                          minMaxSwapAmount.min *
                            (nodeInformation.fiatStats.value / SATSPERBITCOIN),
                        )
                  } - ${
                    userBalanceDenomination != 'fiat'
                      ? formatBalanceAmount(minMaxSwapAmount.max)
                      : Math.ceil(
                          minMaxSwapAmount.max *
                            (nodeInformation.fiatStats.value / SATSPERBITCOIN),
                        )
                  } ${
                    userBalanceDenomination != 'fiat'
                      ? 'sats'
                      : nodeInformation.fiatStats.coin
                  }`}
            </Text>
          </>
        )}
        {(selectedRecieveOption.toLowerCase() === 'bitcoin' ||
          selectedRecieveOption.toLowerCase() === 'unified qr' ||
          selectedRecieveOption.toLowerCase() === 'liquid') &&
          Object.keys(inProgressSwapInfo).length != 0 && (
            <TouchableOpacity
              onPress={() => {
                navigate.navigate('viewInProgressSwap', {
                  inProgressSwapInfo: inProgressSwapInfo,
                  type:
                    selectedRecieveOption.toLowerCase() === 'liquid'
                      ? 'liquid'
                      : 'bitcoin',
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
    padding: 20,
  },
  amountText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.large,
    marginTop: 10,
  },
  errorText: {
    width: '90%',
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
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
