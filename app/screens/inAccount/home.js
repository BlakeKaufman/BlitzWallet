import {Platform, SafeAreaView, StyleSheet, View} from 'react-native';
import {useRef} from 'react';
import {registerWebhook} from '@breeztech/react-native-breez-sdk';
import HomeLightning from '../../components/admin/homeComponents/homeLightning';
import {ConfigurePushNotifications} from '../../hooks/setNotifications';

export default function AdminHome() {
  console.log('admin home');
  const expoPushToken = ConfigurePushNotifications();

  const didLogWebhook = useRef(false);

  expoPushToken &&
    !didLogWebhook.current &&
    (async () => {
      try {
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
