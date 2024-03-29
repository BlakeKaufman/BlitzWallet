import {nodeInfo} from '@breeztech/react-native-breez-sdk';
import {useGlobalContextProvider} from '../../context-store/context';
import {getTransactions} from './SDK';
import {useNavigation} from '@react-navigation/native';
import {getLocalStorageItem, setLocalStorageItem} from './localStorage';
import * as Notifications from 'expo-notifications';

// SDK events listener

const logHandler = logEntry => {
  if (logEntry.level != 'TRACE') {
    console.log(`[${logEntry.level}]: ${logEntry.line}`);
  }
};

export default function globalOnBreezEvent(navigate) {
  const {toggleBreezContextEvent, toggleNodeInformation, nodeInformation} =
    useGlobalContextProvider();
  let currentTransactionIDS = [];

  return function onBreezEvent(e) {
    console.log('RUNNING IN THIS FUNCTION');
    console.log(e);

    if (
      e?.type != 'invoicePaid' &&
      e?.type != 'paymentSucceed' &&
      e?.type != 'paymentFailed'
    )
      return;
    const paymentHash =
      e?.type === 'invoicePaid' ? e.details.payment.id : e.details.id;

    if (currentTransactionIDS.includes(paymentHash)) return;
    e?.type === 'paymentSucceed' ||
      (e?.type === 'invoicePaid' && currentTransactionIDS.push(paymentHash));
    console.log(currentTransactionIDS, 'CURRENT TX IDS');
    console.log(paymentHash);

    if (e?.type === 'paymentSucceed' || e?.type === 'invoicePaid') {
      console.log('CALLED UPDATE FUNC');
      updateGlobalNodeInformation(e);
      toggleBreezContextEvent(e);
    }

    (async () => {
      if (e?.type === 'paymentFailed') return;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Blitz Wallet',
          body: `${e.type === 'invoicePaid' ? 'Received' : 'Sent'} ${Math.round(
            e.type === 'invoicePaid'
              ? e.details.payment.amountMsat / 1000
              : e.details.amountMsat / 1000,
          ).toLocaleString()} sat`,
        },
        trigger: null,
      });
    })();

    if (
      e?.type != 'invoicePaid' ||
      (e?.type === 'invoicePaid' &&
        e.details.payment.description?.includes('bwrfd'))
    )
      return;

    // if (
    //   (e?.type === 'invoicePaid' &&
    //     e.details.payment.description?.includes('bwrfd')) ||
    //   (e?.type === 'paymentSucceed' && e.details.description?.includes('bwsfd'))
    // )
    //   return;
    // if (
    //   e?.type === 'paymentSucceed' &&
    //   e.detials.payment.description
    //     .toLowerCase()
    //     .startsWith('App store - chatGPT'.toLowerCase())
    // )
    //   return;

    // if (e.details.payment.description?.includes('bwrfd')) return;
    if (navigate) {
      if (navigate.canGoBack()) navigate.navigate('HomeAdmin');
      navigate.navigate('ConfirmTxPage', {
        for: e.type,
        information: e,
      });
    }
  };
  async function updateGlobalNodeInformation(e) {
    try {
      const savedBreezObject = JSON.parse(
        await getLocalStorageItem('breezInfo'),
      );

      let transactions = savedBreezObject[0];
      const userBalance = savedBreezObject[1];
      const inboundLiquidityMsat = savedBreezObject[2];
      const blockHeight = savedBreezObject[3];
      const onChainBalance = savedBreezObject[4];
      // const nodeState = await nodeInfo();
      // const msatToSat = nodeState.channelsBalanceMsat / 1000;

      const sendOrReceiveAmountSats =
        e.type === 'invoicePaid'
          ? e.details.payment.amountMsat / 1000
          : e.details.amountMsat / 1000;

      console.log(e.details.payment, 'EEEEEEEE');
      e.type === 'paymentSucceed'
        ? transactions.unshift(e.details)
        : transactions.unshift(e.details.payment);
      console.log(transactions[0]);

      const nodeInfoObject = {
        transactions: transactions,
        userBalance:
          e.type === 'invoicePaid'
            ? userBalance + sendOrReceiveAmountSats
            : userBalance - sendOrReceiveAmountSats,
        inboundLiquidityMsat:
          e.type === 'invoicePaid'
            ? inboundLiquidityMsat - sendOrReceiveAmountSats
            : inboundLiquidityMsat + sendOrReceiveAmountSats,
        blockHeight: blockHeight,
        onChainBalance: onChainBalance,
      };

      toggleNodeInformation(nodeInfoObject);
      await setLocalStorageItem(
        'breezInfo',
        JSON.stringify([
          nodeInfoObject.transactions,
          nodeInfoObject.userBalance,
          nodeInfoObject.inboundLiquidityMsat,
          nodeInfoObject.blockHeight,
          nodeInfoObject.onChainBalance,
        ]),
      );
    } catch (err) {
      console.log(err);
    }
  }
}
