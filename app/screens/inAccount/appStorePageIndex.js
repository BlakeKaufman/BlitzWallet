import {ActivityIndicator, View} from 'react-native';
import ChatGPTHome from '../../components/admin/homeComponents/apps/chatGPT/chatGPTHome';
import {useGlobalContextProvider} from '../../../context-store/context';
import {COLORS} from '../../constants';
import {ChatGPTDrawer} from '../../../navigation/drawers';
import {useState} from 'react';

export default function AppStorePageIndex(props) {
  const targetPage = props.route.params.page;
  const {theme} = useGlobalContextProvider();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme
          ? COLORS.darkModeBackground
          : COLORS.lightModeBackground,
      }}>
      {targetPage.toLowerCase() === 'chatgpt' && <ChatGPTDrawer />}
    </View>
  );
}
