import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import {CENTER, COLORS, SIZES, ICONS} from '../../constants';
import {useEffect, useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {copyToClipboard, formatBalanceAmount} from '../../functions';
import {useGlobalContextProvider} from '../../../context-store/context';
import QRCode from 'react-native-qrcode-svg';
import {ButtonsContainer} from '../../components/admin/homeComponents/receiveBitcoin';

import {useWebView} from '../../../context-store/webViewContext';

import {GlobalThemeView, ThemeText} from '../../functions/CustomElements';

import handleBackPress from '../../hooks/handleBackPress';
import FormattedSatText from '../../functions/CustomElements/satTextDisplay';
import LottieView from 'lottie-react-native';

import {useGlobaleCash} from '../../../context-store/eCash';
import {useGlobalContacts} from '../../../context-store/globalContacts';
import GetThemeColors from '../../hooks/themeColors';
import ThemeImage from '../../functions/CustomElements/themeImage';
import {initializeAddressProcess} from '../../functions/receiveBitcoin/addressGenerationNew';

export function ReceivePaymentHome(props) {
  const navigate = useNavigation();
  const {nodeInformation, masterInfoObject, minMaxLiquidSwapAmounts} =
    useGlobalContextProvider();
  const {webViewRef, setWebViewArgs, webViewArgs} = useWebView();
  const {seteCashNavigate, setReceiveEcashQuote, currentMint} =
    useGlobaleCash();
  const {textColor} = GetThemeColors();
  const ecashRef = useRef(null);
  const sideSwapWebSocketRef = useRef(null);
  const bitcoinWSSRef = useRef(null);
  const initialSendAmount = props.route.params?.receiveAmount;
  const paymentDescription = props.route.params?.description;

  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

  const [addressState, setAddressState] = useState({
    selectedRecieveOption: 'lightning',
    isReceivingSwap: false,
    generatedAddress: '',
    isGeneratingInvoice: false,
    minMaxSwapAmount: {
      min: 0,
      max: 0,
    },
    swapPegInfo: {},
    errorMessageText: {
      type: null,
      text: '',
    },
    hasGlobalError: false,
    bitcoinConfirmations: '',
    isSavedSwap: false,
    fee: 0,
  });

  const receiveOption = addressState.selectedRecieveOption;

  useEffect(() => {
    webViewArgs.page != 'receivePage' &&
      setWebViewArgs({navigate: navigate, page: 'receivePage'});
    initializeAddressProcess({
      nodeInformation,
      userBalanceDenomination: masterInfoObject.userBalanceDenomination,
      receivingAmount: initialSendAmount,
      description: paymentDescription,
      masterInfoObject,
      minMaxSwapAmounts: minMaxLiquidSwapAmounts,
      mintURL: currentMint.mintURL,
      seteCashNavigate,
      setWebViewArgs,
      webViewRef,
      setReceiveEcashQuote,
      ecashRef,
      sideSwapWebSocketRef,
      bitcoinWSSRef,
      setAddressState: setAddressState,
      selectedRecieveOption: addressState.selectedRecieveOption,
      navigate,
    });
  }, [initialSendAmount, paymentDescription, receiveOption]);

  return (
    <GlobalThemeView styles={{alignItems: 'center'}} useStandardWidth={true}>
      <TopBar navigate={navigate} />

      <ThemeText
        styles={{...styles.title}}
        content={addressState.selectedRecieveOption}
      />
      <QrCode navigate={navigate} addressState={addressState} />

      <ButtonsContainer
        generatingInvoiceQRCode={addressState.isGeneratingInvoice}
        generatedAddress={addressState.generatedAddress}
        setSelectedRecieveOption={setAddressState}
      />

      <View style={{marginBottom: 'auto'}}></View>

      <View style={{position: 'absolute', bottom: 0, alignItems: 'center'}}>
        <Text
          style={[
            styles.title,
            {
              color: textColor,
              marginTop: 0,
              marginBottom: 0,
            },
          ]}>
          {addressState.selectedRecieveOption.toLowerCase() === 'bitcoin' &&
          addressState.errorMessageText.text
            ? `${
                addressState.minMaxSwapAmount.min > initialSendAmount
                  ? 'Minimum'
                  : 'Maximum'
              } receive amount:`
            : `Fee:`}
        </Text>
        {addressState.isGeneratingInvoice ? (
          <ThemeText content={' '} />
        ) : (
          <FormattedSatText
            neverHideBalance={true}
            iconHeight={15}
            iconWidth={15}
            styles={{includeFontPadding: false}}
            formattedBalance={formatBalanceAmount(
              addressState.selectedRecieveOption.toLowerCase() === 'bitcoin' &&
                addressState.errorMessageText.text
                ? addressState.minMaxSwapAmount.min > initialSendAmount
                  ? addressState.minMaxSwapAmount.min
                  : addressState.minMaxSwapAmount.max
                : addressState.fee,
            )}
          />
        )}
      </View>

      {/* {addressState.selectedRecieveOption.toLowerCase() === 'bitcoin' &&
        addressState.isReceivingSwap && (
          <TouchableOpacity
            onPress={() => {
              copyToClipboard(
                addressState.swapPegInfo?.tx_hash || 'No Txhash',
                navigate,
              );
            }}
            style={[
              styles.secondaryButton,
              {
                borderColor: textColor,
              },
            ]}>
            <ThemeText content={'Copy transaction id'} />
          </TouchableOpacity>
        )} */}
    </GlobalThemeView>
  );
}

function QrCode(props) {
  const {myProfileImage} = useGlobalContacts();
  const {addressState, navigate} = props;
  const bitcoinConfirmations = addressState.bitcoinConfirmations;
  console.log(addressState);
  const {backgroundOffset, textColor} = GetThemeColors();
  return (
    <TouchableOpacity
      onPress={() => {
        if (addressState.isGeneratingInvoice) return;
        // if (
        //   addressState.selectedRecieveOption.toLowerCase() === 'bitcoin' &&
        //   addressState.isReceivingSwap
        // ) {
        //   copyToClipboard(
        //     addressState.swapPegInfo.tx_hash || 'No Txhash',
        //     navigate,
        //   );
        //   return;
        // }

        copyToClipboard(addressState.generatedAddress, navigate);
      }}
      activeOpacity={0.9}
      style={[
        styles.qrCodeContainer,
        {
          backgroundColor: backgroundOffset,
          paddingVertical: !!addressState.errorMessageText.text ? 10 : 0,
        },
      ]}>
      {addressState.isGeneratingInvoice ? (
        <ActivityIndicator size="large" color={textColor} />
      ) : (
        <>
          {!addressState.generatedAddress ? (
            <ThemeText
              styles={styles.errorText}
              content={
                addressState.errorMessageText.text ||
                'Unable to generate address'
              }
            />
          ) : (
            // <Text
            //   allowFontScaling={false}
            //   style={[
            //     styles.errorText,
            //     {
            //       color: textColor,
            //     },
            //   ]}>
            //   {addressState.errorMessageText.text ||
            //     'Unable to generate address'}
            // </Text>
            <>
              <View
                style={{
                  width: 275,
                  height: 275,
                  overflow: 'hidden',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 5,
                }}>
                {/* {addressState.isReceivingSwap && (
                  <LottieView
                    source={require('../../assets/spinnerloading.json')}
                    autoPlay
                    speed={0.8}
                    loop={true}
                    style={{
                      position: 'absolute',
                      zIndex: 99,
                      top: 89.5,
                      left: 89.5,
                      width: 96,
                      height: 96,
                    }}
                  />
                )} */}
                <QRCode
                  size={275}
                  quietZone={15}
                  value={addressState.generatedAddress || 'Well this is a bug'}
                  color={COLORS.lightModeText}
                  backgroundColor={COLORS.darkModeText}
                  logo={myProfileImage || ICONS.logoWithPadding}
                  logoSize={myProfileImage ? 70 : 50}
                  logoMargin={8}
                  logoBorderRadius={45}
                  logoBackgroundColor={COLORS.darkModeText}
                />
              </View>
              {addressState.errorMessageText.text && (
                <ThemeText
                  styles={{textAlign: 'center', width: 275, marginTop: 10}}
                  content={addressState.errorMessageText.text}
                />
              )}
            </>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

function TopBar(props) {
  return (
    <TouchableOpacity
      style={{marginRight: 'auto'}}
      activeOpacity={0.6}
      onPress={() => {
        props.navigate.reset({
          index: 0,
          routes: [
            {
              name: 'HomeAdmin',
              params: {
                screen: 'Home',
              },
            },
          ],
        });
      }}>
      <ThemeImage
        darkModeIcon={ICONS.smallArrowLeft}
        lightModeIcon={ICONS.smallArrowLeft}
        lightsOutIcon={ICONS.arrow_small_left_white}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 10,
    marginTop: 'auto',
  },
  qrCodeContainer: {
    width: 300,
    height: 'auto',
    minHeight: 300,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorText: {
    width: '90%',
    fontSize: SIZES.medium,
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
});
