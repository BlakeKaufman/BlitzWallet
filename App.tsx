/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {NavigationContainer, useNavigation} from '@react-navigation/native';
import 'text-encoding-polyfill';
import 'react-native-gesture-handler';
import './i18n'; // for translation option
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import React, {useEffect, useRef, useState} from 'react';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import {registerRootComponent} from 'expo';
type RootStackParamList = {
  Home: {someParam?: string};
  Details: {someParam?: string};
};
import {connectToNode, retrieveData} from './app/functions';
import SplashScreen from 'react-native-splash-screen';
import {
  CreateAccountHome,
  DislaimerPage,
  GenerateKey,
  PinSetupPage,
  SecuityOption,
  RestoreWallet,
  VerifyKey,
  RestoreWalletError,
} from './app/screens/createAccount';
import {
  AdminHomeIndex,
  AdminLogin,
  AppStorePageIndex,
  ConfirmTxPage,
  ConnectingToNodeLoadingScreen,
  ConnectionToNode,
  ExpandedTx,
  ReceivePaymentHome,
  SendPaymentHome,
  SettingsContentIndex,
  SettingsIndex,
  TechnicalTransactionDetails,
  ViewAllTxPage,
} from './app/screens/inAccount';

import {setStatusBarHidden} from 'expo-status-bar';
import {
  GlobalContextProvider,
  useGlobalContextProvider,
} from './context-store/context';

import globalOnBreezEvent from './app/functions/globalOnBreezEvent';
import {
  AddChatGPTCredits,
  AddCheckoutItem,
  AddContactPage,
  AddOrDeleteContactImage,
  AmountToGift,
  CameraModal,
  CheckoutPaymentScreen,
  ClipboardCopyPopup,
  ConfirmActionPage,
  ConfirmAddContact,
  ConfirmLeaveChatGPT,
  ContactsPageLongPressActions,
  DrainWalletAddress,
  EditMyProfilePage,
  EditReceivePaymentInformation,
  ErrorScreen,
  ExpandedContactsPage,
  FaucetHome,
  FaucetReceivePage,
  FaucetSendPage,
  FaucetSettingsPage,
  GiftWalletConfirmation,
  HalfModalSendOptions,
  LetterKeyboard,
  LiquidSettingsPage,
  LnurlPaymentDescription,
  LspDescriptionPopup,
  MyContactProfilePage,
  NumberKeyboard,
  RefundBitcoinTransactionPage,
  SendAndRequestPage,
  SendPaymentScreen,
  SwitchReceiveOptionPage,
  UserBalanceDenomination,
  ViewInProgressSwap,
} from './app/components/admin';
import {sendPayment, setLogStream} from '@breeztech/react-native-breez-sdk';

import {ContactsDrawer} from './navigation/drawers';
import {RedeemGiftScreen} from './app/components/login';
import BreezTest from './app/screens/breezTest';
import AddResturantItemToCart from './app/components/admin/homeComponents/apps/resturantService/addItemToCart';
import ResturantCartPage from './app/components/admin/homeComponents/apps/resturantService/cartPage';
import ManualEnterSendAddress from './app/components/admin/homeComponents/homeLightning/manualEnterSendAddress';
import {WebViewProvider} from './context-store/webViewContext';
import {Linking} from 'react-native';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

const Stack = createNativeStackNavigator();

function App(): JSX.Element {
  return (
    <GlobalContextProvider>
      <WebViewProvider>
        <ResetStack />
      </WebViewProvider>

      {/* <BreezTest /> */}
    </GlobalContextProvider>
  );
}

