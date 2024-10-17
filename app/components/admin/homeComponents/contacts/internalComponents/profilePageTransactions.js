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

import {PaymentStatus, sendPayment} from '@breeztech/react-native-breez-sdk';

import {formatBalanceAmount, numberConverter} from '../../../../../functions';
import {createNewAddedContactsList} from '../../../../../functions/contacts/createNewAddedContactsList';
import {encriptMessage} from '../../../../../functions/messaging/encodingAndDecodingMessages';
import {getPublicKey} from 'nostr-tools';
import {sendLiquidTransaction} from '../../../../../functions/liquidWallet';
import {useNavigation} from '@react-navigation/native';
import {useState} from 'react';
import {contactsLNtoLiquidSwapInfo} from './LNtoLiquidSwap';
import {getBoltzWsUrl} from '../../../../../functions/boltz/boltzEndpoitns';
import handleReverseClaimWSS from '../../../../../functions/boltz/handle-reverse-claim-wss';
import {useWebView} from '../../../../../../context-store/webViewContext';
import FormattedSatText from '../../../../../functions/CustomElements/satTextDisplay';
import {useGlobalContacts} from '../../../../../../context-store/globalContacts';
import GetThemeColors from '../../../../../hooks/themeColors';
import ThemeImage from '../../../../../functions/CustomElements/themeImage';
import {
  LIGHTNINGAMOUNTBUFFER,
  LIQUIDAMOUTBUFFER,
  SATSPERBITCOIN,
} from '../../../../../constants/math';
import {assetIDS} from '../../../../../functions/liquidWallet/assetIDS';

export default function ProfilePageTransactions(props) {
  const transaction = props.transaction.transaction;
  const profileInfo = props.transaction;
  const {theme, masterInfoObject, nodeInformation, darkModeType} =
    useGlobalContextProvider();
  const {textColor, backgroundOffset, backgroundColor} = GetThemeColors();

  const navigate = useNavigation();

  const endDate = new Date();
  const startDate = new Date(transaction.uuid * 1000);

  const timeDifferenceMs = endDate - startDate;
  const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60);
  const timeDifferenceHours = timeDifferenceMs / (1000 * 60 * 60);
  const timeDifferenceDays = timeDifferenceMs / (1000 * 60 * 60 * 24);

  const txParsed = isJSON(transaction.data)
    ? JSON.parse(transaction.data)
    : transaction.data;

  if (txParsed === undefined) return;

  const paymentDescription = txParsed.description || '';
  console.log(profileInfo, 'T');

  return (
    <TouchableOpacity
      onPress={() => {
        //navigate to contacts page
        navigate.navigate('ExpandedContactsPage', {
          uuid: profileInfo.contactUUID,
        });
      }}
      key={transaction.uuid}>
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
          profileInfo={profileInfo}
        />
      ) : transaction.paymentType ? (
        <View style={styles.transactionContainer}>
          {/* <View style={{flex: 1}}> */}
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

            <Text
              style={[
                styles.dateText,
                {
                  color: textColor,
                  marginBottom: paymentDescription ? 0 : 15,
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
          </View>
        </View>
      ) : (
        <ActivityIndicator
          size={'large'}
          style={{marginBottom: 10}}
          color={textColor}
        />
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
  props,
  profileInfo,
}) {
  const {nodeInformation, masterInfoObject, darkModeType, theme} =
    useGlobalContextProvider();
  const {myProfileImage} = useGlobalContacts();
  const {textColor, backgroundOffset} = GetThemeColors();

  const transaction = profileInfo.transaction;

  console.log(transaction);

  // console.log(props.transaction, 'TES');
  return (
    <View style={[styles.transactionContainer, {alignItems: 'center'}]}>
      {txParsed.isDeclined ? (
        <Image style={styles.icons} source={ICONS.failedTransaction} />
      ) : (
        <View
          style={{
            width: 30,
            height: 30,
            alignItems: transaction.wasSent ? null : 'center',
            justifyContent: transaction.wasSent ? null : 'center',
            marginRight: 5,
          }}>
          {transaction.wasSent ? (
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
                backgroundColor: backgroundOffset,
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
          )}
        </View>
      )}

      <View>
        <Text
          style={[
            styles.descriptionText,
            {
              color: txParsed.isDeclined ? COLORS.cancelRed : textColor,
            },
          ]}>
          {txParsed.isDeclined
            ? 'Declined'
            : txParsed.isRequest && txParsed.isRedeemed
            ? 'Paid request'
            : paymentDescription.length > 15
            ? paymentDescription.slice(0, 15) + '...'
            : paymentDescription
            ? paymentDescription
            : transaction.wasSent
            ? `${transaction.data?.isRequest ? 'Payment request' : 'Sent'}`
            : `${
                transaction.data?.isRequest
                  ? 'Received payment request'
                  : 'Received'
              }`}
        </Text>
        <Text
          style={[
            styles.dateText,
            {
              color: txParsed.isDeclined ? COLORS.cancelRed : textColor,
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
              transaction.data?.isDeclined ||
              masterInfoObject.userBalanceDenomination === 'hidden'
                ? ''
                : transaction.wasSent && !transaction.data?.isRequest
                ? '-'
                : '+'
            }
            iconHeight={15}
            iconWidth={15}
            iconColor={txParsed.isDeclined ? COLORS.cancelRed : textColor}
            styles={{
              ...styles.amountText,
              color: txParsed.isDeclined ? COLORS.cancelRed : textColor,
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
              color: txParsed.isDeclined ? COLORS.cancelRed : textColor,
            }}>
            N/A
          </Text>
        )}
      </View>
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
