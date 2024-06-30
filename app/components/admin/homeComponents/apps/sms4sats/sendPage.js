import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {ThemeText} from '../../../../../functions/CustomElements';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../../constants';
import {useEffect, useRef, useState} from 'react';
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
  const phoneRef = useRef(null);
  const areaCodeRef = useRef(null);
  const messageRef = useRef(null);
  const intervalRef = useRef(null);
  const navigate = useNavigation();

  return (
    <>
      {!isSending ? (
        <View style={styles.sendPage}>
          <ThemeText
            styles={{fontSize: SIZES.medium, ...CENTER, marginTop: 20}}
            content={'Enter phone number'}
          />
          <TextInput
            autoFocus={true}
            style={{width: 0, height: 0}}
            onChangeText={e => setPhoneNumber(e)}
            ref={phoneRef}
            keyboardType="number-pad"
          />
          <TouchableOpacity
            onPress={() => {
              console.log(phoneRef);
              phoneRef.current.focus();
            }}>
            <ThemeText
              styles={{
                ...styles.phoneNumberInput,
                textAlign: 'center',
                opacity: phoneNumber.length === 0 ? 0.5 : 1,
              }}
              content={
                phoneNumber.length === 0
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
            content={'Area code'}
          />
          <TouchableOpacity
            style={{flexDirection: 'row', justifyContent: 'center'}}
            onPress={() => {
              areaCodeRef.current.focus();
            }}>
            <ThemeText
              styles={{
                ...styles.areaCodeInput,
              }}
              content={'+'}
            />
            <ThemeText
              styles={{
                ...styles.areaCodeInput,
                textAlign: 'center',
                opacity: areaCode.length === 0 ? 0.5 : 1,
              }}
              content={areaCode.length === 0 ? '1' : areaCode}
            />
          </TouchableOpacity>
          <TextInput
            style={{width: 0, height: 0}}
            onChangeText={e => setAreaCode(e)}
            ref={areaCodeRef}
            keyboardType="number-pad"
          />

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
              }

              sendTextMessage();
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
              },
            ]}>
            <ThemeText
              reversed={true}
              styles={{textAlign: 'center', paddingVertical: 10}}
              content={'Send Message'}
            />
          </TouchableOpacity>
        </View>
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
      phone: `+${areaCode}${phoneNumber}`,
      ref: process.env.GPT_PAYOUT_LNURL,
    };

    try {
      const response = (
        await axios.post(`https://api2.sms4sats.com/createsendorder`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      ).data;
      console.log(response);

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
      console.log(err);
    }
  }

  function listenForConfirmation(data) {
    intervalRef.current = setInterval(async () => {
      const response = (
        await axios.get(
          `https://api2.sms4sats.com/orderstatus?orderId=${data.orderId}`,
        )
      ).data;
      console.log(response, 'API REponse');
      if (response.paid) {
        clearInterval(intervalRef.current);
        setDidSend(true);
      }
      //    else if (response.smsStatus === 'failed') {
      //     setHasError(true);
      //   }
    }, 5000);
  }
}

const styles = StyleSheet.create({
  sendPage: {
    flex: 1,
  },

  phoneNumberInput: {
    width: '95%',
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

    marginVertical: 10,
    borderRadius: 8,
  },
});
