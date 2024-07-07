import {
  BackHandler,
  Platform,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import {useEffect, useRef} from 'react';
import {registerWebhook} from '@breeztech/react-native-breez-sdk';
import HomeLightning from '../../components/admin/homeComponents/homeLightning';
import {ConfigurePushNotifications} from '../../hooks/setNotifications';
import handleBackPress from '../../hooks/handleBackPress';
import {useIsFocused} from '@react-navigation/native';

export default function AdminHome() {
  console.log('admin home');
  const expoPushToken = ConfigurePushNotifications();
  const isFocused = useIsFocused();

  const didLogWebhook = useRef(false);

  function handleBackPressFunction() {
    BackHandler.exitApp();

    return true;
  }
  useEffect(() => {
    if (!isFocused) return;
    console.log('RUNNIN IN APP INDES USE EFFECT');
    handleBackPress(handleBackPressFunction);
  }, [isFocused]);

  expoPushToken &&
    !didLogWebhook.current &&
    (async () => {
      try {
        didLogWebhook.current = true;
        await registerWebhook(
          `https://blitz-wallet.com/.netlify/functions/notify?platform=${Platform.OS}&token=${expoPushToken.data}`,
        );
        didLogWebhook.current = true;
      } catch (err) {
        console.log(err);
      }
    })();

  return <HomeLightning />;
}
