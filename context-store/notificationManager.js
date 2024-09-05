import React, {useEffect, useRef, useState} from 'react';
import {Alert, Platform, View} from 'react-native';
import {Notifications} from 'react-native-notifications';
import {getBoltzWsUrl} from '../app/functions/boltz/boltzEndpoitns';
import WebView from 'react-native-webview';
import handleReverseClaimWSS from '../app/functions/boltz/handle-reverse-claim-wss';
import handleWebviewClaimMessage from '../app/functions/boltz/handle-webview-claim-message';
import {getLocalStorageItem, setLocalStorageItem} from '../app/functions';

import {useGlobalContextProvider} from './context';

const PushNotificationManager = ({children}) => {
  const isInitialRender = useRef(true);
  const webViewRef = useRef(null);
  const [webViewArgs, setWebViewArgs] = useState({
    page: null,
    function: null,
  });
  const {didGetToHomepage} = useGlobalContextProvider();

  useEffect(() => {
    if (Platform.OS === 'ios') Notifications.ios.setBadgeCount(0);

    const registerDevice = async () => {
      Notifications.events().registerRemoteNotificationsRegistered(
        async event => {
          const deviceToken = event.deviceToken;
          console.log('Device Token Received', deviceToken);

          const savedDeviceToken = JSON.parse(
            await getLocalStorageItem('pushToken'),
          );

          if (!savedDeviceToken) {
            const em = await (
              await fetch(
                'http://localhost:8888/.netlify/functoins/encriptMessage',
                {
                  method: 'POST', // Specify the HTTP method
                  headers: {
                    'Content-Type': 'application/json', // Set the content type to JSON
                  },
                  body: JSON.stringify({
                    text: deviceToken, // The text property in the body
                  }),
                },
              )
            ).json();

            setLocalStorageItem('pushToken', JSON.stringify(em));

            console.log(em);

            return;
          }

          const decriptedToken = await (
            await fetch(
              'http://localhost:8888/.netlify/functoins/decriptMessage',
              {
                method: 'POST', // Specify the HTTP method
                headers: {
                  'Content-Type': 'application/json', // Set the content type to JSON
                },
                body: JSON.stringify({
                  text: savedDeviceToken, // The text property in the body
                }),
              },
            )
          ).json();
          if (decriptedToken === deviceToken) return;

          const em = await (
            await fetch(
              'http://localhost:8888/.netlify/functoins/encriptMessage',
              {
                method: 'POST', // Specify the HTTP method
                headers: {
                  'Content-Type': 'application/json', // Set the content type to JSON
                },
                body: JSON.stringify({
                  text: deviceToken, // The text property in the body
                }),
              },
            )
          ).json();

          setLocalStorageItem('pushToken', JSON.stringify(em));

          //   SAVE TO GLOBAL DATABASE

          // Save device token in context or database
          // context.setDeviceToken(deviceToken);
        },
      );
      Notifications.events().registerRemoteNotificationsRegistrationFailed(
        event => {
          console.error('event-err', event);
        },
      );

      Notifications.registerRemoteNotifications();
    };

    const registerNotificationEvents = () => {
      Notifications.events().registerNotificationReceivedForeground(
        (notification, completion) => {
          console.log('Notification Received - Foreground', notification);

          const webSocket = new WebSocket(
            `${getBoltzWsUrl(process.env.BOLTZ_ENVIRONMENT)}`,
          );

          if (Platform.OS === 'ios') {
            const {
              payload: {privateKey, preimage, swapInfo, liquidAddress},
            } = notification;

            console.log(privateKey);
            console.log(preimage);
            console.log(swapInfo);
            console.log(liquidAddress);

            setWebViewArgs({page: 'notifications'});

            handleReverseClaimWSS({
              ref: webViewRef,
              webSocket,
              liquidAddress,
              swapInfo,
              preimage,
              privateKey: privateKey,
            });

            // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
            completion({alert: true, sound: false, badge: false});
          }
        },
      );

      if (!isInitialRender.current) return;
      isInitialRender.current = false;
      Notifications.events().registerNotificationOpened(
        (notification, completion) => {
          console.log('Notification opened by device user', notification);
          completion();
        },
      );

      Notifications.events().registerNotificationReceivedBackground(
        (notification, completion) => {
          console.log('Notification Received - Background', notification);
          completion({alert: true, sound: true, badge: false});
        },
      );

      Notifications.getInitialNotification()
        .then(notification => {
          console.log('Initial notification was:', notification || 'N/A');
        })
        .catch(err => console.error('getInitialNotification() failed', err));
    };

    if (!didGetToHomepage) return;

    registerDevice();
    registerNotificationEvents();
  }, [didGetToHomepage]);

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

export default PushNotificationManager;
