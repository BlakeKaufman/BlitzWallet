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
  COLORS,
  FONT,
  ICONS,
  SATSPERBITCOIN,
  SHADOWS,
  SIZES,
} from '../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {formatBalanceAmount, numberConverter} from '../../../../functions';
import {randomUUID} from 'expo-crypto';
import {pubishMessageToAbly} from '../../../../functions/messaging/publishMessage';
import {getPublicKey} from 'nostr-tools';
import {parseInput} from '@breeztech/react-native-breez-sdk';
import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import handleBackPress from '../../../../hooks/handleBackPress';
import CustomNumberKeyboard from '../../../../functions/CustomElements/customNumberKeyboard';
import {
  LIGHTNINGAMOUNTBUFFER,
  LIQUIDAMOUTBUFFER,
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

export default function SendAndRequestPage(props) {
  const navigate = useNavigation();
  const {
    theme,
    nodeInformation,
    masterInfoObject,
    contactsPrivateKey,
    liquidNodeInformation,
    minMaxLiquidSwapAmounts,
    darkModeType,
    JWT,
  } = useGlobalContextProvider();
  const {textColor, backgroundOffset} = GetThemeColors();

  const {
    decodedAddedContacts,
    globalContactsInformation,
    toggleGlobalContactsInformation,
  } = useGlobalContacts();
  const {eCashBalance} = useGlobaleCash();
  const [amountValue, setAmountValue] = useState('');
  const [isAmountFocused, setIsAmountFocused] = useState(true);
  const [descriptionValue, setDescriptionValue] = useState('');
  const [liquidTxFee, setLiquidTxFee] = useState(250);

  const [isLoading, setIsLoading] = useState(false);
  const descriptionRef = useRef(null);
  const selectedContact = props.route.params.selectedContact;
  const paymentType = props.route.params.paymentType;
  const fromPage = props.route.params.fromPage;
  const isBTCdenominated =
    masterInfoObject.userBalanceDenomination === 'hidden' ||
    masterInfoObject.userBalanceDenomination === 'sats';
  const publicKey = getPublicKey(contactsPrivateKey);

  console.log(masterInfoObject.userBalanceDenomination);
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

  const canUseLiquid =
    liquidNodeInformation.userBalance >
      Number(convertedSendAmount) + liquidTxFee + LIQUIDAMOUTBUFFER &&
    convertedSendAmount > liquidTxFee;
  const canUseLightning =
    nodeInformation.userBalance >=
      Number(convertedSendAmount) + boltzFee + LIGHTNINGAMOUNTBUFFER &&
    Number(convertedSendAmount) >= minMaxLiquidSwapAmounts.min &&
    Number(convertedSendAmount) <= minMaxLiquidSwapAmounts.max;

  const canUseEcash =
    eCashBalance >= Number(convertedSendAmount) + 5 &&
    masterInfoObject.enabledEcash;

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
    Number(convertedSendAmount) >= 1000 && paymentType === 'send'
      ? canUseLiquid || canUseLightning || canUseEcash
      : Number(convertedSendAmount) >= minMaxLiquidSwapAmounts.min &&
        Number(convertedSendAmount) <= minMaxLiquidSwapAmounts.max;

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
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  {masterInfoObject.satDisplay === 'symbol' &&
                    (masterInfoObject.userBalanceDenomination === 'sats' ||
                      (masterInfoObject.userBalanceDenomination === 'hidden' &&
                        true)) && (
                      <Icon
                        color={textColor}
                        width={25}
                        height={25}
                        name={'bitcoinB'}
                      />
                    )}
                  <TextInput
                    style={{
                      ...styles.memoInput,
                      width: 'auto',
                      maxWidth: '70%',
                      includeFontPadding: false,
                      color: textColor,
                      fontSize: SIZES.huge,
                      padding: 0,
                      pointerEvents: 'none',
                    }}
                    value={formatBalanceAmount(amountValue)}
                    readOnly={true}
                  />
                  <ThemeText
                    content={`${
                      masterInfoObject.satDisplay === 'symbol' &&
                      (masterInfoObject.userBalanceDenomination === 'sats' ||
                        (masterInfoObject.userBalanceDenomination ===
                          'hidden' &&
                          true))
                        ? ''
                        : masterInfoObject.userBalanceDenomination === 'fiat'
                        ? ` ${nodeInformation.fiatStats.coin || 'USD'}`
                        : masterInfoObject.userBalanceDenomination ===
                            'hidden' && !true
                        ? '* * * * *'
                        : ' sats'
                    }`}
                    styles={{
                      fontSize: SIZES.xxLarge,
                      includeFontPadding: false,
                    }}
                  />
                </View>

                <FormattedSatText
                  containerStyles={{opacity: !amountValue ? 0.5 : 1}}
                  neverHideBalance={true}
                  iconHeight={15}
                  iconWidth={15}
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
                marginBottom: Platform.OS === 'ios' ? 15 : 0,
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
                opacity: canSendPayment || canSendToLNURL ? 1 : 0.5,
                width: 'auto',
                ...CENTER,
                marginTop: 15,
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
    if (!nodeInformation.didConnectToNode) {
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Please reconnect to the internet to use this feature',
      });
      return;
    }

    try {
      setIsLoading(true);
      if (Number(convertedSendAmount) === 0) return;

      if (!canSendPayment && !canSendToLNURL) return;

      const fiatCurrencies = await getFiatRates();

      const sendingAmountMsat = convertedSendAmount * 1000;
      const address = selectedContact.receiveAddress;

      let receiveAddress;
      if (selectedContact.isLNURL) {
        const decodedLNURL = await parseInput(selectedContact.receiveAddress);
        const response = await fetch(
          `${decodedLNURL.data.callback}?amount=${sendingAmountMsat}`,
        );
        const bolt11Invoice = (await response.json()).pr;
        if (!bolt11Invoice) {
          navigate.navigate('ErrorScreen', {
            errorMessage:
              'Unable to create an invoice for the lightning address.',
          });
        }

        receiveAddress = bolt11Invoice;
      } else {
        receiveAddress = `${
          process.env.BOLTZ_ENVIRONMENT === 'testnet'
            ? 'liquidtestnet:'
            : 'liquidnetwork:'
        }${address}?amount=${(convertedSendAmount / SATSPERBITCOIN).toFixed(
          8,
        )}&assetid=${assetIDS['L-BTC']}`;
      }

      const UUID = randomUUID();
      let sendObject = {};

      if (paymentType === 'send') {
        sendObject['amountMsat'] = sendingAmountMsat;
        sendObject['description'] = descriptionValue;
        sendObject['uuid'] = UUID;
        sendObject['isRequest'] = false;
        sendObject['isRedeemed'] = true;

        navigate.navigate('ConfirmPaymentScreen', {
          btcAdress: receiveAddress,
          fromPage: 'contacts',
          publishMessageFunc: () =>
            pubishMessageToAbly(
              contactsPrivateKey,
              selectedContact.uuid,
              globalContactsInformation.myProfile.uuid,
              JSON.stringify(sendObject),
              globalContactsInformation,
              toggleGlobalContactsInformation,
              paymentType,
              decodedAddedContacts,
              publicKey,
              selectedContact,
              JWT,
              fiatCurrencies,
              selectedContact.isLNURL,
            ),
        });
      } else {
        sendObject['amountMsat'] = sendingAmountMsat;
        sendObject['description'] = descriptionValue;
        sendObject['uuid'] = UUID;
        sendObject['isRequest'] = true;
        sendObject['isRedeemed'] = false;

        pubishMessageToAbly(
          contactsPrivateKey,
          selectedContact.uuid,
          globalContactsInformation.myProfile.uuid,
          JSON.stringify(sendObject),
          globalContactsInformation,
          toggleGlobalContactsInformation,
          paymentType,
          decodedAddedContacts,
          publicKey,
          selectedContact,
          JWT,
          fiatCurrencies,
        );
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
    width: '100%',
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.xxLarge,
  },

  button: {
    width: '100%',
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    ...SHADOWS.small,
    ...CENTER,
    marginBottom: 5,
    marginTop: 5,
  },
  buttonText: {
    fontSize: SIZES.large,
  },
});
