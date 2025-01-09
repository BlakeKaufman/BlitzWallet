import {setLogStream} from '@breeztech/react-native-breez-sdk';
import {useGlobalContextProvider} from '../../context-store/context';
// import * as Notifications from 'expo-notifications';
import {BLOCKED_NAVIGATION_PAYMENT_CODES} from '../constants';
import {useNavigation} from '@react-navigation/native';
import startUpdateInterval from '../functions/LNBackupUdate';

// SDK events listener

export default function useGlobalOnBreezEvent() {
  const {toggleNodeInformation} = useGlobalContextProvider();
  const navigate = useNavigation();
  let currentTransactionIDS = [];
  let debounceTimer;
  let intervalId;
  // Custom debounce function
  const debouncedStartInterval = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      if (intervalId) clearInterval(intervalId);
      intervalId = startUpdateInterval(toggleNodeInformation);
    }, 2000);
  };

  return function onBreezEvent(e) {
    console.log('Running in breez event');
    console.log(e);

    if (
      e?.type != 'invoicePaid' &&
      e?.type != 'paymentSucceed' &&
      e?.type != 'paymentFailed' &&
      e?.type != 'reverseSwapUpdated'
    ) {
      return;
    } else {
      // toggleBreezContextEvent(e);
      debouncedStartInterval();
    }
    if (e?.type === 'reverseSwapUpdated') return;
    const paymentHash =
      e?.type === 'invoicePaid' ? e.details.payment.id : e.details.id;

    if (currentTransactionIDS.includes(paymentHash)) return;
    (e?.type === 'paymentSucceed' || e?.type === 'invoicePaid') &&
      currentTransactionIDS.push(paymentHash);

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
      e?.details?.status === 'pending' ||
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
              information: e?.details,
              formattingType: 'lightningNode',
            },
          },
        ],
      });
    }
  };
}
