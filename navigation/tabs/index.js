import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Dimensions, Image, Text, TouchableOpacity, View} from 'react-native';

import {createDrawerNavigator} from '@react-navigation/drawer';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useGlobalContextProvider} from '../../context-store/context';
import {COLORS, FONT, ICONS, SIZES} from '../../app/constants';
import {AddContactPage, GivawayHome} from '../../app/components/admin';
import {ContactsDrawer} from '../drawers';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function MyTabBar({state, descriptors, navigation}) {
  const insets = useSafeAreaInsets();
  const {theme} = useGlobalContextProvider();

  return (
    <View
      style={{
        flexDirection: 'row',
        paddingBottom: insets.bottom,
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
