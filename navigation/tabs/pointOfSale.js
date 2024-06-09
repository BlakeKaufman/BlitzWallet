import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Dimensions, Image, Text, TouchableOpacity, View} from 'react-native';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useGlobalContextProvider} from '../../context-store/context';
import {COLORS, FONT, ICONS, SHADOWS, SIZES} from '../../app/constants';

import {ANDROIDSAFEAREA} from '../../app/constants/styles';
import {PointOfSaleCheckout} from '../../app/components/admin/homeComponents/apps';

const Tab = createBottomTabNavigator();

function MyTabBar({state, descriptors, navigation}) {
  const insets = useSafeAreaInsets();
  const {theme} = useGlobalContextProvider();

  return (
    <View
      style={{
        flexDirection: 'row',
        marginTop: 20,
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
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                style={{
                  width: 25,
                  height: 25,
                }}
                source={
                  label === 'Checkout'
                    ? isFocused
                      ? ICONS.appstoreFilled
                      : ICONS.appstore
                    : label === 'Home'
                    ? isFocused
                      ? ICONS.walletBlueIcon
                      : ICONS.adminHomeWallet
                    : isFocused
                    ? ICONS.appstoreFilled
                    : ICONS.appstore
                }
              />
            </View>
            <Text
              style={{
                color: isFocused
                  ? COLORS.primary
                  : theme
                  ? COLORS.darkModeText
                  : COLORS.lightModeText,
                fontFamily: FONT.Title_Regular,
                fontSize: SIZES.small,
                fontWeight: 'bold',
              }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function PointOfSaleTabs() {
  return (
    <Tab.Navigator
      initialRouteName="checkout"
      screenOptions={{
        headerShown: false,
      }}
      tabBar={props => <MyTabBar {...props} />}>
      <Tab.Screen name="Checkout" component={PointOfSaleCheckout} />
      {/* <Tab.Screen name="Home" component={props.adminHome} /> */}
      {/* <Tab.Screen name="App Store" component={props.appStore} /> */}
      {/* Eventualy make this the app drawer onces there are enough apps to segment */}
    </Tab.Navigator>
  );
}
