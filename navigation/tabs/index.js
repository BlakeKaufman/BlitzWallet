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

import {ContactsDrawer} from '../drawers';
import {getPublicKey} from 'nostr-tools';
import {decryptMessage} from '../../app/functions/messaging/encodingAndDecodingMessages';
import {useNavigation} from '@react-navigation/native';
import {useEffect} from 'react';
import {ANDROIDSAFEAREA, CENTER} from '../../app/constants/styles';
import Icon from '../../app/functions/CustomElements/Icon';
import {ThemeText} from '../../app/functions/CustomElements';

const Tab = createBottomTabNavigator();

function MyTabBar({state, descriptors, navigation}) {
  const insets = useSafeAreaInsets();
  const {
    theme,
    masterInfoObject,
    contactsPrivateKey,
    deepLinkContent,
    setDeepLinkContent,
  } = useGlobalContextProvider();
  const navigate = useNavigation();
  const publicKey = getPublicKey(contactsPrivateKey);

  const addedContacts =
    typeof masterInfoObject.contacts.addedContacts === 'string'
      ? JSON.parse(
          decryptMessage(
            contactsPrivateKey,
            publicKey,
            masterInfoObject.contacts.addedContacts,
          ),
        )
      : [];

  const hasUnlookedTransactions = [...addedContacts].filter(
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
    <View
      style={{
        width: '100%',

        borderTopColor: theme
          ? COLORS.darkModeBackgroundOffset
          : COLORS.lightModeBackgroundOffset,

        borderTopRightRadius: 8,
        borderTopLeftRadius: 8,
      }}>
      <View
        style={[
          {
            width: useWindowDimensions().width * 0.99,
            backgroundColor: theme
              ? COLORS.darkModeBackgroundOffset
              : COLORS.lightModeBackgroundOffset,
            left: (useWindowDimensions().width * 0.01) / 2,
            height: 3,
            position: 'absolute',
            top: 0,
            zIndex: -1,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
          },
        ]}></View>
      <View
        style={{
          width: 300,
          // flex: 1,
          paddingBottom: insets.bottom < 20 ? ANDROIDSAFEAREA : insets.bottom,
          paddingTop: 10,
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
                  // backgroundColor: isFocused
                  //   ? COLORS.lightModeBackground
                  //   : 'transparent',
                  // borderRadius: 15,
                }}>
                {/* {label === 'Contacts' ? (
                  <Icon
                    name={'mail'}
                    width={35}
                    height={35}
                    isActive={isFocused}
                  />
                ) : label === 'Home' ? (
                  <Icon
                    width={35}
                    height={35}
                    name={'wallet'}
                    isActive={isFocused}
                  />
                ) : (
                  <Icon
                    name={'apps'}
                    width={35}
                    height={35}
                    isActive={isFocused}
                  />
                )} */}
                {/* <Icon name={'mail'} isActive={true} /> */}
                <Image
                  style={{
                    width: 30,
                    height: 30,
                  }}
                  source={
                    label === 'Contacts'
                      ? isFocused
                        ? ICONS.contactsSelected
                        : ICONS.contacts
                      : label === 'Home'
                      ? isFocused
                        ? ICONS.walletBlueIcon
                        : ICONS.adminHomeWallet
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
                        backgroundColor: COLORS.primary,
                      }}></View>
                  )}
              </View>
              {/* <ThemeText
                styles={{fontSize: SIZES.small, marginTop: 2}}
                content={
                  label === 'Home'
                    ? 'Wallet'
                    : label === 'App Store'
                    ? 'Store'
                    : label
                }
              /> */}
              {/* <Text
                style={{
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  fontFamily: FONT.Title_Regular,
                  fontSize: SIZES.small,
                }}>
                {label === 'Home'
                  ? 'Wallet'
                  : label === 'App Store'
                  ? 'Store'
                  : label}
              </Text> */}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export function MyTabs(props) {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}
      tabBar={props => <MyTabBar {...props} />}>
      <Tab.Screen name="ContactsPageInit" component={ContactsDrawer} />
      <Tab.Screen name="Home" component={props.adminHome} />
      <Tab.Screen name="App Store" component={props.appStore} />
      {/* Eventualy make this the app drawer onces there are enough apps to segment */}
    </Tab.Navigator>
  );
}
