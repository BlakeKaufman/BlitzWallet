import {listPayments, nodeInfo} from '@breeztech/react-native-breez-sdk';
import {useGlobalContextProvider} from '../../context-store/context';

import * as Notifications from 'expo-notifications';
import {getTransactions} from './SDK';
import {LNURL_WITHDRAWL_CODES} from '../constants';

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

    if (e?.type === 'paymentSucceed' || e?.type === 'invoicePaid') {
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
      e?.type === 'paymentSucceed' ||
      (e?.type === 'invoicePaid' &&
        LNURL_WITHDRAWL_CODES.includes(e.details.payment.description))
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
      navigate.navigate('HomeAdmin');
      navigate.navigate('ConfirmTxPage', {
        for: e.type,
        information: e.type === 'invoicePaid' ? e : e?.details,
      });
    }
  };
  async function updateGlobalNodeInformation(e) {
    try {
      // const savedBreezObject = JSON.parse(
      //   await getLocalStorageItem('breezInfo'),
      // );
      const nodeState = await nodeInfo();
      let transactions = await listPayments({});

      // let transactions = nodeInformation.transactions;

      const userBalance = nodeState.channelsBalanceMsat / 1000;
      const inboundLiquidityMsat = nodeState.inboundLiquidityMsats;
      const blockHeight = nodeState.blockHeight;
      const onChainBalance = nodeState.onchainBalanceMsat;

      console.log(
        nodeInformation,
        userBalance,
        inboundLiquidityMsat,
        blockHeight,
        onChainBalance,
      );

      // const msatToSat = nodeState.channelsBalanceMsat / 1000;

      // const sendOrReceiveAmountSats =
      //   e.type === 'invoicePaid'
      //     ? e.details.payment.amountMsat / 1000
      //     : e.details.amountMsat / 1000;

      // e.type === 'paymentSucceed'
      //   ? transactions.unshift(e.details)
      //   : transactions.unshift(e.details.payment);

      const nodeInfoObject = {
        transactions: transactions,
        userBalance:
          e?.type === 'invoicePaid'
            ? userBalance + e.details.payment.amountMsat / 1000
            : userBalance,
        inboundLiquidityMsat: inboundLiquidityMsat,
        // e.type === 'invoicePaid'
        //   ? inboundLiquidityMsat - sendOrReceiveAmountSats
        //   : inboundLiquidityMsat + sendOrReceiveAmountSats,
        blockHeight: blockHeight,
        onChainBalance: onChainBalance,
      };

      toggleNodeInformation(nodeInfoObject);
      // await setLocalStorageItem(
      //   'breezInfo',
      //   JSON.stringify([
      //     nodeInfoObject.transactions,
      //     nodeInfoObject.userBalance,
      //     nodeInfoObject.inboundLiquidityMsat,
      //     nodeInfoObject.blockHeight,
      //     nodeInfoObject.onChainBalance,
      //   ]),
      // );
    } catch (err) {
      console.log(err);
    }
  }
}
