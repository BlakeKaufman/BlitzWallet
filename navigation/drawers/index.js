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

const Drawer = createDrawerNavigator();

function ChatGPTDrawer() {
  const {theme, masterInfoObject} = useGlobalContextProvider();
  const drawerWidth =
    Dimensions.get('screen').width * 0.5 < 150 ||
    Dimensions.get('screen').width * 0.5 > 230
      ? 175
      : Dimensions.get('screen').width * 0.55;

  const savedConversations =
    masterInfoObject.chatGPT.conversation.length != 0
      ? [null, ...masterInfoObject.chatGPT.conversation]
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

export {ChatGPTDrawer, ContactsDrawer};
