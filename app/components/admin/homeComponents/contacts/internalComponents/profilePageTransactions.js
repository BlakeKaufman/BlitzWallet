import {View, TouchableOpacity, Image, Text, StyleSheet} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../../constants';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {formatBalanceAmount, numberConverter} from '../../../../../functions';
import {useNavigation} from '@react-navigation/native';
import FormattedSatText from '../../../../../functions/CustomElements/satTextDisplay';
import {useGlobalContacts} from '../../../../../../context-store/globalContacts';
import GetThemeColors from '../../../../../hooks/themeColors';
import {ThemeText} from '../../../../../functions/CustomElements';

export default function ProfilePageTransactions(props) {
  const transaction = props.transaction.transaction;
  const profileInfo = props.transaction;
  const {theme, masterInfoObject, nodeInformation, darkModeType} =
    useGlobalContextProvider();

  const {textColor, backgroundOffset} = GetThemeColors();

  const navigate = useNavigation();

  const endDate = new Date();
  const startDate = new Date(transaction.timestamp);

  const timeDifferenceMs = endDate - startDate;
  const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60);
  const timeDifferenceHours = timeDifferenceMs / (1000 * 60 * 60);
  const timeDifferenceDays = timeDifferenceMs / (1000 * 60 * 60 * 24);

  const paymentDescription = transaction.description || '';

  return (
    <TouchableOpacity
      onPress={() => {
        //navigate to contacts page
        navigate.navigate('ExpandedContactsPage', {
          uuid: profileInfo.contactUUID,
        });
      }}
      key={transaction.message.uuid}>
      {transaction.message.didSend ||
      !transaction.message.isRequest ||
      (transaction.message.isRequest &&
        transaction.message.isRedeemed != null) ? (
        <ConfirmedOrSentTransaction
          txParsed={transaction.message}
          paymentDescription={paymentDescription}
          timeDifferenceMinutes={timeDifferenceMinutes}
          timeDifferenceHours={timeDifferenceHours}
          timeDifferenceDays={timeDifferenceDays}
          profileInfo={profileInfo}
        />
      ) : (
        <View style={{...styles.transactionContainer}}>
          <View
            style={{
              ...styles.selectImage,
              backgroundColor: backgroundOffset,
            }}>
            <Image
              source={
                profileInfo.selectedProfileImage
                  ? {
                      uri: profileInfo.selectedProfileImage,
                    }
                  : darkModeType && theme
                  ? ICONS.userWhite
                  : ICONS.userIcon
              }
              style={
                profileInfo.selectedProfileImage
                  ? {width: '100%', height: undefined, aspectRatio: 1}
                  : {width: '60%', height: '60%'}
              }
            />
          </View>

          <View style={{width: '100%', flex: 1}}>
            <View style={styles.requestTextContianer}>
              <ThemeText
                CustomNumberOfLines={1}
                styles={styles.requestText}
                content={`Received request`}
              />

              <FormattedSatText
                frontText={'+'}
                iconHeight={15}
                iconWidth={15}
                styles={{
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  includeFontPadding: false,
                }}
                formattedBalance={formatBalanceAmount(
                  numberConverter(
                    transaction.message.amountMsat / 1000,
                    masterInfoObject.userBalanceDenomination,
                    nodeInformation,
                    masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
                  ),
                )}
              />
            </View>
            <ThemeText
              styles={styles.dateText}
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
        </View>
      )}
    </TouchableOpacity>
  );
}

function ConfirmedOrSentTransaction({
  txParsed,
  paymentDescription,
  timeDifferenceMinutes,
  timeDifferenceHours,
  timeDifferenceDays,
  profileInfo,
}) {
  const {nodeInformation, masterInfoObject, darkModeType, theme} =
    useGlobalContextProvider();
  const {myProfileImage} = useGlobalContacts();
  const {textColor, backgroundOffset} = GetThemeColors();
  const didDeclinePayment = txParsed.isRedeemed != null && !txParsed.isRedeemed;

  return (
    <View style={[styles.transactionContainer, {alignItems: 'center'}]}>
      {didDeclinePayment ? (
        <Image style={styles.icons} source={ICONS.failedTransaction} />
      ) : (
        <View
          style={{
            width: 30,
            height: 30,
            marginRight: 5,
            alignItems: txParsed.didSend ? null : 'center',
            justifyContent: txParsed.didSend ? null : 'center',
          }}>
          {txParsed.didSend ? (
            <>
              <View
                style={{
                  ...styles.profileImageContainer,
                  backgroundColor: backgroundOffset,
                  bottom: 0,
                  left: 0,
                }}>
                <Image
                  source={
                    myProfileImage
                      ? {
                          uri: myProfileImage,
                        }
                      : darkModeType && theme
                      ? ICONS.userWhite
                      : ICONS.userIcon
                  }
                  style={
                    myProfileImage
                      ? {width: '100%', height: undefined, aspectRatio: 1}
                      : {width: '60%', height: '60%'}
                  }
                />
              </View>
              <View
                style={{
                  ...styles.profileImageContainer,
                  backgroundColor: backgroundOffset,
                  zIndex: 1,
                  top: 0,
                  right: 0,
                }}>
                <Image
                  source={
                    profileInfo.selectedProfileImage
                      ? {
                          uri: profileInfo.selectedProfileImage,
                        }
                      : darkModeType && theme
                      ? ICONS.userWhite
                      : ICONS.userIcon
                  }
                  style={
                    profileInfo.selectedProfileImage
                      ? {width: '100%', height: undefined, aspectRatio: 1}
                      : {width: '60%', height: '60%'}
                  }
                />
              </View>
            </>
          ) : (
            <View
              style={{
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 20,
                overflow: 'hidden',

                backgroundColor: backgroundOffset,
              }}>
              <Image
                source={
                  profileInfo.selectedProfileImage
                    ? {
                        uri: profileInfo.selectedProfileImage,
                      }
                    : darkModeType && theme
                    ? ICONS.userWhite
                    : ICONS.userIcon
                }
                style={
                  profileInfo.selectedProfileImage
                    ? {width: '100%', height: undefined, aspectRatio: 1}
                    : {width: '60%', height: '60%'}
                }
              />
            </View>
          )}
        </View>
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
        iconHeight={15}
        iconWidth={15}
        iconColor={didDeclinePayment ? COLORS.cancelRed : textColor}
        containerStyles={{marginBottom: 'auto'}}
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
  selectImage: {
    width: 30,
    height: 30,

    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginRight: 5,
    overflow: 'hidden',
  },
  requestTextContianer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  requestText: {
    flex: 1,
    marginRight: 5,
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

  profileImageContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 20,
    overflow: 'hidden',
    position: 'absolute',
  },
});
