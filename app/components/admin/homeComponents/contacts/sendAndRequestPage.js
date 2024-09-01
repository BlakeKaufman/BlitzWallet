import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
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
import {useEffect, useMemo, useRef, useState} from 'react';
import {formatBalanceAmount, numberConverter} from '../../../../functions';
import {randomUUID} from 'expo-crypto';
import {pubishMessageToAbly} from '../../../../functions/messaging/publishMessage';
import {getPublicKey} from 'nostr-tools';
import {
  getLiquidTxFee,
  sendLiquidTransaction,
} from '../../../../functions/liquidWallet';
import {contactsLNtoLiquidSwapInfo} from './internalComponents/LNtoLiquidSwap';
import {getBoltzWsUrl} from '../../../../functions/boltz/boltzEndpoitns';
import {PaymentStatus, sendPayment} from '@breeztech/react-native-breez-sdk';
import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import {useWebView} from '../../../../../context-store/webViewContext';
import handleBackPress from '../../../../hooks/handleBackPress';
import {backArrow} from '../../../../constants/styles';
import CustomNumberKeyboard from '../../../../functions/CustomElements/customNumberKeyboard';
import {
  LIGHTNINGAMOUNTBUFFER,
  LIQUIDAMOUTBUFFER,
} from '../../../../constants/math';
import CustomButton from '../../../../functions/CustomElements/button';
import handleReverseClaimWSS from '../../../../functions/boltz/handle-reverse-claim-wss';
import Icon from '../../../../functions/CustomElements/Icon';
import FormattedSatText from '../../../../functions/CustomElements/satTextDisplay';
import {useGlobalContacts} from '../../../../../context-store/globalContacts';

