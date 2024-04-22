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
} from '../../../../../constants';
import {useNavigation} from '@react-navigation/native';

import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {formatBalanceAmount, numberConverter} from '../../../../../functions';
import {updateLiquidTransactions} from '../../../../../hooks/updateLiquidTransactions';
import {assetIDS} from '../../../../../functions/liquidWallet/assetIDS';
import {useEffect, useState} from 'react';

export function FormattedLiquidTransactions() {
  updateLiquidTransactions();
  const {liquidNodeInformation, theme, masterInfoObject} =
    useGlobalContextProvider();
  const navigate = useNavigation();
  const showAmount = masterInfoObject.userBalanceDenomination != 'hidden';

  const [formattedTxs, setFormattedTxs] = useState([]);
  let currentGroupedDate = '';

  useEffect(() => {
    let tempTransactions = [];
    liquidNodeInformation.transactions &&
      liquidNodeInformation.transactions
        .sort((a, b) => b.created_at_ts - a.created_at_ts)
        .forEach((tx, id) => {
          const paymentDate = new Date(tx.created_at_ts / 1000);

          const styledTx = (
            <UserTransaction
              theme={theme}
              showAmount={showAmount}
              userBalanceDenomination={masterInfoObject.userBalanceDenomination}
              key={id}
              paymentDate={paymentDate}
              tx={tx}
              navigate={navigate}
              liquidNodeInformation={liquidNodeInformation}
            />
          );

          if (id === 0 || currentGroupedDate != paymentDate.toDateString()) {
            currentGroupedDate = paymentDate.toDateString();

            tempTransactions.push(
              dateBanner(paymentDate.toDateString(), theme),
            );
          }

          tempTransactions.push(styledTx);
        });

    setFormattedTxs(tempTransactions);
  }, [liquidNodeInformation.transactions]);

  return (
    <View style={{flex: 1, alignItems: 'center', width: '100%'}}>
      {liquidNodeInformation.transactions?.length === 0 ? (
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
          style={[{width: '95%', ...CENTER}]}
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
      activeOpacity={0.5}
      onPress={() => {
        //    Navigation to expanded transaction page
      }}>
      <View style={styles.transactionContainer}>
        <Image
          source={ICONS.smallArrowLeft}
          style={[
            styles.icons,
            {
              transform: [
                {
                  rotate: transaction.type === 'incoming' ? '130deg' : '310deg',
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
            {props.userBalanceDenomination === 'hidden'
              ? '*****'
              : !transaction.memo
              ? transaction.type === 'outgoing'
                ? 'Sent'
                : 'Received'
              : transaction.memo.length > 15
              ? transaction.memo.slice(0, 15) + '...'
              : transaction.memo}
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
            ? (transaction.type === 'incoming' ? '+' : '-') +
              formatBalanceAmount(
                numberConverter(
                  Math.abs(transaction.satoshi[assetIDS['L-BTC']] / 1000),
                  props.userBalanceDenomination,
                  props.liquidNodeInformation,
                  props.userBalanceDenomination != 'fiat' ? 0 : 2,
                ),
              ) +
              ` ${
                props.userBalanceDenomination === 'hidden'
                  ? ''
                  : props.userBalanceDenomination === 'sats'
                  ? 'sats'
                  : props.liquidNodeInformation.fiatStats.coin
              }`
            : ' *****'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function dateBanner(date, theme) {
  return (
    <View key={date}>
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
