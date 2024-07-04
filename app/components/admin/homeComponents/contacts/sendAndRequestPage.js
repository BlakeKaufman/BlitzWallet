import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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

export default function SendAndRequestPage(props) {
  const navigate = useNavigation();

  const {
    theme,
    nodeInformation,
    masterInfoObject,
    toggleMasterInfoObject,
    contactsPrivateKey,
    liquidNodeInformation,
  } = useGlobalContextProvider();
  const {setWebViewArgs, webViewRef} = useWebView();
  const [amountValue, setAmountValue] = useState(null);
  const [descriptionValue, setDescriptionValue] = useState('');
  const [swapPairInfo, setSwapPairInfo] = useState({});
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
    ? amountValue
    : Math.round(
        (SATSPERBITCOIN / nodeInformation?.fiatStats?.value) * amountValue,
      );

  console.log(convertedSendAmount);
  const canUseLiquid =
    liquidNodeInformation.userBalance >
      Number(convertedSendAmount) + fees.liquidFees + 500 &&
    convertedSendAmount > fees.liquidFees;
  const canUseLightning =
    nodeInformation.userBalance > Number(convertedSendAmount) + fees.boltzFee &&
    Number(convertedSendAmount) > swapPairInfo?.minimal &&
    Number(convertedSendAmount) < swapPairInfo?.maximal;

  const canSendPayment =
    paymentType === 'send'
      ? canUseLiquid || canUseLightning
      : Number(convertedSendAmount) > swapPairInfo?.minimal &&
        Number(convertedSendAmount) < swapPairInfo?.maximal;
  useEffect(() => {
    (async () => {
      const {liquidFees, boltzFee, boltzSwapInfo} =
        await getLiquidAndBoltzFees();
      setFees({
        liquidFees: liquidFees,
        boltzFee: boltzFee,
      });
      setSwapPairInfo(boltzSwapInfo);
    })();
  }, []);

  console.log(
    canSendPayment,
    liquidNodeInformation.userBalance,
    convertedSendAmount + fees.liquidFees,
    convertedSendAmount,
    fees.liquidFees,
  );

  return (
    <GlobalThemeView styles={{paddingBottom: 0}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={{flex: 1}}>
        <View style={{flex: 1}}>
          {/* This webview is used to call WASM code in browser as WASM code cannot be called in react-native */}
          {/* <WebviewForBoltzSwaps
            navigate={navigate}
            webViewRef={webViewRef}
            page={'contactsPage'}
          /> */}
          {/* <WebView
            javaScriptEnabled={true}
            ref={webViewRef}
            containerStyle={{position: 'absolute', top: 1000, left: 1000}}
            source={webviewHTML}
            originWhitelist={['*']}
            onMessage={event =>
              handleWebviewClaimMessage(navigate, event, 'contactsPage')
            }
          /> */}
          {isPerformingSwap ? (
            <View
              style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
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
                width: '95%',
                ...CENTER,
              }}>
              <TouchableOpacity onPress={navigate.goBack}>
                <Image
                  style={{width: 30, height: 30}}
                  source={ICONS.smallArrowLeft}
                />
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

                <View
                  style={[
                    styles.textInputContainer,
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                  ]}>
                  <TextInput
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
                  />
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
                </View>

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

                <TouchableOpacity
                  onPress={handleSubmit}
                  style={[
                    styles.button,
                    {
                      backgroundColor: theme
                        ? COLORS.darkModeText
                        : COLORS.lightModeText,
                      opacity: canSendPayment ? 1 : 0.5,
                    },
                  ]}>
                  <ThemeText
                    styles={{...styles.buttonText}}
                    reversed={true}
                    content={paymentType === 'send' ? 'Send' : 'Request'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </GlobalThemeView>
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
          navigate.navigate('ErrorScreen', {
            errorMessage:
              'You can only pay to contacts using funds from your bank currently.',
          });
          return;
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

          console.log(data);

          if (!data.invoice) {
            navigate.goBack();
            navigate.navigate('ErrorScreen', {
              errorMessage: 'Lightning payment failed',
            });

            return;
          }

          const paymentAddresss = data.invoice;

          const webSocket = new WebSocket(
            `${getBoltzWsUrl(process.env.BOLTZ_ENVIRONMENT)}`,
          );

          webSocket.onopen = () => {
            console.log('did un websocket open');
            webSocket.send(
              JSON.stringify({
                op: 'subscribe',
                channel: 'swap.update',
                args: [data?.id],
              }),
            );
          };
          webSocket.onmessage = async rawMsg => {
            const msg = JSON.parse(rawMsg.data);
            console.log(msg);
            // console.log(
            //   lntoLiquidSwapInfo,
            //   // lntoLiquidSwapInfo.keys.privateKey.toString('hex'),
            //   lntoLiquidSwapInfo.preimage,
            // );
            if (msg.args[0].status === 'swap.created') {
              // setIsPerformingSwap(true);
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
            } else if (msg.args[0].status === 'transaction.mempool') {
              getClaimReverseSubmarineSwapJS({
                address: selectedContact.receiveAddress,
                swapInfo: data,
                preimage: preimage,
                privateKey: keys.privateKey.toString('hex'),
              });
            } else if (msg.args[0].status === 'invoice.settled') {
              sendObject['amountMsat'] = sendingAmountMsat;
              sendObject['description'] = descriptionValue;
              sendObject['uuid'] = UUID;
              sendObject['isRequest'] = false;
              sendObject['isRedeemed'] = true;

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
              webSocket.close();
            }
          };
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

  function getClaimReverseSubmarineSwapJS({
    address,
    swapInfo,
    preimage,
    privateKey,
  }) {
    const args = JSON.stringify({
      apiUrl: getBoltzApiUrl(process.env.BOLTZ_ENVIRONMENT),
      network: process.env.BOLTZ_ENVIRONMENT,
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
    fontFamily: FONT.Other_Regular,
    fontSize: SIZES.large,
  },
});