function ResetStack(): JSX.Element | null {
  const navigationRef =
    useRef<NativeStackNavigationProp<RootStackParamList> | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isloaded, setIsLoaded] = useState(false);
  const {setDeepLinkContent} = useGlobalContextProvider();

  useEffect(() => {
    const handleDeepLink = (event: {url: string}) => {
      console.log('TEST');
      const {url} = event;

      if (url.startsWith('lightning')) {
        setDeepLinkContent({type: 'LN', data: url});
      } else if (url.includes('blitz')) {
        setDeepLinkContent({type: 'Contact', data: url});
      }

      console.log('Deep link URL:', url); // Log the URL
    };
    const getInitialURL = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        handleDeepLink({url});
      }
    };

    Linking.addEventListener('url', handleDeepLink);
    getInitialURL();

    (async () => {
      const pin = await retrieveData('pin');
      const mnemonic = await retrieveData('mnemonic');

      if (pin && mnemonic) {
        setIsLoggedIn(true);
      } else setIsLoggedIn(false);
      setIsLoaded(true);

      setStatusBarHidden(false, 'fade');
      SplashScreen.hide();
    })();
    return () => {
      Linking.removeAllListeners('url');
    };
  }, []);

  if (!isloaded) return null;
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen
          name="Home"
          component={isLoggedIn ? AdminLogin : CreateAccountHome}
          options={{animation: 'fade', gestureEnabled: false}}
        />
        <Stack.Screen
          name="ConnectingToNodeLoadingScreen"
          component={ConnectingToNodeLoadingScreen}
          options={{animation: 'fade', gestureEnabled: false}}
        />
        <Stack.Screen
          name="AddCheckoutItemPage"
          component={AddCheckoutItem}
          options={{
            animation: 'fade',
            gestureEnabled: false,
            presentation: 'transparentModal',
          }}
        />
        <Stack.Screen
          name="CheckoutPaymentScreen"
          component={CheckoutPaymentScreen}
          options={{
            animation: 'fade',
            gestureEnabled: false,
            presentation: 'transparentModal',
          }}
        />
        <Stack.Screen
          name="AddResturantItemToCart"
          component={AddResturantItemToCart}
          options={{
            animation: 'fade',
            gestureEnabled: false,
            presentation: 'transparentModal',
          }}
        />
        <Stack.Screen
          name="giftWalletConfirmation"
          component={GiftWalletConfirmation}
          options={{
            animation: 'fade',
            gestureEnabled: false,
            presentation: 'transparentModal',
          }}
        />
        <Stack.Screen
          name="ConfirmTxPage"
          component={ConfirmTxPage}
          options={{
            animation: 'fade',
            gestureEnabled: false,
            presentation: 'transparentModal',
          }}
        />

        {/* Create Account screens */}
        <Stack.Screen name="DisclaimerPage" component={DislaimerPage} />
        <Stack.Screen name="StartKeyGeneration" component={SecuityOption} />
        <Stack.Screen name="GenerateKey" component={GenerateKey} />
        <Stack.Screen name="VerifyKey" component={VerifyKey} />
        <Stack.Screen name="PinSetup" component={PinSetupPage} />
        <Stack.Screen name="RestoreWallet" component={RestoreWallet} />
        <Stack.Screen name="RedeemGiftScreen" component={RedeemGiftScreen} />

        {/* admin screens */}
        <Stack.Screen
          name="HomeAdmin"
          component={AdminHomeIndex}
          options={{animation: 'fade', gestureEnabled: false}}
        />

        <Stack.Group
          screenOptions={{
            presentation: 'containedTransparentModal',
            animation: 'slide_from_bottom',
          }}>
          <Stack.Screen
            name="HalfModalSendOption"
            component={HalfModalSendOptions}
          />

          <Stack.Screen name="NumberKeyboard" component={NumberKeyboard} />
          {/* </Stack.Group> */}
          {/* <Stack.Group screenOptions={{animation: 'slide_from_bottom'}}> */}
          <Stack.Screen name="SendBTC" component={SendPaymentHome} />
          <Stack.Screen name="ReceiveBTC" component={ReceivePaymentHome} />
          <Stack.Screen name="ExpandedTx" component={ExpandedTx} />
          <Stack.Screen
            name="TechnicalTransactionDetails"
            component={TechnicalTransactionDetails}
          />
          <Stack.Screen
            name="LiquidSettingsPage"
            component={LiquidSettingsPage}
          />
          <Stack.Group
            screenOptions={{presentation: 'modal', gestureEnabled: false}}>
            <Stack.Screen
              name="EditReceivePaymentInformation"
              component={EditReceivePaymentInformation}
            />
          </Stack.Group>
          <Stack.Screen
            name="SwitchReceiveOptionPage"
            component={SwitchReceiveOptionPage}
          />
          <Stack.Screen name="ContactsPageInit" component={ContactsDrawer} />

          <Stack.Screen name="ViewAllTxPage" component={ViewAllTxPage} />
          <Stack.Screen
            name="DrainWalletAddress"
            component={DrainWalletAddress}
          />
          <Stack.Screen name="CameraModal" component={CameraModal} />
          <Stack.Screen name="FaucetHome" component={FaucetHome} />

          <Stack.Screen
            options={{gestureEnabled: false}}
            name="AddChatGPTCredits"
            component={AddChatGPTCredits}
          />
          <Stack.Screen
            options={{gestureEnabled: false}}
            name="ResturantCartPage"
            component={ResturantCartPage}
          />
        </Stack.Group>
        <Stack.Group
          screenOptions={{
            animation: 'slide_from_right',
          }}>
          <Stack.Screen name="SettingsHome" component={SettingsIndex} />
          <Stack.Screen
            name="SettingsContentHome"
            component={SettingsContentIndex}
          />
          <Stack.Screen
            name="ConfirmPaymentScreen"
            component={SendPaymentScreen}
          />

          {/* GIFT WALLET PATH */}
          <Stack.Screen name="AmountToGift" component={AmountToGift} />

          {/* SWAP PAGES  */}
          <Stack.Screen
            name="RefundBitcoinTransactionPage"
            component={RefundBitcoinTransactionPage}
          />
          <Stack.Screen
            name="viewInProgressSwap"
            component={ViewInProgressSwap}
          />

          {/* Faucet Pages  */}
          <Stack.Screen
            name="FaucetSettingsPage"
            component={FaucetSettingsPage}
          />
          <Stack.Screen
            name="RecieveFaucetPage"
            component={FaucetReceivePage}
          />
          <Stack.Screen name="SendFaucetPage" component={FaucetSendPage} />

          {/* contacts */}

          <Stack.Screen
            name="ExpandedContactsPage"
            component={ExpandedContactsPage}
          />
          <Stack.Screen
            name="MyContactProfilePage"
            component={MyContactProfilePage}
          />
          <Stack.Screen
            name="EditMyProfilePage"
            component={EditMyProfilePage}
          />

          <Stack.Screen
            name="SendAndRequestPage"
            component={SendAndRequestPage}
          />

          {/* App Store */}
          <Stack.Screen
            name="AppStorePageIndex"
            component={AppStorePageIndex}
          />
        </Stack.Group>
        <Stack.Group
          screenOptions={{
            animation: 'fade',
            presentation: 'containedTransparentModal',
          }}>
          <Stack.Screen name="ConnectionToNode" component={ConnectionToNode} />
          <Stack.Screen
            name="ManualyEnterSendAddress"
            component={ManualEnterSendAddress}
          />
          <Stack.Screen
            name="RestoreWalletError"
            component={RestoreWalletError}
          />
          <Stack.Screen
            name="ConfirmActionPage"
            component={ConfirmActionPage}
          />
          <Stack.Screen
            name="ConfirmLeaveChatGPT"
            component={ConfirmLeaveChatGPT}
          />
          <Stack.Screen
            name="GiftWalletConfirmation"
            component={GiftWalletConfirmation}
          />
          <Stack.Screen
            name="ClipboardCopyPopup"
            component={ClipboardCopyPopup}
          />
          <Stack.Screen name="ErrorScreen" component={ErrorScreen} />
          <Stack.Screen
            name="ContactsPageLongPressActions"
            component={ContactsPageLongPressActions}
          />

          <Stack.Screen name="LetterKeyboard" component={LetterKeyboard} />
          <Stack.Screen
            name="ConfirmAddContact"
            component={ConfirmAddContact}
          />
          <Stack.Screen
            name="AddOrDeleteContactImage"
            component={AddOrDeleteContactImage}
          />
          <Stack.Screen
            name="UserBalanceDenomination"
            component={UserBalanceDenomination}
          />
          <Stack.Screen
            name="LnurlPaymentDescription"
            component={LnurlPaymentDescription}
          />
        </Stack.Group>
        <Stack.Group
          screenOptions={{
            presentation: 'modal',
          }}>
          <Stack.Screen
            name="LspDescriptionPopup"
            component={LspDescriptionPopup}
          />
          {/* <Stack.Screen name="AddContact" component={AddContactPage} /> */}
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// TaskManager.defineTask(
//   BACKGROUND_NOTIFICATION_TASK,
//   ({data, error, executionInfo}) => {
//     (async () => {
//       console.log(data);
//       console.log(executionInfo);
//       const paymentInformationFromNotification = data?.body;
//       console.log(paymentInformationFromNotification);

//       if (paymentInformationFromNotification.pr) {
//         try {
//           await sendPayment({
//             bolt11: paymentInformationFromNotification.pr,
//           });
//         } catch (err) {
//           console.log(err);
//         }
//         return;
//       }

//       const didConnect = await connectToNode(globalOnBreezEvent);
//       console.log(didConnect);
//       if (didConnect.isConnected) return;
//       Notifications.cancelAllScheduledNotificationsAsync();

//       try {
//         await Notifications.scheduleNotificationAsync({
//           content: {
//             title: 'Blitz Wallet',
//             body: `Caught incoming payment`,
//           },
//           trigger: {
//             seconds: 2,
//           },
//         });
//         await Notifications.scheduleNotificationAsync({
//           content: {
//             title: 'Blitz Wallet',
//             body: 'Getting invoice details',
//           },
//           trigger: {
//             seconds: 2,
//           },
//         });
//       } catch (err) {
//         console.log(err);
//       }

//       console.log('Received a notification in the background!', 'TTTTT');

//       // Do something with the notification data
//     })();
//   },
// );

// Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

export default App;
registerRootComponent(App);
