import {setLogStream} from '@breeztech/react-native-breez-sdk';
import {useGlobalContextProvider} from '../../context-store/context';
import * as Notifications from 'expo-notifications';
import {BLOCKED_NAVIGATION_PAYMENT_CODES} from '../constants';

// SDK events listener

export default function globalOnBreezEvent(navigate) {
  const {toggleBreezContextEvent} = useGlobalContextProvider();
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
      toggleBreezContextEvent(e);
    }

    // (async () => {
    //   if (e?.type === 'paymentFailed') return;
    //   await Notifications.scheduleNotificationAsync({
    //     content: {
    //       title: 'Blitz Wallet',
    //       body: `${e.type === 'invoicePaid' ? 'Received' : 'Sent'} ${Math.round(
    //         e.type === 'invoicePaid'
    //           ? e.details.payment.amountMsat / 1000
    //           : e.details.amountMsat / 1000,
    //       ).toLocaleString()} sat`,
    //     },
    //     trigger: null,
    //   });
    // })();

    if (e.type === 'paymentFailed') {
      if (
        [...BLOCKED_NAVIGATION_PAYMENT_CODES, 'Send to L-BTC address'].filter(
          code =>
            code.toLowerCase() === e.details.invoice.description.toLowerCase(),
        ).length != 0
      )
        return;
      navigate.navigate('HomeAdmin');
      navigate.navigate('ConfirmTxPage', {
        for: e.type,
        information: e?.details,
      });
      return;
    }

    if (
      e?.type === 'paymentSucceed' ||
      (e?.type === 'invoicePaid' &&
        BLOCKED_NAVIGATION_PAYMENT_CODES.filter(
          code =>
            code.toLowerCase() === e.details.payment.description.toLowerCase(),
        ).length != 0)
    )
      return;

    if (navigate) {
      navigate.navigate('HomeAdmin');
      navigate.navigate('ConfirmTxPage', {
        for: e.type,
        information: e.type === 'invoicePaid' ? e : e?.details,
      });
    }
  };
}
