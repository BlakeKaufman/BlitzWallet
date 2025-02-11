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
import {getFiatRates} from '../../../../../functions/SDK';
import {sendPushNotification} from '../../../../../functions/messaging/publishMessage';
import FullLoadingScreen from '../../../../../functions/CustomElements/loadingScreen';

export default function ContactsTransactionItem(props) {
  const {selectedContact, transaction, myProfile} = props;
  const {theme, masterInfoObject, nodeInformation} = useGlobalContextProvider();
  const {textColor, backgroundColor} = GetThemeColors();
  const navigate = useNavigation();

  const endDate = new Date();
  const startDate = new Date(transaction.timestamp);

  const timeDifferenceMs = endDate - startDate;
  const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60);
  const timeDifferenceHours = timeDifferenceMs / (1000 * 60 * 60);
  const timeDifferenceDays = timeDifferenceMs / (1000 * 60 * 60 * 24);
  const timeDifferenceYears = timeDifferenceMs / (1000 * 60 * 60 * 24 * 365);

  const txParsed = transaction.message;

  const [isLoading, setIsLoading] = useState(false);

  if (txParsed === undefined) return;

  const paymentDescription = txParsed.description || '';

  return (
    <View>
      {isLoading ? (
        <FullLoadingScreen containerStyles={{marginVertical: 20}} />
      ) : (
        <TouchableOpacity
          onPress={() => {
            if (!paymentDescription) return;
            // if (
            //   !(
            //     txParsed.didSend ||
            //     !txParsed.isRequest ||
            //     (txParsed.isRequest && txParsed.isRedeemed != null)
            //   )
            // )
            //   return;
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
                <FormattedSatText
                  frontText={`Received request for `}
                  neverHideBalance={true}
                  containerStyles={styles.requestTextContainer}
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

                <ThemeText
                  styles={{
                    ...styles.dateText,
                    marginBottom: paymentDescription ? 0 : 15,
                  }}
                  content={`${
                    timeDifferenceMinutes <= 60
                      ? timeDifferenceMinutes < 1
                        ? ''
                        : Math.round(timeDifferenceMinutes)
                      : timeDifferenceHours <= 24
                      ? Math.round(timeDifferenceHours)
                      : timeDifferenceDays <= 365
                      ? Math.round(timeDifferenceDays)
                      : Math.round(timeDifferenceYears)
                  } ${
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
                      : timeDifferenceDays <= 365
                      ? Math.round(timeDifferenceDays) === 1
                        ? 'day'
                        : 'days'
                      : Math.round(timeDifferenceYears) === 1
                      ? 'year'
                      : 'years'
                  } ${timeDifferenceMinutes > 1 ? 'ago' : ''}`}
                />

                {paymentDescription && (
                  <ThemeText
                    CustomEllipsizeMode={'tail'}
                    CustomNumberOfLines={2}
                    styles={{
                      ...styles.descriptionText,
                      marginBottom: 10,
                    }}
                    content={paymentDescription}
                  />
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
                  <ThemeText
                    styles={{
                      color: backgroundColor,
                      includeFontPadding: false,
                    }}
                    content={'Send'}
                  />
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
                  <ThemeText
                    styles={{
                      color: theme ? textColor : COLORS.primary,
                      includeFontPadding: false,
                    }}
                    content={'Decline'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  async function updatePaymentStatus(transaction, usingOnPage, didPay) {
    try {
      usingOnPage && setIsLoading(true);
      let newMessage = {
        ...transaction.message,
        isRedeemed: didPay,
      };
      delete newMessage.didSend;
      delete newMessage.wasSeen;
      const fiatCurrencies = await getFiatRates();

      sendPushNotification({
        selectedContactUsername: selectedContact.uniqueName,
        myProfile: myProfile,
        data: {
          isUpdate: true,
          message: `${myProfile.name || myProfile.uniqueName} ${
            didPay ? 'paid' : 'declined'
          } your request`,
        },
        fiatCurrencies: fiatCurrencies,
      });

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
        <ThemeText
          styles={{
            ...styles.dateText,
            color: didDeclinePayment ? COLORS.cancelRed : textColor,
          }}
          content={`${
            timeDifferenceMinutes < 60
              ? timeDifferenceMinutes < 1
                ? ''
                : Math.round(timeDifferenceMinutes)
              : Math.round(timeDifferenceHours) < 24
              ? Math.round(timeDifferenceHours)
              : Math.round(timeDifferenceDays)
          } ${
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
        />
      </View>

      <FormattedSatText
        frontText={
          didDeclinePayment ||
          masterInfoObject.userBalanceDenomination === 'hidden'
            ? ''
            : txParsed.didSend && !txParsed.isRequest
            ? '-'
            : '+'
        }
        containerStyles={{
          marginBottom: 'auto',
        }}
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
  requestTextContainer: {
    marginRight: 'auto',
    width: '100%',
    flexWrap: 'wrap',
    justifyContent: 'start',
  },
  descriptionText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Regular,
    fontWeight: 400,
  },
  dateText: {
    fontSize: SIZES.small,
    fontWeight: 300,
  },
  amountText: {
    fontWeight: 400,
  },

  acceptOrPayBTN: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 15,
    paddingVertical: 8,
    alignItems: 'center',
  },
});
