// import React, {useEffect, useRef, useState} from 'react';
// import {AppState, PermissionsAndroid, Platform, View} from 'react-native';
// import {Notifications} from 'react-native-notifications';
// import {getBoltzWsUrl} from '../app/functions/boltz/boltzEndpoitns';
// import WebView from 'react-native-webview';
// import handleReverseClaimWSS from '../app/functions/boltz/handle-reverse-claim-wss';
// import handleWebviewClaimMessage from '../app/functions/boltz/handle-webview-claim-message';
// import {
//   getLocalStorageItem,
//   retrieveData,
//   setLocalStorageItem,
// } from '../app/functions';

// import {addDataToCollection} from '../db';

// const PushNotificationManager = ({children}) => {
//   // const isInitialRender = useRef(true);
//   const webViewRef = useRef(null);
//   const [webViewArgs, setWebViewArgs] = useState({
//     page: null,
//     function: null,
//   });
//   const receivedSwapsRef = useRef({});

//   useEffect(() => {
//     async function initNotification() {
//       requestAndroidNotificationsPermissinos();
//       // if (Platform.OS === 'android') {
//       //   const hasPermission = await requestAndroidNotificationsPermissinos();
//       //   if (!hasPermission) {
//       //     console.log('Notification permission denied');
//       //     return;
//       //   } else {
//       //     getFcmToken();
//       //   }
//       // }

//       if (Platform.OS === 'ios') Notifications.ios.setBadgeCount(0);

//       const registerDevice = async () => {
//         Notifications.registerRemoteNotifications();
//         Notifications.setNotificationChannel({
//           channelId: 'blitzWallet',
//           name: 'Blitz Wallet',
//           importance: 5,
//           description: 'Blitz Wallet notification',
//           enableLights: true,
//           showBadge: true,
//           vibrationPattern: [200, 1000, 500, 1000, 500],
//         });

//         Notifications.events().registerRemoteNotificationsRegistered(
//           async event => {
//             const deviceToken = event.deviceToken;
//             console.log('Device Token Received', deviceToken);

//             const savedDeviceToken =
//               JSON.parse(await getLocalStorageItem('pushToken')) || {};

//             const encriptedText = savedDeviceToken.encriptedText;

//             if (Object.keys(savedDeviceToken) === 0) {
//               savePushNotificationToDatabase(deviceToken);
//               return;
//             }

//             const decriptedToken = await (
//               await fetch(
//                 'https://blitz-wallet.com/.netlify/functions/decriptMessage',
//                 {
//                   method: 'POST', // Specify the HTTP method
//                   headers: {
//                     'Content-Type': 'application/json', // Set the content type to JSON
//                   },
//                   body: JSON.stringify({
//                     encriptedText, // The text property in the body
//                   }),
//                 },
//               )
//             ).json();

//             if (decriptedToken.decryptedText === deviceToken) return;

//             savePushNotificationToDatabase(deviceToken);
//           },
//         );
//         Notifications.events().registerRemoteNotificationsRegistrationFailed(
//           event => {
//             console.error('event-err', event);
//           },
//         );
//       };

//       const savePushNotificationToDatabase = async pushKey => {
//         try {
//           const em = await (
//             await fetch(
//               'https://blitz-wallet.com/.netlify/functions/encriptMessage',
//               {
//                 method: 'POST', // Specify the HTTP method
//                 headers: {
//                   'Content-Type': 'application/json', // Set the content type to JSON
//                 },
//                 body: JSON.stringify({
//                   text: pushKey, // The text property in the body
//                 }),
//               },
//             )
//           ).json();
//           setLocalStorageItem('pushToken', JSON.stringify(em));
//           addDataToCollection(
//             {
//               pushNotifications: {platform: Platform.OS, key: em},
//             },
//             'blitzWalletUsers',
//           );
//         } catch (err) {
//           console.log(`Saving push notification to database error:`, err);
//         }
//       };

