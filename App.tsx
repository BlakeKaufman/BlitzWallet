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
import React, {lazy, Suspense, useEffect, useRef, useState} from 'react';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import {registerRootComponent} from 'expo';
type RootStackParamList = {
  Home: {someParam?: string};
  Details: {someParam?: string};
};
import {connectToNode, retrieveData} from './app/functions';
// import SplashScreen from 'react-native-splash-screen';

const DislaimerPage = lazy(
  () => import('./app/screens/createAccount/disclaimer.js'),
);
const GenerateKey = lazy(
  () => import('./app/screens/createAccount/keySetup/generateKey.js'),
);
const PinSetupPage = lazy(
  () => import('./app/screens/createAccount/keySetup/pin.js'),
);
const RestoreWallet = lazy(
  () => import('./app/screens/createAccount/restoreWallet/home.js'),
);
const RestoreWalletError = lazy(
  () => import('./app/screens/createAccount/restoreWallet/errorScreen.js'),
);
const SkipCreateAccountPathMessage = lazy(
  () => import('./app/screens/createAccount/skipMessage.js'),
);
// in account pages

// const AdminLogin = lazy(() => import('./app/screens/inAccount/login.js'));
const AppStorePageIndex = lazy(
  () => import('./app/screens/inAccount/appStorePageIndex.js'),
);
const ConfirmTxPage = lazy(
  () => import('./app/screens/inAccount/confirmTxPage.js'),
);
const ConnectingToNodeLoadingScreen = lazy(
  () => import('./app/screens/inAccount/loadingScreen.js'),
);
const ConnectionToNode = lazy(() =>
  import('./app/screens/inAccount/conectionToNode.js').then(module => ({
    default: module['ConnectionToNode'],
  })),
);
const ExpandedTx = lazy(
  () => import('./app/screens/inAccount/expandedTxPage.js'),
);
const TechnicalTransactionDetails = lazy(
  () => import('./app/screens/inAccount/technicalTransactionDetails.js'),
);
const ViewAllTxPage = lazy(
  () => import('./app/screens/inAccount/viewAllTxPage.js'),
);
const SettingsContentIndex = lazy(
  () => import('./app/screens/inAccount/settingsContent.js'),
);

import {
  AdminHomeIndex,
  AdminLogin,
  // AppStorePageIndex,
  // ConfirmTxPage,
  // ConnectingToNodeLoadingScreen,
  // ConnectionToNode,
  // ExpandedTx,
  ReceivePaymentHome,
  SendPaymentHome,
  // SettingsContentIndex,
  SettingsIndex,
  // TechnicalTransactionDetails,
  // ViewAllTxPage,
} from './app/screens/inAccount';

import {
  GlobalContextProvider,
  useGlobalContextProvider,
} from './context-store/context';

const AddChatGPTCredits = lazy(
  () =>
    import(
      './app/components/admin/homeComponents/apps/chatGPT/addCreditsPage.js'
    ),
);
const ConfirmLeaveChatGPT = lazy(
  () =>
    import(
      './app/components/admin/homeComponents/apps/chatGPT/components/confirmLeaveChat.js'
    ),
);
const FaucetHome = lazy(
  () => import('./app/components/admin/homeComponents/faucet/home.js'),
);
const FaucetReceivePage = lazy(
  () => import('./app/components/admin/homeComponents/faucet/receivePage.js'),
);
const FaucetSendPage = lazy(
  () => import('./app/components/admin/homeComponents/faucet/sendPage.js'),
);
const FaucetSettingsPage = lazy(
  () => import('./app/components/admin/homeComponents/faucet/settingsPage.js'),
);

const GiftWalletConfirmation = lazy(
  () =>
    import(
      './app/components/admin/homeComponents/fundGift/popups/giftWalletConfirmation.js'
    ),
);
const AmountToGift = lazy(
  () =>
    import('./app/components/admin/homeComponents/fundGift/amountToGift.js'),
);
import {
  // AddChatGPTCredits,
  AddOrDeleteContactImage,
  // AmountToGift,
  CameraModal,
  ClipboardCopyPopup,
  ConfirmActionPage,
  ConfirmAddContact,
  // ConfirmLeaveChatGPT,
  ContactsPageLongPressActions,
  DrainWalletAddress,
  EditMyProfilePage,
  EditReceivePaymentInformation,
  ErrorScreen,
  ExpandedContactsPage,
  // FaucetHome,
  // FaucetReceivePage,
  // FaucetSendPage,
  // FaucetSettingsPage,
  // GiftWalletConfirmation,
  HalfModalSendOptions,
  // LetterKeyboard,
  LiquidSettingsPage,
  LnurlPaymentDescription,
  LspDescriptionPopup,
  MyContactProfilePage,
  // NumberKeyboard,
  RefundBitcoinTransactionPage,
  SendAndRequestPage,
  SendPaymentScreen,
  SwitchReceiveOptionPage,
  // UserBalanceDenomination,
  ViewInProgressSwap,
} from './app/components/admin';

