import {useEffect, useRef, useState} from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import {COLORS, FONT, ICONS, SIZES} from '../../constants';
import {useGlobalContextProvider} from '../../../context-store/context';
import {useNavigation} from '@react-navigation/native';
import * as Device from 'expo-device';
import {BlitzSocialOptions} from '../../components/admin/homeComponents/settingsContent';
import {backArrow} from '../../constants/styles';

const GENERALOPTIONS = [
  {
    for: 'general',
    name: 'About',
    icon: ICONS.aboutIcon,
    arrowIcon: ICONS.leftCheveronIcon,
  },
  {
    for: 'general',
    name: 'Fiat currency',
    icon: ICONS.currencyIcon,
    arrowIcon: ICONS.leftCheveronIcon,
  },
  {
    for: 'general',
    name: 'Node Info',
    icon: ICONS.nodeIcon,
    arrowIcon: ICONS.leftCheveronIcon,
  },
  {
    for: 'general',
    name: 'Display options',
    icon: ICONS.colorIcon,
    arrowIcon: ICONS.leftCheveronIcon,
  },
  {
    for: 'general',
    name: 'Send On-chain',
    icon: ICONS.settingsBitcoinIcon,
    arrowIcon: ICONS.leftCheveronIcon,
  },
  {
    for: 'general',
    name: 'Gains Calculator',
    icon: ICONS.gainsIcon,
    arrowIcon: ICONS.leftCheveronIcon,
  },
  {
    for: 'general',
    name: 'Refund liquid tx',
    icon: ICONS.liquidIcon,
    arrowIcon: ICONS.leftCheveronIcon,
  },
  {
    for: 'general',
    name: 'Create Gift',
    icon: ICONS.walletBlueIcon,
    arrowIcon: ICONS.leftCheveronIcon,
    usesStandAlonePath: true,
  },
  // {
  //   for: 'general',
  //   name: 'Noster Wallet Connect',
  //   icon: ICONS.Connected,
  //   arrowIcon: ICONS.leftCheveronIcon,
  // },
];
const SECURITYOPTIONS = [
  {
    for: 'Security & Customization',
    name: 'Biometric Login',
    icon: ICONS.faceIDIcon,
    arrowIcon: ICONS.leftCheveronIcon,
  },
  {
    for: 'Security & Customization',
    name: 'Recovery phrase',
    icon: ICONS.keyIcon,
    arrowIcon: ICONS.leftCheveronIcon,
  },
  {
    for: 'Security & Customization',
    name: 'LSP',
    icon: ICONS.linkIcon,
    arrowIcon: ICONS.leftCheveronIcon,
  },
  {
    for: 'Security & Customization',
    name: 'Data Storage',
    icon: ICONS.dataStorage,
    arrowIcon: ICONS.leftCheveronIcon,
  },
  // {
  //   for: 'Security & Customization',
  //   name: 'Bank',
  //   icon: ICONS.bankIcon,
  //   arrowIcon: ICONS.leftCheveronIcon,
  // },
];
const ADVANCEDOPTIONS = [
  {
    for: 'Closing Account',
    name: 'Reset Wallet',
    icon: ICONS.trashIcon,
    arrowIcon: ICONS.leftCheveronIcon,
  },
  {
    for: 'Closing Account',
    name: 'Drain Wallet',
    icon: ICONS.Xcircle,
    arrowIcon: ICONS.leftCheveronIcon,
  },
];
const SETTINGSOPTIONS = [
  [...GENERALOPTIONS],
  [...SECURITYOPTIONS],
  [...ADVANCEDOPTIONS],
];

export default function SettingsIndex(props) {
  const {theme, toggleTheme} = useGlobalContextProvider();
  const navigate = useNavigation();

  const settingsElements = SETTINGSOPTIONS.map((element, id) => {
    const internalElements = element.map((element, id) => {
      return (
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.listContainer}
          key={id}
          onPress={() => {
            // if (element?.usesStandAlonePath) {
            //   navigate.navigate('GiftWalletHome');
            //   return;
            // }
            navigate.navigate('SettingsContentHome', {for: element.name});
            // setSettingsContent({isDisplayed: true, for: element.name});
          }}>
          <Image style={[styles.listIcon]} source={element.icon} />
          <Text
            style={[
              styles.listText,
              {
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            {element.name}
          </Text>
          <Image
            style={[styles.listIcon, {transform: [{rotate: '180deg'}]}]}
            source={element.arrowIcon}
          />
        </TouchableOpacity>
      );
    });
    return (
      <View key={id} style={styles.optionsContainer}>
        <Text
          style={[
            styles.optionsTitle,
            {
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
            },
          ]}>
          {id === 0
            ? 'general'
            : id === 1
            ? 'Security & Customization'
            : 'Closing Account'}
        </Text>
        <View
          style={[
            styles.optionsListContainer,
            {
              backgroundColor: theme
                ? COLORS.darkModeBackgroundOffset
                : COLORS.lightModeBackgroundOffset,
            },
          ]}>
          {internalElements}
        </View>
      </View>
    );
  });

  return (
    <View
      style={[
        styles.globalContainer,
        {
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
          paddingVertical: Device.osName === 'ios' ? 0 : 10,
        },
      ]}>
      <SafeAreaView style={[styles.innerContainer]}>
        <View style={styles.topbar}>
          <TouchableOpacity onPress={() => navigate.goBack()}>
            <Image style={[backArrow]} source={ICONS.smallArrowLeft} />
          </TouchableOpacity>
          <Text
            style={[
              styles.topBarText,
              {
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            Settings
          </Text>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{alignItems: 'center'}}
          style={styles.settingsContainer}>
          {settingsElements}
        </ScrollView>
        <BlitzSocialOptions />
      </SafeAreaView>

      {/* popups */}
    </View>
  );
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
    alignItems: 'center',
  },
  innerContainer: {
    width: '95%',
    flex: 1,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  topBarText: {
    fontSize: SIZES.large,
    marginRight: 'auto',
    marginLeft: 'auto',
    transform: [{translateX: -12.5}],
    fontFamily: FONT.Title_Bold,
  },

  //
  settingsContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  optionsContainer: {
    width: '90%',
    marginTop: 20,
  },
  optionsTitle: {
    fontSize: SIZES.medium,
    textTransform: 'uppercase',
    marginBottom: 5,
    fontFamily: FONT.Title_Regular,
  },
  optionsListContainer: {
    padding: 5,
    borderRadius: 8,
  },
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  listText: {
    fontSize: SIZES.medium,
    marginRight: 'auto',
    marginLeft: 10,
    fontFamily: FONT.Descriptoin_Regular,
    textTransform: 'capitalize',
  },
  listIcon: {
    width: 20,
    height: 20,
  },
});
