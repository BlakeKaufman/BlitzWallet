import {
  PaymentDetailsVariant,
  PaymentMethod,
  PaymentState,
  PaymentType,
} from '@breeztech/react-native-breez-sdk-liquid';
import {useGlobalContextProvider} from '../../context-store/context';
import {useNavigation} from '@react-navigation/native';
import startLiquidUpdateInterval from '../functions/liquidBackupUpdate';

// SDK events listener

const BLOCKED_PAYMENT_CODES = [
  'Auto Channel Rebalance',
  'Auto Channel Open',
  'Store - chatGPT',
];
//auto channel rebalance
//APP STORE
//chatGPT
//messaging
//VPN

let intervalId;
export default function useGlobalLiquidOnBreezEvent() {
  const {toggleBreezContextEvent, toggleLiquidNodeInformation} =
    useGlobalContextProvider();
  const navigate = useNavigation();

  return function onBreezEvent(e) {
    console.log('Running in breez Liquid event');
    console.log(e);

    console.log(
      e.type === 'paymentWaitingConfirmation' || e.type === 'paymentPending',
    );

    if (
      e.type === 'paymentWaitingConfirmation' ||
      e.type === 'paymentPending'
    ) {
      if (intervalId) clearInterval(intervalId);
      intervalId = startLiquidUpdateInterval(toggleLiquidNodeInformation);

      console.log(
        BLOCKED_PAYMENT_CODES.includes(e.details?.details?.description),
        'BLOCKING NAVIGATION LOGIC',
      );

      if (BLOCKED_PAYMENT_CODES.includes(e.details?.details?.description))
        return;
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
              for:
                e.details.paymentType === PaymentType.SEND
                  ? 'paymentsucceed'
                  : 'invoicepaid',
              information: e?.details,
              formattingType: 'liquidNode',
            },
          },
        ],
      });
    } else if (e.type === 'paymentSucceeded') {
      if (intervalId) clearInterval(intervalId);
      intervalId = startLiquidUpdateInterval(toggleLiquidNodeInformation);
    }
  };
}
