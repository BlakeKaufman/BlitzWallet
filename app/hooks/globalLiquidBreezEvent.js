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
  'TBC Gift Card',
  'sms4sats send sms api payment',
  '1.5',
  '4',
  '9',
  'Internal_Transfer',
];
//auto channel rebalance
//APP STORE
//chatGPT
//messaging
//VPN

let intervalId;
let syncCount = 0;
let confirmedTxIds = [];
export default function useGlobalLiquidOnBreezEvent() {
  const {toggleBreezContextEvent, toggleLiquidNodeInformation} =
    useGlobalContextProvider();
  const navigate = useNavigation();

  return function onBreezEvent(e) {
    console.log('Running in breez Liquid event');
    console.log(e);

    if (e.type === 'synced') {
      if (syncCount < 4) {
        syncCount += 1;
        return;
      }
      if (intervalId) clearInterval(intervalId);
      intervalId = startLiquidUpdateInterval(toggleLiquidNodeInformation);
      syncCount = 0;
    }
    if (
      e.type === 'paymentWaitingConfirmation' ||
      e.type === 'paymentPending'
    ) {
      if (intervalId) clearInterval(intervalId);
      intervalId = startLiquidUpdateInterval(toggleLiquidNodeInformation);

      if (
        e?.details?.details?.type === 'bitcoin' &&
        confirmedTxIds?.includes(e?.details?.txId)
      )
        return;
      e?.details?.details?.type === 'bitcoin' &&
        confirmedTxIds.push(e?.details?.txId);

      console.log(
        !!BLOCKED_PAYMENT_CODES.filter(blockedCode => {
          if (
            blockedCode == '1.5' ||
            blockedCode === '4' ||
            blockedCode === '9'
          ) {
            return e.details?.details?.description == blockedCode;
          } else
            return e.details?.details?.description
              .toLowerCase()
              .includes(blockedCode.toLowerCase());
        }).length,
        'NEW WAY',
        '_________',
        'OLD WAY',
        BLOCKED_PAYMENT_CODES.includes(e.details?.details?.description),
        'BLOCKING NAVIGATION LOGIC',
      );

      if (
        !!BLOCKED_PAYMENT_CODES.filter(blockedCode => {
          if (
            blockedCode === '1.5' ||
            blockedCode === '4' ||
            blockedCode === '9'
          ) {
            return e.details?.details?.description === blockedCode;
          } else
            return e.details?.details?.description
              .toLowerCase()
              .includes(blockedCode.toLowerCase());
        }).length
      )
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
