import {createContext, useContext, useEffect, useRef, useState} from 'react';
import {
  PaymentDetailsVariant,
  PaymentType,
  SdkEventVariant,
} from '@breeztech/react-native-breez-sdk-liquid';
import startLiquidUpdateInterval from '../app/functions/liquidBackupUpdate';
import {useGlobalContextProvider} from './context';
import {AppState} from 'react-native';

const LiquidEventContext = createContext(null);

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
// Create a context for the WebView ref
export function LiquidEventProvider({children}) {
  const {didGetToHomepage, toggleLiquidNodeInformation} =
    useGlobalContextProvider();
  const intervalId = useRef(null);
  const debounceTimer = useRef(null);
  const syncCount = useRef(0);
  const isWaitingForActiveRef = useRef(false);
  const backgroundNotificationEvent = useRef(null);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [liquidEvent, setLiquidEvent] = useState(null);
  const didLoadDataOnInitialSync = useRef(false);
  const receivedPayments = useRef([]);

  const debouncedStartInterval = intervalCount => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      if (intervalId.current) clearInterval(intervalId.current);
      intervalId.current = startLiquidUpdateInterval(
        toggleLiquidNodeInformation,
        intervalCount,
      );
    }, 2000);
  };

  const waitForActiveScreen = () => {
    const subscription = AppState.addEventListener('change', state => {
      console.log('RUNNINGIN WAIT FOR AVTIVE SCREEN', state);
      if (state === 'active' && backgroundNotificationEvent.current) {
        isWaitingForActiveRef.current = false;
        setPendingNavigation({
          routes: [
            {
              name: 'HomeAdmin',
              params: {screen: 'Home'},
            },
            {
              name: 'ConfirmTxPage',
              params: {
                for:
                  backgroundNotificationEvent.current.details.paymentType ===
                  PaymentType.SEND
                    ? 'paymentsucceed'
                    : 'invoicepaid',
                information: backgroundNotificationEvent.current?.details,
                formattingType: 'liquidNode',
              },
            },
          ],
        });
        backgroundNotificationEvent.current = null;
        subscription.remove();
        return true;
      }
    });
  };

  const shouldNavigate = event => {
    console.log('RUNNING IN SHOULD NAVIGATE', event.type);
    setLiquidEvent(null);
    if (
      event.type === SdkEventVariant.PAYMENT_WAITING_CONFIRMATION ||
      event.type === SdkEventVariant.PAYMENT_PENDING
    ) {
      debouncedStartInterval();

      console.log('RUNNING AFTER FIRST IF STATEMENT');
      console.log(event?.details);
      console.log(event?.details?.txId);
      console.log(receivedPayments.current);
      console.log('-----------------------------------');
      if (
        event?.details?.txId &&
        receivedPayments.current.includes(event?.details?.txId)
      ) {
        return false;
      }
      receivedPayments.current.push(event?.details?.txId);

      if (
        event?.details?.details?.type === PaymentDetailsVariant.BITCOIN &&
        event?.details.paymentType === PaymentType.SEND
      )
        return false;
      console.log('CURRENT APP STATW', AppState.currentState);
      if (AppState.currentState == 'background') {
        if (!isWaitingForActiveRef.current) {
          isWaitingForActiveRef.current = true;
          backgroundNotificationEvent.current = event;
          waitForActiveScreen();
        }
        return false;
      }
      console.log(
        !!BLOCKED_PAYMENT_CODES.filter(blockedCode => {
          if (
            blockedCode == '1.5' ||
            blockedCode === '4' ||
            blockedCode === '9'
          ) {
            return event.details?.details?.description == blockedCode;
          } else
            return event.details?.details?.description
              .toLowerCase()
              .includes(blockedCode.toLowerCase());
        }).length,
        'NEW WAY',
        '_________',
        'OLD WAY',
        BLOCKED_PAYMENT_CODES.includes(event.details?.details?.description),
        'BLOCKING NAVIGATION LOGIC',
      );

      if (
        !!BLOCKED_PAYMENT_CODES.filter(blockedCode => {
          if (
            blockedCode === '1.5' ||
            blockedCode === '4' ||
            blockedCode === '9'
          ) {
            return event.details?.details?.description === blockedCode;
          } else
            return event.details?.details?.description
              .toLowerCase()
              .includes(blockedCode.toLowerCase());
        }).length
      )
        return false;
      return true;
    } else {
      if (
        event.type === SdkEventVariant.SYNCED &&
        didLoadDataOnInitialSync.current
      ) {
        if (syncCount.current < 2) {
          syncCount.current += 1;
          return false;
        }
        syncCount.current = 0;
      }

      if (!didLoadDataOnInitialSync.current) {
        debouncedStartInterval(1);
        didLoadDataOnInitialSync.current = true;
        return false;
      }

      debouncedStartInterval();
      return false;
    }
  };

  useEffect(() => {
    if (!didGetToHomepage) return;
    if (!liquidEvent) return;
    const response = shouldNavigate(liquidEvent);
    if (response) {
      console.log('SETTING PENDING NAVIGATION');
      setPendingNavigation({
        routes: [
          {
            name: 'HomeAdmin',
            params: {screen: 'Home'},
          },
          {
            name: 'ConfirmTxPage',
            params: {
              for:
                liquidEvent.details.paymentType === PaymentType.SEND
                  ? 'paymentsucceed'
                  : 'invoicepaid',
              information: liquidEvent?.details,
              formattingType: 'liquidNode',
            },
          },
        ],
      });
    }
  }, [liquidEvent, didGetToHomepage]);

  const onLiquidBreezEvent = e => {
    console.log('Running in breez Liquid event in useContext');
    console.log(e);
    setLiquidEvent(e);
  };

  return (
    <LiquidEventContext.Provider
      value={{
        onLiquidBreezEvent,
        pendingNavigation,
        setPendingNavigation, // Include this so we can clear it after navigation
      }}>
      {children}
    </LiquidEventContext.Provider>
  );
}
export const useLiquidEvent = () => {
  return useContext(LiquidEventContext); // Use the correct context
};
