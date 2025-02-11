import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
} from 'react-native';
import {
  CENTER,
  FONT,
  ICONS,
  LIQUID_DEFAULT_FEE,
  SATSPERBITCOIN,
  SHADOWS,
  SIZES,
} from '../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {formatBalanceAmount} from '../../../../functions';
import {publishMessage} from '../../../../functions/messaging/publishMessage';
import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import handleBackPress from '../../../../hooks/handleBackPress';
import CustomNumberKeyboard from '../../../../functions/CustomElements/customNumberKeyboard';
import {
  DUST_LIMIT_FOR_LBTC_CHAIN_PAYMENTS,
  LIGHTNINGAMOUNTBUFFER,
} from '../../../../constants/math';
import CustomButton from '../../../../functions/CustomElements/button';
import Icon from '../../../../functions/CustomElements/Icon';
import FormattedSatText from '../../../../functions/CustomElements/satTextDisplay';
import {useGlobalContacts} from '../../../../../context-store/globalContacts';
import GetThemeColors from '../../../../hooks/themeColors';
import ThemeImage from '../../../../functions/CustomElements/themeImage';
import {assetIDS} from '../../../../functions/liquidWallet/assetIDS';
import {getFiatRates} from '../../../../functions/SDK';
import {useGlobaleCash} from '../../../../../context-store/eCash';
import CustomSearchInput from '../../../../functions/CustomElements/searchInput';
import customUUID from '../../../../functions/customUUID';
import FormattedBalanceInput from '../../../../functions/CustomElements/formattedBalanceInput';

