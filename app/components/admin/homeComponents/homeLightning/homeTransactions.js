import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import {
  CENTER,
  COLORS,
  FONT,
  ICONS,
  SATSPERBITCOIN,
  SIZES,
} from '../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {updateHomepageTransactions} from '../../../../hooks/updateHomepageTransactions';
import {formatBalanceAmount, getLocalStorageItem} from '../../../../functions';

export function HomeTransactions(props) {
  const updateTransactions = updateHomepageTransactions();
  const [txs, setTxs] = useState([]);
  const {nodeInformation, theme, userTxPreferance, userBalanceDenomination} =
    useGlobalContextProvider();
  const navigate = useNavigation();

  useEffect(() => {
    // (async () => {
    setTxs([
      <View style={[styles.noTransactionsContainer]} key={'noTx'}>
        <Text
          style={[
            styles.noTransactionsText,
            {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
          ]}>
          Send or receive a transaction for it to show up here
        </Text>
      </View>,
    ]);

    if (nodeInformation.transactions.length === 0) return;

    // const conjoinedTxList = await createConjoinedTxList(
    //   nodeInformation.transactions,
    // );

    setTransactionElements(
      setTxs,
      props,
      navigate,
      nodeInformation,
      theme,
      userTxPreferance,
      userBalanceDenomination,
    );
    // })();
  }, [
    nodeInformation,
    userBalanceDenomination,
    theme,
    props.numTx,
    updateTransactions,
  ]);

  return <View style={{flex: 1, alignItems: 'center'}}>{txs}</View>;
}

function setTransactionElements(
  setTxs,
  props,
  navigate,
  nodeInformation,
  theme,
  userTxPreferance,
  userBalanceDenomination,
) {
  const transactions = nodeInformation.transactions
    .slice(0, userTxPreferance)
    .map((tx, id) => {
      return (
        <UserTransaction
          theme={theme}
          showAmount={props.showAmount}
          userBalanceDenomination={userBalanceDenomination}
          key={id}
          {...tx}
          navigate={navigate}
          transactions={props.transactions}
          nodeInformation={nodeInformation}
        />
      );
    });

  const scrollTxs = (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{alignItems: 'center'}}
      style={{flex: 1, width: '85%'}}>
      {transactions.length === 0 ? (
        <Text
          style={[
            styles.noTransactionsText,
            {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
          ]}>
          Send or receive a transaction for it to show up here
        </Text>
      ) : (
        <>
          {transactions}
          <TouchableOpacity
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
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );

  setTxs(scrollTxs);
}

function UserTransaction(props) {
  const endDate = new Date();
  const startDate = new Date(props.paymentTime * 1000);
  const paymentDate = new Date(props.paymentTime * 1000).toLocaleString();
  const timeDifferenceMs = endDate - startDate;
  const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60);
  const timeDifferenceHours = timeDifferenceMs / (1000 * 60 * 60);
  const timeDifferenceDays = timeDifferenceMs / (1000 * 60 * 60 * 24);

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={() => {
        props.navigate.navigate('ExpandedTx', {
          txId: props.details.data.paymentHash,
        });
      }}>
      <View style={styles.transactionContainer}>
        <Image
          source={
            props.status === 'complete' ? ICONS.smallArrowLeft : ICONS.Xcircle
          }
          style={[
            styles.icons,
            {
              transform: [
                {
                  rotate:
                    props.status === 'complete'
                      ? props.paymentType === 'sent'
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
            {props.userBalanceDenomination === 'hidden'
              ? '*****'
              : !props.description
              ? 'No description'
              : props.description.includes('bwrfd')
              ? 'faucet'
              : props.description.length > 15
              ? props.description.slice(0, 15) + '...'
              : props.description}
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
            ? (props.paymentType === 'received' ? '+' : '-') +
              formatBalanceAmount(
                props.userBalanceDenomination === 'sats'
                  ? props.amountMsat / 1000
                  : (
                      (props.amountMsat / 1000) *
                      (props.nodeInformation.fiatStats.value / SATSPERBITCOIN)
                    ).toFixed(2),
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
async function createConjoinedTxList(nodeTxs) {
  const failedPayments = await (async () => {
    const failedTxs = JSON.parse(await getLocalStorageItem('failedTxs'));
    return new Promise(resolve => {
      resolve(failedTxs);
    });
  })();
  if (!failedPayments)
    return new Promise(resolve => {
      resolve(nodeTxs);
    });

  const combinedArr = [...nodeTxs, ...failedPayments];

  combinedArr.sort((a, b) => {
    let A = a.paymentType ? a.paymentTime : a.details.paymentTime;
    let B = b.paymentType ? b.paymentTime : b.details.paymentTime;

    A - B;
  });

  return new Promise(resolve => {
    resolve(combinedArr);
  });
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
});
