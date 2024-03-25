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

type Routes = {
  name: string;
  key: number;
  params: object;
};
type DescriptorsObject = {
  options: {
    tabBarLabel: string;
    title: string;
    params: object;
    tabBarAccessibilityLabel: string;
    tabBarTestID: string;
  };
};
type TabStackParamList = {
  state: {routes: Routes[]; index: number};
  descriptors: DescriptorsObject[];
  navigation: {emit: Function; navigate: Function};
};
import {
  AppState,
  Dimensions,
  Image,
  Platform,
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
  AdminHome,
  AdminHomeIndex,
  AdminLogin,
  ConfirmTxPage,
  ConnectingToNodeLoadingScreen,
  ConnectionToNode,
  ContactsPage,
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

import ReceiveGiftHome from './app/screens/createAccount/receiveGift/receiveGiftHome';
import globalOnBreezEvent from './app/functions/globalOnBreezEvent';
import {useIsForeground} from './app/hooks/isAppForground';
import {
  AddContactPage,
  AmountToGift,
  CameraModal,
  ChangeNostrPrivKeyPage,
  ClipboardCopyPopup,
  ConfirmActionPage,
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
  GivawayHome,
  HalfModalSendOptions,
  LnurlPaymentDescription,
  LspDescriptionPopup,
  MyContactProfilePage,
  RefundBitcoinTransactionPage,
  ScanRecieverQrCode,
  SendAndRequestPage,
  SendPaymentScreen,
  SwitchReceiveOptionPage,
  UserBalanceDenomination,
  ViewInProgressSwap,
} from './app/components/admin';
import {sendPayment} from '@breeztech/react-native-breez-sdk';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {COLORS, FONT, ICONS, SHADOWS, SIZES} from './app/constants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

function MyTabBar({state, descriptors, navigation}: TabStackParamList) {
  const insets = useSafeAreaInsets();
  const {theme} = useGlobalContextProvider();

  return (
    <View
      style={{
        flexDirection: 'row',
        paddingBottom: insets.bottom,
        paddingTop: 10,

        backgroundColor: theme
          ? COLORS.darkModeBackgroundOffset
          : COLORS.lightModeBackgroundOffset,
      }}>
      {state.routes.map(
        (route: {name: string; key: number; params: object}, index: number) => {
          const {options} = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name === 'ContactsPageInit'
              ? 'Contacts'
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? {selected: true} : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              activeOpacity={1}
              style={{flex: 1, alignItems: 'center'}}>
              <View
                style={{
                  width: 30,
                  height: 30,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isFocused
                    ? COLORS.lightModeBackground
                    : 'transparent',
                  borderRadius: 15,
                }}>
                <Image
                  style={{
                    width: 20,
                    height: 20,
                  }}
                  source={
                    label === 'Contacts'
                      ? ICONS.contactsIcon
                      : label === 'Home'
                      ? ICONS.adminHomeWallet
                      : ICONS.faucetIcon
                  }
                />
              </View>
              <Text
                style={{
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  fontFamily: FONT.Title_Regular,
                  fontSize: SIZES.small,
                }}>
                {label === 'Home' ? 'Wallet' : label}
              </Text>
            </TouchableOpacity>
          );
        },
      )}
    </View>
  );
}

export function MyTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}
      tabBar={props => <MyTabBar {...props} />}>
      <Tab.Screen name="ContactsPageInit" component={ContactsDrawer} />
      <Tab.Screen name="Home" component={AdminHome} />
      <Tab.Screen name="Faucet" component={FaucetHome} />
    </Tab.Navigator>
  );
}

function ContactsDrawer() {
  const {theme} = useGlobalContextProvider();
  const insets = useSafeAreaInsets();
  const drawerWidth =
    Dimensions.get('screen').width * 0.5 < 150 ||
    Dimensions.get('screen').width * 0.5 > 230
      ? 175
      : Dimensions.get('screen').width * 0.55;
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerType: 'front',
        drawerStyle: {
          flex: 1,
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
          width: drawerWidth,
        },

        drawerActiveBackgroundColor: theme
          ? COLORS.darkModeBackgroundOffset
          : COLORS.lightModeBackgroundOffset,
        drawerActiveTintColor: theme
          ? COLORS.darkModeText
          : COLORS.lightModeText,
        drawerInactiveTintColor: theme
          ? COLORS.darkModeText
          : COLORS.lightModeText,

        headerShown: false,
        drawerPosition: 'right',
      }}>
      <Drawer.Screen name="ContactsPage" component={ContactsPage} />
      <Drawer.Screen name="AddContact" component={AddContactPage} />
      <Drawer.Screen name="Givaway" component={GivawayHome} />
    </Drawer.Navigator>
  );
}

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
        {/* gift walet path */}
        <Stack.Screen name="ReceiveGiftHome" component={ReceiveGiftHome} />
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
          <Stack.Screen
            name="ScanReciverQrCode"
            component={ScanRecieverQrCode}
          />

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
  async ({data, error, executionInfo}) => {
    console.log(data);
    console.log(executionInfo);
    const paymentInformationFromNotification = data?.body;
    console.log(paymentInformationFromNotification);

    if (paymentInformationFromNotification.pr) {
      try {
        const test = await sendPayment({
          bolt11: paymentInformationFromNotification.pr,
        });
        console.log(test);
      } catch (err) {
        console.log(err);
      }
      return;
    }

    const didConnect = await connectToNode(globalOnBreezEvent);
    console.log(didConnect);
    if (didConnect.isConnected) {
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
    }

    console.log('Received a notification in the background!', 'TTTTT');

    // Do something with the notification data
  },
);

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

export default App;
registerRootComponent(App);
