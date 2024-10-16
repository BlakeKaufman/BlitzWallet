import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useGlobalContextProvider} from '../../context-store/context';
import {COLORS, FONT, ICONS, SHADOWS, SIZES} from '../../app/constants';

// import {ContactsDrawer} from '../drawers';
import {getPublicKey} from 'nostr-tools';
import {decryptMessage} from '../../app/functions/messaging/encodingAndDecodingMessages';
import {useNavigation} from '@react-navigation/native';
import {useEffect} from 'react';
import {ANDROIDSAFEAREA, CENTER} from '../../app/constants/styles';
import Icon from '../../app/functions/CustomElements/Icon';
import {ThemeText} from '../../app/functions/CustomElements';
import {useGlobalContacts} from '../../context-store/globalContacts';
import {ContactsPage} from '../../app/components/admin';

const Tab = createBottomTabNavigator();

function MyTabBar({state, descriptors, navigation}) {
  const insets = useSafeAreaInsets();
  const {
    theme,
    darkModeType,
    contactsPrivateKey,
    deepLinkContent,
    setDeepLinkContent,
  } = useGlobalContextProvider();
  const {decodedAddedContacts} = useGlobalContacts();

  const navigate = useNavigation();
  const publicKey = getPublicKey(contactsPrivateKey);

  const hasUnlookedTransactions = decodedAddedContacts.filter(
    addedContact => addedContact.unlookedTransactions > 0,
  );

  useEffect(() => {
    if (deepLinkContent.data.length === 0) return;
    if (deepLinkContent.type === 'Contact') {
      navigation.jumpTo('ContactsPageInit');
    } else if (deepLinkContent.type === 'LN') {
      navigate.navigate('ConfirmPaymentScreen', {
        btcAdress: deepLinkContent.data,
      });
      setDeepLinkContent({type: '', data: ''});
    }
  }, [deepLinkContent]);

  return (
    <View>
      <View
        style={[
          {
            width: useWindowDimensions().width,
            backgroundColor: theme
              ? darkModeType
                ? COLORS.lightsOutBackgroundOffset
                : COLORS.darkModeBackgroundOffset
              : COLORS.lightModeBackgroundOffset,
            height: 50,
            position: 'absolute',
            left: 0,
            top: -3,
            zIndex: 1,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
        ]}></View>
      <View
        style={{
          width: '100%',

          backgroundColor: theme
            ? darkModeType
              ? COLORS.lightsOutBackground
              : COLORS.darkModeBackground
            : COLORS.lightModeBackground,

          borderTopRightRadius: 15,
          borderTopLeftRadius: 15,
          zIndex: 1,
        }}>
        <View
          style={{
            width: 300,
            paddingBottom: insets.bottom < 20 ? ANDROIDSAFEAREA : insets.bottom,
            paddingTop: 15,
            flexDirection: 'row',

            ...CENTER,
          }}>
          {state.routes.map((route, index) => {
            const {options} = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name === 'ContactsPageInit'
                ? 'Contacts'
                : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <TouchableOpacity
                key={index}
                accessibilityRole="button"
                accessibilityState={isFocused ? {selected: true} : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                activeOpacity={1}
                style={{flex: 1, alignItems: 'center'}}>
                <View
                  style={{
                    width: 30,
                    height: 30,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Image
                    style={{
                      width: 30,
                      height: 30,
                    }}
                    source={
                      label === 'Contacts'
                        ? theme && darkModeType
                          ? isFocused
                            ? ICONS.contactsIconSelectedWhite
                            : ICONS.contactsIconWhite
                          : isFocused
                          ? ICONS.contactsIconBlueSelected
                          : ICONS.contactsIconBlue
                        : label === 'Home'
                        ? theme && darkModeType
                          ? isFocused
                            ? ICONS.wallet_white
                            : ICONS.adminHomeWallet_white
                          : isFocused
                          ? ICONS.walletBlueIcon
                          : ICONS.adminHomeWallet
                        : theme && darkModeType
                        ? isFocused
                          ? ICONS.appStoreFilled_white
                          : ICONS.appStore_white
                        : isFocused
                        ? ICONS.appstoreFilled
                        : ICONS.appstore
                    }
                  />

                  {label === 'Contacts' &&
                    hasUnlookedTransactions.length > 0 &&
                    !isFocused && (
                      <View
                        style={{
                          position: 'absolute',
                          top: 0,
                          right: -2.5,
                          width: 10,
                          height: 10,
                          borderRadius: 10,
                          backgroundColor:
                            theme && darkModeType
                              ? COLORS.darkModeText
                              : COLORS.primary,
                        }}></View>
                    )}
                </View>
                <ThemeText
                  styles={{
                    fontSize: SIZES.small,
                    marginTop: 2,
                    fontWeight: 500,
                  }}
                  content={
                    label === 'Home'
                      ? 'Wallet'
                      : label === 'App Store'
                      ? 'Store'
                      : label
                  }
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export function MyTabs(props) {
  return (
    <Tab.Navigator
      initialRouteName={props.fromStore ? 'App Store' : 'Home'}
      screenOptions={{
        headerShown: false,
      }}
      tabBar={props => <MyTabBar {...props} />}>
      <Tab.Screen name="ContactsPageInit" component={ContactsPage} />
      <Tab.Screen name="Home" component={props.adminHome} />
      <Tab.Screen name="App Store" component={props.appStore} />
      {/* Eventualy make this the app drawer onces there are enough apps to segment */}
    </Tab.Navigator>
  );
}
