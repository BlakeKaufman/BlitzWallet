import {Image, StyleSheet, View, TouchableOpacity, Text} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../constants';
import {ThemeText} from './CustomElements';
import FormattedSatText from './CustomElements/satTextDisplay';
import {useTranslation} from 'react-i18next';
import Icon from './CustomElements/Icon';
import {useGlobalThemeContext} from '../../context-store/theme';
import {useGlobalContextProvider} from '../../context-store/context';

export default function getFormattedHomepageTxs({
  nodeInformation,
  liquidNodeInformation,
  homepageTxPreferance = 25,
  navigate,
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
  const arr1 = [...nodeInformation.transactions]
    .map(tx => ({...tx, usesLightningNode: true}))
    .sort((a, b) => b.paymentTime - a.paymentTime);
  const n1 = nodeInformation.transactions.length;

  const arr2 = [...liquidNodeInformation.transactions]
    .map(tx => ({...tx, usesLiquidNode: true}))
    .sort((a, b) => b.timestamp - a.timestamp);

  const n2 = liquidNodeInformation.transactions.length;

  const arr3 = [];

  const n3 = [].length;

  const arr4 = [...ecashTransactions]
    .map(tx => ({...tx, usesEcash: true}))
    .sort((a, b) => b.time - a.time);
  const n4 = ecashTransactions.length;

  const conjoinedTxList = isBankPage
    ? arr2
    : mergeArrays(arr1, arr2, n1, n2, arr3, n3, arr4, n4);

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
    let transactionIndex = 0;

    while (
      formattedTxs.length <
        (isBankPage
          ? arr2.length
          : frompage === 'viewAllTx'
          ? conjoinedTxList.length
          : homepageTxPreferance) &&
      transactionIndex < conjoinedTxList.length
    ) {
      try {
        const currentTransaction = conjoinedTxList[transactionIndex];
        const isLiquidPayment = currentTransaction.usesLiquidNode;
        const isLightningPayment = currentTransaction.usesLightningNode;
        const isEcashPayment = currentTransaction.usesEcash;
        const isFailedPayment = !currentTransaction.status === 'complete';
        let paymentDate;
        if (isLiquidPayment) {
          paymentDate = new Date(currentTransaction.timestamp * 1000);
        } else if (isLightningPayment) {
          paymentDate = new Date(currentTransaction.paymentTime * 1000); // could also need to be timd by 1000
        } else {
          paymentDate = new Date(currentTransaction.time);
        }

        const uniuqeIDFromTx = isLiquidPayment
          ? currentTransaction.timestamp
          : isLightningPayment
          ? currentTransaction.paymentTime
          : currentTransaction.time;

        const styledTx = (
          <UserTransaction
            tx={currentTransaction}
            navigate={navigate}
            nodeInformation={nodeInformation}
            isLiquidPayment={isLiquidPayment}
            isLightningPayment={isLightningPayment}
            isEcashPayment={isEcashPayment}
            isFailedPayment={isFailedPayment}
            paymentDate={paymentDate}
            id={uniuqeIDFromTx}
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
          (transactionIndex === 0 || currentGroupedDate != bannerText) && //&&
          // paymentDate.toDateString() != new Date().toDateString()
          timeDifference > 0.5 &&
          frompage != 'home'
        ) {
          currentGroupedDate = bannerText;
          formattedTxs.push(dateBanner(bannerText));
        }
        if (
          (currentTransaction?.description === 'Auto Channel Rebalance' ||
            currentTransaction?.description?.toLowerCase() ===
              'internal_transfer') &&
          frompage != 'viewAllTx'
        )
          throw Error('Do not show transaction');
        if (
          frompage != 'viewAllTx' &&
          !isBankPage &&
          isLiquidPayment &&
          (currentTransaction.details?.description ===
            'Auto Channel Rebalance' ||
            currentTransaction.details?.description?.toLowerCase() ===
              'internal_transfer')
        )
          throw Error('Do not show transaction');
        formattedTxs.push(styledTx);
      } catch (err) {
        console.log(err);
      } finally {
        transactionIndex += 1;
      }
    }

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
  const {theme, darkModeType} = useGlobalThemeContext();
  const {masterInfoObject} = useGlobalContextProvider();
  const {t} = useTranslation();
  const endDate = new Date();
  const transaction = props.tx;
  const paymentDate = props.paymentDate;
  const {
    isLiquidPayment,
    isLightningPayment,
    isEcashPayment,
    id,
    isFailedPayment,
  } = props;
  const timeDifferenceMs = endDate - paymentDate;
  const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60);
  const timeDifferenceHours = timeDifferenceMs / (1000 * 60 * 60);
  const timeDifferenceDays = timeDifferenceMs / (1000 * 60 * 60 * 24);
  const timeDifferenceYears = timeDifferenceMs / (1000 * 60 * 60 * 24 * 365);

  const paymentImage = (() => {
    if (isLiquidPayment) {
      return darkModeType && theme
        ? ICONS.arrow_small_left_white
        : ICONS.smallArrowLeft;
    } else if (transaction.status === 'complete' || isEcashPayment) {
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
      key={id}
      activeOpacity={0.5}
      onPress={() => {
        props.navigate.navigate('ExpandedTx', {
          isFailedPayment: isFailedPayment,
          transaction: transaction,
        });
      }}>
      <View style={styles.transactionContainer}>
        {(transaction.usesLightningNode && transaction.status === 'pending') ||
        (props.isLiquidPayment && transaction.status === 'pending') ? (
          <View style={{...styles.icons}}>
            <Icon
              width={27}
              height={27}
              color={
                darkModeType && theme ? COLORS.darkModeText : COLORS.primary
              }
              name={'pendingTxIcon'}
            />
          </View>
        ) : (
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
                        ? transaction?.paymentType !== 'receive'
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
        )}

        <View style={{flex: 1, width: '100%'}}>
          <ThemeText
            CustomEllipsizeMode={'tail'}
            CustomNumberOfLines={1}
            styles={{
              ...styles.descriptionText,
              color:
                props.isFailedPayment ||
                transaction.paymentType === 'closed_channel'
                  ? COLORS.failedTransaction
                  : theme
                  ? COLORS.darkModeText
                  : COLORS.lightModeText,
              fontStyle:
                props.isFailedPayment ||
                transaction.paymentType === 'closed_channel'
                  ? 'italic'
                  : 'normal',
              marginRight: 20,
            }}
            content={
              props.isFailedPayment
                ? t('transactionLabelText.failed')
                : masterInfoObject.userBalanceDenomination === 'hidden'
                ? '*****'
                : isLiquidPayment
                ? !!transaction?.details?.description
                  ? transaction?.details?.description
                  : transaction?.paymentType !== 'receive'
                  ? t('constants.sent')
                  : t('constants.received')
                : isLightningPayment &&
                  ((transaction?.details?.data?.lnAddress &&
                    !!transaction?.details?.data?.label) ||
                    (!transaction?.details?.data?.lnAddress &&
                      !!transaction?.description))
                ? transaction?.details?.data.lnAddress
                  ? transaction?.details?.data?.label
                  : transaction?.description
                : transaction.paymentType === 'sent'
                ? t('constants.sent')
                : t('constants.received')
            }
          />

          <ThemeText
            styles={{
              ...styles.dateText,
              color:
                props.isFailedPayment ||
                transaction.paymentType === 'closed_channel'
                  ? COLORS.failedTransaction
                  : theme
                  ? COLORS.darkModeText
                  : COLORS.lightModeText,
              fontStyle:
                props.isFailedPayment ||
                transaction.paymentType === 'closed_channel'
                  ? 'italic'
                  : 'normal',
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
                  ? t('transactionLabelText.txTime_just_now')
                  : Math.round(timeDifferenceMinutes) === 1
                  ? t('constants.minute')
                  : t('constants.minute') + 's'
                : timeDifferenceHours <= 24
                ? Math.round(timeDifferenceHours) === 1
                  ? t('constants.hour')
                  : t('constants.hour') + 's'
                : timeDifferenceDays <= 365
                ? Math.round(timeDifferenceDays) === 1
                  ? t('constants.day')
                  : t('constants.day') + 's'
                : Math.round(timeDifferenceYears) === 1
                ? 'year'
                : 'years'
            } ${
              timeDifferenceMinutes > 1 ? t('transactionLabelText.ago') : ''
            }`}
          />
        </View>
        {!props.isFailedPayment ? (
          <FormattedSatText
            isFailedPayment={
              props.isFailedPayment ||
              transaction.paymentType === 'closed_channel'
            }
            containerStyles={{marginLeft: 'auto', marginBottom: 'auto'}}
            frontText={
              masterInfoObject.userBalanceDenomination != 'hidden'
                ? transaction.paymentType === 'closed_channel'
                  ? ''
                  : props.isLiquidPayment
                  ? transaction?.paymentType === 'receive'
                    ? '+'
                    : '-'
                  : transaction.paymentType === 'received'
                  ? '+'
                  : '-'
                : ''
            }
            styles={{
              ...styles.amountText,
              color:
                props.isFailedPayment ||
                transaction.paymentType === 'closed_channel'
                  ? COLORS.failedTransaction
                  : theme
                  ? COLORS.darkModeText
                  : COLORS.lightModeText,
            }}
            balance={
              isLiquidPayment
                ? transaction.amountSat
                : transaction.type === 'ecash'
                ? transaction.amount
                : transaction.amountMsat / 1000
            }
          />
        ) : (
          <Text style={{marginLeft: 'auto'}}></Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
export function dateBanner(bannerText) {
  return (
    <View key={bannerText}>
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
    alignItems: 'center',
    justifyContent: 'center',
  },

  descriptionText: {
    fontWeight: 400,
  },
  dateText: {
    fontSize: SIZES.small,
  },
  amountText: {
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
    width: '95%',
    maxWidth: 300,
    textAlign: 'center',
  },

  mostRecentTxContainer: {
    width: 'auto',
    ...CENTER,
    alignItems: 'center',
  },
});
