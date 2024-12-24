import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {ThemeText} from '../../../../../functions/CustomElements';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../../constants';
import {useEffect, useMemo, useRef, useState} from 'react';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import {
  ReportIssueRequestVariant,
  parseInput,
  reportIssue,
  sendPayment,
} from '@breeztech/react-native-breez-sdk';
import {useWebView} from '../../../../../../context-store/webViewContext';
import {sendCountryCodes} from './sendCountryCodes';
import CustomNumberKeyboard from '../../../../../functions/CustomElements/customNumberKeyboard';
import {KEYBOARDTIMEOUT} from '../../../../../constants/styles';
import {AsYouType} from 'libphonenumber-js';
import CustomButton from '../../../../../functions/CustomElements/button';
import {
  LIGHTNINGAMOUNTBUFFER,
  LIQUIDAMOUTBUFFER,
} from '../../../../../constants/math';
import {getPublicKey} from 'nostr-tools';
import {encriptMessage} from '../../../../../functions/messaging/encodingAndDecodingMessages';
import {useGlobalAppData} from '../../../../../../context-store/appData';
import GetThemeColors from '../../../../../hooks/themeColors';
import CountryFlag from 'react-native-country-flag';
import CustomSearchInput from '../../../../../functions/CustomElements/searchInput';
import {breezPaymentWrapper} from '../../../../../functions/SDK';
import {breezLiquidPaymentWrapper} from '../../../../../functions/breezLiquid';

