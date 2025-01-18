import {useNavigation} from '@react-navigation/native';
import {useLiquidEvent} from './liquidEventContext';
import {useEffect} from 'react';
import {useLightningEvent} from './lightningEventContext';

export function LiquidNavigationListener() {
  const navigation = useNavigation();
  const {pendingNavigation, setPendingNavigation} = useLiquidEvent();

  useEffect(() => {
    console.log('RUNNING IN PENDING NAVIGATION LISTENER', pendingNavigation);
    if (!pendingNavigation) return;
    navigation.reset(pendingNavigation);
    setPendingNavigation(null);
  }, [pendingNavigation]);

  return null;
}

export function LightningNavigationListener() {
  const navigation = useNavigation();
  const {pendingNavigation, setPendingNavigation} = useLightningEvent();

  useEffect(() => {
    if (!pendingNavigation) return;
    console.log(
      'RUNNING IN PENDING NAVIGATION LISTENER',
      pendingNavigation.routes[1]?.params,
    );
    navigation.reset(pendingNavigation);
    setPendingNavigation(null);
  }, [pendingNavigation]);

  return null;
}
