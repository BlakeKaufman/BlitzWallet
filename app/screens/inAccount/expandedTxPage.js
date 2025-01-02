import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
  ImageBackground,
  Platform,
} from 'react-native';
import {BTN, CENTER, COLORS, FONT, ICONS, SIZES} from '../../constants';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../context-store/context';
import {
  formatBalanceAmount,
  getLocalStorageItem,
  numberConverter,
} from '../../functions';

import {GlobalThemeView, ThemeText} from '../../functions/CustomElements';
import {WINDOWWIDTH} from '../../constants/theme';
import handleBackPress from '../../hooks/handleBackPress';
import {useEffect, useState} from 'react';

import Icon from '../../functions/CustomElements/Icon';
import FormattedSatText from '../../functions/CustomElements/satTextDisplay';
import CustomButton from '../../functions/CustomElements/button';
import GetThemeColors from '../../hooks/themeColors';
import ThemeImage from '../../functions/CustomElements/themeImage';
import {PaymentState} from '@breeztech/react-native-breez-sdk-liquid';

export default function ExpandedTx(props) {
  console.log('Transaction Detials Page');
  const navigate = useNavigation();
  const {theme, nodeInformation, masterInfoObject} = useGlobalContextProvider();
  const {backgroundOffset, backgroundColor} = GetThemeColors();

  const transaction = props.route.params.transaction;
  const isLiquidPayment =
    props.route.params.isLiquidPayment &&
    props.route.params.transaction.type != 'ecash';
  const isFailedPayment =
    props.route.params.isFailedPayment &&
    props.route.params.transaction.type != 'ecash';

  const isPending = transaction.status === PaymentState.PENDING;

  const selectedTX =
    isLiquidPayment || isFailedPayment || transaction.type === 'ecash'
      ? transaction
      : nodeInformation.transactions?.filter(tx => {
          return props.route.params.txId === tx.details.data.paymentHash;
        })[0];

  const paymentDate = new Date(
    isLiquidPayment
      ? selectedTX.timestamp * 1000
      : isFailedPayment
      ? selectedTX.invoice.timestamp * 1000
      : selectedTX.type === 'ecash'
      ? selectedTX.time
      : selectedTX.paymentTime * 1000,
  );

  console.log(transaction);

  const month = paymentDate.toLocaleString('default', {month: 'short'});
  const day = paymentDate.getDate();
  const year = paymentDate.getFullYear();

  const isAutoChannelRebalance =
    selectedTX.details?.description === 'Auto Channel Rebalance';
  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

  return (
    <GlobalThemeView styles={{paddingBottom: 0}} useStandardWidth={true}>
      <View style={{flex: 1}}>
        <TouchableOpacity
          style={{marginRight: 'auto'}}
          onPress={() => {
            navigate.goBack();
          }}>
          <ThemeImage
            darkModeIcon={ICONS.smallArrowLeft}
            lightModeIcon={ICONS.smallArrowLeft}
            lightsOutIcon={ICONS.arrow_small_left_white}
          />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={{
            // flex: 1,
            width: '95%',
            alignItems: 'center',
            justifyContent: 'center',
            // backgroundColor: 'red',
            ...CENTER,
          }}>
          <View
            style={{
              // flex: 1,
              width: '100%',
              height: 'auto',
              backgroundColor: theme ? backgroundOffset : COLORS.white,
              borderTopRightRadius: 20,
              borderTopLeftRadius: 20,
              // // overflow: 'visible',
              padding: 15,
              paddingTop: 40,
              ...CENTER,
              alignItems: 'center',
              marginTop: 80,
              marginBottom: 20,
            }}>
            <View
              style={{
                width: 100,
                height: 100,
                position: 'absolute',
                backgroundColor: backgroundColor,
                top: -70,
                borderRadius: 50,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor: isPending
                    ? theme
                      ? COLORS.expandedTxDarkModePendingOuter
                      : COLORS.expandedTXLightModePendingOuter
                    : isFailedPayment
                    ? COLORS.expandedTXLightModeFailed
                    : theme
                    ? COLORS.expandedTXDarkModeConfirmd
                    : COLORS.expandedTXLightModeConfirmd,
                  alignItems: 'center',
                  justifyContent: 'center',

                  borderRadius: 40,
                }}>
                <View
                  style={{
                    width: 60,
                    height: 60,
                    backgroundColor: isPending
                      ? theme
                        ? COLORS.expandedTxDarkModePendingInner
                        : COLORS.expandedTXLightModePendingInner
                      : isFailedPayment
                      ? COLORS.cancelRed
                      : theme
                      ? COLORS.darkModeText
                      : COLORS.primary,

                    borderRadius: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Icon
                    width={25}
                    height={25}
                    color={backgroundColor}
                    name={
                      isPending
                        ? 'pendingTxIcon'
                        : isFailedPayment
                        ? 'expandedTxClose'
                        : 'expandedTxCheck'
                    }
                  />
                </View>
              </View>
            </View>
            <ThemeText
              styles={{
                marginTop: 10,
                fontWeight: 'light',
                includeFontPadding: false,
              }}
              content={`${
                isFailedPayment
                  ? 'Sent'
                  : isLiquidPayment
                  ? transaction.details.paymentType === 'receive'
                    ? 'Received'
                    : 'Sent'
                  : selectedTX.paymentType === 'sent'
                  ? 'Sent'
                  : 'Received'
              } amount`}
            />
            <FormattedSatText
              containerStyles={{marginTop: -5}}
              neverHideBalance={true}
              iconHeight={25}
              iconWidth={25}
              styles={{
                fontSize: SIZES.xxLarge,
                includeFontPadding: false,
              }}
              formattedBalance={formatBalanceAmount(
                numberConverter(
                  isFailedPayment
                    ? 1000 || transaction.invoice.amountMsat / 1000
                    : isLiquidPayment
                    ? selectedTX.amountSat
                    : selectedTX.type === 'ecash'
                    ? selectedTX.amount
                    : transaction.amountMsat / 1000,
                  masterInfoObject.userBalanceDenomination,
                  nodeInformation,
                  masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
                ),
              )}
            />
            <View
              style={{
                width: '100%',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexDirection: 'row',
                marginTop: 30,
                marginBottom: 10,
              }}>
              <ThemeText content={'Payment status'} />
              <View
                style={{
                  backgroundColor: isPending
                    ? theme
                      ? COLORS.expandedTxDarkModePendingInner
                      : COLORS.expandedTXLightModePendingOuter
                    : isFailedPayment
                    ? COLORS.expandedTXLightModeFailed
                    : theme
                    ? COLORS.expandedTXDarkModeConfirmd
                    : COLORS.expandedTXLightModeConfirmd,
                  paddingVertical: 2,
                  paddingHorizontal: 25,
                  borderRadius: 20,
                }}>
                <ThemeText
                  styles={{
                    color: isPending
                      ? theme
                        ? COLORS.darkModeText
                        : COLORS.expandedTXLightModePendingInner
                      : isFailedPayment
                      ? COLORS.cancelRed
                      : theme
                      ? COLORS.darkModeText
                      : COLORS.primary,
                    includeFontPadding: false,
                  }}
                  content={
                    isPending
                      ? 'Pending'
                      : isFailedPayment
                      ? 'Failed'
                      : 'Successful'
                  }
                />
              </View>
            </View>
            <Border />
            <View style={styles.infoLine}>
              <ThemeText content={'Date'} />
              <ThemeText
                styles={{fontSize: SIZES.large}}
                content={`${month} ${day} ${year}`}
              />
            </View>
            <View style={styles.infoLine}>
              <ThemeText content={'Time'} />
              <ThemeText
                content={`${
                  paymentDate.getHours() <= 9
                    ? '0' + paymentDate.getHours()
                    : paymentDate.getHours()
                }:${
                  paymentDate.getMinutes() <= 9
                    ? '0' + paymentDate.getMinutes()
                    : paymentDate.getMinutes()
                }`}
                styles={{fontSize: SIZES.large}}
              />
            </View>
            <View style={styles.infoLine}>
              <ThemeText content={'Fee'} />
              <FormattedSatText
                neverHideBalance={true}
                iconHeight={18}
                iconWidth={18}
                styles={{fontSize: SIZES.large}}
                formattedBalance={formatBalanceAmount(
                  numberConverter(
                    isFailedPayment
                      ? 0
                      : isLiquidPayment
                      ? selectedTX.feesSat
                      : selectedTX.type === 'ecash'
                      ? selectedTX.fee
                      : selectedTX.feeMsat / 1000,
                    masterInfoObject.userBalanceDenomination,
                    nodeInformation,
                    masterInfoObject.userBalanceDenomination != 'fiat' ? 0 : 2,
                  ),
                )}
              />
            </View>
            <View style={styles.infoLine}>
              <ThemeText content={'Type'} />
              <ThemeText
                content={
                  selectedTX?.paymentType === 'closed_channel'
                    ? 'On-chain'
                    : isLiquidPayment
                    ? selectedTX.details.type.slice(0, 1).toUpperCase() +
                      selectedTX.details.type.slice(1)
                    : selectedTX.type === 'ecash'
                    ? 'eCash'
                    : `Lightning`
                }
                styles={{fontSize: SIZES.large}}
              />
            </View>

            {(selectedTX.description ||
              selectedTX?.details?.data?.label ||
              isFailedPayment ||
              (isLiquidPayment && isAutoChannelRebalance)) && (
              <View style={styles.descriptionContainer}>
                <ThemeText
                  content={'Memo'}
                  styles={{...styles.descriptionHeader}}
                />

                <View
                  style={[
                    styles.descriptionContentContainer,
                    {
                      backgroundColor: backgroundColor,
                    },
                  ]}>
                  <ScrollView
                    horizontal={false}
                    showsVerticalScrollIndicator={false}>
                    <ThemeText
                      content={
                        isLiquidPayment && isAutoChannelRebalance
                          ? 'Auto Channel Rebalance'
                          : isFailedPayment
                          ? transaction.error
                          : selectedTX.description
                          ? selectedTX.description
                          : selectedTX?.details?.data?.label
                          ? selectedTX?.details?.data?.label
                          : 'No description'
                      }
                      styles={{...styles.buttonText}}
                    />
                  </ScrollView>
                </View>
              </View>
            )}
            {selectedTX.type !== 'ecash' ? (
              <CustomButton
                buttonStyles={{
                  width: 'auto',
                  ...CENTER,
                  backgroundColor: theme ? COLORS.darkModeText : COLORS.primary,
                  marginVertical: 20,
                }}
                textStyles={{
                  color: theme ? COLORS.lightModeText : COLORS.darkModeText,
                  paddingVertical: 10,
                  includeFontPadding: false,
                }}
                textContent={'Technical details'}
                actionFunction={() => {
                  navigate.navigate('TechnicalTransactionDetails', {
                    selectedTX: selectedTX,
                    isLiquidPayment: isLiquidPayment,
                    isFailedPayment: isFailedPayment,
                  });
                }}
              />
            ) : (
              <View style={{height: 40}}></View>
            )}
            <ReceiptDots />
          </View>
        </ScrollView>
      </View>
    </GlobalThemeView>
  );
}

function Border() {
  const {theme} = useGlobalContextProvider();
  const dotsWidth = useWindowDimensions().width * 0.95 - 30;
  const numDots = Math.floor(dotsWidth / 25);

  let dotElements = [];

  for (let index = 0; index < numDots; index++) {
    dotElements.push(
      <View
        key={index}
        style={{
          width: 20,
          height: 2,
          backgroundColor: theme
            ? COLORS.darkModeText
            : COLORS.lightModeBackground,
        }}></View>,
    );
  }

  return (
    <View
      style={{
        width: '100%',
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginBottom: 20,
      }}>
      {dotElements}
    </View>
  );
}

function ReceiptDots() {
  const {backgroundColor} = GetThemeColors();
  const dotsWidth = useWindowDimensions().width * 0.95 - 30;
  const numDots = Math.floor(dotsWidth / 25);

  let dotElements = [];

  for (let index = 0; index < numDots; index++) {
    dotElements.push(
      <View
        key={index}
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: backgroundColor,
        }}></View>,
    );
  }

  return (
    <View
      style={{
        position: 'absolute',
        bottom: Platform.OS == 'ios' ? -12 : -10,
        width: '100%',
        justifyContent: 'space-between',
        flexDirection: 'row',
      }}>
      {dotElements}
    </View>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    width: WINDOWWIDTH,
    ...CENTER,
  },
  headerText: {
    fontSize: SIZES.xxLarge,
  },
  didCompleteText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Descriptoin_Regular,
    marginBottom: 30,
  },

  fiatHeaderAmount: {
    fontSize: SIZES.huge,
  },
  satHeaderAmount: {
    marginBottom: 20,
  },

  infoLine: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  infoContainer: {
    width: '100%',
    maxWidth: 300,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 10,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contentBlock: {
    width: '45%',
    alignContent: 'center',
    justifyContent: 'center',
  },
  infoHeaders: {
    textAlign: 'center',
    fontSize: SIZES.large,
    marginBottom: 5,
  },
  infoDescriptions: {
    textAlign: 'center',
    fontSize: SIZES.small,
  },
  failedTransactionText: {
    fontFamily: FONT.Title_Bold,
    fontSize: SIZES.large,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  descriptionContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
    marginTop: 10,
  },
  descriptionHeader: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Regular,
    marginBottom: 10,
  },
  descriptionContentContainer: {
    width: '100%',
    height: 100,
    padding: 10,
    borderRadius: 8,
  },
  buttonContainer: {
    marginTop: 'auto',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  buttonText: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
  },
});
