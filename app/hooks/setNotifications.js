import {useState, useEffect, useRef} from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import {Alert} from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function ConfigurePushNotifications() {
  const isInitialRender = useRef(true);
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [notification, setNotification] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    if (!isInitialRender.current) return;
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    // notificationListener.current =
    //   Notifications.addNotificationReceivedListener(notification => {
    //     console.log(notification);
    //     setNotification(notification);
    //   });

    // responseListener.current =
    //   Notifications.addNotificationResponseReceivedListener(response => {
    //     console.log(response);
    //   });

    isInitialRender.current = false;

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current,
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return expoPushToken;
}

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

  return token;
}

export {ConfigurePushNotifications};
