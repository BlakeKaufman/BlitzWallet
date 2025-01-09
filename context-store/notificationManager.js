import React, {useEffect, useRef, useState} from 'react';
import {Alert, Platform, View} from 'react-native';
import * as Notifications from 'expo-notifications';
import WebView from 'react-native-webview';
import handleWebviewClaimMessage from '../app/functions/boltz/handle-webview-claim-message';
import {addDataToCollection} from '../db';
import * as Device from 'expo-device';
import {useGlobalContextProvider} from './context';
import * as Crypto from 'react-native-quick-crypto';

import * as TaskManager from 'expo-task-manager';

import messaging from '@react-native-firebase/messaging';
import {encriptMessage} from '../app/functions/messaging/encodingAndDecodingMessages';

const PushNotificationManager = ({children}) => {
  const {didGetToHomepage, masterInfoObject, contactsPrivateKey} =
    useGlobalContextProvider();

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
      if (
        masterInfoObject?.pushNotifications?.hash &&
        typeof masterInfoObject?.pushNotifications?.key.encriptedText ===
          'string'
      ) {
        // DONT DECRPT HERE, INSTED HASH THE DEVICE KEY AND CHECK THE HASH
        const hashedPushKey = Crypto.default
          .createHash('sha256')
          .update(deviceToken)
          .digest('hex');

        console.log(hashedPushKey, masterInfoObject?.pushNotifications?.hash);

        if (masterInfoObject?.pushNotifications?.hash === hashedPushKey) return;
      }

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

      const encriptedPushKey = encriptMessage(
        contactsPrivateKey,
        process.env.BACKEND_PUB_KEY,
        pushKey,
      );
      console.log(encriptedPushKey, 'NEW ENCRIPTED PUSH KEY');
      await addDataToCollection(
        {
          pushNotifications: {
            platform: Platform.OS,
            key: {encriptedText: encriptedPushKey},
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
    });

    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification opened by device user', response.notification);
    });
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
    console.log('RUNNING IN BACKGROUHND');
    if (data) {
      console.log(data, 'RUNNING IN BACKGROUHND');
    }
  },
);

// Register the background notification task
export async function registerBackgroundNotificationTask() {
  try {
    await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
  } catch (error) {
    console.error('Task registration failed:', error);
  }
}

export default PushNotificationManager;
