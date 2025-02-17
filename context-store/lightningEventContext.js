import {createContext, useContext, useEffect, useRef, useState} from 'react';
import {AppState} from 'react-native';
import {BLOCKED_NAVIGATION_PAYMENT_CODES} from '../app/constants';
import startUpdateInterval from '../app/functions/LNBackupUdate';
import {
  BreezEventVariant,
  PaymentType,
} from '@breeztech/react-native-breez-sdk';
import {useNodeContext} from './nodeContext';
import {useAppStatus} from './appStatus';

const LightningEventContext = createContext(null);

export function LightningEventProvider({children}) {
  const {didGetToHomepage} = useAppStatus();
  const {toggleNodeInformation} = useNodeContext();
  const intervalId = useRef(null);
  const debounceTimer = useRef(null);
  const currentTransactionIDS = useRef([]);
  const isWaitingForActiveRef = useRef(false);
  const backgroundNotificationEvent = useRef(null);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [lightningEvent, setLightningEvent] = useState(null);

  const debouncedStartInterval = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      if (intervalId.current) clearInterval(intervalId.current);
      intervalId.current = startUpdateInterval(toggleNodeInformation);
    }, 2000);
  };

  const waitForActiveScreen = () => {
    const subscription = AppState.addEventListener('change', state => {
      console.log('RUNNINGIN WAIT FOR AVTIVE SCREEN', state);
      if (state === 'active' && backgroundNotificationEvent.current) {
        isWaitingForActiveRef.current = false;

        console.log('RUNNING NAVIGATION FROM THE BACKGROUND');
        setPendingNavigation({
          routes: [
            {
              name: 'HomeAdmin',
              params: {screen: 'Home'},
            },
            {
              name: 'ConfirmTxPage',
              params: {
                for: backgroundNotificationEvent.current?.type,
                information: backgroundNotificationEvent.current?.details,
                formattingType: 'lightningNode',
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
    setLightningEvent(null);
    if (
      event?.type != BreezEventVariant.INVOICE_PAID &&
      event?.type != BreezEventVariant.PAYMENT_SUCCEED &&
      event?.type != BreezEventVariant.PAYMENT_FAILED &&
      event?.type != BreezEventVariant.REVERSE_SWAP_UPDATED
    )
      return false;
    debouncedStartInterval();
    if (event?.type === BreezEventVariant.REVERSE_SWAP_UPDATED) return false;
    console.log('CURRENT APP STATW', AppState.currentState);
    if (AppState.currentState == 'background') {
      if (!isWaitingForActiveRef.current) {
        isWaitingForActiveRef.current = true;
        backgroundNotificationEvent.current = event;
        waitForActiveScreen();
      }
      return false;
    }
    const paymentHash =
      event?.type === BreezEventVariant.INVOICE_PAID
        ? event.details.payment.id
        : event.details.id;

    if (currentTransactionIDS.current.includes(paymentHash)) return false;

    (event?.type === BreezEventVariant.PAYMENT_SUCCEED ||
      event?.type === BreezEventVariant.INVOICE_PAID) &&
      currentTransactionIDS.current.push(paymentHash);

    if (event.type === BreezEventVariant.PAYMENT_FAILED) return false;

    if (
      event?.type === BreezEventVariant.PAYMENT_SUCCEED ||
      event?.details?.status === 'pending' ||
      (event?.type === BreezEventVariant.INVOICE_PAID &&
        BLOCKED_NAVIGATION_PAYMENT_CODES.filter(
          code =>
            code.toLowerCase() ===
            event.details.payment.description.toLowerCase(),
        ).length != 0)
    )
      return false;
    return true;
  };

  useEffect(() => {
    console.log(didGetToHomepage, 'RUNNING BEFORE USE EFFECT LOGIC');
    if (!didGetToHomepage) return;
    if (!lightningEvent) return;
    const response = shouldNavigate(lightningEvent);
    if (response) {
      console.log('SETTING PENDING NAVIGATION');
      console.log('SENDING OBJECT', {
        name: 'ConfirmTxPage',
        params: {
          for: lightningEvent.type,
          information: lightningEvent?.details,
          formattingType: 'lightningNode',
        },
      });
      setPendingNavigation({
        routes: [
          {
            name: 'HomeAdmin',
            params: {screen: 'Home'},
          },
          {
            name: 'ConfirmTxPage',
            params: {
              for: lightningEvent.type,
              information: lightningEvent?.details,
              formattingType: 'lightningNode',
            },
          },
        ],
      });
    }
  }, [lightningEvent, didGetToHomepage]);

  const onLightningBreezEvent = e => {
    console.log('Running in breez event in useContext');
    console.log(e);
    setLightningEvent(e);
  };

  return (
    <LightningEventContext.Provider
      value={{
        onLightningBreezEvent,
        pendingNavigation,
        setPendingNavigation, // Include this so we can clear it after navigation
      }}>
      {children}
    </LightningEventContext.Provider>
  );
}
export const useLightningEvent = () => {
  return useContext(LightningEventContext); // Use the correct context
};
