import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  AppState,
  PermissionsAndroid,
  Platform,
  View,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import {getBoltzWsUrl} from '../app/functions/boltz/boltzEndpoitns';
import WebView from 'react-native-webview';
import handleReverseClaimWSS from '../app/functions/boltz/handle-reverse-claim-wss';
import handleWebviewClaimMessage from '../app/functions/boltz/handle-webview-claim-message';
import {
  getLocalStorageItem,
  retrieveData,
  setLocalStorageItem,
} from '../app/functions';
import {addDataToCollection} from '../db';
import * as Device from 'expo-device';

const PushNotificationManager = ({children}) => {
  const webViewRef = useRef(null);
  const [webViewArgs, setWebViewArgs] = useState({
    page: null,
    function: null,
  });
  const receivedSwapsRef = useRef({});

  useEffect(() => {
    async function initNotification() {
      const {status} = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permission denied');
        return;
      }

      if (Platform.OS === 'ios') Notifications.setBadgeCountAsync(0);

      const deviceToken = await registerForPushNotificationsAsync();
      if (deviceToken) {
        await checkAndSavePushNotificationToDatabase(deviceToken);
      }

      registerNotificationHandlers();
    }
    initNotification();
  }, []);

  const checkAndSavePushNotificationToDatabase = async deviceToken => {
    try {
      const savedDeviceToken =
        JSON.parse(await getLocalStorageItem('pushToken')) || {};

      const test = await getLocalStorageItem('pushToken');
      const encryptedText = savedDeviceToken.encriptedText;

      if (!Object.keys(savedDeviceToken).length) {
        savePushNotificationToDatabase(deviceToken);
        return;
      }

      const decryptedToken = await (
        await fetch(
          'https://blitz-wallet.com/.netlify/functions/decriptMessage',
          {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({encriptedText: encryptedText}),
          },
        )
      ).json();

      if (decryptedToken.decryptedText === deviceToken) return;

      savePushNotificationToDatabase(deviceToken);
    } catch (error) {
      console.error('Error in checkAndSavePushNotificationToDatabase', error);
    }
  };

  const savePushNotificationToDatabase = async pushKey => {
    try {
      const encryptedData = await (
        await fetch(
          `https://blitz-wallet.com/.netlify/functions/encriptMessage`,
          {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({text: pushKey}),
          },
        )
      ).json();
      await setLocalStorageItem('pushToken', JSON.stringify(encryptedData));
      await addDataToCollection(
        {
          pushNotifications: {platform: Platform.OS, key: encryptedData},
        },
        'blitzWalletUsers',
      );
    } catch (error) {
      console.error('Error saving push notification to database', error);
    }
  };

  const registerNotificationHandlers = () => {
    Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground', notification);
      Notifications.scheduleNotificationAsync({
        content: {title: 'Running in the background'},
        trigger: null,
      });
      // handleSwap(notification, 'Foreground');
    });

    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification opened by device user', response.notification);
      // handleSwap(response.notification, 'Clicked');
    });
  };

  const handleSwap = (notification, notificationType) => {
    const webSocket = new WebSocket(
      `${getBoltzWsUrl(process.env.BOLTZ_ENVIRONMENT)}`,
    );

    if (Platform.OS === 'ios') {
      const {
        payload: {privateKey, preimage, swapInfo, liquidAddress, title},
      } = notification.request.content.data;

      if (
        title === 'Running in the background' ||
        title === 'Claiming incoming payment' ||
        title === 'Payment Received' ||
        !privateKey ||
        !preimage ||
        !swapInfo ||
        !liquidAddress
      )
        return;

      if (!receivedSwapsRef.current[swapInfo.id]) {
        receivedSwapsRef.current[swapInfo.id] = true;
      } else return;

      console.log(privateKey, preimage, swapInfo, liquidAddress);

      setWebViewArgs({page: 'notifications'});

      if (notificationType === 'Background') {
        Notifications.scheduleNotificationAsync({
          content: {title: 'Running in the background'},
          trigger: null,
        });
      }

      Notifications.scheduleNotificationAsync({
        content: {title: 'Claiming incoming payment'},
        trigger: null,
      });

      handleReverseClaimWSS({
        ref: webViewRef,
        webSocket,
        liquidAddress,
        swapInfo,
        preimage,
        privateKey: privateKey,
        fromPage: 'notifications',
      });
    }
  };

  return (
    <View style={{flex: 1}}>
      <WebView
        domStorageEnabled
        javaScriptEnabled
        ref={webViewRef}
        containerStyle={{position: 'absolute', top: 1000, left: 1000}}
        source={
          Platform.OS === 'ios'
            ? require('boltz-swap-web-context')
            : {uri: 'file:///android_asset/boltzSwap.html'}
        }
        originWhitelist={['*']}
        onMessage={event =>
          handleWebviewClaimMessage(
            null,
            event,
            webViewArgs.page,
            webViewArgs.function,
          )
        }
      />
      {children}
    </View>
  );
};

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const {status: existingStatus} = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const {status} = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert('Failed to get push token for push notification!');
      return;
    }
    try {
      const projectId = 'edf13405-7014-4f88-aee5-ec131bfc217d';
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(token, 'PUSH TOKEN');
    } catch (e) {
      token = `${e}`;
    }
  } else {
    Alert.alert('Must use physical device for Push Notifications');
  }

  return token;
}

export default PushNotificationManager;
