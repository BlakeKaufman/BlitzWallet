import {createDrawerNavigator} from '@react-navigation/drawer';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Dimensions, Keyboard, Platform} from 'react-native';
import ChatGPTHome from '../../app/components/admin/homeComponents/apps/chatGPT/chatGPTHome';
import {AddChatGPTCredits} from '../../app/components/admin';
import {ANDROIDSAFEAREA} from '../../app/constants/styles';
import {useNavigation} from '@react-navigation/native';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useGlobalAppData} from '../../context-store/appData';
import GetThemeColors from '../../app/hooks/themeColors';
import handleBackPress from '../../app/hooks/handleBackPress';

const Drawer = createDrawerNavigator();

function ChatGPTDrawer() {
  const {decodedChatGPT} = useGlobalAppData();
  const {textColor, backgroundOffset, backgroundColor} = GetThemeColors();
  const navigate = useNavigation();

  const insets = useSafeAreaInsets();

  const bottomPadding = Platform.select({
    ios: insets.bottom,
    android: ANDROIDSAFEAREA,
  });
  const chatGPTCoversations = decodedChatGPT.conversation;
  const chatGPTCredits = decodedChatGPT.credits;

  const drawerWidth =
    Dimensions.get('screen').width * 0.5 < 150 ||
    Dimensions.get('screen').width * 0.5 > 230
      ? 175
      : Dimensions.get('screen').width * 0.55;

  const savedConversations =
    decodedChatGPT.conversation.length != 0
      ? [...decodedChatGPT.conversation, null]
      : [null];

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

  const handleBackPressFunction = useCallback(() => {
    Keyboard.dismiss();
    navigate.goBack();
    return true;
  }, [navigate]);

  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

  if (chatGPTCredits > 30) {
    return (
      <Drawer.Navigator
        screenOptions={{
          drawerType: 'front',
          drawerStyle: {
            backgroundColor: backgroundColor,
            width: drawerWidth,
            paddingBottom: bottomPadding,
          },

          drawerActiveBackgroundColor: backgroundOffset,
          drawerActiveTintColor: textColor,
          drawerInactiveTintColor: textColor,

          headerShown: false,
          drawerPosition: 'right',
        }}>
        {drawerElements}
      </Drawer.Navigator>
    );
  } else {
    return <AddChatGPTCredits />;
  }
}

export {ChatGPTDrawer};
