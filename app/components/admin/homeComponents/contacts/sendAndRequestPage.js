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
import {useEffect, useRef, useState} from 'react';
import {formatBalanceAmount, numberConverter} from '../../../../functions';

import {randomUUID} from 'expo-crypto';

import {pubishMessageToAbly} from '../../../../functions/messaging/publishMessage';
import {decryptMessage} from '../../../../functions/messaging/encodingAndDecodingMessages';
import {getPublicKey} from 'nostr-tools';

import {sendLiquidTransaction} from '../../../../functions/liquidWallet';
import {contactsLNtoLiquidSwapInfo} from './internalComponents/LNtoLiquidSwap';

import {
  getBoltzApiUrl,
  getBoltzWsUrl,
} from '../../../../functions/boltz/boltzEndpoitns';

import {PaymentStatus, sendPayment} from '@breeztech/react-native-breez-sdk';
import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import getLiquidAndBoltzFees from '../sendBitcoin/functions/getFees';

import {useWebView} from '../../../../../context-store/webViewContext';
import handleBackPress from '../../../../hooks/handleBackPress';
import {backArrow} from '../../../../constants/styles';
import {WINDOWWIDTH} from '../../../../constants/theme';
import CustomNumberKeyboard from '../../../../functions/CustomElements/customNumberKeyboard';
import {LIQUIDAMOUTBUFFER} from '../../../../constants/math';
import CustomButton from '../../../../functions/CustomElements/button';
import handleReverseClaimWSS from '../../../../functions/boltz/handle-reverse-claim-wss';

