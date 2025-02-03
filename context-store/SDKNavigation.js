import {useNavigation} from '@react-navigation/native';
import {useLiquidEvent} from './liquidEventContext';
import {useEffect, useRef} from 'react';
import {useLightningEvent} from './lightningEventContext';

export function LiquidNavigationListener() {
  const navigation = useNavigation();
  const {pendingNavigation, setPendingNavigation} = useLiquidEvent();
  const isNavigating = useRef(false);

  useEffect(() => {
    console.log('RUNNING IN PENDING NAVIGATION LISTENER', pendingNavigation);
    if (!pendingNavigation) return;
    if (isNavigating.current) return;
    isNavigating.current = true;
    navigation.reset(pendingNavigation);
    requestAnimationFrame(() => {
      isNavigating.current = false;
      setPendingNavigation(null);
    });
  }, [pendingNavigation]);

  return null;
}

export function LightningNavigationListener() {
  const navigation = useNavigation();
  const {pendingNavigation, setPendingNavigation} = useLightningEvent();
  const isNavigating = useRef(false); // Use a ref for local state

  useEffect(() => {
    if (!pendingNavigation) return;
    console.log(
      'RUNNING IN PENDING NAVIGATION LISTENER',
      pendingNavigation.routes[1]?.params,
    );
    if (isNavigating.current) return;
    isNavigating.current = true;
    navigation.reset(pendingNavigation);
    requestAnimationFrame(() => {
      isNavigating.current = false;
      setPendingNavigation(null);
    });
  }, [pendingNavigation]);

  return null;
}