export default function SendAndRequestPage(props) {
  const navigate = useNavigation();
  const {
    theme,
    nodeInformation,
    masterInfoObject,
    liquidNodeInformation,
    minMaxLiquidSwapAmounts,
    darkModeType,
    isConnectedToTheInternet,
  } = useGlobalContextProvider();
  const {textColor, backgroundOffset} = GetThemeColors();

  const {globalContactsInformation, updatedCachedMessagesStateFunction} =
    useGlobalContacts();
  const {eCashBalance} = useGlobaleCash();
  const [amountValue, setAmountValue] = useState('');
  const [isAmountFocused, setIsAmountFocused] = useState(true);
  const [descriptionValue, setDescriptionValue] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const descriptionRef = useRef(null);
  const selectedContact = props.route.params.selectedContact;
  const paymentType = props.route.params.paymentType;
  const fromPage = props.route.params.fromPage;
  const isBTCdenominated =
    masterInfoObject.userBalanceDenomination === 'hidden' ||
    masterInfoObject.userBalanceDenomination === 'sats';

  const convertedSendAmount = isBTCdenominated
    ? Math.round(amountValue)
    : Math.round(
        (SATSPERBITCOIN / nodeInformation?.fiatStats?.value) * amountValue,
      );

  const boltzFee = useMemo(() => {
    return (
      minMaxLiquidSwapAmounts.reverseSwapStats?.fees?.minerFees?.claim +
      minMaxLiquidSwapAmounts.reverseSwapStats?.fees?.minerFees?.lockup +
      Math.round(convertedSendAmount * 0.0025)
    );
  }, [convertedSendAmount]);

  const canUseLiquid = selectedContact?.isLNURL
    ? Number(convertedSendAmount) >= minMaxLiquidSwapAmounts.min &&
      Number(convertedSendAmount) <= minMaxLiquidSwapAmounts.max &&
      liquidNodeInformation.userBalance >= Number(convertedSendAmount)
    : liquidNodeInformation.userBalance >= Number(convertedSendAmount) &&
      Number(convertedSendAmount) >= DUST_LIMIT_FOR_LBTC_CHAIN_PAYMENTS;

  const canUseLightning = masterInfoObject.liquidWalletSettings
    .isLightningEnabled
    ? selectedContact?.isLNURL
      ? nodeInformation.userBalance >= Number(convertedSendAmount)
      : nodeInformation.userBalance >=
          Number(convertedSendAmount) + boltzFee + LIGHTNINGAMOUNTBUFFER &&
        Number(convertedSendAmount) >= minMaxLiquidSwapAmounts.min &&
        Number(convertedSendAmount) <= minMaxLiquidSwapAmounts.max
    : false;

  const canUseEcash = selectedContact?.isLNURL
    ? eCashBalance >= Number(convertedSendAmount) + 5 &&
      masterInfoObject.enabledEcash
    : false;

  const canSendToLNURL =
    selectedContact?.isLNURL &&
    (nodeInformation.userBalance >=
      Number(convertedSendAmount) + LIGHTNINGAMOUNTBUFFER ||
      canUseEcash ||
      (canUseLiquid &&
        Number(convertedSendAmount) >= minMaxLiquidSwapAmounts.min)) &&
    !!Number(convertedSendAmount);

  console.log(
    canUseLiquid,
    canUseEcash,
    canUseLightning,
    canSendToLNURL,
    convertedSendAmount,
    minMaxLiquidSwapAmounts.min,
  );

  const canSendPayment =
    paymentType === 'request'
      ? convertedSendAmount >= minMaxLiquidSwapAmounts.min &&
        convertedSendAmount
      : (canUseEcash || canUseLightning || canUseLiquid) && convertedSendAmount;

  const handleBackPressFunction = useCallback(() => {
    navigate.goBack();
    return true;
  }, [navigate]);

  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, [handleBackPressFunction]);

  const convertedValue = () => {
    return masterInfoObject.userBalanceDenomination === 'fiat'
      ? Math.round(
          (SATSPERBITCOIN / (nodeInformation.fiatStats?.value || 65000)) *
            Number(amountValue),
        )
      : String(
          (
            ((nodeInformation.fiatStats?.value || 65000) / SATSPERBITCOIN) *
            Number(amountValue)
          ).toFixed(2),
        );
  };

  const handleSearch = term => {
    setAmountValue(term);
  };

  return (
    <GlobalThemeView useStandardWidth={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={{flex: 1}}>
        <View
          style={{
            flex: 1,
          }}>
          <TouchableOpacity onPress={navigate.goBack}>
            <ThemeImage
              darkModeIcon={ICONS.smallArrowLeft}
              lightModeIcon={ICONS.smallArrowLeft}
              lightsOutIcon={ICONS.arrow_small_left_white}
            />
          </TouchableOpacity>

          <View
            style={{
              flex: 1,
            }}>
            <ScrollView>
              <View
                style={[
                  styles.profileImage,
                  {
                    backgroundColor: backgroundOffset,
                    marginBottom: 5,
                  },
                ]}>
                <Image
                  source={
                    selectedContact.profileImage
                      ? {uri: selectedContact.profileImage}
                      : darkModeType && theme
                      ? ICONS.userWhite
                      : ICONS.userIcon
                  }
                  style={
                    selectedContact.profileImage
                      ? {width: '100%', height: undefined, aspectRatio: 1}
                      : {width: '50%', height: '50%'}
                  }
                />
              </View>
              <ThemeText
                styles={{...styles.profileName}}
                content={`${
                  selectedContact.name || selectedContact.uniqueName
                }`}
              />

              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  setTimeout(() => {
                    setIsAmountFocused(true);
                  }, 200);
                }}
                style={[
                  styles.textInputContainer,
                  {
                    alignItems: 'center',
                    opacity: !amountValue ? 0.5 : 1,
                  },
                ]}>
                <FormattedBalanceInput
                  amountValue={amountValue}
                  inputDenomination={masterInfoObject.userBalanceDenomination}
                />

                <FormattedSatText
                  containerStyles={{opacity: !amountValue ? 0.5 : 1}}
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
            </ScrollView>

            <CustomSearchInput
              onFocusFunction={() => {
                setIsAmountFocused(false);
              }}
              onBlurFunction={() => {
                setTimeout(() => {
                  setIsAmountFocused(true);
                }, 150);
              }}
              textInputRef={descriptionRef}
              placeholderText={"What's this for?"}
              setInputText={setDescriptionValue}
              inputText={descriptionValue}
              textInputMultiline={true}
              textAlignVertical={'center'}
              maxLength={150}
              containerStyles={{
                width: '90%',
                marginBottom: Platform.OS === 'ios' ? 25 : 0,
              }}
            />

            {isAmountFocused && (
              <CustomNumberKeyboard
                showDot={masterInfoObject.userBalanceDenomination === 'fiat'}
                frompage="sendContactsPage"
                setInputValue={handleSearch}
              />
            )}

            <CustomButton
              buttonStyles={{
                opacity: canSendPayment ? 1 : 0.5,
                ...styles.button,
              }}
              textStyles={{
                fontSize: SIZES.large,
                includeFontPadding: false,
              }}
              useLoading={isLoading}
              actionFunction={handleSubmit}
              textContent={paymentType === 'send' ? 'Accept' : 'Request'}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </GlobalThemeView>
  );

  async function handleSubmit() {
    if (!isConnectedToTheInternet) {
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Please reconnect to the internet to use this feature',
      });
      return;
    }

    try {
      setIsLoading(true);
      if (!convertedSendAmount) return;
      if (!canSendPayment) return;

      const fiatCurrencies = await getFiatRates();

      const sendingAmountMsat = convertedSendAmount * 1000;
      const address = selectedContact.receiveAddress;

      let receiveAddress;
      if (selectedContact.isLNURL) {
        receiveAddress = address;
        // note do not need to set an amount for lnurl taken care of down below with entered payment information object
      } else {
        receiveAddress = `${
          process.env.BOLTZ_ENVIRONMENT === 'testnet'
            ? 'liquidtestnet:'
            : 'liquidnetwork:'
        }${address}?message=${`Paying ${
          selectedContact.name || selectedContact.uniqueName
        }`}&amount=${(convertedSendAmount / SATSPERBITCOIN).toFixed(
          8,
        )}&assetid=${assetIDS['L-BTC']}`;
      }

      const UUID = customUUID();
      let sendObject = {};

      if (paymentType === 'send') {
        sendObject['amountMsat'] = sendingAmountMsat;
        sendObject['description'] = descriptionValue;
        sendObject['uuid'] = UUID;
        sendObject['isRequest'] = false;
        sendObject['isRedeemed'] = null;
        sendObject['wasSeen'] = null;
        sendObject['didSend'] = null;

        navigate.navigate('ConfirmPaymentScreen', {
          btcAdress: receiveAddress,
          comingFromAccept: true,
          enteredPaymentInfo: {
            amount: sendingAmountMsat / 1000,
            description: descriptionValue,
          },
          fromPage: 'contacts',
          publishMessageFunc: () =>
            publishMessage({
              toPubKey: selectedContact.uuid,
              fromPubKey: globalContactsInformation.myProfile.uuid,
              data: sendObject,
              globalContactsInformation,
              selectedContact,
              fiatCurrencies,
              isLNURLPayment: selectedContact?.isLNURL,
              updateFunction: updatedCachedMessagesStateFunction,
            }),
        });
      } else {
        sendObject['amountMsat'] = sendingAmountMsat;
        sendObject['description'] = descriptionValue;
        sendObject['uuid'] = UUID;
        sendObject['isRequest'] = true;
        sendObject['isRedeemed'] = null;
        sendObject['wasSeen'] = null;
        sendObject['didSend'] = null;
        publishMessage({
          toPubKey: selectedContact.uuid,
          fromPubKey: globalContactsInformation.myProfile.uuid,
          data: sendObject,
          globalContactsInformation,
          selectedContact,
          fiatCurrencies,
          isLNURLPayment: selectedContact?.isLNURL,
          updateFunction: updatedCachedMessagesStateFunction,
        });
        navigate.goBack();
      }
    } catch (err) {
      setIsLoading(false);
      navigate.navigate('ErrorScreen', {
        errorMessage: selectedContact.isLNURL
          ? 'Error generating invoice. Make sure this is a valid LNURL address.'
          : 'Not able to create invoice',
      });
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }
}

const styles = StyleSheet.create({
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 125,
    backgroundColor: 'red',
    ...CENTER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 20,
    overflow: 'hidden',
  },
  profileName: {
    ...CENTER,
    marginBottom: 20,
  },

  textInputContainer: {
    width: '95%',
    margin: 0,
    ...CENTER,
  },
  memoInput: {
    fontSize: 50,
    padding: 0,
    pointerEvents: 'none',
    width: 'auto',
    maxWidth: '70%',
    includeFontPadding: false,
  },

  button: {
    width: 'auto',
    ...CENTER,
  },
});
