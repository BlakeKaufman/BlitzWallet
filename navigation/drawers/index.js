import {createDrawerNavigator, DrawerContent} from '@react-navigation/drawer';
import {useGlobalContextProvider} from '../../context-store/context';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ActivityIndicator, Dimensions, Platform, View} from 'react-native';
import ChatGPTHome from '../../app/components/admin/homeComponents/apps/chatGPT/chatGPTHome';
import {COLORS} from '../../app/constants';

import {
  AddChatGPTCredits,
  AddContactPage,
  AutomatedPayments,
  ContactsPage,
  MyContactProfilePage,
} from '../../app/components/admin';
import * as nostr from 'nostr-tools';
import {decryptMessage} from '../../app/functions/messaging/encodingAndDecodingMessages';
import {ANDROIDSAFEAREA} from '../../app/constants/styles';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useCallback, useEffect, useMemo, useState} from 'react';
import FullLoadingScreen from '../../app/functions/CustomElements/loadingScreen';
import {useGlobalAppData} from '../../context-store/appData';

const Drawer = createDrawerNavigator();

function ChatGPTDrawer() {
  const {decodedChatGPT, toggleGlobalAppDataInformation} = useGlobalAppData();
  const {theme} = useGlobalContextProvider();

  const insets = useSafeAreaInsets();
  const [didLoadSavedConversations, setDidLoadSavedConversatinos] =
    useState(false);

  const chatGPTCoversations = decodedChatGPT.conversation;

  const drawerWidth =
    Dimensions.get('screen').width * 0.5 < 150 ||
    Dimensions.get('screen').width * 0.5 > 230
      ? 175
      : Dimensions.get('screen').width * 0.55;

  const savedConversations =
    decodedChatGPT.conversation.length != 0
      ? [...decodedChatGPT.conversation, null]
      : [null];

  const chatGPTCredits = decodedChatGPT.credits;

  const drawerElements = useMemo(() => {
    return savedConversations
      .map((element, id) => {
        return (
          <Drawer.Screen
            key={id}
            initialParams={{chatHistory: element}}
            name={element ? element.firstQuery : 'New Chat'}
            component={ChatGPTHome}
          />
        );
      })
      .reverse();
  }, [chatGPTCoversations]);

  useEffect(() => {
    setDidLoadSavedConversatinos(true);
  }, []);
  if (!didLoadSavedConversations) {
    return <FullLoadingScreen text={'Initializing chatGPT'} />;
  }

  return (
    <>
      {chatGPTCredits > 30 ? (
        <Drawer.Navigator
          screenOptions={{
            drawerType: 'front',
            drawerStyle: {
              backgroundColor: theme
                ? COLORS.darkModeBackground
                : COLORS.lightModeBackground,
              width: drawerWidth,
              paddingBottom:
                insets.bottom < ANDROIDSAFEAREA
                  ? ANDROIDSAFEAREA
                  : insets.bottom,
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
          {drawerElements}
        </Drawer.Navigator>
      ) : (
        <AddChatGPTCredits />
      )}
    </>
  );
}

function ContactsDrawer() {
  const {theme, nodeInformation} = useGlobalContextProvider();
  const insets = useSafeAreaInsets();
  const drawerWidth =
    Dimensions.get('screen').width * 0.5 < 150 ||
    Dimensions.get('screen').width * 0.5 > 230
      ? 175
      : Dimensions.get('screen').width * 0.55;

  // const navigation = useNavigation();

  // useFocusEffect(
  //   useCallback(() => {
  //     return () => {
  //       navigation.reset({
  //         index: 0,
  //         routes: [{name: 'Contacts Page'}],
  //       });
  //     };
  //   }, [navigation]),
  // );

  return (
    <Drawer.Navigator
      initialRouteName="Contacts Page"
      screenOptions={{
        drawerType: 'front',
        drawerStyle: {
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
          width: drawerWidth,

          paddingBottom:
            insets.bottom < ANDROIDSAFEAREA ? ANDROIDSAFEAREA : insets.bottom,
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
      <Drawer.Screen name="My Profile" component={MyContactProfilePage} />
      <Drawer.Screen name="Contacts Page" component={ContactsPage} />
      {nodeInformation.didConnectToNode && (
        <Drawer.Screen name="Add Contact" component={AddContactPage} />
      )}
      {nodeInformation.didConnectToNode && (
        <Drawer.Screen
          initialParams={{pageType: 'giveaway'}}
          name="Giveaway"
          component={AutomatedPayments}
        />
      )}
      {nodeInformation.didConnectToNode && (
        <Drawer.Screen
          initialParams={{pageType: 'paymentRequest'}}
          name="Payment Requests"
          component={AutomatedPayments}
        />
      )}
    </Drawer.Navigator>
  );
}

export {ChatGPTDrawer, ContactsDrawer};
