import {
  SafeAreaView,
  View,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import {
  CENTER,
  COLORS,
  FONT,
  ICONS,
  SATSPERBITCOIN,
  SIZES,
} from '../../../../../constants';

import {useGlobalContextProvider} from '../../../../../../context-store/context';

import {
  InputTypeVariant,
  PaymentStatus,
  parseInput,
  sendPayment,
  withdrawLnurl,
} from '@breeztech/react-native-breez-sdk';

import {formatBalanceAmount, numberConverter} from '../../../../../functions';
import {createNewAddedContactsList} from '../../../../../functions/contacts/createNewAddedContactsList';
import {
  decryptMessage,
  encriptMessage,
} from '../../../../../functions/messaging/encodingAndDecodingMessages';
import {getPublicKey} from 'nostr-tools';
import {sendLiquidTransaction} from '../../../../../functions/liquidWallet';
import {useNavigation} from '@react-navigation/native';
import {useState} from 'react';
import {contactsLNtoLiquidSwapInfo} from './LNtoLiquidSwap';
import {getBoltzWsUrl} from '../../../../../functions/boltz/boltzEndpoitns';
import handleReverseClaimWSS from '../../../../../functions/boltz/handle-reverse-claim-wss';
import {useWebView} from '../../../../../../context-store/webViewContext';
import FormattedSatText from '../../../../../functions/CustomElements/satTextDisplay';

export default function ContactsTransactionItem(props) {
  const transaction = props.transaction;
  const {
    theme,
    toggleMasterInfoObject,
    masterInfoObject,
    nodeInformation,
    contactsPrivateKey,
    liquidNodeInformation,
  } = useGlobalContextProvider();
  const {webViewRef, setWebViewArgs} = useWebView();
  const publicKey = getPublicKey(contactsPrivateKey);
  const navigate = useNavigation();

  const decodedAddedContacts =
    typeof masterInfoObject.contacts.addedContacts === 'string'
      ? JSON.parse(
          decryptMessage(
            contactsPrivateKey,
            publicKey,
            masterInfoObject.contacts.addedContacts,
          ),
        )
      : [];

  const endDate = new Date();
  const startDate = new Date(transaction.uuid * 1000);

  const timeDifferenceMs = endDate - startDate;
  const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60);
  const timeDifferenceHours = timeDifferenceMs / (1000 * 60 * 60);
  const timeDifferenceDays = timeDifferenceMs / (1000 * 60 * 60 * 24);

  const txParsed = isJSON(transaction.data)
    ? JSON.parse(transaction.data)
    : transaction.data;

  const [isLoading, setIsLoading] = useState(false);

  if (txParsed === undefined) return;

  const paymentDescription = txParsed.description || '';

  // return (
  //   <TouchableOpacity
  //     key={props.id}
  //     activeOpacity={!txParsed.isRedeemed ? 1 : 0.5}
  //     onPress={() => {
  //       if (!txParsed.isRedeemed) return;
  //       // props.navigate.navigate('ExpandedTx', {
  //       //   txId: props.details.data.paymentHash,
  //       // });
  //     }}>
  //     <ConfirmedOrSentTransaction
  //       txParsed={txParsed}
  //       paymentDescription={paymentDescription}
  //       timeDifferenceMinutes={timeDifferenceMinutes}
  //       timeDifferenceHours={timeDifferenceHours}
  //       timeDifferenceDays={timeDifferenceDays}
  //       props={props}
  //     />
  //   </TouchableOpacity>
  // );

  return (
    <View>
      {isLoading ? (
        <View style={{marginVertical: 20}}>
          <ActivityIndicator
            size="large"
            color={theme ? COLORS.darkModeText : COLORS.lightModeText}
          />
        </View>
      ) : (
        <TouchableOpacity key={props.id} activeOpacity={1}>
          {transaction.paymentType != 'request' ||
          txParsed.isRedeemed ||
          txParsed.isDeclined !== undefined ? (
            <ConfirmedOrSentTransaction
              txParsed={txParsed}
              paymentDescription={paymentDescription}
              timeDifferenceMinutes={timeDifferenceMinutes}
              timeDifferenceHours={timeDifferenceHours}
              timeDifferenceDays={timeDifferenceDays}
              props={props}
            />
          ) : transaction.paymentType ? (
            <View style={styles.transactionContainer}>
              {/* <View style={{flex: 1}}> */}
              <Image
                source={ICONS.smallArrowLeft}
                style={[
                  styles.icons,
                  {
                    transform: [
                      {
                        rotate: '130deg',
                      },
                    ],
                  },
                ]}
                resizeMode="contain"
              />
              {/* </View> */}
              <View style={{width: '100%', flex: 1}}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  {Object.keys(txParsed).includes('amountMsat') ? (
                    <FormattedSatText
                      frontText={
                        transaction.paymentType != 'send'
                          ? `${'Received'} request for `
                          : 'Accept '
                      }
                      iconHeight={15}
                      iconWidth={15}
                      styles={{
                        fontFamily: FONT.Title_Regular,
                        fontSize: SIZES.medium,
                        color: theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                        includeFontPadding: false,
                      }}
                      formattedBalance={formatBalanceAmount(
                        numberConverter(
                          txParsed.amountMsat / 1000,
                          masterInfoObject.userBalanceDenomination,
                          nodeInformation,
                          masterInfoObject.userBalanceDenomination === 'fiat'
                            ? 2
                            : 0,
                        ),
                      )}
                    />
                  ) : (
                    <Text
                      style={{
                        ...styles.amountText,
                        color: txParsed.isDeclined
                          ? COLORS.cancelRed
                          : theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                      }}>
                      N/A
                    </Text>
                  )}
                </View>

                {/* <Text
                  style={{
                    fontFamily: FONT.Title_Regular,
                    fontSize: SIZES.medium,
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  }}>
                  {`${
                    transaction.paymentType != 'send'
                      ? `${'Received'} request for`
                      : 'Accept'
                  } ${
                    Object.keys(txParsed).includes('amountMsat') &&
                    formatBalanceAmount(
                      numberConverter(
                        txParsed.amountMsat / 1000,
                        masterInfoObject.userBalanceDenomination,
                        nodeInformation,
                      ),
                    ) +
                      ` ${
                        masterInfoObject.userBalanceDenomination != 'fiat'
                          ? 'sats'
                          : nodeInformation.fiatStats.coin
                      }`
                  }`}
                </Text> */}
                <Text
                  style={[
                    styles.dateText,
                    {
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    },
                  ]}>
                  {timeDifferenceMinutes < 60
                    ? timeDifferenceMinutes < 1
                      ? ''
                      : Math.round(timeDifferenceMinutes)
                    : Math.round(timeDifferenceHours) < 24
                    ? Math.round(timeDifferenceHours)
                    : Math.round(timeDifferenceDays)}{' '}
                  {`${
                    Math.round(timeDifferenceMinutes) < 60
                      ? timeDifferenceMinutes < 1
                        ? 'Just now'
                        : Math.round(timeDifferenceMinutes) === 1
                        ? 'minute'
                        : 'minutes'
                      : Math.round(timeDifferenceHours) < 24
                      ? Math.round(timeDifferenceHours) === 1
                        ? 'hour'
                        : 'hours'
                      : Math.round(timeDifferenceDays) === 1
                      ? 'day'
                      : 'days'
                  } ${timeDifferenceMinutes > 1 ? 'ago' : ''}`}
                </Text>
                <Text
                  style={[
                    styles.descriptionText,
                    {
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                      marginBottom: 20,
                      fontWeight: 'normal',
                    },
                  ]}>
                  {paymentDescription.length > 15
                    ? paymentDescription.slice(0, 15) + '...'
                    : paymentDescription || 'No description'}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    acceptPayRequest(txParsed, props.selectedContact);
                  }}
                  style={[
                    styles.acceptOrPayBTN,
                    {
                      marginBottom: 10,
                      backgroundColor: COLORS.primary,
                    },
                  ]}>
                  <Text style={{color: COLORS.darkModeText}}>
                    {transaction.paymentType != 'send' ? 'Send' : 'Accept'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    declinePayment(transaction);
                  }}
                  style={[
                    styles.acceptOrPayBTN,
                    {
                      borderWidth: 1,
                      borderColor: COLORS.primary,
                    },
                  ]}>
                  <Text style={{color: COLORS.primary}}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <ActivityIndicator
              size={'large'}
              style={{marginBottom: 10}}
              color={theme ? COLORS.darkModeText : COLORS.lightModeText}
            />
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  function declinePayment(transaction) {
    setIsLoading(true);
    const selectedPaymentId = transaction.uuid;
    const selectedUserTransactions = [...props.selectedContact.transactions];

    const updatedTransactions = selectedUserTransactions.map(tx => {
      const txData = isJSON(tx.data) ? JSON.parse(tx.data) : tx.data;
      const txDataType = typeof txData === 'string';

      if (tx?.uuid === selectedPaymentId) {
        return {
          ...tx,
          data: txDataType ? txData : {...txData, isDeclined: true},
        };
      }
      return {...tx, data: txDataType ? txData : {...txData}};
    });

    toggleMasterInfoObject({
      contacts: {
        myProfile: {...masterInfoObject.contacts.myProfile},
        addedContacts: encriptMessage(
          contactsPrivateKey,
          publicKey,
          JSON.stringify(
            createNewAddedContactsList(
              decodedAddedContacts,
              props.selectedContact,
              updatedTransactions,
            ),
          ),
        ),
        // unaddedContacts:
        //   typeof masterInfoObject.contacts.unaddedContacts === 'string'
        //     ? masterInfoObject.contacts.unaddedContacts
        //     : [],
      },
    });
    setIsLoading(false);
    // props.toggleNostrContacts(
    //   {transactions: updatedTransactions},
    //   null,
    //   props.selectedContact,
    // );
    // console.log(updatedTransactions);
  }

  async function acceptPayRequest(parsedTx, selectedContact) {
    // console.log(parsedTx);
    setIsLoading(true);
    const sendingAmount = parsedTx.amountMsat / 1000;
    const txID = parsedTx.uuid;
    const selectedUserTransactions = [...selectedContact.transactions];

    console.log(sendingAmount);
    const updatedTransactions = selectedUserTransactions.map(tx => {
      const txData = isJSON(tx.data) ? JSON.parse(tx.data) : tx.data;
      const txDataType = typeof txData === 'string';
      // console.log(txData);

      if (txData.uuid === txID) {
        console.log('TRUE');
        console.log(txData);
        return {
          ...tx,
          data: txDataType ? txData : {...txData, isRedeemed: true},
        };
      } else return tx;
    });

    if (liquidNodeInformation.userBalance > sendingAmount + 500) {
      // console.log(updatedTransactions);

      const didPay = sendLiquidTransaction(
        sendingAmount,
        selectedContact.receiveAddress,
      );

      if (didPay) {
        updateTransactionData(updatedTransactions);
        // toggleMasterInfoObject({
        //   contacts: {
        //     myProfile: {...masterInfoObject.contacts.myProfile},
        //     addedContacts: encriptMessage(
        //       contactsPrivateKey,
        //       publicKey,
        //       JSON.stringify(
        //         createNewAddedContactsList(
        //           decodedAddedContacts,
        //           selectedContact,
        //           updatedTransactions,
        //         ),
        //       ),
        //     ),
        //     // unaddedContacts:
        //     //   typeof masterInfoObject.contacts.unaddedContacts === 'string'
        //     //     ? masterInfoObject.contacts.unaddedContacts
        //     //     : [],
        //   },
        // });
        // setIsLoading(false);
      } else {
        setIsLoading(false);
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Unable to pay request',
        });
      }
    } else if (nodeInformation.userBalance > sendingAmount + 50) {
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Can only pay to contacts from bank balance...',
      });
      return;
      const [
        data,
        swapPublicKey,
        privateKeyString,
        keys,
        preimage,
        liquidAddress,
      ] = await contactsLNtoLiquidSwapInfo(
        selectedContact.receiveAddress,
        sendingAmount,
      );

      if (!data?.invoice) {
        setIsLoading(false);
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Unable to pay request',
        });
        return;
      }
      const webSocket = new WebSocket(
        `${getBoltzWsUrl(process.env.BOLTZ_ENVIRONMENT)}`,
      );

      setWebViewArgs({navigate: navigate, page: 'contacts'});
      const didHandle = await handleReverseClaimWSS({
        ref: webViewRef,
        webSocket: webSocket,
        liquidAddress: liquidAddress,
        swapInfo: data,
        preimage: preimage,
        privateKey: keys.privateKey.toString('hex'),
        navigate: navigate,
      });
      if (didHandle) {
        try {
          const didSend = await sendPayment({
            bolt11: data.invoice,
          });
          if (didSend.payment.status === PaymentStatus.COMPLETE) {
            updateTransactionData(updatedTransactions);
          } else if (didSend.payment.status === PaymentStatus.FAILED) {
            webSocket.close();
            navigate.navigate('HomeAdmin');
            navigate.navigate('ConfirmTxPage', {
              for: 'paymentFailed',
              information: {},
            });
          }
        } catch (err) {
          console.log(err);
          webSocket.close();
          navigate.navigate('HomeAdmin');
          navigate.navigate('ConfirmTxPage', {
            for: 'paymentFailed',
            information: {},
          });
        }
      }
    } else {
      setIsLoading(false);
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Unable to pay request',
      });
    }

    return;
    console.log('IS RUNNING');
    // const selectedPaymentId = parsedTx.id;
    // const selectedUserTransactions = props.selectedContact.transactions;

    // try {
    //   const input = await parseInput(parsedTx.url);
    //   if (input.type === InputTypeVariant.LN_URL_WITHDRAW) {
    //     const response = await withdrawLnurl({
    //       data: input.data,
    //       amountMsat: input.data.minWithdrawable,
    //       description: input.data.defaultDescription,
    //     });

    //     if (response) console.log(response);
    //     else throw new Error('error');
    //   } else throw new Error('Not valid withdrawls LNURL');
    // } catch (err) {
    //   console.log(err);
    //   navigate.navigate('ErrorScreen', {
    //     errorMessage: 'Error receiving payment',
    //   });
    // } finally {
    //   const updatedTransactions = selectedUserTransactions.map(tx => {
    //     const txParsed = isJSON(tx.content)
    //       ? JSON.parse(tx.content)
    //       : tx.content;

    //     if (txParsed?.id === selectedPaymentId) {
    //       return {
    //         content: {...txParsed, isDeclined: false, isRedeemed: true},
    //         time: tx.time,
    //       };
    //     }
    //     return {content: {...txParsed}, time: tx.time};
    //   });

    //   console.log(
    //     createNewAddedContactsList(
    //       decodedAddedContacts,
    //       props.selectedContact,
    //       updatedTransactions,
    //     ),
    //   );

    //   return;

    //   toggleMasterInfoObject({
    //     contacts: {
    //       myProfile: {...masterInfoObject.contacts.myProfile},
    //       addedContacts: encriptMessage(
    //         contactsPrivateKey,
    //         publicKey,
    //         JSON.stringify(
    //           createNewAddedContactsList(
    //             decodedAddedContacts,
    //             props.selectedContact,
    //             updatedTransactions,
    //           ),
    //         ),
    //       ),
    //       unaddedContacts:
    //         typeof masterInfoObject.contacts.unaddedContacts === 'string'
    //           ? masterInfoObject.contacts.unaddedContacts
    //           : [],
    //     },
    //   });

    // props.toggleNostrContacts(
    //   {transactions: updatedTransactions},
    //   null,
    //   props.selectedContact,
    // );
    // console.log(updatedTransactions);
    // }
  }
  function updateTransactionData(updatedTransactions) {
    toggleMasterInfoObject({
      contacts: {
        myProfile: {...masterInfoObject.contacts.myProfile},
        addedContacts: encriptMessage(
          contactsPrivateKey,
          publicKey,
          JSON.stringify(
            createNewAddedContactsList(
              decodedAddedContacts,
              props.selectedContact,
              updatedTransactions,
            ),
          ),
        ),
        // unaddedContacts:
        //   typeof masterInfoObject.contacts.unaddedContacts === 'string'
        //     ? masterInfoObject.contacts.unaddedContacts
        //     : [],
      },
    });
    setIsLoading(false);
  }
}

