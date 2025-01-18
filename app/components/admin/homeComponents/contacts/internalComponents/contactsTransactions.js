import {
  View,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../../constants';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {formatBalanceAmount, numberConverter} from '../../../../../functions';
import {useNavigation} from '@react-navigation/native';
import {useState} from 'react';
import FormattedSatText from '../../../../../functions/CustomElements/satTextDisplay';
import GetThemeColors from '../../../../../hooks/themeColors';
import ThemeImage from '../../../../../functions/CustomElements/themeImage';
import {SATSPERBITCOIN} from '../../../../../constants/math';
import {assetIDS} from '../../../../../functions/liquidWallet/assetIDS';
import {ThemeText} from '../../../../../functions/CustomElements';
import {updateMessage} from '../../../../../../db';

export default function ContactsTransactionItem(props) {
  const transaction = props.transaction;
  const {theme, masterInfoObject, nodeInformation} = useGlobalContextProvider();
  const {textColor, backgroundColor} = GetThemeColors();
  const navigate = useNavigation();

  const endDate = new Date();
  const startDate = new Date(transaction.timestamp);

  const timeDifferenceMs = endDate - startDate;
  const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60);
  const timeDifferenceHours = timeDifferenceMs / (1000 * 60 * 60);
  const timeDifferenceDays = timeDifferenceMs / (1000 * 60 * 60 * 24);

  const txParsed = transaction.message;

  const [isLoading, setIsLoading] = useState(false);

  if (txParsed === undefined) return;

  const paymentDescription = txParsed.description || '';

  return (
    <View>
      {isLoading ? (
        <View style={{marginVertical: 20}}>
          <ActivityIndicator size="large" color={textColor} />
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => {
            if (!paymentDescription) return;
            if (
              !(
                txParsed.didSend ||
                !txParsed.isRequest ||
                (txParsed.isRequest && txParsed.isRedeemed != null)
              )
            )
              return;
            navigate.navigate('CustomHalfModal', {
              wantedContent: 'expandedContactMessage',
              sliderHight: 0.3,
              message: paymentDescription,
            });
          }}
          key={props.id}
          activeOpacity={1}>
          {txParsed.didSend ||
          !txParsed.isRequest ||
          (txParsed.isRequest && txParsed.isRedeemed != null) ? (
            <ConfirmedOrSentTransaction
              txParsed={txParsed}
              paymentDescription={paymentDescription}
              timeDifferenceMinutes={timeDifferenceMinutes}
              timeDifferenceHours={timeDifferenceHours}
              timeDifferenceDays={timeDifferenceDays}
              props={props}
            />
          ) : (
            <View style={styles.transactionContainer}>
              <ThemeImage
                styles={{
                  ...styles.icons,
                  transform: [
                    {
                      rotate: '130deg',
                    },
                  ],
                }}
                darkModeIcon={ICONS.smallArrowLeft}
                lightModeIcon={ICONS.smallArrowLeft}
                lightsOutIcon={ICONS.arrow_small_left_white}
              />

              <View style={{width: '100%', flex: 1}}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <FormattedSatText
                    frontText={`Received request for `}
                    iconHeight={15}
                    iconWidth={15}
                    styles={{
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
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
                </View>

                <Text
                  style={[
                    styles.dateText,
                    {
                      color: textColor,
                      marginBottom: paymentDescription ? 0 : 15,
                    },
                  ]}>
                  {timeDifferenceMinutes <= 60
                    ? timeDifferenceMinutes < 1
                      ? ''
                      : Math.round(timeDifferenceMinutes)
                    : timeDifferenceHours <= 24
                    ? Math.round(timeDifferenceHours)
                    : Math.round(timeDifferenceDays)}{' '}
                  {`${
                    timeDifferenceMinutes <= 60
                      ? timeDifferenceMinutes < 1
                        ? 'Just now'
                        : Math.round(timeDifferenceMinutes) === 1
                        ? 'minute'
                        : 'minutes'
                      : timeDifferenceHours <= 24
                      ? Math.round(timeDifferenceHours) === 1
                        ? 'hour'
                        : 'hours'
                      : Math.round(timeDifferenceDays) === 1
                      ? 'day'
                      : 'days'
                  } ${timeDifferenceMinutes > 1 ? 'ago' : ''}`}
                </Text>

                {paymentDescription && (
                  <Text
                    style={[
                      styles.descriptionText,
                      {
                        color: textColor,
                        marginBottom: 20,
                        fontWeight: 'normal',
                      },
                    ]}>
                    {paymentDescription.length > 15
                      ? paymentDescription.slice(0, 15) + '...'
                      : paymentDescription}
                  </Text>
                )}

                <TouchableOpacity
                  onPress={() => {
                    acceptPayRequest(transaction, props.selectedContact);
                  }}
                  style={[
                    styles.acceptOrPayBTN,
                    {
                      marginBottom: 10,
                      backgroundColor: theme ? textColor : COLORS.primary,
                    },
                  ]}>
                  <Text
                    style={{
                      color: backgroundColor,
                    }}>
                    Send
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    updatePaymentStatus(transaction, true, false);
                  }}
                  style={[
                    styles.acceptOrPayBTN,
                    {
                      borderWidth: 1,
                      borderColor: theme ? textColor : COLORS.primary,
                    },
                  ]}>
                  <Text
                    style={{
                      color: theme ? textColor : COLORS.primary,
                    }}>
                    Decline
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  function updatePaymentStatus(transaction, usingOnPage, didPay) {
    try {
      usingOnPage && setIsLoading(true);
      let newMessage = {
        ...transaction.message,
        isRedeemed: didPay,
      };
      delete newMessage.didSend;
      delete newMessage.wasSeen;

      updateMessage({
        newMessage,
        fromPubKey: transaction.fromPubKey,
        toPubKey: transaction.toPubKey,
      });
    } catch (err) {
      console.log(err);
      usingOnPage &&
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Unable to decline payment',
        });
    } finally {
      usingOnPage && setIsLoading(false);
    }
  }

  async function acceptPayRequest(transaction, selectedContact) {
    const sendingAmount = transaction.message.amountMsat / 1000;

    const receiveAddress = `${
      process.env.BOLTZ_ENVIRONMENT === 'testnet'
        ? 'liquidtestnet:'
        : 'liquidnetwork:'
    }${selectedContact.receiveAddress}?amount=${(
      sendingAmount / SATSPERBITCOIN
    ).toFixed(8)}&assetid=${assetIDS['L-BTC']}`;

    navigate.navigate('ConfirmPaymentScreen', {
      btcAdress: receiveAddress,
      fromPage: 'contacts',
      publishMessageFunc: () => updatePaymentStatus(transaction, false, true),
    });
    return;
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
  const {nodeInformation, masterInfoObject} = useGlobalContextProvider();
  const {textColor} = GetThemeColors();

  const didDeclinePayment = txParsed.isRedeemed != null && !txParsed.isRedeemed;

  return (
    <View style={[styles.transactionContainer, {alignItems: 'center'}]}>
      {didDeclinePayment ? (
        <Image style={styles.icons} source={ICONS.failedTransaction} />
      ) : (
        <ThemeImage
          styles={{
            ...styles.icons,
            transform: [
              {
                rotate: didDeclinePayment
                  ? '180deg'
                  : txParsed.didSend && !txParsed.isRequest
                  ? '130deg'
                  : '310deg',
              },
            ],
          }}
          darkModeIcon={ICONS.smallArrowLeft}
          lightModeIcon={ICONS.smallArrowLeft}
          lightsOutIcon={ICONS.arrow_small_left_white}
        />
      )}

      <View style={{width: '100%', flex: 1}}>
        <ThemeText
          CustomEllipsizeMode={'tail'}
          CustomNumberOfLines={1}
          styles={{
            ...styles.descriptionText,
            color: didDeclinePayment ? COLORS.cancelRed : textColor,
            marginRight: 15,
          }}
          content={
            didDeclinePayment
              ? txParsed.didSend
                ? 'Request declined'
                : 'Declined request'
              : txParsed.isRequest
              ? txParsed.didSend
                ? txParsed.isRedeemed === null
                  ? 'Payment request sent'
                  : 'Request paid'
                : paymentDescription || 'Paid request'
              : !!paymentDescription
              ? paymentDescription
              : txParsed.didSend
              ? 'Sent'
              : 'Received'
          }
        />
        <Text
          style={[
            styles.dateText,
            {
              color: didDeclinePayment ? COLORS.cancelRed : textColor,
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
        <FormattedSatText
          frontText={
            didDeclinePayment ||
            masterInfoObject.userBalanceDenomination === 'hidden'
              ? ''
              : txParsed.didSend && !txParsed.isRequest
              ? '-'
              : '+'
          }
          iconHeight={15}
          iconWidth={15}
          iconColor={didDeclinePayment ? COLORS.cancelRed : textColor}
          styles={{
            ...styles.amountText,
            color: didDeclinePayment ? COLORS.cancelRed : textColor,
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontFamily: FONT.Title_Regular,
    fontWeight: 400,
  },
  dateText: {
    fontFamily: FONT.Title_light,
    fontSize: SIZES.small,
  },
  amountText: {
    marginLeft: 'auto',
    fontFamily: FONT.Title_Regular,
    marginBottom: 'auto',
    fontWeight: 400,
  },

  acceptOrPayBTN: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 15,
    padding: 5,
    alignItems: 'center',
  },
});
