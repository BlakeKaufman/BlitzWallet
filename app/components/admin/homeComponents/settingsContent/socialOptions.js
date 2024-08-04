import {StyleSheet, View, Image, TouchableOpacity} from 'react-native';
import {CENTER, ICONS} from '../../../../constants';

import * as WebBrowser from 'expo-web-browser';

const NAVITEMS = [
  //   {name: 'Faucet', link: 'URL', icon: ICONS.faucetIcon, inApp: true},
  // {name: 'Drain', link: 'URL', icon: ICONS.Checkcircle, inApp: true},
  {
    name: 'Telegram',
    link: 'https://t.me/+-VIAPa9ObHM4YWQx',
    icon: ICONS.telegramIcon,
    inApp: false,
  },
  {
    name: 'View Code',
    link: 'https://github.com/BlakeKaufman/BlitzWallet',
    icon: ICONS.githubIcon,
    inApp: false,
  },
  {
    name: 'Twitter',
    link: 'https://twitter.com/BlitzWallet1',
    icon: ICONS.twitterIcon,
    inApp: false,
  },
];

export default function BlitzSocialOptions() {
  const navElements = NAVITEMS.map((item, id) => {
    return (
      <TouchableOpacity
        key={id}
        onPress={() => {
          (async () => {
            try {
              await WebBrowser.openBrowserAsync(item.link);
            } catch (err) {
              console.log(err, 'OPENING LINK ERROR');
            }
          })();
        }}
        style={styles.tochableOpacityContainer}>
        <Image source={item.icon} style={{width: 50, height: 50}} />
      </TouchableOpacity>
    );
  });

  return <View style={styles.innerContainer}>{navElements}</View>;
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
