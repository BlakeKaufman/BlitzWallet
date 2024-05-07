import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';

import {
  CENTER,
  COLORS,
  FONT,
  ICONS,
  SATSPERBITCOIN,
  SIZES,
} from '../../../../constants';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {updateHomepageTransactions} from '../../../../hooks/updateHomepageTransactions';
import {
  formatBalanceAmount,
  getLocalStorageItem,
  numberConverter,
} from '../../../../functions';
import {assetIDS} from '../../../../functions/liquidWallet/assetIDS';
import {randomUUID} from 'expo-crypto';

export function UserTransactions(props) {
  props.from === 'homepage' && updateHomepageTransactions();
  const {nodeInformation, theme, masterInfoObject, liquidNodeInformation} =
    useGlobalContextProvider();
  const navigate = useNavigation();
  const showAmount = masterInfoObject.userBalanceDenomination != 'hidden';
  let formattedTxs = [];
  let currentGroupedDate = '';
  // const conjoinedTxList =
  //   masterInfoObject.failedTransactions.length != 0
  //     ? createConjoinedTxList(
  //         nodeInformation.transactions,
  //         masterInfoObject.failedTransactions,
  //       )
  //     : nodeInformation.transactions;

  const conjoinedTxList = createConjoinedTxList(
    [...liquidNodeInformation.transactions, ...nodeInformation.transactions],
    // nodeInformation.transactions.length === 0 &&
    //   liquidNodeInformation.transactions.length === 0
    //   ? []
    //   : nodeInformation.transactions.length != 0 &&
    //     liquidNodeInformation.transactions.length != 0
    //   ? [...liquidNodeInformation.transactions, ...nodeInformation.transactions]
    //   : nodeInformation.transactions.length != 0 &&
    //     liquidNodeInformation.transactions.length === 0
    //   ? [...nodeInformation.transactions]
    //   : [...liquidNodeInformation.transactions],
  );

  conjoinedTxList &&
    conjoinedTxList
      .slice(
        0,
        props.from === 'homepage'
          ? masterInfoObject.homepageTxPreferance
          : conjoinedTxList.length,
      )
      .forEach((tx, id) => {
        const keyUUID = randomUUID();
        const isLiquidPayment = !!tx.created_at_ts;
        const paymentDate = new Date(
          isLiquidPayment ? tx.created_at_ts / 1000 : tx.paymentTime * 1000,
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
            paymentDate={paymentDate}
            id={keyUUID}
          />
        );
        if (props.from === 'viewAllTxPage') {
          if (id === 0 || currentGroupedDate != paymentDate.toDateString()) {
            currentGroupedDate = paymentDate.toDateString();

            formattedTxs.push(dateBanner(paymentDate.toDateString(), theme));
          }
        }

        formattedTxs.push(styledTx);
      });

  props.from === 'homepage' &&
    formattedTxs.push(
      <TouchableOpacity
        style={{marginBottom: 10}}
        onPress={() => {
          navigate.navigate('ViewAllTxPage');
        }}>
        <Text
          style={[
            styles.headerText,
            {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
          ]}>
          See all transactions
        </Text>
      </TouchableOpacity>,
    );

  return (
    <View style={{flex: 1, alignItems: 'center'}}>
      {conjoinedTxList?.length === 0 ? (
        <View style={[styles.noTransactionsContainer]} key={'noTx'}>
          <Text
            style={[
              styles.noTransactionsText,
              {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
            ]}>
            Send or receive a transaction for it to show up here
          </Text>
        </View>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            props.from === 'homepage' ? {alignItems: 'center'} : {},
          ]}
          style={[
            props.from === 'homepage'
              ? {flex: 1, width: '85%'}
              : {width: '90%', ...CENTER},
          ]}
          data={formattedTxs}
          renderItem={({item}) => item}
        />
      )}
    </View>
  );
}

function UserTransaction(props) {
  const endDate = new Date();
  const transaction = props.tx;
  const paymentDate = props.paymentDate;
  const timeDifferenceMs = endDate - paymentDate;
  const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60);
  const timeDifferenceHours = timeDifferenceMs / (1000 * 60 * 60);
  const timeDifferenceDays = timeDifferenceMs / (1000 * 60 * 60 * 24);

  return (
    <TouchableOpacity
      key={props.id}
      activeOpacity={0.5}
      onPress={() => {
        props.navigate.navigate('ExpandedTx', {
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
              : ICONS.Xcircle
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
                color: props.theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            {props.isLiquidPayment
              ? transaction.type === 'outgoing'
                ? 'Sent'
                : 'Received'
              : props.userBalanceDenomination === 'hidden'
              ? '*****'
              : transaction.metadata?.includes('usedAppStore')
              ? `Store - ${transaction.metadata?.split('"')[5]}`
              : !transaction.description
              ? transaction.paymentType === 'sent'
                ? 'Sent'
                : 'Received'
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
                color: props.theme ? COLORS.darkModeText : COLORS.lightModeText,
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
        <Text
          style={[
            styles.amountText,
            {
              color: props.theme ? COLORS.darkModeText : COLORS.lightModeText,
            },
          ]}>
          {props.userBalanceDenomination != 'hidden'
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
            : ' *****'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
function createConjoinedTxList(combinedArr) {
  combinedArr.sort((a, b) => {
    let A = a.paymentType ? a.paymentTime : a.created_at_ts / 1000;
    let B = b.paymentType ? b.paymentTime : b.created_at_ts / 1000;

    A - B;
  });
  return combinedArr;
}

function dateBanner(date, theme) {
  const uuid = randomUUID();
  return (
    <View key={uuid}>
      <Text
        style={[
          styles.transactionTimeBanner,
          {
            backgroundColor: theme
              ? COLORS.darkModeBackgroundOffset
              : COLORS.lightModeBackgroundOffset,
            color: theme ? COLORS.darkModeText : COLORS.lightModeText,
          },
        ]}>
        {date}
      </Text>
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
