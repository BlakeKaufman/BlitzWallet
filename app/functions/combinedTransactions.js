import {Image, StyleSheet, View, TouchableOpacity, Text} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../constants';
import {ThemeText} from './CustomElements';
import {randomUUID} from 'expo-crypto';
import formatBalanceAmount from './formatNumber';
import numberConverter from './numberConverter';
import {assetIDS} from './liquidWallet/assetIDS';

export default function getFormattedHomepageTxs({
  nodeInformation,
  liquidNodeInformation,
  masterInfoObject,
  theme,
  navigate,
  showAmount,
  isBankPage,
}) {
  const arr1 = [...nodeInformation.transactions].sort(
    (a, b) => b.paymentTime - a.paymentTime,
  );
  const n1 = nodeInformation.transactions.length;

  const arr2 = [...liquidNodeInformation.transactions].sort(
    (a, b) => b.created_at_ts - a.created_at_ts,
  );

  const n2 = liquidNodeInformation.transactions.length;

  const arr3 = [...masterInfoObject.failedTransactions]
    .filter(tx => Object.keys(tx).length != 0)
    .sort((a, b) => b.invoice.timestamp - a.invoice.timestamp);
  const n3 = masterInfoObject.failedTransactions.length;

  console.log(isBankPage);
  const conjoinedTxList = isBankPage
    ? arr2
    : mergeArrays(arr1, arr2, n1, n2, arr3, n3);

  if (conjoinedTxList.length === 0) {
    return [
      <View style={[styles.noTransactionsContainer]} key={'noTx'}>
        <ThemeText
          content={'Send or receive a transaction for it to show up here'}
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
        isBankPage ? arr2.length : masterInfoObject.homepageTxPreferance,
      )
      .forEach((tx, id) => {
        const keyUUID = randomUUID();
        const isLiquidPayment = !!tx.created_at_ts;
        const isFailedPayment = !!tx?.invoice?.timestamp;
        const paymentDate = new Date(
          isLiquidPayment
            ? tx.created_at_ts / 1000
            : !isFailedPayment
            ? tx.paymentTime * 1000
            : tx.invoice.timestamp * 1000,
        );
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
          />
        );

        const timeDifference = (new Date() - paymentDate) / 1000 / 60 / 60 / 24;

        const bannerText =
          timeDifference < 0.5
            ? 'Today'
            : timeDifference > 0.5 && timeDifference < 1
            ? 'Yesterday'
            : Math.round(timeDifference) <= 30
            ? `${Math.round(timeDifference)} days ago`
            : Math.round(timeDifference) > 30 &&
              Math.round(timeDifference) < 365
            ? `${Math.floor(Math.round(timeDifference) / 30)} months ago`
            : `${Math.floor(Math.round(timeDifference) / 365)} years ago`;

        console.log(paymentDate, 'TESTONG', timeDifference, bannerText);

        if (
          id === 0 ||
          currentGroupedDate != bannerText //&&
          // paymentDate.toDateString() != new Date().toDateString()
        ) {
          currentGroupedDate = bannerText;
          formattedTxs.push(dateBanner(bannerText, theme));
        }
        formattedTxs.push(styledTx);
      });
    if (!isBankPage)
      formattedTxs.push(
        <TouchableOpacity
          style={{marginBottom: 10, ...CENTER}}
          onPress={() => {
            navigate.navigate('ViewAllTxPage');
          }}>
          <ThemeText
            content={'See all transactions'}
            styles={{...styles.headerText}}
          />
        </TouchableOpacity>,
      );
    // return;
    return formattedTxs;
  }
}

function mergeArrays(arr1, arr2, n1, n2, arr3, n3) {
  let arr4 = [];

  let i = 0,
    j = 0,
    k = 0;

  while (i < n1 && j < n2) {
    if (!arr3[k]?.invoice?.timestamp) {
      if (arr1[i].paymentTime < Math.round(arr2[j].created_at_ts / 1000000)) {
        arr4.push(arr2[j++]);
      } else {
        arr4.push(arr1[i++]);
      }
    } else {
      if (
        Math.round(arr2[j].created_at_ts / 1000000) > arr1[i].paymentTime &&
        Math.round(arr2[j].created_at_ts / 1000000) >
          arr3[k]?.invoice?.timestamp
      ) {
        arr4.push(arr2[j++]);
      } else if (
        arr1[i].paymentTime > Math.round(arr2[j].created_at_ts / 1000000) &&
        arr1[i].paymentTime > arr3[k]?.invoice?.timestamp
      ) {
        arr4.push(arr1[i++]);
      } else {
        arr4.push(arr3[k++]);
      }
    }
  }

  while (i < n1) arr4.push(arr1[i++]);

  while (j < n2) arr4.push(arr2[j++]);

  return arr4;
}

