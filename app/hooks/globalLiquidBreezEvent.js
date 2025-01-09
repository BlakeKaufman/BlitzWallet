import {
  PaymentDetailsVariant,
  PaymentType,
  SdkEventVariant,
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

export default function useGlobalLiquidOnBreezEvent() {
  const {toggleLiquidNodeInformation} = useGlobalContextProvider();
  const navigate = useNavigation();
  let intervalId;
  let syncCount = 0;

  const debouncedStartInterval = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      if (intervalId) clearInterval(intervalId);
      intervalId = startLiquidUpdateInterval(toggleLiquidNodeInformation);
    }, 2000);
  };

  return function onBreezEvent(e) {
    console.log('Running in breez Liquid event');
    console.log(e);

    if (
      e.type === SdkEventVariant.PAYMENT_WAITING_CONFIRMATION ||
      e.type === SdkEventVariant.PAYMENT_PENDING
    ) {
      debouncedStartInterval();

      if (
        e?.details?.details?.type === PaymentDetailsVariant.BITCOIN &&
        e?.details.paymentType === PaymentType.SEND
      )
        return;

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
    } else {
      if (e.type === SdkEventVariant.SYNCED) {
        if (syncCount < 2) {
          syncCount += 1;
          return;
        }
        syncCount = 0;
      }
      debouncedStartInterval();
    }
  };
}