function ConfirmedOrSentTransaction({
  txParsed,
  paymentDescription,
  timeDifferenceMinutes,
  timeDifferenceHours,
  timeDifferenceDays,
  props,
}) {
  const {theme, nodeInformation, masterInfoObject} = useGlobalContextProvider();

  console.log(props.transaction);
  return (
    <View style={[styles.transactionContainer, {alignItems: 'center'}]}>
      <Image
        source={ICONS.smallArrowLeft}
        style={[
          styles.icons,
          {
            transform: [
              {
                rotate: props.transaction.data?.isDeclined
                  ? '180deg'
                  : props.transaction.wasSent &&
                    !props.transaction.data?.isRequest
                  ? '130deg'
                  : '310deg',
              },
            ],
          },
        ]}
        resizeMode="contain"
      />

      <View>
        <Text
          style={[
            styles.descriptionText,
            {
              color: txParsed.isDeclined
                ? COLORS.cancelRed
                : theme
                ? COLORS.darkModeText
                : COLORS.lightModeText,
            },
          ]}>
          {paymentDescription.length > 15
            ? paymentDescription.slice(0, 15) + '...'
            : paymentDescription
            ? paymentDescription
            : props.transaction.wasSent
            ? `${
                props.transaction.data?.isRequest ? 'Payment request' : 'Sent'
              }`
            : `${
                props.transaction.data?.isRequest
                  ? 'Received payment request'
                  : 'Received'
              }`}
        </Text>
        <Text
          style={[
            styles.dateText,
            {
              color: txParsed.isDeclined
                ? COLORS.cancelRed
                : theme
                ? COLORS.darkModeText
                : COLORS.lightModeText,
            },
          ]}>
          {timeDifferenceMinutes < 60
            ? timeDifferenceMinutes < 1
              ? ''
              : Math.round(timeDifferenceMinutes)
            : Math.round(timeDifferenceHours) < 24
            ? Math.round(timeDifferenceHours)
            : Math.round(timeDifferenceDays)}{' '}
          {`${
            Math.round(timeDifferenceMinutes) < 60
              ? timeDifferenceMinutes < 1
                ? 'Just now'
                : Math.round(timeDifferenceMinutes) === 1
                ? 'minute'
                : 'minutes'
              : Math.round(timeDifferenceHours) < 24
              ? Math.round(timeDifferenceHours) === 1
                ? 'hour'
                : 'hours'
              : Math.round(timeDifferenceDays) === 1
              ? 'day'
              : 'days'
          } ${timeDifferenceMinutes > 1 ? 'ago' : ''}`}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginLeft: 'auto',
          marginBottom: 'auto',
        }}>
        {Object.keys(txParsed).includes('amountMsat') ? (
          <FormattedSatText
            frontText={
              props.transaction.data?.isDeclined
                ? ''
                : props.transaction.wasSent &&
                  !props.transaction.data?.isRequest
                ? '-'
                : '+'
            }
            iconHeight={15}
            iconWidth={15}
            styles={{
              ...styles.amountText,
              color: txParsed.isDeclined
                ? COLORS.cancelRed
                : theme
                ? COLORS.darkModeText
                : COLORS.lightModeText,
              includeFontPadding: false,
            }}
            formattedBalance={formatBalanceAmount(
              numberConverter(
                txParsed.amountMsat / 1000,
                masterInfoObject.userBalanceDenomination,
                nodeInformation,
                masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
              ),
            )}
          />
        ) : (
          <Text
            style={{
              ...styles.amountText,
              color: txParsed.isDeclined
                ? COLORS.cancelRed
                : theme
                ? COLORS.darkModeText
                : COLORS.lightModeText,
            }}>
            N/A
          </Text>
        )}
      </View>
      {/* <Text
        style={{
          ...styles.amountText,
          color: txParsed.isDeclined
            ? COLORS.cancelRed
            : theme
            ? COLORS.darkModeText
            : COLORS.lightModeText,
        }}>
        {`${
          props.transaction.data?.isDeclined
            ? ''
            : props.transaction.wasSent && !props.transaction.data?.isRequest
            ? '-'
            : '+'
        }${
          Object.keys(txParsed).includes('amountMsat')
            ? formatBalanceAmount(
                numberConverter(
                  txParsed.amountMsat / 1000,
                  masterInfoObject.userBalanceDenomination,
                  nodeInformation,
                ),
              ) +
              ` ${
                masterInfoObject.userBalanceDenomination != 'fiat'
                  ? 'sats'
                  : nodeInformation.fiatStats.coin
              }`
            : 'N/A'
        }`}
      </Text> */}
    </View>
  );
}

function isJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },
  topBar: {
    width: '95%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
    // backgroundColor: 'black',
    ...CENTER,
  },
  backButton: {
    width: 20,
    height: 20,
  },

  profileImage: {
    width: 150,
    height: 150,
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
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Regular,
    fontWeight: 'bold',
    ...CENTER,
  },
  buttonGlobalContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 25,
  },

  buttonContainer: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  buttonText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
  },

  gradient: {
    height: 100,
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },

  transactionContainer: {
    width: '95%',
    flexDirection: 'row',
    alignItems: 'start',
    marginVertical: 12.5,
    ...CENTER,
  },
  icons: {
    width: 30,
    height: 30,
    marginRight: 5,
  },

  descriptionText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Medium,
  },
  dateText: {
    fontFamily: FONT.Title_light,
    fontSize: SIZES.small,
  },
  amountText: {
    marginLeft: 'auto',
    fontFamily: FONT.Title_Medium,
    fontSize: SIZES.medium,
    marginBottom: 'auto',
  },
  transactionTimeBanner: {
    width: '100%',
    alignItems: 'center',

    fontFamily: FONT.Title_Bold,
    fontSize: SIZES.medium,

    padding: 5,
    borderRadius: 2,
    overflow: 'hidden',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    width: '85%',
    alignItems: 'center',
  },
  noTransactionsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noTransactionsText: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: FONT.Descriptoin_Regular,
  },

  mostRecentTxContainer: {
    width: 'auto',
    ...CENTER,
    alignItems: 'center',
  },

  acceptOrPayBTN: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 15,
    padding: 5,
    alignItems: 'center',
  },
});
