import {createDrawerNavigator} from '@react-navigation/drawer';
import {useGlobalContextProvider} from '../../context-store/context';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ActivityIndicator, Dimensions, View} from 'react-native';
import ChatGPTHome from '../../app/components/admin/homeComponents/apps/chatGPT/chatGPTHome';
import {COLORS} from '../../app/constants';
import {useEffect, useState} from 'react';
import {getLocalStorageItem, retrieveData} from '../../app/functions';

const Drawer = createDrawerNavigator();

function ChatGPTDrawer() {
  const {theme} = useGlobalContextProvider();
  const insets = useSafeAreaInsets();
  const drawerWidth =
    Dimensions.get('screen').width * 0.5 < 150 ||
    Dimensions.get('screen').width * 0.5 > 230
      ? 175
      : Dimensions.get('screen').width * 0.55;

  const [savedConversations, setSavedConversations] = useState(null);
  const [chatGPTCredits, setChatGPTCredits] = useState(null);

  useEffect(() => {
    (async () => {
      const savedConversations = JSON.parse(
        await getLocalStorageItem('chatGPT'),
      );
      const chatGPTCredits =
        JSON.parse(await retrieveData('blitzWalletContact')).chatGPTCredits ||
        0;

      console.log(chatGPTCredits);
      if (savedConversations)
        setSavedConversations([null, ...savedConversations]);
      else setSavedConversations([null]);
      setChatGPTCredits(chatGPTCredits);
    })();
  }, []);

  const drawerElements = savedConversations
    ?.sort((a, b) => a - b)
    .map((element, id) => {
      return (
        <Drawer.Screen
          key={id}
          initialParams={{chatHistory: element, credits: chatGPTCredits}}
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

export {ChatGPTDrawer};