export default function SMSMessagingSendPage({SMSprices}) {
  const {webViewRef, setWebViewArgs, toggleSavedIds} = useWebView();
  const {
    theme,
    liquidNodeInformation,
    nodeInformation,
    contactsPrivateKey,
    minMaxLiquidSwapAmounts,
  } = useGlobalContextProvider();
  const {decodedMessages, toggleGlobalAppDataInformation} = useGlobalAppData();
  const publicKey = getPublicKey(contactsPrivateKey);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [areaCode, setAreaCode] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [focusedElement, setFocusedElement] = useState('country');
  const phoneRef = useRef(null);
  const areaCodeRef = useRef(null);
  const messageRef = useRef(null);
  const intervalRef = useRef(null);
  const navigate = useNavigation();
  const [isNumberFocused, setIsNumberFocused] = useState(false);
  const {textColor, backgroundColor} = GetThemeColors();

  useEffect(() => {
    return () => {
      try {
        clearInterval(intervalRef.current);
      } catch (err) {
        console.log(err);
      }
    };
  }, []);

  const selectedAreaCode = useMemo(() => {
    return sendCountryCodes.filter(
      item => item.country.toLowerCase() === areaCode.toLowerCase(),
    );
  }, [areaCode]);

  // make sure to save orderID number and then remove orderID number when payment sends
  return (
    <>
      {!isSending ? (
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
            setIsNumberFocused(false);
            setFocusedElement('');
          }}>
          <View style={styles.sendPage}>
            {/* <ScrollView showsVerticalScrollIndicator={false}> */}
            <TextInput
              // autoFocus={true}
              style={styles.textInputHidden}
              onChangeText={e => setPhoneNumber(e)}
              ref={phoneRef}
              keyboardType="number-pad"
              maxLength={15}
              onFocus={() => setFocusedElement('phoneNumber')}
            />
            <TextInput
              style={styles.textInputHidden}
              onChangeText={e => setAreaCode(e)}
              ref={areaCodeRef}
              keyboardType="ascii-capable"
              onFocus={() => {
                setFocusedElement('country');
                setIsNumberFocused(false);
              }}
              value={areaCode}
            />
            <ThemeText
              styles={{...CENTER, marginTop: 20}}
              content={'Enter phone number'}
            />

            <TouchableOpacity
              onPress={() => {
                // phoneRef.current.focus();
                setFocusedElement('phoneNumber');
                Keyboard.dismiss();
                setTimeout(() => {
                  setIsNumberFocused(true);
                }, 200);
              }}>
              <ThemeText
                styles={{
                  ...styles.phoneNumberInput,
                  textAlign: 'center',
                  opacity: phoneNumber.length === 0 ? 0.5 : 1,
                  color: textColor,
                }}
                content={
                  phoneNumber.length > 15
                    ? phoneNumber.slice(0, 15) + '...'
                    : phoneNumber.length === 0
                    ? '(123) 456-7891'
                    : `${new AsYouType().input(
                        `${selectedAreaCode[0]?.cc || '+1'}${phoneNumber}`,
                      )}`
                }
              />
            </TouchableOpacity>

            <ThemeText
              styles={{...CENTER, marginTop: 20}}
              content={'Phone number country'}
            />
            <TouchableOpacity
              style={{flexDirection: 'row', justifyContent: 'center'}}
              onPress={() => {
                areaCodeRef.current.focus();
              }}>
              <ThemeText
                styles={{
                  ...styles.areaCodeInput,
                  textAlign: 'center',
                  opacity: areaCode.length === 0 ? 0.5 : 1,
                }}
                content={areaCode.length === 0 ? 'United States' : areaCode}
              />
            </TouchableOpacity>

            {(focusedElement === 'country' || !focusedElement) && (
              <FlatList
                contentContainerStyle={{paddingVertical: 10}}
                data={sendCountryCodes
                  .filter(item =>
                    item.country
                      .toLowerCase()
                      .startsWith(areaCode.toLowerCase()),
                  )
                  .sort((a, b) => a.country.localeCompare(b.country))}
                renderItem={({item}) => {
                  return (
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        marginVertical: 15,
                      }}
                      key={item.country}
                      onPress={() => {
                        setAreaCode(item.country);
                        messageRef.current.focus();
                      }}>
                      <CountryFlag isoCode={item.isoCode} size={20} />

                      <ThemeText
                        styles={{marginLeft: 10}}
                        content={item.country}
                      />
                    </TouchableOpacity>
                  );
                }}
                showsVerticalScrollIndicator={false}
                maxToRenderPerBatch={10}
              />
            )}

            <CustomSearchInput
              onFocusFunction={() => {
                setIsNumberFocused(false);
                setFocusedElement('message');
              }}
              textInputRef={messageRef}
              setInputText={setMessage}
              inputText={message}
              placeholderText={'Message'}
              maxLength={135}
              textInputMultiline={true}
              containerStyles={{
                marginTop: 'auto',
                maxHeight: 120,
              }}
            />

            <CustomButton
              buttonStyles={{
                width: 'auto',
                marginTop: 5,
                marginBottom: Platform.OS === 'ios' ? 5 : 0,

                opacity:
                  phoneNumber.length === 0 ||
                  message.length === 0 ||
                  areaCode.length === 0
                    ? 0.5
                    : 1,
                ...CENTER,
              }}
              textStyles={{
                paddingVertical: 10,
                color: theme ? backgroundColor : COLORS.lightModeText,
              }}
              actionFunction={handleSubmit}
              textContent={'Send message'}
            />

            {isNumberFocused && (
              <CustomNumberKeyboard
                setInputValue={setPhoneNumber}
                frompage={'sendSMSPage'}
              />
            )}
          </View>
        </TouchableWithoutFeedback>
      ) : (
        <View
          style={[
            styles.sendPage,
            {alignItems: 'center', justifyContent: 'center'},
          ]}>
          <ActivityIndicator
            size={'large'}
            color={theme ? COLORS.darkModeText : COLORS.lightModeText}
          />
          <ThemeText
            styles={{marginTop: 10}}
            content={
              hasError ? 'Error sending message, try again!' : 'Sending message'
            }
          />
        </View>
      )}
    </>
  );

  function handleSubmit() {
    if (
      phoneNumber.length === 0 ||
      message.length === 0 ||
      areaCode.length === 0
    ) {
      navigate.navigate('ErrorScreen', {
        errorMessage: `Must have a ${
          phoneNumber.length === 0
            ? 'phone number'
            : message.length === 0
            ? 'message'
            : 'area code'
        }`,
      });
      return;
    } else if (selectedAreaCode.length === 0) {
      navigate.navigate('ErrorScreen', {
        errorMessage: `Not a valid country`,
      });
      return;
    }

    Keyboard.dismiss();
    setTimeout(() => {
      navigate.navigate('CustomHalfModal', {
        wantedContent: 'confirmSMS',
        prices: SMSprices,
        phoneNumber: phoneNumber,
        areaCodeNum: selectedAreaCode[0].cc,
        sendTextMessage: sendTextMessage,
        sliderHight: 0.5,
      });
    }, KEYBOARDTIMEOUT);

    return;
  }

  async function sendTextMessage() {
    setIsSending(true);
    const payload = {
      message: message,
      phone: `${selectedAreaCode[0].cc}${phoneNumber}`,
      ref: process.env.GPT_PAYOUT_LNURL,
    };

    let savedMessages = JSON.parse(JSON.stringify(decodedMessages));

    try {
      // let savedRequests =
      //   JSON.parse(await getLocalStorageItem('savedSMS4SatsIds')) || [];
      const response = (
        await axios.post(`https://api2.sms4sats.com/createsendorder`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      ).data;
      // savedRequests.push({
      //   orderId: response.orderId,
      //   message: message,
      //   phone: `${selectedAreaCode[0].cc}${phoneNumber}`,
      // });
      // setLocalStorageItem('savedSMS4SatsIds', JSON.stringify(savedRequests));

      savedMessages.sent.push({
        orderId: response.orderId,
        message: message,
        phone: `${selectedAreaCode[0].cc}${phoneNumber}`,
      });

      // listenForConfirmation(response, savedMessages);

      const parsedInput = await parseInput(response.payreq);
      const sendingAmountSat = parsedInput.invoice.amountMsat / 1000;

      if (
        nodeInformation.userBalance >
        sendingAmountSat + LIGHTNINGAMOUNTBUFFER
      ) {
        // try {
        await breezPaymentWrapper({
          paymentInfo: parsedInput,
          amountMsat: parsedInput?.invoice?.amountMsat,
          paymentDescription: 'Store - SMS',
          failureFunction: paymentResponse => {
            navigate.reset({
              index: 0, // The top-level route index
              routes: [
                {
                  name: 'HomeAdmin',
                  params: {screen: 'Home'},
                },
                {
                  name: 'ConfirmTxPage',
                  params: {
                    for: 'paymentFailed',
                    information: paymentResponse,
                    formattingType: 'lightningNode',
                  },
                },
              ],
            });
          },
          confirmFunction: paymentResponse => {
            listenForConfirmation(
              response,
              savedMessages,
              paymentResponse,
              'lightningNode',
            );
          },
        });
        // await sendPayment({bolt11: response.payreq, useTrampoline: false});
        // } catch (err) {
        //   try {
        //     setHasError(true);
        //     const paymentHash = parsedInput.invoice.paymentHash;
        //     await reportIssue({
        //       type: ReportIssueRequestVariant.PAYMENT_FAILURE,
        //       data: {paymentHash},
        //     });
        //   } catch (err) {
        //     console.log(err);
        //   }
        // }
      } else if (
        liquidNodeInformation.userBalance >
        sendingAmountSat + LIQUIDAMOUTBUFFER
      ) {
        if (sendingAmountSat < minMaxLiquidSwapAmounts.min) {
          navigate.navigate('ErrorScreen', {
            errorMessage: `Cannot send payment less than ${formatBalanceAmount(
              minMaxLiquidSwapAmounts.min,
            )} sats using the bank`,
          });
          return;
        }
        const response = await breezLiquidPaymentWrapper({
          paymentType: 'bolt11',
          invoice: response.payreq,
        });

        if (!response.didWork) {
          navigate.navigate('ErrorScreen', {
            errorMessage: 'Error paying with liquid',
          });
          setIsSending(false);
        }
        listenForConfirmation(
          response,
          savedMessages,
          response.payment,
          'liquidNode',
        );
        return;
        // const {swapInfo, privateKey} = await createLiquidToLNSwap(
        //   response.payreq,
        // );
        // if (!swapInfo?.expectedAmount || !swapInfo?.address) {
        //   setHasError(true);
        //   return;
        // }
        // setWebViewArgs({navigate, page: 'sms4sats'});

        // const refundJSON = {
        //   id: swapInfo.id,
        //   asset: 'L-BTC',
        //   version: 3,
        //   privateKey: privateKey,
        //   blindingKey: swapInfo.blindingKey,
        //   claimPublicKey: swapInfo.claimPublicKey,
        //   timeoutBlockHeight: swapInfo.timeoutBlockHeight,
        //   swapTree: swapInfo.swapTree,
        // };
        // const webSocket = new WebSocket(
        //   `${getBoltzWsUrl(process.env.BOLTZ_ENVIRONMENT)}`,
        // );

        // const didHandle = await handleSubmarineClaimWSS({
        //   ref: webViewRef,
        //   webSocket: webSocket,
        //   invoiceAddress: response.payreq,
        //   swapInfo,
        //   privateKey,
        //   toggleMasterInfoObject: null,
        //   masterInfoObject: null,
        //   contactsPrivateKey,
        //   refundJSON,
        //   navigate,
        //   page: 'sms4sats',
        // });
        // if (didHandle) {
        //   const didSend = await sendLiquidTransaction(
        //     swapInfo.expectedAmount,
        //     swapInfo.address,
        //     true,
        //     false,
        //     toggleSavedIds,
        //   );

        //   if (!didSend) {
        //     webSocket.close();
        //     setHasError(true);
        //   }
        // }
      } else {
        setHasError(true);
      }
    } catch (err) {
      setHasError(true);
      console.log(err);
    }
  }

  async function listenForConfirmation(
    data,
    savedMessages,
    paymentResponse,
    formmatingType,
  ) {
    saveMessagesToDB(savedMessages);

    let didSettleInvoice = false;
    let runCount = 0;

    while (!didSettleInvoice && runCount < 10) {
      try {
        runCount += 1;
        const resposne = await fetch(
          `https://api2.sms4sats.com/orderstatus?orderId=${data.orderId}`,
        );
        const smsData = await resposne.json();

        if (
          smsData.paid &&
          (smsData.smsStatus === 'delivered' || smsData.smsStatus === 'sent')
        ) {
          didSettleInvoice = true;
          navigate.reset({
            index: 0, // The top-level route index
            routes: [
              {
                name: 'HomeAdmin',
                params: {screen: 'Home'},
              },
              {
                name: 'ConfirmTxPage',
                params: {
                  for: 'paymentSucceed',
                  information: paymentResponse,
                  formattingType: formmatingType,
                },
              },
            ],
          });
        } else {
          console.log('Waiting for confirmation....');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } catch (err) {
        console.log(err);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    if (!didSettleInvoice) setHasError(true);

    return;
    // let tries = 0;
    // intervalRef.current = setInterval(async () => {
    //   const response = (
    //     await axios.get(
    //       `https://api2.sms4sats.com/orderstatus?orderId=${data.orderId}`,
    //     )
    //   ).data;
    //   if (tries > 10) {
    //     clearInterval(intervalRef.current);
    //     setHasError(true);
    //     return;
    //   }
    //   tries += 1;
    //   if (response.paid && response?.smsStatus === 'delivered') {
    //     clearInterval(intervalRef.current);

    //     setAreaCode('');
    //     setPhoneNumber('');
    //     setMessage('');
    //     navigate.navigate('ConfirmTxPage', {fromPage: 'sendSMSPage'});
    //     // setDidSend(true);
    //   } else if (response.paid && response.smsStatus === 'failed') {
    //     clearInterval(intervalRef.current);
    //     setHasError(true);
    //   }
    // }, 5000);
  }

  async function saveMessagesToDB(messageObject) {
    const em = encriptMessage(
      contactsPrivateKey,
      publicKey,
      JSON.stringify(messageObject),
    );

    toggleGlobalAppDataInformation({messagesApp: em}, true);
  }
}

const styles = StyleSheet.create({
  sendPage: {
    flex: 1,
  },

  phoneNumberInput: {
    width: '95%',
    fontSize: SIZES.xLarge,
    fontFamily: FONT.Title_Regular,
    ...CENTER,
    marginTop: 10,
  },
  areaCodeInput: {
    fontSize: SIZES.xLarge,
    marginTop: 10,
  },

  button: {
    width: '100%',
    borderRadius: 8,
  },
  textInputHidden: {
    width: 0,
    height: 0,
    position: 'absolute',
    left: 1000,
    top: 1000,
  },
});
