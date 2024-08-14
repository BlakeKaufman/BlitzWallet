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
import {backArrow, CENTER} from '../../constants/styles';

import {GlobalThemeView, ThemeText} from '../../functions/CustomElements';
import {WINDOWWIDTH} from '../../constants/theme';
import {useEffect} from 'react';
import handleBackPress from '../../hooks/handleBackPress';
import Icon from '../../functions/CustomElements/Icon';

const GENERALOPTIONS = [
  {
    for: 'general',
    name: 'About',
    icon: ICONS.aboutIcon,
    arrowIcon: ICONS.leftCheveronIcon,
  },
  {
    for: 'general',
    name: 'Display currency',
    icon: ICONS.currencyIcon,
    arrowIcon: ICONS.leftCheveronIcon,
  },
  {
    for: 'general',
    name: 'Node info',
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
    name: 'On-chain funds',
    icon: ICONS.settingsBitcoinIcon,
    arrowIcon: ICONS.leftCheveronIcon,
  },
  // {
  //   for: 'general',
  //   name: 'Wallet Stats',
  //   icon: ICONS.Connected,
  //   arrowIcon: ICONS.leftCheveronIcon,
  // },
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
    name: 'Backup phrase',
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

const EXPIRIMENTALFEATURES = [
  {
    for: 'Experimental features',
    name: 'Experimental',
    svgIcon: true,
    svgName: 'expirementalFeaturesIcon',
    arrowIcon: ICONS.leftCheveronIcon,
  },
];
// const ADVANCEDOPTIONS = [
//   {
//     for: 'Closing Account',
//     name: 'Reset Wallet',
//     icon: ICONS.trashIcon,
//     arrowIcon: ICONS.leftCheveronIcon,
//   },
//   // {
//   //   for: 'Closing Account',
//   //   name: 'Drain Wallet',
//   //   icon: ICONS.Xcircle,
//   //   arrowIcon: ICONS.leftCheveronIcon,
//   // },
// ];
const SETTINGSOPTIONS = [
  [...GENERALOPTIONS],
  [...SECURITYOPTIONS],
  // [...EXPIRIMENTALFEATURES],
  // [...ADVANCEDOPTIONS],
];

export default function SettingsIndex() {
  const {theme, nodeInformation} = useGlobalContextProvider();
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

            if (
              !nodeInformation.didConnectToNode &&
              (element.name.toLocaleLowerCase() === 'fiat currency' ||
                element.name.toLocaleLowerCase() === 'node info' ||
                element.name.toLocaleLowerCase() === 'send on-chain' ||
                element.name.toLocaleLowerCase() === 'lsp')
            ) {
              navigate.navigate('ErrorScreen', {
                errorMessage:
                  'Please reconnect to the internet to use this feature',
              });
              return;
            }
            navigate.navigate('SettingsContentHome', {for: element.name});
            // setSettingsContent({isDisplayed: true, for: element.name});
          }}>
          {element.svgIcon ? (
            <Icon width={20} height={20} name={element.svgName} />
          ) : (
            <Image style={[styles.listIcon]} source={element.icon} />
          )}
          <ThemeText
            styles={{
              ...styles.listText,
              textTransform:
                element.name === 'Experimental' ? 'none' : 'capitalize',
            }}
            content={element.name}
          />
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
              ? 'Security'
              : 'Experimental features'
          }
          styles={{...styles.optionsTitle}}
        />
        <View style={[styles.optionsListContainer]}>{internalElements}</View>
      </View>
    );
  });

  return (
    <GlobalThemeView styles={{alignItems: 'center'}}>
      <View style={[styles.innerContainer]}>
        <View style={styles.topbar}>
          <TouchableOpacity
            style={{position: 'absolute', top: 0, left: 0, zIndex: 1}}
            onPress={() => navigate.goBack()}>
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
        <TouchableOpacity
          onPress={() =>
            navigate.navigate('SettingsContentHome', {for: 'Point-of-sale'})
          }
          style={{
            flexDirection: 'row',
            borderWidth: 2,
            width: 'auto',
            ...CENTER,
            paddingHorizontal: 25,
            paddingVertical: 8,
            borderRadius: 8,
            borderColor: COLORS.primary,
            marginBottom: 10,
            alignItems: 'center',
          }}>
          <Icon width={30} height={40} name={'posICON'} />
          <ThemeText
            styles={{
              color: COLORS.primary,
              fontSize: SIZES.xLarge,
              marginLeft: 10,
              includeFontPadding: false,
            }}
            content={'Point-of-sale'}
          />
        </TouchableOpacity>
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
    position: 'relative',
    marginBottom: 10,
  },

  topBarText: {
    width: '100%',
    fontSize: SIZES.xLarge,
    fontFamily: FONT.Title_Regular,
    textAlign: 'center',
  },

  settingsContainer: {
    flex: 1,
    width: '95%',
    ...CENTER,
  },

  optionsContainer: {
    width: '100%',
    marginTop: 10,
  },
  optionsTitle: {
    textTransform: 'capitalize',
    marginBottom: 5,
    fontSize: SIZES.large,
  },
  optionsListContainer: {
    width: '95%',
    padding: 5,
    borderRadius: 8,
    ...CENTER,
  },
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  listText: {
    marginRight: 'auto',
    marginLeft: 10,
    // textTransform: 'capitalize',
    fontSize: SIZES.large,
    fontFamily: FONT.Title_light,
  },
  listIcon: {
    width: 20,
    height: 20,
  },
});
