import {Image, StyleSheet, View, TouchableOpacity, Text} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../constants';
import {ThemeText} from './CustomElements';
import {randomUUID} from 'expo-crypto';
import formatBalanceAmount from './formatNumber';
import numberConverter from './numberConverter';
import {assetIDS} from './liquidWallet/assetIDS';
import FormattedSatText from './CustomElements/satTextDisplay';
import {useGlobalContextProvider} from '../../context-store/context';
import {useTranslation} from 'react-i18next';

export default function getFormattedHomepageTxs({
  nodeInformation,
  liquidNodeInformation,
  masterInfoObject,
  theme,
  navigate,
  showAmount,
  isBankPage,
  frompage,
  ecashTransactions,
  viewAllTxText,
  noTransactionHistoryText,
  todayText,
  yesterdayText,
  dayText,
  monthText,
  yearText,
  agoText,
}) {
  const arr1 = [...nodeInformation.transactions].sort(
    (a, b) => b.paymentTime - a.paymentTime,
  );
  const n1 = nodeInformation.transactions.length;

  const arr2 = [...liquidNodeInformation.transactions].sort(
    (a, b) => b.timestamp - a.timestamp,
  );

  const n2 = liquidNodeInformation.transactions.length;

  const arr3 = [...masterInfoObject.failedTransactions]
    .filter(tx => Object.keys(tx).length != 0)
    .sort((a, b) => b.invoice.timestamp - a.invoice.timestamp);
  const n3 = masterInfoObject.failedTransactions.length;

  const arr4 = [...ecashTransactions].sort((a, b) => b.time - a.time);
  const n4 = ecashTransactions.length;

  const conjoinedTxList = isBankPage
    ? arr2
    : // : masterInfoObject.enabledEcash
      // ?
      mergeArrays(arr1, arr2, n1, n2, arr3, n3, arr4, n4);
  // : mergeArrays(arr1, arr2, n1, n2, arr3, n3);

  if (conjoinedTxList.length === 0) {
    return [
      <View style={[styles.noTransactionsContainer]} key={'noTx'}>
        <ThemeText
          content={noTransactionHistoryText}
          styles={{...styles.noTransactionsText}}
        />
      </View>,
    ];
  } else {
    let formattedTxs = [];
    let currentGroupedDate = '';
    conjoinedTxList
      .slice(
        0,
        isBankPage
          ? arr2.length
          : frompage === 'viewAllTx'
          ? conjoinedTxList.length
          : masterInfoObject.homepageTxPreferance,
      )
      .forEach((tx, id) => {
        const keyUUID = randomUUID();
        const isLiquidPayment = !!tx.timestamp;
        const isFailedPayment = !!tx?.invoice?.timestamp;
        let paymentDate;

        if (isLiquidPayment) {
          paymentDate = new Date(tx.timestamp * 1000);
        } else if (!isFailedPayment && tx.type != 'ecash') {
          paymentDate = new Date(tx.paymentTime * 1000); // could also need to be timd by 1000
        } else if (tx.type === 'ecash') {
          paymentDate = new Date(tx.time);
        } else paymentDate = new Date(tx.invoice.timestamp * 1000);

        const styledTx = (
          <UserTransaction
            theme={theme}
            showAmount={showAmount}
            userBalanceDenomination={masterInfoObject.userBalanceDenomination}
            key={keyUUID}
            tx={tx}
            navigate={navigate}
            nodeInformation={nodeInformation}
            isLiquidPayment={isLiquidPayment}
            isFailedPayment={isFailedPayment}
            paymentDate={paymentDate}
            id={keyUUID}
            isBankPage={isBankPage}
            frompage={frompage}
          />
        );

        const timeDifference = (new Date() - paymentDate) / 1000 / 60 / 60 / 24;

        const bannerText =
          timeDifference < 0.5
            ? todayText
            : timeDifference > 0.5 && timeDifference < 1
            ? yesterdayText
            : Math.round(timeDifference) <= 30
            ? `${Math.round(timeDifference)} ${
                Math.round(timeDifference) === 1 ? dayText : dayText + 's'
              } ${agoText}`
            : Math.round(timeDifference) > 30 &&
              Math.round(timeDifference) < 365
            ? `${Math.floor(Math.round(timeDifference) / 30)} ${monthText}${
                Math.floor(Math.round(timeDifference) / 30) === 1 ? '' : 's'
              } ${agoText}`
            : `${Math.floor(Math.round(timeDifference) / 365)} ${yearText}${
                Math.floor(Math.round(timeDifference) / 365) ? '' : 's'
              } ${agoText}`;

        if (
          (id === 0 || currentGroupedDate != bannerText) && //&&
          // paymentDate.toDateString() != new Date().toDateString()
          timeDifference > 0.5 &&
          frompage != 'home'
        ) {
          currentGroupedDate = bannerText;
          formattedTxs.push(dateBanner(bannerText, theme));
        }
        formattedTxs.push(styledTx);
      });
    if (!isBankPage && frompage != 'viewAllTx')
      formattedTxs.push(
        <TouchableOpacity
          style={{marginBottom: 10, ...CENTER}}
          onPress={() => {
            navigate.navigate('ViewAllTxPage');
          }}>
          <ThemeText content={viewAllTxText} styles={{...styles.headerText}} />
        </TouchableOpacity>,
      );
    // return;
    return formattedTxs;
  }
}

