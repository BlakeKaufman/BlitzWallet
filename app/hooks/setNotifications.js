import {useState, useEffect, useRef} from 'react';
import * as Device from 'expo-device';
// import {Notifications} from 'react-native-notifications';
import * as Notifications from 'expo-notifications';

import {Alert} from 'react-native';
import {sendPayment} from '@breeztech/react-native-breez-sdk';
import {retrieveData, storeData} from '../functions';

function ConfigurePushNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  const isInitialRender = useRef(true);
  const [expoPushToken, setExpoPushToken] = useState(null);
  // const [notification, setNotification] = useState(null);
  const notificationListener = useRef();
  // const responseListener = useRef();

  useEffect(() => {
    if (!isInitialRender.current) return;
    (async () => {
      const blitzWalletContact = JSON.parse(
        await retrieveData('blitzWalletContact'),
      );
      blitzWalletContact ||
        registerForPushNotificationsAsync().then(token => {
          storeData(
            'blitzWalletContact',
            JSON.stringify({
              ...blitzWalletContact,
              token: token,
            }),
          ),
            setExpoPushToken(token);
        });
      blitzWalletContact && setExpoPushToken(blitzWalletContact.token);
    })();

    notificationListener.current =
      Notifications.addNotificationReceivedListener(async notification => {
        const lnInvoice = notification.request.content.data.pr;
        if (lnInvoice) {
          try {
            await sendPayment({
              bolt11: lnInvoice,
            });
          } catch (err) {
            console.log(err);
          }
        }

        console.log(notification, notification.request.content.data, 'TESTING');
      });
    // responseListener.current =
    //   Notifications.addNotificationResponseReceivedListener(response => {
    //     console.log(response, 'TEST');
    //   });

    isInitialRender.current = false;

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current,
      );
      // Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
  console.log(expoPushToken, 'EXPO TOTOTO');

  return expoPushToken;
}

async function registerForPushNotificationsAsync() {
  let token;
  // return new Promise(resolve => {
  // Notifications.registerRemoteNotifications();
  // Notifications.events().registerRemoteNotificationsRegistered(event => {
  //   // TODO: Send the token to my server so it could send back push notifications...

  //   resolve(event.deviceToken);

  //   console.log('Device Token Received', event.deviceToken);
  // });
  // Notifications.events().registerRemoteNotificationsRegistrationFailed(
  //   event => {
  //     console.error(event);
  //   },
  // );

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
      Alert.alert(
        'Failed to get push token for push notification!',
        'Make sure your push notifications are turned on.',
      );
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.PROJECT_ID,
    });
    // token = await Notifications.getDevicePushTokenAsync();
  } else {
    Alert.alert('Must use physical device for Push Notifications');
  }
  // });

  return token;
}

export {ConfigurePushNotifications};
