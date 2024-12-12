import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  AppState,
  PermissionsAndroid,
  Platform,
  View,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  getBoltzApiUrl,
  getBoltzWsUrl,
} from '../app/functions/boltz/boltzEndpoitns';
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
import {useGlobalContextProvider} from './context';
import * as Crypto from 'react-native-quick-crypto';

import * as TaskManager from 'expo-task-manager';

import messaging from '@react-native-firebase/messaging';

const PushNotificationManager = ({children}) => {
  const {didGetToHomepage, masterInfoObject} = useGlobalContextProvider();

  const webViewRef = useRef(null);
  const didRunRef = useRef(false);

  useEffect(() => {
    if (!didGetToHomepage || didRunRef.current) return;
    didRunRef.current = true;
    async function initNotification() {
      console.log('IN INITIALIIZATION FUNCTION');
      const {status} = await Notifications.requestPermissionsAsync();
      console.log('AFTER STATUS FUNCTION', status);
      if (status !== 'granted') {
        console.log('Notification permission denied');
        return;
      }

      if (Platform.OS === 'ios') Notifications.setBadgeCountAsync(0);
      console.log('BEFROE REGISTER NOTIFICATION');

      const deviceToken = await registerForPushNotificationsAsync();
      console.log(deviceToken, 'DEVICE TOKEN');
      if (deviceToken) {
        await checkAndSavePushNotificationToDatabase(deviceToken);
      } else {
        // Alert.alert('No device token generated');
      }

      registerNotificationHandlers();
    }
    console.log('BEFORE INIFIALIZATION FUNCTION CALL');
    initNotification();
  }, [didGetToHomepage]);

  const checkAndSavePushNotificationToDatabase = async deviceToken => {
    try {
      if (masterInfoObject?.pushNotifications?.hash) {
        // DONT DECRPT HERE, INSTED HASH THE DEVICE KEY AND CHECK THE HASH
        const hashedPushKey = Crypto.default
          .createHash('sha256')
          .update(deviceToken)
          .digest('hex');

        // const decryptedToken = await (
        //   await fetch(
        //     'https://blitz-wallet.com/.netlify/functions/decriptMessage',
        //     {
        //       method: 'POST',
        //       headers: {'Content-Type': 'application/json'},
        //       body: JSON.stringify({
        //         encriptedText:
        //           masterInfoObject.pushNotifications.key.encriptedText,
        //       }),
        //     },
        //   )
        // ).json();

        console.log(hashedPushKey, masterInfoObject?.pushNotifications?.hash);

        if (masterInfoObject?.pushNotifications?.hash === hashedPushKey) return;
      }
      // const savedDeviceToken =
      //   JSON.parse(await getLocalStorageItem('pushToken')) || {};

      // const encryptedText = savedDeviceToken?.encriptedText;

      // if (!encryptedText) {
      //   savePushNotificationToDatabase(deviceToken);
      //   return;
      // }

      savePushNotificationToDatabase(deviceToken);
    } catch (error) {
      // Alert.alert('Error checking push notification', JSON.stringify(error));
      console.error('Error in checkAndSavePushNotificationToDatabase', error);
    }
  };

  const savePushNotificationToDatabase = async pushKey => {
    try {
      const hashedPushKey = Crypto.default
        .createHash('sha256')
        .update(pushKey)
        .digest('hex');
      let encryptedData = await (
        await fetch(
          `https://blitz-wallet.com/.netlify/functions/encriptMessage`,
          {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({text: pushKey}),
          },
        )
      ).json();
      // await setLocalStorageItem('pushToken', JSON.stringify(encryptedData));
      await addDataToCollection(
        {
          pushNotifications: {
            platform: Platform.OS,
            key: encryptedData,
            hash: hashedPushKey,
          },
        },
        'blitzWalletUsers',
      );
    } catch (error) {
      // Alert.alert('Error saving token to database', JSON.stringify(error));
      console.error('Error saving push notification to database', error);
    }
  };

  const registerNotificationHandlers = () => {
    Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground', notification);
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

      if (!privateKey || !preimage || !swapInfo || !liquidAddress) return;

      console.log(privateKey, preimage, swapInfo, liquidAddress);

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
          handleWebviewClaimMessage(null, event, 'savedClaimInformation', null)
        }
      />
      {children}
    </View>
  );
};

async function registerForPushNotificationsAsync() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(
        'blitzWalletNotifications',
        {
          name: 'blitzWalletNotifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        },
      );
    }

    if (Device.isDevice) {
      const permissionsResult = await Notifications.getPermissionsAsync();

      let finalStatus = permissionsResult.status;

      if (finalStatus !== 'granted') {
        const requestResult = await Notifications.requestPermissionsAsync();

        finalStatus = requestResult.status;
      }

      if (finalStatus !== 'granted') {
        console.log('PERMISSIONS NOT GRANTED');
        return false;
      }

      let options = {
        projectId: process.env.EXPO_PROJECT_ID,
      };
      if (Platform.OS === 'ios') {
        const token = await messaging().getAPNSToken();
        options.devicePushToken = {type: 'ios', data: token};
      }

      const pushToken = await Notifications.getExpoPushTokenAsync(options);

      return pushToken.data;
    } else {
      Alert.alert('Must use physical device for Push Notifications');
    }
  } catch (err) {
    console.error('UNEXPECTED ERROR IN FUNCTION', err);
    return false;
  }
}

// Define the task name
const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

// Register background task
TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  async ({data, error, executionInfo}) => {
    if (error) {
      console.error('Background task error:', error);
      return;
    }

    if (data) {
      // The notification data will be in data.notification
      const swapInformation = data?.body;
      // const notificationData = notification.request.content.data;

      try {
        if (!swapInformation) return;
        storeNotification(swapInformation);
      } catch (error) {
        console.error('Error handling background notification:', error);
      }
    }
  },
);

// Helper function to store notification
async function storeNotification(notificationData) {
  try {
    // Get existing notifications
    const existingSwaps = await getLocalStorageItem('lnurlSwaps');
    const swapArray = existingSwaps ? JSON.parse(existingSwaps) : [];

    if (
      swapArray.filter(
        swapData => swapData.preimage === notificationData.preimage,
      ).lengh
    )
      return;
    if (!notificationData.swapInfo) return;
    const swapArgs = {
      apiUrl: getBoltzApiUrl(process.env.BOLTZ_ENVIRONMENT),
      network: process.env.BOLTZ_ENVIRONMENT,
      address: notificationData.liquidAddress,
      feeRate: process.env.BOLTZ_ENVIRONMENT === 'testnet' ? 0.11 : 0.01,
      swapInfo: notificationData.swapInfo,
      privateKey: notificationData.privateKey,
      preimage: notificationData.preimage,
      createdOn: new Date(),
    };
    console.log(swapArgs, 'SWAP ARGS');

    swapArray.push(swapArgs);

    await setLocalStorageItem('lnurlSwaps', JSON.stringify(swapArray));
  } catch (error) {
    console.error('Error storing notification:', error);
  }
}

// Register the background notification task
export async function registerBackgroundNotificationTask() {
  try {
    await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
  } catch (error) {
    console.error('Task registration failed:', error);
  }
}

export default PushNotificationManager;
