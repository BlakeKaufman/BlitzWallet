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
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../context-store/context';

export default function AdminHome({navigation}) {
  console.log('admin home');
  // const expoPushToken = ConfigurePushNotifications();
  const isFocused = useIsFocused();
  // const didLogWebhook = useRef(false);
  const {deepLinkContent, setDeepLinkContent} = useGlobalContextProvider();
  const navigate = useNavigation();

  useEffect(() => {
    if (deepLinkContent.data.length === 0) return;
    if (deepLinkContent.type === 'Contact') {
      navigation.jumpTo('ContactsPageInit');
    } else if (deepLinkContent.type === 'LN') {
      navigate.navigate('ConfirmPaymentScreen', {
        btcAdress: deepLinkContent.data,
      });
      setDeepLinkContent({type: '', data: ''});
    }
  }, [deepLinkContent]);

  function handleBackPressFunction() {
    BackHandler.exitApp();

    return true;
  }
  useEffect(() => {
    if (!isFocused) return;
    console.log('RUNNIN IN APP INDES USE EFFECT');
    handleBackPress(handleBackPressFunction);
  }, [isFocused]);

  // expoPushToken &&
  //   !didLogWebhook.current &&
  //   (async () => {
  //     try {
  //       didLogWebhook.current = true;
  //       await registerWebhook(
  //         `https://blitz-wallet.com/.netlify/functions/notify?platform=${Platform.OS}&token=${expoPushToken.data}`,
  //       );
  //       didLogWebhook.current = true;
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   })();

  return <HomeLightning />;
}