export default function SendAndRequestPage(props) {
  const navigate = useNavigation();
  const {
    theme,
    nodeInformation,
    masterInfoObject,
    contactsPrivateKey,
    liquidNodeInformation,
    minMaxLiquidSwapAmounts,
  } = useGlobalContextProvider();
  const {
    decodedAddedContacts,
    globalContactsInformation,
    toggleGlobalContactsInformation,
  } = useGlobalContacts();
  const {setWebViewArgs, webViewRef} = useWebView();
  const [amountValue, setAmountValue] = useState('');
  const [isAmountFocused, setIsAmountFocused] = useState(true);
  const [descriptionValue, setDescriptionValue] = useState('');
  const [liquidTxFee, setLiquidTxFee] = useState(300);

  const [isPerformingSwap, setIsPerformingSwap] = useState(false);
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

  const canSendPayment =
    paymentType === 'send'
      ? canUseLiquid || canUseLightning
      : Number(convertedSendAmount) >= minMaxLiquidSwapAmounts.min &&
        Number(convertedSendAmount) <= minMaxLiquidSwapAmounts.max;

  useEffect(() => {
    const fetchLiquidTxFee = async () => {
      try {
        const fee = await getLiquidTxFee({
          amountSat: convertedSendAmount,
          address: selectedContact.receiveAddress,
        });

        setLiquidTxFee(fee || 300);
      } catch (error) {
        console.error('Error fetching liquid transaction fee:', error);
        setLiquidTxFee(300); // Fallback value
      }
    };

    fetchLiquidTxFee();
  }, [convertedSendAmount]);

  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

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

  return (
    <GlobalThemeView useStandardWidth={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={{flex: 1}}>
        {isPerformingSwap ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <ActivityIndicator
              size={'large'}
              color={theme ? COLORS.darkModeText : COLORS.lightModeText}
            />
            <ThemeText styles={{marginTop: 10}} content={'Performing swap'} />
          </View>
        ) : (
          <View
            style={{
              flex: 1,
            }}>
            <TouchableOpacity onPress={navigate.goBack}>
              <Image style={[backArrow]} source={ICONS.smallArrowLeft} />
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
                      borderColor: theme
                        ? COLORS.darkModeBackgroundOffset
                        : COLORS.lightModeBackgroundOffset,
                      backgroundColor: COLORS.darkModeText,
                      marginBottom: 5,
                    },
                  ]}>
                  <Image
                    source={
                      selectedContact.profileImage
                        ? {uri: selectedContact.profileImage}
                        : ICONS.userIcon
                    }
                    style={
                      selectedContact.profileImage
                        ? {width: '100%', height: undefined, aspectRatio: 1}
                        : {width: '80%', height: '80%'}
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
                        (masterInfoObject.userBalanceDenomination ===
                          'hidden' &&
                          true)) && (
                        <Icon
                          color={
                            theme ? COLORS.darkModeText : COLORS.lightModeText
                          }
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
                        color: theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
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

                {/* {paymentType === 'send' && (
                  <FormattedSatText
                    containerStyles={{opacity: !amountValue ? 0.5 : 1}}
                    frontText={`Fee: `}
                    iconHeight={15}
                    iconWidth={15}
                    styles={{includeFontPadding: false}}
                    formattedBalance={formatBalanceAmount(
                      numberConverter(
                        canSendPayment
                          ? canUseLiquid
                            ? liquidTxFee
                            : boltzFee
                          : 0,
                        masterInfoObject.userBalanceDenomination,
                        nodeInformation,
                        masterInfoObject.userBalanceDenomination === 'fiat'
                          ? 2
                          : 0,
                      ),
                    )}
                  />
                )} */}
              </ScrollView>

              <TextInput
                onFocus={() => {
                  setIsAmountFocused(false);
                }}
                ref={descriptionRef}
                placeholder="What's this for?"
                placeholderTextColor={COLORS.lightModeText}
                onChangeText={value => setDescriptionValue(value)}
                multiline={true}
                textAlignVertical="center"
                maxLength={150}
                lineBreakStrategyIOS="standard"
                value={descriptionValue}
                style={styles.descriptionInput}
              />

              {isAmountFocused && (
                <CustomNumberKeyboard
                  showDot={masterInfoObject.userBalanceDenomination === 'fiat'}
                  frompage="sendContactsPage"
                  setInputValue={setAmountValue}
                />
              )}
              <CustomButton
                buttonStyles={{
                  opacity: canSendPayment ? 1 : 0.5,
                  width: 'auto',
                  ...CENTER,
                  marginTop: 15,
                }}
                textStyles={{
                  fontSize: SIZES.large,
                  includeFontPadding: false,
                }}
                actionFunction={handleSubmit}
                textContent={paymentType === 'send' ? 'Send' : 'Request'}
              />
            </View>
          </View>
        )}
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
      if (Number(convertedSendAmount) === 0) return;

      if (!canSendPayment) return;

      // const nostrProfile = JSON.parse(await retrieveData('myNostrProfile'));
      // const blitzWalletContact = JSON.parse(
      //   await retrieveData('blitzWalletContact'),
      // );

      // if (!blitzWalletContact.token) {
      //   navigate.navigate('ErrorScreen', {
      //     errorMessage: 'Notifications must be turned on',
      //   });
      //   return;
      // }

      const sendingAmountMsat = convertedSendAmount * 1000;

      const UUID = randomUUID();
      let sendObject = {};
      // const data = `https://blitz-wallet.com/.netlify/functions/lnurlwithdrawl?platform=${
      //   Platform.OS
      // }&token=${blitzWalletContact?.token?.data}&amount=${
      //   sendingAmountMsat / 1000
      // }&uuid=${UUID}&desc=${LNURL_WITHDRAWL_CODES[3]}&totalAmount=${1}`;

      // const byteArr = Buffer.Buffer.from(data, 'utf8');
      // const words = bench32.bech32.toWords(byteArr);
      // const encoded = bench32.bech32.encode('lnurl', words, 1500);
      // const withdrawLNURL = encoded.toUpperCase();

      if (paymentType === 'send') {
        if (canUseLiquid) {
          const didSend = await sendLiquidTransaction(
            Number(convertedSendAmount),
            selectedContact.receiveAddress,
          );

          sendObject['amountMsat'] = sendingAmountMsat;
          sendObject['description'] = descriptionValue;
          sendObject['uuid'] = UUID;
          sendObject['isRequest'] = false;
          sendObject['isRedeemed'] = true;

          if (didSend) {
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
            );
            if (fromPage === 'halfModal') {
              setTimeout(() => {
                navigate.replace('HomeAdmin');
                navigate.navigate('ConfirmTxPage', {
                  for: 'paymentSucceed',
                  information: {},
                });
              }, 1000);

              return;
            }

            navigate.goBack();
          } else {
            navigate.goBack();
            navigate.navigate('ErrorScreen', {
              errorMessage: 'Not enough funds',
            });
          }
        } else {
          setIsPerformingSwap(true);
          setWebViewArgs({navigate: navigate, page: 'contactsPage'});
          const [
            data,
            swapPublicKey,
            privateKeyString,
            keys,
            preimage,
            liquidAddress,
          ] = await contactsLNtoLiquidSwapInfo(
            selectedContact.receiveAddress,
            sendingAmountMsat / 1000,
            `Paying ${selectedContact.name || selectedContact.uniqueName}`,
          );

          if (!data.invoice) {
            navigate.goBack();
            navigate.navigate('ErrorScreen', {
              errorMessage: 'Creating swap failed, try agian',
            });

            return;
          }
          const webSocket = new WebSocket(
            `${getBoltzWsUrl(process.env.BOLTZ_ENVIRONMENT)}`,
          );
          const paymentAddresss = data.invoice;
          const didHandle = await handleReverseClaimWSS({
            ref: webViewRef,
            webSocket: webSocket,
            liquidAddress: liquidAddress,
            swapInfo: data,
            preimage: preimage,
            privateKey: keys.privateKey.toString('hex'),
            navigate: navigate,
            fromPage: 'contacts',
            contactsFunction: () =>
              publishMessageToAblyGlobLFunc({
                UUID,
                sendingAmountMsat,
                descriptionValue,
                isRequest: false,
                isRedeemed: true,
                decodedAddedContacts,
                fromPage,
              }),
          });

          if (didHandle) {
            try {
              const didSend = await sendPayment({bolt11: paymentAddresss});
              if (didSend.payment.status === PaymentStatus.FAILED) {
                navigate.goBack();
                navigate.navigate('ErrorScreen', {
                  errorMessage: 'Lightning payment failed',
                });
              }
            } catch (err) {
              console.log(err);
              navigate.goBack();
              navigate.navigate('ErrorScreen', {
                errorMessage: 'Lightning payment failed',
              });
            }
          }
        }
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
        );
        navigate.goBack();
      }
    } catch (err) {
      console.log(err);
    }
  }

  function publishMessageToAblyGlobLFunc({
    sendingAmountMsat,
    descriptionValue,
    UUID,
    isRequest,
    isRedeemed,
    decodedAddedContacts,
    fromPage,
  }) {
    let sendObject = {};
    sendObject['amountMsat'] = sendingAmountMsat;
    sendObject['description'] = descriptionValue;
    sendObject['uuid'] = UUID;
    sendObject['isRequest'] = isRequest;
    sendObject['isRedeemed'] = isRedeemed;

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
    );

    if (fromPage === 'halfModal') {
      setTimeout(() => {
        navigate.replace('HomeAdmin');
        navigate.navigate('ConfirmTxPage', {
          for: 'paymentSucceed',
          information: {},
        });
      }, 1000);
      return;
    }

    navigate.goBack();
  }

  // function getClaimReverseSubmarineSwapJS({
  //   address,
  //   swapInfo,
  //   preimage,
  //   privateKey,
  // }) {
  //   const args = JSON.stringify({
  //     apiUrl: getBoltzApiUrl(process.env.BOLTZ_ENVIRONMENT),
  //     network: process.env.BOLTZ_ENVIRONMENT,
  //     address,
  //     feeRate: 1,
  //     swapInfo,
  //     privateKey,
  //     preimage,
  //   });

  //   console.log('SENDING CLAIM TO WEBVIEW', args);

  //   webViewRef.current.injectJavaScript(
  //     `window.claimReverseSubmarineSwap(${args}); void(0);`,
  //   );
  // }
}

const styles = StyleSheet.create({
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 125,
    borderWidth: 5,
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
  descriptionInput: {
    width: '90%',
    color: COLORS.lightModeText,
    fontSize: SIZES.medium,
    maxHeight: 80,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: COLORS.darkModeText,
    includeFontPadding: false,
    marginTop: 'auto',
    paddingTop: 10,
    paddingBottom: 10,
    ...CENTER,
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
