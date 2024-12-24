import {setLogStream} from '@breeztech/react-native-breez-sdk';
import {useGlobalContextProvider} from '../../context-store/context';
// import * as Notifications from 'expo-notifications';
import {BLOCKED_NAVIGATION_PAYMENT_CODES} from '../constants';
import {useNavigation} from '@react-navigation/native';
import startUpdateInterval from '../functions/LNBackupUdate';

// SDK events listener

let intervalId;
export default function useGlobalOnBreezEvent() {
  const {toggleBreezContextEvent, toggleNodeInformation} =
    useGlobalContextProvider();
  const navigate = useNavigation();
  let currentTransactionIDS = [];

  return function onBreezEvent(e) {
    console.log('Running in breez event');
    console.log(e);

    if (
      e?.type != 'invoicePaid' &&
      e?.type != 'paymentSucceed' &&
      e?.type != 'paymentFailed'
    ) {
      return;
    } else {
      toggleBreezContextEvent(e);
      if (intervalId) clearInterval(intervalId);
      intervalId = startUpdateInterval(toggleNodeInformation);
    }
    const paymentHash =
      e?.type === 'invoicePaid' ? e.details.payment.id : e.details.id;

    if (currentTransactionIDS.includes(paymentHash)) return;
    e?.type === 'paymentSucceed' ||
      (e?.type === 'invoicePaid' && currentTransactionIDS.push(paymentHash));

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
            code.toLowerCase() ===
            e?.details?.invoice?.description?.toLowerCase(),
        ).length != 0
      )
        return;
      if (navigate) {
        navigate.reset({
          index: 0, // The top-level route index
          routes: [
            {
              name: 'HomeAdmin',
              params: {screen: 'Home'},
            },
            {
              name: 'ConfirmTxPage',
              params: {
                for: e.type,
                information: e?.details,
                formattingType: 'lightningNode',
              },
            },
          ],
        });
      }
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
      navigate.reset({
        index: 0, // The top-level route index
        routes: [
          {
            name: 'HomeAdmin',
            params: {screen: 'Home'},
          },
          {
            name: 'ConfirmTxPage',
            params: {
              for: e.type,
              information: e.type === 'invoicePaid' ? e : e?.details,
            },
          },
        ],
      });
    }
  };
}
