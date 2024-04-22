import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {COLORS} from '../../constants';
import {useEffect, useRef, useState} from 'react';
import {registerWebhook} from '@breeztech/react-native-breez-sdk';
import NavBar from '../../components/admin/homeComponents/navBar';
import HomeLightning from '../../components/admin/homeComponents/homeLightning';
import {useGlobalContextProvider} from '../../../context-store/context';
import {ConfigurePushNotifications} from '../../hooks/setNotifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {listenForMessages} from '../../hooks/listenForMessages';
import {listenForLiquidEvents} from '../../functions/liquidWallet';

export default function AdminHome() {
  console.log('admin home');
  const expoPushToken = ConfigurePushNotifications();
  const {theme, toggleMasterInfoObject, masterInfoObject, contactsPrivateKey} =
    useGlobalContextProvider();
  listenForMessages(
    toggleMasterInfoObject,
    masterInfoObject,
    contactsPrivateKey,
  );
  listenForLiquidEvents();

  const didLogWebhook = useRef(false);

  expoPushToken &&
    !didLogWebhook.current &&
    (async () => {
      try {
        console.log(
          `https://blitz-wallet.com/.netlify/functions/notify?platform=${Platform.OS}&token=${expoPushToken.data} `,
        );
        await registerWebhook(
          `https://blitz-wallet.com/.netlify/functions/notify?platform=${Platform.OS}&token=${expoPushToken.data}`,
        );
        didLogWebhook.current = true;
      } catch (err) {
        console.log(err);
      }
    })();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
        },
      ]}>
      <SafeAreaView style={styles.container}>
        <NavBar />
        {/* <TouchableOpacity
          onPress={async () => {
            console.log(await AsyncStorage.getAllKeys());
          }}>
          <Text style={{marginTop: 20}}>PRESS ME</Text>
        </TouchableOpacity> */}
        <HomeLightning />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