//       const registerNotificationEvents = () => {
//         Notifications.events().registerNotificationReceivedForeground(
//           (notification, completion) => {
//             console.log('Notification Received - Foreground', notification);
//             // handleSwap(notification, 'Foreground');
//             completion({alert: true, sound: false, badge: false});
//           },
//         );

//         Notifications.events().registerNotificationOpened(
//           (notification, completion) => {
//             console.log('Notification opened by device user', notification);
//             // /if (notification) handleSwap(notification, 'clicked');
//             completion();
//           },
//         );

//         Notifications.events().registerNotificationReceivedBackground(
//           (notification, completion) => {
//             console.log('Notification Received - Background', notification);
//             // handleSwap(notification, 'Background');
//             completion({alert: true, sound: true, badge: false});
//           },
//         );

//         Notifications.getInitialNotification()
//           .then(notification => {
//             console.log('Initial notification was:', notification || 'N/A');
//             // if (notification) handleSwap(notification, 'initialNotification');
//           })
//           .catch(err => console.error('getInitialNotification() failed', err));
//       };
//       registerNotificationEvents();
//       registerDevice();
//     }
//     initNotification();
//   }, []);

//   const handleSwap = (notification, notificationType) => {
//     const webSocket = new WebSocket(
//       `${getBoltzWsUrl(process.env.BOLTZ_ENVIRONMENT)}`,
//     );

//     if (Platform.OS === 'ios') {
//       const {
//         payload: {privateKey, preimage, swapInfo, liquidAddress, title},
//       } = notification;

//       if (
//         title === 'Running in the background' ||
//         title === 'Claiming incoming payment' ||
//         title === 'Payment Received' ||
//         !privateKey ||
//         !preimage ||
//         !swapInfo ||
//         !liquidAddress
//       )
//         return;

//       if (!receivedSwapsRef.current[swapInfo.id]) {
//         receivedSwapsRef.current[swapInfo.id] = true;
//       } else return;

//       console.log(privateKey);
//       console.log(preimage);
//       console.log(swapInfo);
//       console.log(liquidAddress);

//       setWebViewArgs({page: 'notifications'});
//       if (notificationType === 'Background') {
//         Notifications.postLocalNotification({
//           title: 'Running in the background',
//         });
//       }
//       Notifications.postLocalNotification({
//         title: 'Claiming incoming payment',
//       });

//       handleReverseClaimWSS({
//         ref: webViewRef,
//         webSocket,
//         liquidAddress,
//         swapInfo,
//         preimage,
//         privateKey: privateKey,
//         fromPage: 'notifications',
//       });

//       // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
//     }
//   };

//   return (
//     <View style={{flex: 1}}>
//       <WebView
//         domStorageEnabled
//         javaScriptEnabled
//         ref={webViewRef}
//         containerStyle={{position: 'absolute', top: 1000, left: 1000}}
//         source={
//           Platform.OS === 'ios'
//             ? require('boltz-swap-web-context')
//             : {uri: 'file:///android_asset/boltzSwap.html'}
//         }
//         originWhitelist={['*']}
//         onMessage={event =>
//           handleWebviewClaimMessage(
//             null,
//             event,
//             webViewArgs.page,
//             webViewArgs.function,
//           )
//         }
//       />
//       {children}
//     </View>
//   );
// };

// const requestAndroidNotificationsPermissinos = async () => {
//   const granted = await PermissionsAndroid.request(
//     PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
//     {
//       title: 'Notification Permission',
//       message:
//         'Blitz Wallet needs access to send you notifications about transactions.',
//       buttonNeutral: 'Ask Me Later',
//       buttonNegative: 'Cancel',
//       buttonPositive: 'OK',
//     },
//   );
//   console.log(granted, 'TES');
//   return granted === PermissionsAndroid.RESULTS.GRANTED;
// };

// export default PushNotificationManager;