function mergeArrays(
  arr1 = [],
  arr2 = [],
  n1 = 0,
  n2 = 0,
  arr3 = [],
  n3 = 0,
  arr4 = [],
  n4 = 0,
) {
  let arr5 = [];
  let i = 0,
    j = 0,
    k = 0,
    l = 0;

  // Function to get the timestamp from different array objects
  const getTime = (arr, idx, standardTime) => {
    if (arr === arr1)
      return arr[idx]?.paymentTime
        ? getTimeDifference(standardTime, arr[idx]?.paymentTime * 1000) // could also need to be timd by 1000
        : Infinity;
    if (arr === arr2)
      return arr[idx]?.timestamp
        ? getTimeDifference(standardTime, Math.round(arr[idx].timestamp * 1000))
        : Infinity;
    if (arr === arr3)
      return arr[idx]?.invoice?.timestamp
        ? getTimeDifference(standardTime, arr[idx]?.invoice?.timestamp * 1000)
        : Infinity;
    if (arr === arr4)
      return arr[idx]?.time
        ? getTimeDifference(standardTime, Math.round(arr[idx]?.time))
        : Infinity;
  };

  const getTimeDifference = (standardTime, time) => {
    return (standardTime - new Date(time)) / 1000 / 60 / 60 / 24;
  };

  // Merge the arrays based on time, from oldest to newest
  while (i < n1 || j < n2 || k < n3 || l < n4) {
    const standardTime = new Date();
    let t1 = i < n1 ? getTime(arr1, i, standardTime) : Infinity;
    let t2 = j < n2 ? getTime(arr2, j, standardTime) : Infinity;
    let t3 = k < n3 ? getTime(arr3, k, standardTime) : Infinity;
    let t4 = l < n4 ? getTime(arr4, l, standardTime) : Infinity;

    // Filter out 'Infinity' and convert to numbers
    const numericTimes = [t1, t2, t3, t4]
      .filter(time => String(time) !== 'Infinity')
      .map(time => new Date() - new Date(time) / 1000 / 60 / 60 / 24);

    let minTime = Math.min(t1, t2, t3, t4);

    // If minTime is Infinity, it means no more valid times are left, so break the loop
    if (minTime === Infinity) break;

    if (minTime === t1) arr5.push(arr1[i++]);
    else if (minTime === t2) arr5.push(arr2[j++]);
    else if (minTime === t3) arr5.push(arr3[k++]);
    else if (minTime === t4) arr5.push(arr4[l++]);
  }

  return arr5;
}

