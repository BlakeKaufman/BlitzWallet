import {StyleSheet, View, Image, TouchableOpacity} from 'react-native';
import {CENTER, ICONS} from '../../../../constants';

import * as WebBrowser from 'expo-web-browser';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ANDROIDSAFEAREA} from '../../../../constants/styles';
import ThemeImage from '../../../../functions/CustomElements/themeImage';
import icons from '../../../../constants/icons';
import {useNavigation} from '@react-navigation/native';

const NAVITEMS = [
  //   {name: 'Faucet', link: 'URL', icon: ICONS.faucetIcon, inApp: true},
  // {name: 'Drain', link: 'URL', icon: ICONS.Checkcircle, inApp: true},
  {
    name: 'Telegram',
    link: 'https://t.me/+-VIAPa9ObHM4YWQx',
    icon: ICONS.telegramIcon,
    whiteIcon: ICONS.telegramWhite,
    inApp: false,
  },
  {
    name: 'View Code',
    link: 'https://github.com/BlakeKaufman/BlitzWallet',
    icon: ICONS.githubIcon,
    whiteIcon: ICONS.githubWhite,
    inApp: false,
  },
  {
    name: 'Twitter',
    link: 'https://twitter.com/BlitzWallet1',
    icon: ICONS.twitterIcon,
    whiteIcon: ICONS.twitterWhite,
    inApp: false,
  },
];

export default function BlitzSocialOptions() {
  const insets = useSafeAreaInsets();
  const navigate = useNavigation();
  const navElements = NAVITEMS.map((item, id) => {
    return (
      <TouchableOpacity
        key={id}
        onPress={() => {
          navigate.navigate('CustomWebView', {
            webViewURL: item.link,
          });
          // (async () => {
          //   try {
          //     await WebBrowser.openBrowserAsync(item.link);
          //   } catch (err) {
          //     console.log(err, 'OPENING LINK ERROR');
          //   }
          // })();
        }}
        style={styles.tochableOpacityContainer}>
        <ThemeImage
          styles={{width: 50, height: 50}}
          darkModeIcon={item.icon}
          lightModeIcon={item.icon}
          lightsOutIcon={item.whiteIcon}
        />
      </TouchableOpacity>
    );
  });

  return (
    <View
      style={[
        styles.innerContainer,
        {
          marginBottom:
            insets.bottom < 20 ? ANDROIDSAFEAREA : insets.bottom + 15,
        },
      ]}>
      {navElements}
    </View>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    width: '95%',
    maxWidth: 200,
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'space-between',
    ...CENTER,
    marginBottom: 5,
    paddingTop: 10,
  },
});
