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

import {
  AppState,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
  AddContactPage,
  AmountToGift,
  CameraModal,
  ChangeNostrPrivKeyPage,
  ClipboardCopyPopup,
  ConfirmActionPage,
  ConfirmLeaveChatGPT,
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
  LnurlPaymentDescription,
  LspDescriptionPopup,
  MyContactProfilePage,
  RefundBitcoinTransactionPage,
  SendAndRequestPage,
  SendPaymentScreen,
  SwitchReceiveOptionPage,
  UserBalanceDenomination,
  ViewInProgressSwap,
} from './app/components/admin';
import {sendPayment} from '@breeztech/react-native-breez-sdk';

import {ContactsDrawer} from './navigation/drawers';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

const Stack = createNativeStackNavigator();

function App(): JSX.Element {
  return (
    <GlobalContextProvider>
      <ResetStack />
    </GlobalContextProvider>
  );
}

function ResetStack(): JSX.Element | null {
  const navigationRef =
    useRef<NativeStackNavigationProp<RootStackParamList> | null>(null);
  // const appState = useRef(AppState.currentState);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isloaded, setIsLoaded] = useState(false);
  // const isAppForground = useIsForeground();

  useEffect(() => {
    (async () => {
      const pin = await retrieveData('pin');
      const mnemonic = await retrieveData('mnemonic');

      if (pin && mnemonic) {
        setIsLoggedIn(true);
      } else setIsLoggedIn(false);
      setIsLoaded(true);

      if (Platform.OS === 'android') {
        SplashScreen.hide();
      }
      setStatusBarHidden(false, 'fade');
    })();
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

        {/* Create Account screens */}
        <Stack.Screen name="DisclaimerPage" component={DislaimerPage} />
        <Stack.Screen name="StartKeyGeneration" component={SecuityOption} />
        <Stack.Screen name="GenerateKey" component={GenerateKey} />
        <Stack.Screen name="VerifyKey" component={VerifyKey} />
        <Stack.Screen name="PinSetup" component={PinSetupPage} />
        <Stack.Screen name="RestoreWallet" component={RestoreWallet} />
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
          <Stack.Screen
            name="SendAndRequestPage"
            component={SendAndRequestPage}
          />
        </Stack.Group>
        <Stack.Group screenOptions={{animation: 'slide_from_bottom'}}>
          <Stack.Screen name="SendBTC" component={SendPaymentHome} />
          <Stack.Screen name="ReceiveBTC" component={ReceivePaymentHome} />
          <Stack.Screen name="ExpandedTx" component={ExpandedTx} />
          <Stack.Group
            screenOptions={{presentation: 'modal', gestureEnabled: false}}>
            <Stack.Screen name="ConfirmTxPage" component={ConfirmTxPage} />
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
          <Stack.Screen
            name="MyContactProfilePage"
            component={MyContactProfilePage}
          />

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
          <Stack.Screen
            name="TechnicalTransactionDetails"
            component={TechnicalTransactionDetails}
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
            name="EditMyProfilePage"
            component={EditMyProfilePage}
          />
          <Stack.Screen
            name="ChangeNostrPrivKeyPage"
            component={ChangeNostrPrivKeyPage}
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

TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  ({data, error, executionInfo}) => {
    (async () => {
      console.log(data);
      console.log(executionInfo);
      const paymentInformationFromNotification = data?.body;
      console.log(paymentInformationFromNotification);

      if (paymentInformationFromNotification.pr) {
        try {
          await sendPayment({
            bolt11: paymentInformationFromNotification.pr,
          });
        } catch (err) {
          console.log(err);
        }
        return;
      }

      const didConnect = await connectToNode(globalOnBreezEvent);
      console.log(didConnect);
      if (didConnect.isConnected) return;
      Notifications.cancelAllScheduledNotificationsAsync();

      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Blitz Wallet',
            body: `Caught incoming payment`,
          },
          trigger: {
            seconds: 2,
          },
        });
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Blitz Wallet',
            body: 'Getting invoice details',
          },
          trigger: {
            seconds: 2,
          },
        });
      } catch (err) {
        console.log(err);
      }

      console.log('Received a notification in the background!', 'TTTTT');

      // Do something with the notification data
    })();
  },
);

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

export default App;
registerRootComponent(App);