export function UserTransaction(props) {
  const {darkModeType, theme} = useGlobalContextProvider();
  const {t} = useTranslation();
  const endDate = new Date();
  const transaction = props.tx;
  const paymentDate = props.paymentDate;
  const timeDifferenceMs = endDate - paymentDate;
  const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60);
  const timeDifferenceHours = timeDifferenceMs / (1000 * 60 * 60);
  const timeDifferenceDays = timeDifferenceMs / (1000 * 60 * 60 * 24);

  const paymentImage = (() => {
    if (props.isLiquidPayment) {
      return darkModeType && theme
        ? ICONS.arrow_small_left_white
        : ICONS.smallArrowLeft;
    } else if (transaction.paymentType === 'closed_channel') {
      return ICONS.failedTransaction;
    } else if (
      transaction.status === 'complete' ||
      transaction.type === 'ecash'
    ) {
      return darkModeType && theme
        ? ICONS.arrow_small_left_white
        : ICONS.smallArrowLeft;
    } else {
      return ICONS.failedTransaction;
    }
  })();

  return (
    <TouchableOpacity
      style={{
        width:
          props.isBankPage || props.frompage === 'viewAllTx' ? '90%' : '85%',
        ...CENTER,
      }}
      key={props.id}
      activeOpacity={0.5}
      onPress={() => {
        props.navigate.navigate('ExpandedTx', {
          isFailedPayment: props.isFailedPayment,
          isLiquidPayment: props.isLiquidPayment,
          txId:
            transaction.type === 'ecash'
              ? ''
              : transaction.details?.data?.paymentHash,
          transaction: transaction,
        });
      }}>
      <View style={styles.transactionContainer}>
        <Image
          source={paymentImage}
          style={[
            styles.icons,
            {
              transform: [
                {
                  rotate:
                    transaction.paymentType === 'closed_channel'
                      ? '0deg'
                      : props.isLiquidPayment
                      ? transaction.type === 'outgoing'
                        ? '130deg'
                        : '310deg'
                      : transaction.status === 'complete' ||
                        transaction.type === 'ecash'
                      ? transaction.paymentType === 'sent'
                        ? '130deg'
                        : '310deg'
                      : '0deg',
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
                color:
                  props.isFailedPayment ||
                  transaction.paymentType === 'closed_channel'
                    ? COLORS.failedTransaction
                    : props.theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                fontStyle:
                  props.isFailedPayment ||
                  transaction.paymentType === 'closed_channel'
                    ? 'italic'
                    : 'normal',
              },
            ]}>
            {props.isFailedPayment
              ? t('transactionLabelText.failed')
              : props.userBalanceDenomination === 'hidden'
              ? '*****'
              : props.isLiquidPayment
              ? transaction.type === 'outgoing'
                ? t('constants.sent')
                : t('constants.received')
              : !transaction.description
              ? transaction.paymentType === 'sent'
                ? t('constants.sent')
                : t('constants.received')
              : transaction.metadata?.includes('usedAppStore')
              ? `${t('constants.store')} - ${
                  transaction.metadata?.split('"')[5]
                }`
              : transaction.description.includes('bwrfd')
              ? t('constants.faucet')
              : transaction.description.length > 12
              ? transaction.description.slice(0, 12) + '...'
              : transaction.description}
          </Text>

          <Text
            style={[
              styles.dateText,
              {
                color:
                  props.isFailedPayment ||
                  transaction.paymentType === 'closed_channel'
                    ? COLORS.failedTransaction
                    : props.theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                fontStyle:
                  props.isFailedPayment ||
                  transaction.paymentType === 'closed_channel'
                    ? 'italic'
                    : 'normal',
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
                  ? t('transactionLabelText.txTime_just_now')
                  : Math.round(timeDifferenceMinutes) === 1
                  ? t('constants.minute')
                  : t('constants.minute') + 's'
                : Math.round(timeDifferenceHours) < 24
                ? Math.round(timeDifferenceHours) === 1
                  ? t('constants.hour')
                  : t('constants.hour') + 's'
                : Math.round(timeDifferenceDays) === 1
                ? t('constants.day')
                : t('constants.day') + 's'
            } ${
              timeDifferenceMinutes > 1 ? t('transactionLabelText.ago') : ''
            }`}
          </Text>
        </View>
        {!props.isFailedPayment ? (
          <FormattedSatText
            isFailedPayment={
              props.isFailedPayment ||
              transaction.paymentType === 'closed_channel'
            }
            containerStyles={{marginLeft: 'auto', marginBottom: 'auto'}}
            frontText={
              props.userBalanceDenomination != 'hidden'
                ? transaction.paymentType === 'closed_channel'
                  ? ''
                  : props.isLiquidPayment
                  ? transaction.type === 'incoming'
                    ? '+'
                    : '-'
                  : transaction.paymentType === 'received'
                  ? '+'
                  : '-'
                : ''
            }
            iconHeight={15}
            iconWidth={15}
            styles={{
              ...styles.amountText,
              color:
                props.isFailedPayment ||
                transaction.paymentType === 'closed_channel'
                  ? COLORS.failedTransaction
                  : props.theme
                  ? COLORS.darkModeText
                  : COLORS.lightModeText,
            }}
            formattedBalance={formatBalanceAmount(
              numberConverter(
                props.isLiquidPayment
                  ? Math.abs(transaction.balance[assetIDS['L-BTC']])
                  : transaction.type === 'ecash'
                  ? transaction.amount
                  : transaction.amountMsat / 1000,
                props.userBalanceDenomination,
                props.nodeInformation,
                props.userBalanceDenomination != 'fiat' ? 0 : 2,
              ),
            )}
          />
        ) : (
          <Text style={{marginLeft: 'auto'}}></Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
export function dateBanner(bannerText, theme) {
  const uuid = randomUUID();

  return (
    <View key={uuid}>
      <ThemeText
        styles={{
          ...styles.transactionTimeBanner,
        }}
        content={`${bannerText}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  transactionContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
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
  transactionTimeBanner: {
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
    width: 250,
    textAlign: 'center',
  },

  mostRecentTxContainer: {
    width: 'auto',
    ...CENTER,
    alignItems: 'center',
  },
});
