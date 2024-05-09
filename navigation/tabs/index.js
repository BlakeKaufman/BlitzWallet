import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Dimensions, Image, Text, TouchableOpacity, View} from 'react-native';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useGlobalContextProvider} from '../../context-store/context';
import {COLORS, FONT, ICONS, SIZES} from '../../app/constants';

import {ContactsDrawer} from '../drawers';
import {getPublicKey} from 'nostr-tools';
import {decryptMessage} from '../../app/functions/messaging/encodingAndDecodingMessages';

const Tab = createBottomTabNavigator();

function MyTabBar({state, descriptors, navigation}) {
  const insets = useSafeAreaInsets();
  const {theme, masterInfoObject, contactsPrivateKey} =
    useGlobalContextProvider();

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

  return (
    <View
      style={{
        flexDirection: 'row',
        paddingBottom: insets.bottom === 0 ? 10 : insets.bottom,
        paddingTop: 10,

        backgroundColor: theme
          ? COLORS.darkModeBackgroundOffset
          : COLORS.lightModeBackgroundOffset,
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
                backgroundColor: isFocused
                  ? COLORS.lightModeBackground
                  : 'transparent',
                borderRadius: 15,
              }}>
              <Image
                style={{
                  width: 20,
                  height: 20,
                }}
                source={
                  label === 'Contacts'
                    ? ICONS.contactsIcon
                    : label === 'Home'
                    ? ICONS.adminHomeWallet
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
                      right: 0,
                      width: 10,
                      height: 10,
                      borderRadius: 10,
                      backgroundColor: COLORS.primary,
                    }}></View>
                )}
            </View>
            <Text
              style={{
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                fontFamily: FONT.Title_Regular,
                fontSize: SIZES.small,
              }}>
              {label === 'Home' ? 'Wallet' : label}
            </Text>
          </TouchableOpacity>
        );
      })}
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
