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
import {useCallback, useEffect} from 'react';
import handleBackPress from '../../hooks/handleBackPress';
import Icon from '../../functions/CustomElements/Icon';
import ThemeImage from '../../functions/CustomElements/themeImage';

const GENERALOPTIONS = [
  {
    for: 'general',
    name: 'About',
    icon: ICONS.aboutIcon,
    iconWhite: ICONS.aboutIconWhite,
    arrowIcon: ICONS.leftCheveronIcon,
  },
  {
    for: 'general',
    name: 'Display Currency',
    icon: ICONS.currencyIcon,
    iconWhite: ICONS.currencyIconWhite,
    arrowIcon: ICONS.leftCheveronIcon,
  },

  {
    for: 'general',
    name: 'Display Options',
    icon: ICONS.colorIcon,
    iconWhite: ICONS.colorIconWhite,
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
    name: 'Edit Contact Profile',
    icon: ICONS.contactsIconBlue,
    iconWhite: ICONS.contactsIconWhite,
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
    iconWhite: ICONS.faceIDIconWhite,
    arrowIcon: ICONS.leftCheveronIcon,
  },
  {
    for: 'Security & Customization',
    name: 'Backup wallet',
    icon: ICONS.keyIcon,
    iconWhite: ICONS.keyIconWhite,
    arrowIcon: ICONS.leftCheveronIcon,
  },

  // {
  //   for: 'Security & Customization',
  //   name: 'Data Storage',
  //   icon: ICONS.dataStorage,
  //   arrowIcon: ICONS.leftCheveronIcon,
  // },
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
const ADVANCEDOPTIONS = [
  {
    for: 'general',
    name: 'Node Info',
    icon: ICONS.nodeIcon,
    iconWhite: ICONS.nodeIconWhite,
    arrowIcon: ICONS.leftCheveronIcon,
  },
  {
    for: 'Security & Customization',
    name: 'Lsp',
    icon: ICONS.linkIcon,
    iconWhite: ICONS.chainLight,
    arrowIcon: ICONS.leftCheveronIcon,
  },
  {
    for: 'Security & Customization',
    name: 'Bank',
    icon: ICONS.bankIcon,
    iconWhite: ICONS.bankWhite,
    arrowIcon: ICONS.leftCheveronIcon,
  },
  {
    for: 'general',
    name: 'On-Chain Funds',
    icon: ICONS.settingsBitcoinIcon,
    iconWhite: ICONS.settingsBitcoinIconWhite,
    arrowIcon: ICONS.leftCheveronIcon,
  },
  {
    for: 'general',
    name: 'View Liquid Swaps',
    icon: ICONS.liquidIcon,
    iconWhite: ICONS.liquidIconWhite,
    arrowIcon: ICONS.leftCheveronIcon,
  },
  {
    for: 'Closing Account',
    name: 'Reset Wallet',
    icon: ICONS.trashIcon,
    iconWhite: ICONS.trashIconWhite,
    arrowIcon: ICONS.leftCheveronIcon,
  },
  {
    for: 'Closing Account',
    name: 'Restore channels',
    icon: ICONS.share,
    iconWhite: ICONS.shareWhite,
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
  [...EXPIRIMENTALFEATURES],
];

export default function SettingsIndex() {
  const {theme, nodeInformation, darkModeType} = useGlobalContextProvider();
  const navigate = useNavigation();
  const handleBackPressFunction = useCallback(() => {
    navigate.goBack();
    return true;
  }, [navigate]);

  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, [handleBackPressFunction]);

  const settingsElements = SETTINGSOPTIONS.map((element, id) => {
    const internalElements = element.map((element, id) => {
      return (
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.listContainer}
          key={id}
          onPress={() => {
            if (
              element.name.toLocaleLowerCase() === 'restore channels' &&
              nodeInformation.userBalance === 0
            ) {
              navigate.navigate('ErrorScreen', {
                errorMessage: 'You have no channels to back up',
              });
              return;
            }

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
            <Icon
              color={theme && darkModeType ? COLORS.white : COLORS.primary}
              width={20}
              height={20}
              name={element.svgName}
            />
          ) : (
            <ThemeImage
              styles={{width: 20, height: 20}}
              lightsOutIcon={element.iconWhite}
              darkModeIcon={element.icon}
              lightModeIcon={element.icon}
            />
          )}
          <ThemeText
            styles={{
              ...styles.listText,
              textTransform:
                element.name === 'Experimental' ? 'none' : 'capitalize',
            }}
            content={element.name}
          />
          <ThemeImage
            styles={{width: 20, height: 20, transform: [{rotate: '180deg'}]}}
            lightsOutIcon={ICONS.left_cheveron_white}
            darkModeIcon={ICONS.leftCheveronIcon}
            lightModeIcon={ICONS.leftCheveronIcon}
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
              : id === 2
              ? 'Technical Settings'
              : 'Experimental features'
          }
          styles={{...styles.optionsTitle}}
        />
        <View style={[styles.optionsListContainer]}>{internalElements}</View>
      </View>
    );
  });

  return (
    <GlobalThemeView styles={{alignItems: 'center', paddingBottom: 0}}>
      <View style={[styles.innerContainer]}>
        <View style={styles.topbar}>
          <TouchableOpacity
            style={{position: 'absolute', top: 0, left: 0, zIndex: 1}}
            onPress={() => navigate.goBack()}>
            <ThemeImage
              lightsOutIcon={ICONS.arrow_small_left_white}
              darkModeIcon={ICONS.smallArrowLeft}
              lightModeIcon={ICONS.smallArrowLeft}
            />
          </TouchableOpacity>
          <ThemeText content={'Settings'} styles={{...styles.topBarText}} />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{alignItems: 'center'}}
          style={styles.settingsContainer}>
          {settingsElements}
          <TouchableOpacity
            onPress={() =>
              navigate.navigate('SettingsContentHome', {for: 'Point-of-sale'})
            }
            style={{
              ...styles.posContainer,
              borderColor:
                theme && darkModeType ? COLORS.white : COLORS.primary,
            }}>
            <Icon
              color={theme && darkModeType ? COLORS.white : COLORS.primary}
              width={30}
              height={40}
              name={'posICON'}
            />
            <ThemeText
              styles={{
                color: theme && darkModeType ? COLORS.white : COLORS.primary,
                fontSize: SIZES.xLarge,
                marginLeft: 10,
                includeFontPadding: false,
              }}
              content={'Point-of-sale'}
            />
          </TouchableOpacity>
          <BlitzSocialOptions />
        </ScrollView>
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
    fontSize: SIZES.large,
  },

  posContainer: {
    flexDirection: 'row',
    borderWidth: 2,
    width: 'auto',
    ...CENTER,
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
});
