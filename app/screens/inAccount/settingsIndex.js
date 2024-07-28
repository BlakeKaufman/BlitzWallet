import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import {COLORS, FONT, ICONS, SIZES} from '../../constants';
import {useGlobalContextProvider} from '../../../context-store/context';
import {useNavigation} from '@react-navigation/native';
import {BlitzSocialOptions} from '../../components/admin/homeComponents/settingsContent';
import {backArrow} from '../../constants/styles';

import {GlobalThemeView, ThemeText} from '../../functions/CustomElements';
import {WINDOWWIDTH} from '../../constants/theme';
import {useEffect} from 'react';
import handleBackPress from '../../hooks/handleBackPress';

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
    name: 'Wallet Stats',
    icon: ICONS.Connected,
    arrowIcon: ICONS.leftCheveronIcon,
  },
  {
    for: 'general',
    name: 'View liquid Swaps',
    icon: ICONS.liquidIcon,
    arrowIcon: ICONS.leftCheveronIcon,
  },
  // {
  //   for: 'general',
  //   name: 'Create Gift',
  //   icon: ICONS.adminHomeWallet,
  //   arrowIcon: ICONS.leftCheveronIcon,
  //   usesStandAlonePath: true,
  // },
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
  // {
  //   for: 'Security & Customization',
  //   name: 'Data Storage',
  //   icon: ICONS.dataStorage,
  //   arrowIcon: ICONS.leftCheveronIcon,
  // },
  {
    for: 'Security & Customization',
    name: 'Bank',
    icon: ICONS.bankIcon,
    arrowIcon: ICONS.leftCheveronIcon,
  },
];
const ADVANCEDOPTIONS = [
  {
    for: 'Closing Account',
    name: 'Reset Wallet',
    icon: ICONS.trashIcon,
    arrowIcon: ICONS.leftCheveronIcon,
  },
  // {
  //   for: 'Closing Account',
  //   name: 'Drain Wallet',
  //   icon: ICONS.Xcircle,
  //   arrowIcon: ICONS.leftCheveronIcon,
  // },
];
const SETTINGSOPTIONS = [
  [...GENERALOPTIONS],
  [...SECURITYOPTIONS],
  [...ADVANCEDOPTIONS],
];

export default function SettingsIndex() {
  const {theme} = useGlobalContextProvider();
  const navigate = useNavigation();
  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

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
          <ThemeText styles={{...styles.listText}} content={element.name} />
          <Image
            style={[styles.listIcon, {transform: [{rotate: '180deg'}]}]}
            source={element.arrowIcon}
          />
        </TouchableOpacity>
      );
    });
    return (
      <View key={id} style={styles.optionsContainer}>
        <ThemeText
          content={
            id === 0
              ? 'general'
              : id === 1
              ? 'Security & Customization'
              : 'Closing Account'
          }
          styles={{...styles.optionsTitle}}
        />
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
    <GlobalThemeView styles={{alignItems: 'center'}}>
      <View style={[styles.innerContainer]}>
        <View style={styles.topbar}>
          <TouchableOpacity onPress={() => navigate.goBack()}>
            <Image style={[backArrow]} source={ICONS.smallArrowLeft} />
          </TouchableOpacity>
          <ThemeText content={'Settings'} styles={{...styles.topBarText}} />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{alignItems: 'center'}}
          style={styles.settingsContainer}>
          {settingsElements}
        </ScrollView>
        <BlitzSocialOptions />
      </View>

      {/* popups */}
    </GlobalThemeView>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    width: WINDOWWIDTH,
    flex: 1,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  topBarText: {
    fontSize: SIZES.large,
    // marginRight: 'auto',
    marginLeft: 'auto',
    // transform: [{translateX: -12.5}],
    fontFamily: FONT.Title_Bold,
  },

  settingsContainer: {
    flex: 1,
    // width: '100%',
    // height: '100%',
  },

  optionsContainer: {
    width: '100%',
    marginTop: 20,
  },
  optionsTitle: {
    textTransform: 'uppercase',
    marginBottom: 5,
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
    marginRight: 'auto',
    marginLeft: 10,
    textTransform: 'capitalize',
  },
  listIcon: {
    width: 20,
    height: 20,
  },
});