import {ContactsDrawer} from './navigation/drawers';
import {RedeemGiftScreen} from './app/components/login';

const AddResturantItemToCart = lazy(
  () =>
    import(
      './app/components/admin/homeComponents/apps/resturantService/addItemToCart.js'
    ),
);
const ResturantCartPage = lazy(
  () =>
    import(
      './app/components/admin/homeComponents/apps/resturantService/cartPage.js'
    ),
);
const ManualEnterSendAddress = lazy(
  () =>
    import(
      './app/components/admin/homeComponents/homeLightning/manualEnterSendAddress'
    ),
);
// import AddResturantItemToCart from './app/components/admin/homeComponents/apps/resturantService/addItemToCart';
// import ResturantCartPage from './app/components/admin/homeComponents/apps/resturantService/cartPage';
// import ManualEnterSendAddress from './app/components/admin/homeComponents/homeLightning/manualEnterSendAddress';
import {WebViewProvider} from './context-store/webViewContext';
import {Linking, View} from 'react-native';

const ChatGPTVoiceFeature = lazy(
  () =>
    import(
      './app/components/admin/homeComponents/apps/chatGPT/components/voice/index.js'
    ),
);
const ConfirmExportPayments = lazy(
  () =>
    import(
      './app/components/admin/homeComponents/exportTransactions/exportTracker.js'
    ),
);
const HistoricalVPNPurchases = lazy(
  () =>
    import(
      './app/components/admin/homeComponents/apps/VPN/historicalPurchasesPage.js'
    ),
);
const GeneratedVPNFile = lazy(
  () =>
    import(
      './app/components/admin/homeComponents/apps/VPN/pages/generatedFile.js'
    ),
);
const ConfirmVPNPage = lazy(
  () =>
    import(
      './app/components/admin/homeComponents/apps/VPN/components/confirmationSlideUp.js'
    ),
);
const ConfirmSMSPayment = lazy(
  () =>
    import(
      './app/components/admin/homeComponents/apps/sms4sats/confirmationSlideUp.js'
    ),
);
// import ConfirmExportPayments from './app/components/admin/homeComponents/exportTransactions/exportTracker';
// import {
//   // ChatGPTVoiceFeature,
//   // ConfirmSMSPayment,
//   // ConfirmVPNPage,
//   // GeneratedVPNFile,
//   // HistoricalVPNPurchases,
// } from './app/components/admin/homeComponents/apps';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';
import LottieView from 'lottie-react-native';
import {COLORS} from './app/constants';
import SplashScreen from './app/screens/splashScreen';
import {GlobalContactsList} from './context-store/globalContacts';
// import {
//   // ChooseContactHalfModal,
//   // ExpandedAddContactsPage,
// } from './app/components/admin/homeComponents/contacts';

const ChooseContactHalfModal = lazy(
  () =>
    import(
      './app/components/admin/homeComponents/contacts/halfModalSendOptionPath/contactsList.js'
    ),
);
const ExpandedAddContactsPage = lazy(
  () =>
    import(
      './app/components/admin/homeComponents/contacts/expandedAddContactsPage.js'
    ),
);
import {GlobaleCashVariables} from './context-store/eCash';
const POSInstructionsPath = lazy(
  () =>
    import(
      './app/components/admin/homeComponents/settingsContent/posPath/posInstructionsPath.js'
    ),
);
// import POSInstructionsPath from './app/components/admin/homeComponents/settingsContent/posPath/posInstructionsPath';
import {ListenForLiquidPaymentProvider} from './context-store/listenForLiquidPayment';
import FullLoadingScreen from './app/functions/CustomElements/loadingScreen';
import {CreateAccountHome} from './app/screens/createAccount';
import {GlobalAppDataProvider} from './context-store/appData';
import PushNotificationManager from './context-store/notificationManager';

const Stack = createNativeStackNavigator();

