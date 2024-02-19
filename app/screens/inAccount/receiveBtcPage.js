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
// import {
//   BitcoinPage,
//   ButtonsContainer,
//   EditAmountPopup,
//   LightningPage,
//   LiquidPage,
//   NavBar,
// } from '../../components/admin/homeComponents/recieveBitcoin';
import {useNavigation} from '@react-navigation/native';
import * as Device from 'expo-device';

import {formatBalanceAmount, getLocalStorageItem} from '../../functions';
import {useGlobalContextProvider} from '../../../context-store/context';
import QRCode from 'react-native-qrcode-svg';

import {
  generateBitcoinAddress,
  generateLightningAddress,
  generateUnifiedAddress,
} from '../../functions/receiveBitcoin/addressGeneration';
import {ButtonsContainer} from '../../components/admin/homeComponents/receiveBitcoinNew';
import {monitorSwap} from '../../functions/receiveBitcoin';

export function ReceivePaymentHome() {
  const [generatedAddress, setGeneratedAddress] = useState('');
  const [sendingAmount, setSendingAmount] = useState(1);
  const [paymentDescription, setPaymentDescription] = useState('');
  const [selectedRecieveOption, setSelectedRecieveOption] =
    useState('Unified QR');

  const [isSwapCreated, setIsSwapCreated] = useState(false);
  const [generatingInvoiceQRCode, setGeneratingInvoiceQRCode] = useState(true);
  const navigate = useNavigation();
  const {theme, nodeInformation, userBalanceDenomination} =
    useGlobalContextProvider();
  const [minMaxSwapAmount, setMinMaxSwapAmount] = useState({
    min: 0,
    max: 0,
  });
  const [inProgressSwapInfo, setInProgressSwapInfo] = useState({});
  const [errorMessageText, setErrorMessageText] = useState('');

  useEffect(() => {
    (async () => {
      const receiveAddress =
        selectedRecieveOption.toLowerCase() === 'lightning'
          ? await generateLightningAddress(
              nodeInformation,
              userBalanceDenomination,
              sendingAmount,
              paymentDescription,
              setGeneratingInvoiceQRCode,
            )
          : selectedRecieveOption.toLowerCase() === 'bitcoin'
          ? await generateBitcoinAddress(
              nodeInformation,
              userBalanceDenomination,
              sendingAmount,
              paymentDescription,
              setGeneratingInvoiceQRCode,
            )
          : selectedRecieveOption.toLowerCase() === 'liquid'
          ? await generateLiquidAddress(
              nodeInformation,
              userBalanceDenomination,
              sendingAmount,
              paymentDescription,
              setGeneratingInvoiceQRCode,
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

      setGeneratedAddress(receiveAddress);
    })();
    let lookForBTCSwap = setInterval(async () => {
      console.log('a');
      const swapinfo = await monitorSwap();
      if (!swapinfo) return;

      setInProgressSwapInfo(swapinfo);

      console.log('T');
    }, 5000);
    return () => {
      clearInterval(lookForBTCSwap);
    };
  }, [sendingAmount, paymentDescription]);

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
          {generatingInvoiceQRCode ? (
            <>
              <ActivityIndicator
                size="large"
                color={theme ? COLORS.darkModeText : COLORS.lightModeText}
              />
              <Text style={styles.errorText}>
                {errorMessageText ? errorMessageText : ''}
              </Text>
            </>
          ) : (
            <QRCode
              size={250}
              value={generatedAddress ? generatedAddress : 'Genrating QR Code'}
              color={theme ? COLORS.darkModeText : COLORS.lightModeText}
              backgroundColor={
                theme ? COLORS.black : COLORS.lightModeBackground
              }
            />
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
        />
        <Text
          style={[
            styles.title,
            {
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              marginTop: 0,
              marginBottom: 0,
            },
          ]}>
          {generatingInvoiceQRCode ? ' ' : ' Min/Max receive via onchain:'}
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
        {Object.keys(inProgressSwapInfo).length === 0 ? (
          <Text> </Text>
        ) : (
          <TouchableOpacity
            onPress={() => {
              navigate.navigate('viewInProgressSwap', {
                inProgressSwapInfo: inProgressSwapInfo,
              });
            }}
            style={[
              styles.secondaryButton,
              {borderColor: theme ? COLORS.darkModeText : COLORS.lightModeText},
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

  function clear(type) {
    setSendingAmount(1);
    setPaymentDescription('');
    // setGeneratedAddress('');
    setIsSwapCreated(false);

    if (type === 'navChange') return;
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
    height: 275,
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
