import {useNavigation} from '@react-navigation/native';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {BTN, COLORS, FONT, ICONS, SIZES} from '../../../../constants';

import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useEffect, useState} from 'react';
import {retrieveData} from '../../../../functions';
import HasNWCAccount from './nwc/hasAccount';
import NoNWCAccount from './nwc/noAccount';

export default function NosterWalletConnect() {
  const navigate = useNavigation();
  const {theme} = useGlobalContextProvider();
  const [hasAccount, setHasAccount] = useState(false);

  //   useEffect(() => {
  //     (async () => {
  //       const nwcUrl = await retrieveData('nwcUrl');
  //       if (nwcUrl) setHasAccount(true);
  //       else setHasAccount(false);
  //     })();
  //   }, []);

  if (hasAccount === null) return;
  return (
    <View
      style={[
        styles.globalContainer,
        {
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
          paddingVertical: Platform.OS === 'ios' ? 0 : 10,
        },
      ]}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
          }}>
          <SafeAreaView style={{flex: 1}}>
            {hasAccount ? <HasNWCAccount /> : <NoNWCAccount />}
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },

  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBarIcon: {
    width: 25,
    height: 25,
  },
  topBarText: {
    fontSize: SIZES.large,
    marginRight: 'auto',
    marginLeft: 'auto',
    transform: [{translateX: -12.5}],
    fontFamily: FONT.Title_Bold,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  contentItem: {
    width: '90%',
    marginVertical: 10,
  },
  contentHeader: {
    fontFamily: FONT.Title_Bold,
    fontSize: SIZES.medium,
    marginBottom: 10,
  },
  contentDescriptionContainer: {
    padding: 10,
    borderRadius: 8,
  },
  contentDescription: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
    marginBottom: 10,
  },

  buttonText: {
    color: COLORS.white,
    fontFamily: FONT.Other_Regular,
  },
});
