import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import {useGlobalContextProvider} from '../../../context-store/context';
import {CENTER, COLORS, FONT, SIZES} from '../../constants';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {APPLIST} from '../../components/admin/homeComponents/apps/appList';
import {GlobalThemeView, ThemeText} from '../../functions/CustomElements';
import handleBackPress from '../../hooks/handleBackPress';
import {useEffect} from 'react';
import Icon from '../../functions/CustomElements/Icon';
import GetThemeColors from '../../hooks/themeColors';
import {useGlobalAppData} from '../../../context-store/appData';
import {isMoreThan21Days} from '../../functions/rotateAddressDateChecker';

export default function AppStore({navigation}) {
  const {theme, nodeInformation, darkModeType} = useGlobalContextProvider();
  const {textColor, backgroundOffset} = GetThemeColors();
  const {decodedGiftCards} = useGlobalAppData();
  const navigate = useNavigation();
  const isFocused = useIsFocused();

  console.log(decodedGiftCards);
  function handleBackPressFunction() {
    navigation.navigate('Home');
    return true;
  }
  useEffect(() => {
    if (!isFocused) return;
    console.log('RUNNIN IN APP INDES USE EFFECT');
    handleBackPress(handleBackPressFunction);
  }, [isFocused]);

  const appElements = APPLIST.map((app, id) => {
    return (
      <TouchableOpacity
        key={id}
        onPress={() => {
          if (
            !nodeInformation.didConnectToNode &&
            (app.pageName.toLocaleLowerCase() === 'chatgpt' ||
              app.pageName.toLocaleLowerCase() === 'pos' ||
              app.pageName.toLocaleLowerCase() === 'sms4sats' ||
              app.pageName.toLocaleLowerCase() === 'lnvpn')
          ) {
            navigate.navigate('ErrorScreen', {
              errorMessage:
                'Please reconnect to the internet to use this feature',
            });
            return;
          }
          navigate.navigate('AppStorePageIndex', {page: app.pageName});
        }}
        style={{
          ...styles.appRowContainer,
          backgroundColor: backgroundOffset,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
          }}>
          <View
            style={[
              styles.appIcon,
              {
                backgroundColor: theme
                  ? darkModeType
                    ? COLORS.darkModeText
                    : COLORS.darkModeBackground
                  : COLORS.darkModeText,
              },
            ]}>
            {app.svgName ? (
              <Icon
                color={
                  theme && !darkModeType
                    ? COLORS.darkModeText
                    : COLORS.lightModeText
                }
                width={30}
                height={30}
                name={'shield'}
              />
            ) : (
              <Image
                // resizeMethod="scale"
                resizeMode="contain"
                style={{width: '80%', aspectRatio: 1, height: undefined}}
                source={theme && !darkModeType ? app.iconLight : app.iconDark}
              />
            )}
          </View>
          <ThemeText content={app.name} styles={{...styles.appTitle}} />
        </View>
        <View>
          <ThemeText
            content={app.description}
            styles={{...styles.appDescription}}
          />
        </View>
      </TouchableOpacity>
    );
  });

  return (
    <GlobalThemeView useStandardWidth={true}>
      <ThemeText content={'Store'} styles={{...styles.headerText}} />

      <View style={{flex: 1, width: '100%', ...CENTER}}>
        <TouchableOpacity
          onPress={() => {
            if (
              !decodedGiftCards?.profile?.accessToken ||
              !decodedGiftCards?.profile?.refreshToken ||
              isMoreThan21Days(decodedGiftCards?.profile?.lastLoginDate)
            ) {
              navigate.navigate('GiftCardLoginPage');
            } else {
              navigate.navigate('GiftCardsPage');
            }
          }}
          style={{
            ...styles.giftCardContainer,
            backgroundColor: theme
              ? darkModeType
                ? COLORS.darkModeText
                : COLORS.darkModeBackgroundOffset
              : COLORS.darkModeText,
          }}>
          <ThemeText
            styles={{marginBottom: 10, color: COLORS.darkModeText}}
            content={'Shop with Bitcoin'}
          />
          <ThemeText
            styles={{
              width: '65%',
              color: COLORS.darkModeText,
              fontSize: SIZES.small,
              lineHeight: 20,
            }}
            content={
              'Buy gift cards from thousands of different merchants around the world'
            }
          />
          <View
            style={{
              position: 'absolute',
              right: 5,
              height: 90,
              width: 90,
              zIndex: -2,
            }}>
            <Icon
              height={90}
              width={90}
              color={
                theme
                  ? darkModeType
                    ? COLORS.lightsOutBackground
                    : COLORS.darkModeText
                  : COLORS.primary
              }
              offsetColor={
                theme
                  ? darkModeType
                    ? COLORS.darkModeText
                    : COLORS.darkModeBackgroundOffset
                  : COLORS.darkModeText
              }
              name={'bitcoinBCircle'}
            />
          </View>
          <View
            style={{
              ...styles.backgroundBlue,
              backgroundColor: theme
                ? darkModeType
                  ? COLORS.lightsOutBackground
                  : COLORS.darkModeBackgroundOffset
                : COLORS.primary,
            }}></View>
          <View
            style={{
              ...styles.backgroundBlue2,
              backgroundColor: theme
                ? darkModeType
                  ? COLORS.giftcardlightsout2
                  : COLORS.giftcarddarkblue2
                : COLORS.giftcardblue2,
            }}></View>
          <View
            style={{
              ...styles.backgroundBlue3,
              backgroundColor: theme
                ? darkModeType
                  ? COLORS.giftcardlightsout3
                  : COLORS.giftcarddarkblue3
                : COLORS.giftcardblue3,
            }}></View>
        </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.scrollViewStyles}>
          {appElements}
        </ScrollView>
      </View>
    </GlobalThemeView>
  );
}

const styles = StyleSheet.create({
  headerText: {fontSize: SIZES.large, ...CENTER, marginBottom: 50},

  giftCardContainer: {
    minHeight: 120,
    width: '95%',
    minWidth: 310,
    paddingHorizontal: 15,
    borderRadius: 10,
    justifyContent: 'center',
    ...CENTER,
    overflow: 'hidden',
  },
  backgroundBlue: {
    width: '80%',
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: COLORS.primary,
    borderTopRightRadius: 200,
    height: '100%',
    zIndex: -1,
  },
  backgroundBlue2: {
    width: '87%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: COLORS.darkModeBackground,
    borderTopRightRadius: 200,

    zIndex: -2,
  },
  backgroundBlue3: {
    width: '95%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: COLORS.cancelRed,
    borderTopRightRadius: 200,

    zIndex: -3,
  },

  appTitle: {
    fontWeight: 500,
  },
  appDescription: {
    fontSize: SIZES.small,
    flexWrap: 'wrap',
  },

  appRowContainer: {
    width: Platform.OS === 'ios' ? '46.25%' : '45%',
    minWidth: 150,

    // marginVertical: 10,
    // marginHorizontal: 5,
    padding: 10,
    paddingBottom: 30,
    borderRadius: 10,
  },
  appIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderRadius: 8,
  },

  scrollViewStyles: {
    width: '95%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    ...CENTER,
    paddingTop: 20,
    rowGap: Platform.OS === 'ios' ? '15%' : '5%',
    columnGap: Platform.OS === 'ios' ? '15%' : '5%',
  },
});
