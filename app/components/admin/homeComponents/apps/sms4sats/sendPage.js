import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
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
import createLiquidToLNSwap from '../../../../../functions/boltz/liquidToLNSwap';
import {sendLiquidTransaction} from '../../../../../functions/liquidWallet';
import handleSubmarineClaimWSS from '../../../../../functions/boltz/handle-submarine-claim-wss';
import {getBoltzWsUrl} from '../../../../../functions/boltz/boltzEndpoitns';
import {useWebView} from '../../../../../../context-store/webViewContext';
import {
  getLocalStorageItem,
  setLocalStorageItem,
} from '../../../../../functions';
import {sendCountryCodes} from './sendCountryCodes';
import CustomNumberKeyboard from '../../../../../functions/CustomElements/customNumberKeyboard';

export default function SMSMessagingSendPage() {
  const {webViewRef} = useWebView();
  const {
    theme,
    liquidNodeInformation,
    nodeInformation,
    toggleMasterInfoObject,
    masterInfoObject,
    contactsPrivateKey,
  } = useGlobalContextProvider();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [areaCode, setAreaCode] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [didSend, setDidSend] = useState(false);
  const [focusedElement, setFocusedElement] = useState('');
  const phoneRef = useRef(null);
  const areaCodeRef = useRef(null);
  const messageRef = useRef(null);
  const intervalRef = useRef(null);
  const navigate = useNavigation();
  const [confirmedSendPayment, setConfirmedSendPayment] = useState(false);
  const [isNumberFocused, setIsNumberFocused] = useState(true);

  useEffect(() => {
    return () => {
      try {
        clearInterval(intervalRef.current);
      } catch (err) {
        console.log(err);
      }
    };
  }, []);

  useEffect(() => {
    if (!confirmedSendPayment) return;
    sendTextMessage();
  }, [confirmedSendPayment]);

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
              styles={{fontSize: SIZES.medium, ...CENTER, marginTop: 20}}
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
                }}
                content={
                  phoneNumber.length > 10
                    ? phoneNumber
                    : phoneNumber.length === 0
                    ? '(123) 456-7891'
                    : `${`(${phoneNumber.slice(0, 3)}${
                        phoneNumber.length === 1 || phoneNumber.length === 2
                          ? ' '
                          : ''
                      })`} ${`${phoneNumber.slice(3, 6)}`}${
                        phoneNumber.length > 6 ? `-${phoneNumber.slice(6)}` : ''
                      }`
                }
              />
            </TouchableOpacity>

            <ThemeText
              styles={{fontSize: SIZES.medium, ...CENTER, marginTop: 20}}
              content={'Phone number country'}
            />
            <TouchableOpacity
              style={{flexDirection: 'row', justifyContent: 'center'}}
              onPress={() => {
                areaCodeRef.current.focus();
              }}>
              {/* <ThemeText
              styles={{
                ...styles.areaCodeInput,
              }}
              content={'+'}
            /> */}
              <ThemeText
                styles={{
                  ...styles.areaCodeInput,
                  textAlign: 'center',
                  opacity: areaCode.length === 0 ? 0.5 : 1,
                }}
                content={areaCode.length === 0 ? 'United States' : areaCode}
              />
            </TouchableOpacity>

            {focusedElement === 'country' && (
              <FlatList
                style={{marginVertical: 10}}
                data={sendCountryCodes.filter(item =>
                  item.country.toLowerCase().startsWith(areaCode.toLowerCase()),
                )}
                renderItem={({item}) => (
                  <TouchableOpacity
                    key={item.country}
                    onPress={() => {
                      setAreaCode(item.country);
                      messageRef.current.focus();
                    }}>
                    <ThemeText
                      styles={{fontSize: SIZES.large, textAlign: 'center'}}
                      content={item.country}
                    />
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            )}

            <TextInput
              multiline={true}
              textAlignVertical="top"
              lineBreakStrategyIOS="standard"
              style={[
                styles.messageInput,
                {
                  backgroundColor: theme
                    ? COLORS.darkModeBackgroundOffset
                    : COLORS.lightModeBackgroundOffset,
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                },
              ]}
              onChangeText={e => setMessage(e)}
              placeholder="Message"
              placeholderTextColor={
                theme ? COLORS.darkModeText : COLORS.lightModeText
              }
              ref={messageRef}
              maxLength={135}
              onFocus={() => {
                setIsNumberFocused(false);
                setFocusedElement('message');
              }}
            />

            <TouchableOpacity
              onPress={() => {
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

                navigate.navigate('ConfirmActionPage', {
                  wantsToDrainFunc: setConfirmedSendPayment,
                  confirmMessage: `Is this the correct phone number: ${selectedAreaCode[0].cc}${phoneNumber}`,
                });
                return;
              }}
              style={[
                styles.button,
                {
                  opacity:
                    phoneNumber.length === 0 ||
                    message.length === 0 ||
                    areaCode.length === 0
                      ? 0.5
                      : 1,
                  backgroundColor: theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                  marginTop: 10,
                  marginBottom: Platform.OS === 'ios' ? 10 : 0,
                },
              ]}>
              <ThemeText
                reversed={true}
                styles={{textAlign: 'center', paddingVertical: 10}}
                content={'Send Message'}
              />
            </TouchableOpacity>
            {/* </ScrollView> */}
            {isNumberFocused && (
              <CustomNumberKeyboard
                setInputValue={setPhoneNumber}
                frompage={'sendSMSPage'}
              />
            )}
          </View>
        </TouchableWithoutFeedback>
      ) : didSend ? (
        <View
          style={[
            styles.sendPage,
            {alignItems: 'center', justifyContent: 'center'},
          ]}>
          <ThemeText styles={{fontSize: SIZES.huge}} content={'Payment Sent'} />
        </View>
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

  async function sendTextMessage() {
    setIsSending(true);
    const payload = {
      message: message,
      phone: `${selectedAreaCode[0].cc}${phoneNumber}`,
      ref: process.env.GPT_PAYOUT_LNURL,
    };

    console.log(payload);

    try {
      let savedRequests =
        JSON.parse(await getLocalStorageItem('savedSMS4SatsIds')) || [];
      const response = (
        await axios.post(`https://api2.sms4sats.com/createsendorder`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      ).data;
      savedRequests.push(response.orderId);
      setLocalStorageItem('savedSMS4SatsIds', JSON.stringify(savedRequests));

      listenForConfirmation(response);

      const parsedInput = await parseInput(response.payreq);
      const sendingAmountSat = parsedInput.invoice.amountMsat / 1000;
      if (nodeInformation.userBalance > sendingAmountSat + 100) {
        try {
          const lnResponse = await sendPayment({bolt11: response.payreq});

          navigate.navigate('HomeAdmin');
          navigate.navigate('ConfirmTxPage', {
            for: lnResponse.type,
            information: lnResponse,
          });
        } catch (err) {
          try {
            const paymentHash = parsedInput.invoice.paymentHash;
            await reportIssue({
              type: ReportIssueRequestVariant.PAYMENT_FAILURE,
              data: {paymentHash},
            });
          } catch (err) {
            console.log(err);
          }
        }
      } else if (liquidNodeInformation.userBalance > sendingAmountSat + 500) {
        const {swapInfo, privateKey} = await createLiquidToLNSwap(
          response.payreq,
        );
        if (!swapInfo?.expectedAmount || !swapInfo?.address) {
          setHasError(true);
          return;
        }

        const refundJSON = {
          id: swapInfo.id,
          asset: 'L-BTC',
          version: 3,
          privateKey: privateKey,
          blindingKey: swapInfo.blindingKey,
          claimPublicKey: swapInfo.claimPublicKey,
          timeoutBlockHeight: swapInfo.timeoutBlockHeight,
          swapTree: swapInfo.swapTree,
        };
        const webSocket = new WebSocket(
          `${getBoltzWsUrl(process.env.BOLTZ_ENVIRONMENT)}`,
        );

        const didHandle = await handleSubmarineClaimWSS({
          ref: webViewRef,
          webSocket: webSocket,
          invoiceAddress: response.payreq,
          swapInfo,
          privateKey,
          toggleMasterInfoObject,
          masterInfoObject,
          contactsPrivateKey,
          refundJSON,
          navigate,
          page: 'sms4sats',
        });
        if (didHandle) {
          const didSend = await sendLiquidTransaction(
            swapInfo.expectedAmount,
            swapInfo.address,
          );

          if (!didSend) {
            webSocket.close();
            setHasError(true);
          }
        }
      } else {
        setHasError(true);
      }
    } catch (err) {
      setHasError(true);
      console.log(err);
    }
  }

  async function listenForConfirmation(data) {
    intervalRef.current = setInterval(async () => {
      const response = (
        await axios.get(
          `https://api2.sms4sats.com/orderstatus?orderId=${data.orderId}`,
        )
      ).data;
      if (response.paid && response?.smsStatus === 'delivered') {
        clearInterval(intervalRef.current);
        let savedIds = JSON.parse(
          await getLocalStorageItem('savedSMS4SatsIds'),
        );
        savedIds.pop();
        setLocalStorageItem('savedSMS4SatsIds', JSON.stringify(savedIds));
        setDidSend(true);
      } else if (response.paid && response.smsStatus === 'failed') {
        setHasError(true);
      }
    }, 5000);
  }
}

const styles = StyleSheet.create({
  sendPage: {
    flex: 1,
  },

  phoneNumberInput: {
    width: '95%',
    maxHeight: 100,
    fontSize: SIZES.xxLarge,
    ...CENTER,
    marginTop: 10,
  },
  areaCodeInput: {
    fontSize: SIZES.xxLarge,
    marginTop: 10,
  },

  messageInput: {
    marginTop: 'auto',
    width: '100%',
    maxHeight: 120,
    borderRadius: 8,
    padding: 10,
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
