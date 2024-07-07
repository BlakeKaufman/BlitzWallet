import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {BTN, CENTER, COLORS, FONT, ICONS, SIZES} from '../../constants';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../context-store/context';
import {formatBalanceAmount, numberConverter} from '../../functions';
import {assetIDS} from '../../functions/liquidWallet/assetIDS';
import {GlobalThemeView, ThemeText} from '../../functions/CustomElements';
import {WINDOWWIDTH} from '../../constants/theme';
import handleBackPress from '../../hooks/handleBackPress';
import {useEffect} from 'react';

export default function ExpandedTx(props) {
  console.log('Transaction Detials Page');
  const navigate = useNavigation();
  const {theme, nodeInformation, masterInfoObject} = useGlobalContextProvider();
  const isLiquidPayment = props.route.params.isLiquidPayment;
  const isFailedPayment = props.route.params.isFailedPayment;
  const transaction = props.route.params.transaction;
  const selectedTX =
    isLiquidPayment || isFailedPayment
      ? transaction
      : nodeInformation.transactions?.filter(tx => {
          return props.route.params.txId === tx.details.data.paymentHash;
        })[0];

  // console.log(selectedTX);
  const paymentDate = new Date(
    isLiquidPayment
      ? selectedTX.created_at_ts / 1000
      : isFailedPayment
      ? selectedTX.invoice.timestamp * 1000
      : selectedTX.paymentTime * 1000,
  );
  const month = paymentDate.toLocaleString('default', {month: 'short'});
  const day = paymentDate.getDate();
  const year = paymentDate.getFullYear();

  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

  // return;
  return (
    <GlobalThemeView>
      <View style={styles.innerContainer}>
        <TouchableOpacity
          style={{marginRight: 'auto'}}
          onPress={() => {
            navigate.goBack();
          }}>
          <Image style={styles.backButton} source={ICONS.smallArrowLeft} />
        </TouchableOpacity>
        <ThemeText content={'Status'} styles={{...styles.headerText}} />
        <Text
          style={[
            styles.didCompleteText,
            {
              color: isFailedPayment
                ? COLORS.failedTransaction
                : selectedTX.status === 'complete' || isLiquidPayment
                ? COLORS.nostrGreen
                : theme
                ? COLORS.darkModeText
                : COLORS.lightModeText,
            },
          ]}>
          {isFailedPayment
            ? 'Payment Failed'
            : selectedTX.status === 'complete' || isLiquidPayment
            ? 'Successful'
            : 'Payment Failed'}
        </Text>
        <ThemeText
          content={`${
            isFailedPayment
              ? '-'
              : isLiquidPayment
              ? transaction.type === 'incoming'
                ? '+'
                : '-'
              : selectedTX.paymentType === 'sent'
              ? '-'
              : '+'
          }${formatBalanceAmount(
            numberConverter(
              isFailedPayment
                ? transaction.invoice.amountMsat / 1000
                : isLiquidPayment
                ? Math.abs(transaction.satoshi[assetIDS['L-BTC']])
                : transaction.amountMsat / 1000,
              'fiat',
              nodeInformation,
              2,
            ),
          )} ${nodeInformation.fiatStats.coin}`}
          styles={{...styles.fiatHeaderAmount}}
        />
        <ThemeText
          content={`${formatBalanceAmount(
            numberConverter(
              isFailedPayment
                ? transaction.invoice.amountMsat / 1000
                : isLiquidPayment
                ? Math.abs(transaction.satoshi[assetIDS['L-BTC']])
                : transaction.amountMsat / 1000,
              'sats',
              nodeInformation,
              0,
            ),
          )} SATS`}
          styles={{...styles.satHeaderAmount}}
        />

        <View
          style={[
            styles.infoContainer,
            {
              borderColor: theme ? COLORS.darkModeText : COLORS.lightModeText,
            },
          ]}>
          <View style={[styles.infoRow, {marginBottom: 20}]}>
            <View style={styles.contentBlock}>
              <ThemeText content={'Date'} styles={{...styles.infoHeaders}} />
              <ThemeText
                content={`${month} ${day}, ${year}`}
                styles={{...styles.infoDescriptions}}
              />
            </View>
            <View style={styles.contentBlock}>
              <ThemeText content={'Time'} styles={{...styles.infoHeaders}} />
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
                styles={{...styles.infoDescriptions}}
              />
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.contentBlock}>
              <ThemeText content={'Fee'} styles={{...styles.infoHeaders}} />
              <ThemeText
                content={`${formatBalanceAmount(
                  numberConverter(
                    isFailedPayment
                      ? 0
                      : isLiquidPayment
                      ? selectedTX.type === 'incoming'
                        ? 0
                        : transaction.fee
                      : selectedTX.feeMsat / 1000,
                    masterInfoObject.userBalanceDenomination,
                    nodeInformation,
                    masterInfoObject.userBalanceDenomination != 'fiat' ? 0 : 2,
                  ),
                )} ${
                  masterInfoObject.userBalanceDenomination != 'fiat'
                    ? 'sats'
                    : nodeInformation.fiatStats.coin
                }`}
                styles={{...styles.infoDescriptions}}
              />
            </View>
            <View style={styles.contentBlock}>
              <ThemeText content={'Type'} styles={{...styles.infoHeaders}} />
              <ThemeText
                content={isLiquidPayment ? 'Liquid' : `Lightning`}
                styles={{...styles.infoDescriptions}}
              />
            </View>
          </View>
        </View>
        {isFailedPayment && (
          <ThemeText
            content={'No money has been sent'}
            styles={{...styles.failedTransactionText}}
          />
        )}
        <View style={styles.descriptionContainer}>
          <ThemeText
            content={'Description'}
            styles={{...styles.descriptionHeader}}
          />

          <View
            style={[
              styles.descriptionContentContainer,
              {
                backgroundColor: theme
                  ? COLORS.darkModeBackgroundOffset
                  : COLORS.lightModeBackgroundOffset,
              },
            ]}>
            <ScrollView horizontal={false} showsVerticalScrollIndicator={false}>
              <ThemeText
                content={
                  isFailedPayment
                    ? transaction.error
                    : selectedTX.description
                    ? selectedTX.description
                    : 'No description'
                }
                styles={{...styles.buttonText}}
              />
            </ScrollView>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            navigate.navigate('TechnicalTransactionDetails', {
              selectedTX: selectedTX,
              isLiquidPayment: isLiquidPayment,
              isFailedPayment: isFailedPayment,
            });
          }}
          style={[
            styles.buttonContainer,
            {
              borderColor: theme ? COLORS.darkModeText : COLORS.lightModeText,
            },
          ]}>
          <ThemeText
            content={' Technical details'}
            styles={{...styles.buttonText}}
          />
        </TouchableOpacity>
      </View>
    </GlobalThemeView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 40,
    height: 40,
  },

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
    fontSize: SIZES.xxLarge,
  },
  satHeaderAmount: {
    marginBottom: 20,
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