export function UserTransaction(props) {
  const endDate = new Date();
  const transaction = props.tx;
  const paymentDate = props.paymentDate;
  const timeDifferenceMs = endDate - paymentDate;
  const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60);
  const timeDifferenceHours = timeDifferenceMs / (1000 * 60 * 60);
  const timeDifferenceDays = timeDifferenceMs / (1000 * 60 * 60 * 24);

  return (
    <TouchableOpacity
      style={{width: props.isBankPage ? '95%' : '90%', ...CENTER}}
      key={props.id}
      activeOpacity={0.5}
      onPress={() => {
        props.navigate.navigate('ExpandedTx', {
          isFailedPayment: props.isFailedPayment,
          isLiquidPayment: props.isLiquidPayment,
          txId: transaction.details?.data?.paymentHash,
          transaction: transaction,
        });
      }}>
      <View style={styles.transactionContainer}>
        <Image
          source={
            props.isLiquidPayment
              ? ICONS.smallArrowLeft
              : transaction.status === 'complete'
              ? ICONS.smallArrowLeft
              : ICONS.failedTransaction
          }
          style={[
            styles.icons,
            {
              transform: [
                {
                  rotate: props.isLiquidPayment
                    ? transaction.type === 'outgoing'
                      ? '130deg'
                      : '310deg'
                    : transaction.status === 'complete'
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
                color: props.isFailedPayment
                  ? COLORS.failedTransaction
                  : props.theme
                  ? COLORS.darkModeText
                  : COLORS.lightModeText,
                fontStyle: props.isFailedPayment ? 'italic' : 'normal',
              },
            ]}>
            {props.isFailedPayment
              ? 'Payment not sent'
              : props.userBalanceDenomination === 'hidden'
              ? '*****'
              : props.isLiquidPayment
              ? transaction.type === 'outgoing'
                ? 'Sent'
                : 'Received'
              : !transaction.description
              ? transaction.paymentType === 'sent'
                ? 'Sent'
                : 'Received'
              : transaction.metadata?.includes('usedAppStore')
              ? `Store - ${transaction.metadata?.split('"')[5]}`
              : transaction.description.includes('bwrfd')
              ? 'faucet'
              : transaction.description.length > 15
              ? transaction.description.slice(0, 15) + '...'
              : transaction.description}
          </Text>

          <Text
            style={[
              styles.dateText,
              {
                color: props.isFailedPayment
                  ? COLORS.failedTransaction
                  : props.theme
                  ? COLORS.darkModeText
                  : COLORS.lightModeText,
                fontStyle: props.isFailedPayment ? 'italic' : 'normal',
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
        {!props.isFailedPayment ? (
          <ThemeText
            content={
              props.userBalanceDenomination != 'hidden'
                ? (props.isLiquidPayment
                    ? transaction.type === 'incoming'
                      ? '+'
                      : '-'
                    : transaction.paymentType === 'received'
                    ? '+'
                    : '-') +
                  formatBalanceAmount(
                    numberConverter(
                      props.isLiquidPayment
                        ? Math.abs(transaction.satoshi[assetIDS['L-BTC']])
                        : transaction.amountMsat / 1000,
                      props.userBalanceDenomination,
                      props.nodeInformation,
                      props.userBalanceDenomination != 'fiat' ? 0 : 2,
                    ),
                  ) +
                  ` ${
                    props.userBalanceDenomination === 'hidden'
                      ? ''
                      : props.userBalanceDenomination === 'sats'
                      ? 'sats'
                      : props.nodeInformation.fiatStats.coin
                  }`
                : ' *****'
            }
            styles={{...styles.amountText}}
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
  },
  icons: {
    width: 30,
    height: 30,
    marginRight: 15,
  },

  descriptionText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Descriptoin_Regular,
  },
  dateText: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.small,
  },
  amountText: {
    marginLeft: 'auto',
    fontFamily: FONT.Other_Regular,
    fontSize: SIZES.medium,
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
});
