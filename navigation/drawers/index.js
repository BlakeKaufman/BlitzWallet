import {createDrawerNavigator} from '@react-navigation/drawer';
import {useGlobalContextProvider} from '../../context-store/context';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ActivityIndicator, Dimensions, View} from 'react-native';
import ChatGPTHome from '../../app/components/admin/homeComponents/apps/chatGPT/chatGPTHome';
import {COLORS} from '../../app/constants';

import {
  AddContactPage,
  ContactsPage,
  GivawayHome,
} from '../../app/components/admin';
import * as nostr from 'nostr-tools';
import {decryptMessage} from '../../app/functions/messaging/encodingAndDecodingMessages';
import {ANDROIDSAFEAREA} from '../../app/constants/styles';
import {
  AutomatedPayments,
  PaymentRequests,
} from '../../app/components/admin/homeComponents/contacts/automatedPayments';

const Drawer = createDrawerNavigator();

function ChatGPTDrawer() {
  const {theme, masterInfoObject, contactsPrivateKey} =
    useGlobalContextProvider();
  const publicKey = nostr.getPublicKey(contactsPrivateKey);
  const insets = useSafeAreaInsets();

  const drawerWidth =
    Dimensions.get('screen').width * 0.5 < 150 ||
    Dimensions.get('screen').width * 0.5 > 230
      ? 175
      : Dimensions.get('screen').width * 0.55;

  const savedConversations =
    masterInfoObject.chatGPT.conversation.length != 0
      ? [
          null,
          ...JSON.parse(
            decryptMessage(
              contactsPrivateKey,
              publicKey,
              masterInfoObject.chatGPT.conversation,
            ),
          ),
        ]
      : [null];

  const chatGPTCredits = masterInfoObject.chatGPT.credits;

  const drawerElements = savedConversations
    ?.sort((a, b) => a - b)
    .map((element, id) => {
      return (
        <Drawer.Screen
          key={id}
          initialParams={{chatHistory: element}}
          name={element ? element.firstQuery : 'New Chat'}
          component={ChatGPTHome}
        />
      );
    });

  return (
    <>
      {savedConversations && chatGPTCredits != null ? (
        <Drawer.Navigator
          screenOptions={{
            drawerType: 'front',
            drawerStyle: {
              backgroundColor: theme
                ? COLORS.darkModeBackground
                : COLORS.lightModeBackground,
              width: drawerWidth,
              paddingTop: insets.top === 0 ? ANDROIDSAFEAREA : 0,
              paddingBottom: insets.bottom === 0 ? ANDROIDSAFEAREA : 0,
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
        <ActivityIndicator
          size={'large'}
          color={theme ? COLORS.darkModeText : COLORS.lightModeText}
          style={{
            marginTop: 'auto',
            marginBottom: 'auto',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        />
      )}
    </>
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
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
          width: drawerWidth,
          paddingTop: insets.top === 0 ? ANDROIDSAFEAREA : 0,
          paddingBottom: insets.bottom === 0 ? ANDROIDSAFEAREA : 0,
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
      <Drawer.Screen name="Contacts Page" component={ContactsPage} />
      <Drawer.Screen name="Add Contact" component={AddContactPage} />
      <Drawer.Screen
        initialParams={{pageType: 'giveaway'}}
        name="Giveaway"
        component={AutomatedPayments}
      />
      <Drawer.Screen
        initialParams={{pageType: 'paymentRequest'}}
        name="Payment Requests"
        component={AutomatedPayments}
      />
    </Drawer.Navigator>
  );
}

export {ChatGPTDrawer, ContactsDrawer};
