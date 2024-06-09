import {Platform} from 'react-native';
import {useRef} from 'react';
import {registerWebhook} from '@breeztech/react-native-breez-sdk';
import NavBar from '../../components/admin/homeComponents/navBar';
import HomeLightning from '../../components/admin/homeComponents/homeLightning';
import {ConfigurePushNotifications} from '../../hooks/setNotifications';
import {listenForMessages} from '../../hooks/listenForMessages';
import {GlobalThemeView} from '../../functions/CustomElements';

export default function AdminHome() {
  console.log('admin home');
  const expoPushToken = ConfigurePushNotifications();
  listenForMessages();

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

  return (
    <GlobalThemeView styles={{paddingBottom: 0}}>
      <NavBar />
      <HomeLightning />
    </GlobalThemeView>
  );
}