function App(): JSX.Element {
  return (
    <GlobalContextProvider>
      <GlobalAppDataProvider>
        <WebViewProvider>
          <GlobalContactsList>
            <GlobaleCashVariables>
              <ListenForLiquidPaymentProvider>
                <PushNotificationManager>
                  <Suspense
                    fallback={<FullLoadingScreen text={'Loading Page'} />}>
                    <ResetStack />
                  </Suspense>
                </PushNotificationManager>
              </ListenForLiquidPaymentProvider>
            </GlobaleCashVariables>
          </GlobalContactsList>
        </WebViewProvider>
      </GlobalAppDataProvider>
      {/* <BreezTest /> */}
    </GlobalContextProvider>
  );
}

function ResetStack(): JSX.Element | null {
  const navigationRef =
    useRef<NativeStackNavigationProp<RootStackParamList> | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isloaded, setIsLoaded] = useState(false);
  const {setDeepLinkContent, theme} = useGlobalContextProvider();

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

      // setTimeout(() => {
      //   setIsLoaded(true);
      // }, 2500);

      // setStatusBarHidden(false, 'fade');
      // SplashScreen.hide();
    })();
    return () => {
      Linking.removeAllListeners('url');
    };
  }, []);

  const handleAnimationFinish = () => {
    setIsLoaded(true);
  };

  // if (!isloaded) return null;
  if (!isloaded) {
    return <SplashScreen onAnimationFinish={handleAnimationFinish} />;
  }
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
            // gestureEnabled: false,
            presentation: 'transparentModal',
          }}
        />

        {/* Create Account screens */}
        <Stack.Screen name="DisclaimerPage" component={DislaimerPage} />
        {/* <Stack.Screen name="StartKeyGeneration" component={SecuityOption} /> */}
        <Stack.Screen name="GenerateKey" component={GenerateKey} />
        {/* <Stack.Screen name="VerifyKey" component={VerifyKey} /> */}
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
            name="ConfirmSMSPayment"
            component={ConfirmSMSPayment}
          />
          <Stack.Screen name="ConfirmVPNPage" component={ConfirmVPNPage} />

          <Stack.Screen
            name="ConfirmExportPayments"
            component={ConfirmExportPayments}
          />

          {/* <Stack.Screen name="NumberKeyboard" component={NumberKeyboard} /> */}
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

          <Stack.Screen
            name="EditReceivePaymentInformation"
            component={EditReceivePaymentInformation}
          />

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
            name="ChooseContactHalfModal"
            component={ChooseContactHalfModal}
          />
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
            name="ExpandedAddContactsPage"
            component={ExpandedAddContactsPage}
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
          <Stack.Screen
            name="HistoricalVPNPurchases"
            component={HistoricalVPNPurchases}
          />
          <Stack.Screen name="GeneratedVPNFile" component={GeneratedVPNFile} />
          <Stack.Screen
            name="POSInstructionsPath"
            component={POSInstructionsPath}
          />
          <Stack.Screen
            name="ManualyEnterSendAddress"
            component={ManualEnterSendAddress}
          />
        </Stack.Group>
        <Stack.Group
          screenOptions={{
            animation: 'fade',
            presentation: 'containedTransparentModal',
          }}>
          <Stack.Screen name="ConnectionToNode" component={ConnectionToNode} />

          <Stack.Screen
            name="HalfModalSendOption"
            component={HalfModalSendOptions}
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

          {/* <Stack.Screen name="LetterKeyboard" component={LetterKeyboard} /> */}
          <Stack.Screen
            name="ConfirmAddContact"
            component={ConfirmAddContact}
          />
          <Stack.Screen
            name="AddOrDeleteContactImage"
            component={AddOrDeleteContactImage}
          />
          {/* <Stack.Screen
            name="UserBalanceDenomination"
            component={UserBalanceDenomination}
          /> */}
          <Stack.Screen
            name="LnurlPaymentDescription"
            component={LnurlPaymentDescription}
          />
          <Stack.Screen
            name="SkipCreateAccountPathMessage"
            component={SkipCreateAccountPathMessage}
          />
          <Stack.Screen
            name="ChatGPTVoiceFeature"
            component={ChatGPTVoiceFeature}
          />
        </Stack.Group>

        <Stack.Screen
          name="LspDescriptionPopup"
          component={LspDescriptionPopup}
        />
        {/* <Stack.Screen name="AddContact" component={AddContactPage} /> */}
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