export default function SendAndRequestPage(props) {
  const navigate = useNavigation();

  const {
    theme,
    nodeInformation,
    masterInfoObject,
    toggleMasterInfoObject,
    contactsPrivateKey,
    liquidNodeInformation,
    minMaxLiquidSwapAmounts,
  } = useGlobalContextProvider();
  const {setWebViewArgs, webViewRef} = useWebView();
  const [amountValue, setAmountValue] = useState('');
  const [isAmountFocused, setIsAmountFocused] = useState(true);
  const [descriptionValue, setDescriptionValue] = useState('');
  // const [swapPairInfo, setSwapPairInfo] = useState({});
  const [fees, setFees] = useState({
    liquidFees: 0,
    boltzFee: 0,
  });
  const [isPerformingSwap, setIsPerformingSwap] = useState(false);
  const amountRef = useRef(null);
  const descriptionRef = useRef(null);
  const selectedContact = props.route.params.selectedContact;
  const paymentType = props.route.params.paymentType;
  const isBTCdenominated =
    masterInfoObject.userBalanceDenomination === 'hidden' ||
    masterInfoObject.userBalanceDenomination === 'sats';
  const publicKey = getPublicKey(contactsPrivateKey);

  console.log(amountValue);

  const convertedSendAmount = isBTCdenominated
    ? Math.round(amountValue)
    : Math.round(
        (SATSPERBITCOIN / nodeInformation?.fiatStats?.value) * amountValue,
      );

  const canUseLiquid =
    liquidNodeInformation.userBalance - LIQUIDAMOUTBUFFER >
      Number(convertedSendAmount) + fees.liquidFees &&
    convertedSendAmount > fees.liquidFees;
  const canUseLightning =
    nodeInformation.userBalance >=
      Number(convertedSendAmount) +
        fees.boltzFee +
        fees.liquidFees +
        LIQUIDAMOUTBUFFER &&
    Number(convertedSendAmount) >= minMaxLiquidSwapAmounts.min &&
    Number(convertedSendAmount) <= minMaxLiquidSwapAmounts.max;

  const canSendPayment =
    paymentType === 'send'
      ? canUseLiquid || canUseLightning
      : Number(convertedSendAmount) >= 1000 &&
        Number(convertedSendAmount) <= minMaxLiquidSwapAmounts.max;
  useEffect(() => {
    (async () => {
      const {liquidFees, boltzFee, boltzSwapInfo} =
        await getLiquidAndBoltzFees();
      setFees({
        liquidFees: liquidFees,
        boltzFee: boltzFee,
      });
      // setSwapPairInfo(boltzSwapInfo);
    })();
  }, []);

  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

  console.log(
    canSendPayment,
    liquidNodeInformation.userBalance,
    convertedSendAmount + fees.liquidFees,
    convertedSendAmount,
    fees.liquidFees,
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      style={{flex: 1}}>
      <GlobalThemeView useStandardWidth={true} styles={{paddingBottom: 0}}>
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
              width: '100%',
            }}>
            <TouchableOpacity onPress={navigate.goBack}>
              <Image style={[backArrow]} source={ICONS.smallArrowLeft} />
            </TouchableOpacity>
            <View
              style={{
                flex: 1,
              }}>
              <View
                style={[
                  styles.profileImage,
                  {
                    borderColor: theme
                      ? COLORS.darkModeBackgroundOffset
                      : COLORS.lightModeBackgroundOffset,
                    backgroundColor: theme
                      ? COLORS.darkModeText
                      : COLORS.lightModeText,
                    marginBottom: 5,
                  },
                ]}>
                <Image
                  source={
                    selectedContact.profileImg
                      ? selectedContact.profileImg
                      : ICONS.userIcon
                  }
                  style={{width: '80%', height: '80%'}}
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
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}>
                <TextInput
                  style={{
                    ...styles.memoInput,
                    width: 'auto',
                    maxWidth: '70%',
                    includeFontPadding: false,
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  }}
                  value={formatBalanceAmount(amountValue)}
                  readOnly={true}
                />
                {/* <TextInput
                    ref={amountRef}
                    placeholder="0"
                    placeholderTextColor={
                      theme ? COLORS.darkModeText : COLORS.lightModeText
                    }
                    onChangeText={setAmountValue}
                    keyboardType="decimal-pad"
                    value={amountValue}
                    autoFocus={true}
                    style={[
                      styles.memoInput,
                      {
                        width: 'auto',
                        maxWidth: '70%',
                        color: theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                        includeFontPadding: false,
                        padding: 0,
                        margin: 0,
                      },
                    ]}
                  /> */}
                <ThemeText
                  styles={{
                    fontSize: SIZES.xxLarge,
                    marginLeft: 5,
                    includeFontPadding: false,
                  }}
                  content={
                    masterInfoObject.userBalanceDenomination === 'sats' ||
                    masterInfoObject.userBalanceDenomination === 'hidden'
                      ? 'sats'
                      : nodeInformation.fiatStats.coin
                  }
                />
              </TouchableOpacity>

              {paymentType === 'send' && (
                <ThemeText
                  styles={{...CENTER, fontSize: SIZES.small}}
                  content={`${
                    canSendPayment
                      ? canUseLiquid
                        ? 'Transaction'
                        : 'Swap'
                      : 'Transaction'
                  } Fee: ${
                    !fees.boltzFee || !fees.liquidFees
                      ? 'Calculating...'
                      : formatBalanceAmount(
                          numberConverter(
                            canSendPayment
                              ? canUseLiquid
                                ? fees.liquidFees
                                : fees.boltzFee + fees.liquidFees
                              : fees.liquidFees,
                            'sats',
                            nodeInformation,
                          ),
                        )
                  } sats`}
                />
              )}

              <TextInput
                onFocus={() => {
                  setIsAmountFocused(false);
                }}
                ref={descriptionRef}
                placeholder="What's this for?"
                placeholderTextColor={
                  theme ? COLORS.darkModeText : COLORS.lightModeText
                }
                onChangeText={value => setDescriptionValue(value)}
                multiline={true}
                textAlignVertical="top"
                maxLength={150}
                lineBreakStrategyIOS="standard"
                value={descriptionValue}
                style={[
                  {
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    fontSize: SIZES.medium,
                    maxHeight: 80,
                    paddingHorizontal: 10,
                    borderRadius: 8,
                    borderColor: theme
                      ? COLORS.darkModeText
                      : COLORS.lightModeText,
                    borderWidth: 1,
                    marginTop: 'auto',
                    paddingVertical: 10,
                  },
                ]}
              />

              <CustomButton
                buttonStyles={{
                  opacity: canSendPayment ? 1 : 0.5,
                  width: '100%',
                  marginVertical: 5,
                }}
                textStyles={{textTransform: 'uppercase', fontSize: SIZES.large}}
                actionFunction={handleSubmit}
                textContent={paymentType === 'send' ? 'Send' : 'Request'}
              />

              {isAmountFocused && (
                <CustomNumberKeyboard
                  showDot={masterInfoObject.userBalanceDenomination === 'fiat'}
                  frompage="sendContactsPage"
                  setInputValue={setAmountValue}
                />
              )}
            </View>
          </View>
        )}
      </GlobalThemeView>
    </KeyboardAvoidingView>
  );
  async function handleSubmit() {
    const decodedContacts = JSON.parse(
      decryptMessage(
        contactsPrivateKey,
        publicKey,
        masterInfoObject.contacts.addedContacts,
      ),
    );
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
              masterInfoObject.contacts.myProfile.uuid,
              JSON.stringify(sendObject),
              masterInfoObject,
              toggleMasterInfoObject,
              paymentType,
              decodedContacts,
              publicKey,
            );
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
                decodedContacts,
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
          masterInfoObject.contacts.myProfile.uuid,
          JSON.stringify(sendObject),
          masterInfoObject,
          toggleMasterInfoObject,
          paymentType,
          decodedContacts,
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
    decodedContacts,
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
      masterInfoObject.contacts.myProfile.uuid,
      JSON.stringify(sendObject),
      masterInfoObject,
      toggleMasterInfoObject,
      paymentType,
      decodedContacts,
      publicKey,
    );
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
    width: 90,
    height: 90,
    borderRadius: 125,
    borderWidth: 5,
    backgroundColor: 'red',
    ...CENTER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  profileName: {
    width: '90%',
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Regular,
    fontWeight: 'bold',
    textAlign: 'center',
    ...CENTER,
    marginBottom: 10,
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
