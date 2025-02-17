import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useGlobalContextProvider} from '../../context-store/context';
import {COLORS, FONT, ICONS, SHADOWS, SIZES} from '../../app/constants';
import {useNavigation} from '@react-navigation/native';
import {useEffect, useMemo, useRef} from 'react';
import {CENTER} from '../../app/constants/styles';
import {ThemeText} from '../../app/functions/CustomElements';
import {useGlobalContacts} from '../../context-store/globalContacts';
import {ContactsPage} from '../../app/components/admin';
import GetThemeColors from '../../app/hooks/themeColors';
import {useGlobalThemeContext} from '../../context-store/theme';

const Tab = createBottomTabNavigator();

function MyTabBar({state, descriptors, navigation}) {
  const insets = useSafeAreaInsets();
  const {deepLinkContent, setDeepLinkContent} = useGlobalContextProvider();
  const {theme, darkModeType} = useGlobalThemeContext();
  const {contactsMessags} = useGlobalContacts();
  const {backgroundOffset, backgroundColor} = GetThemeColors();

  const navigate = useNavigation();

  const hasUnlookedTransactions = useMemo(() => {
    return (
      Object.keys(contactsMessags).filter(contactUUID => {
        if (contactUUID === 'lastMessageTimestamp') return false;
        const hasUnlookedTx =
          contactsMessags[contactUUID]?.messages?.length &&
          contactsMessags[contactUUID].messages.filter(savedMessage => {
            return !savedMessage.message.wasSeen;
          }).length > 0;
        return hasUnlookedTx;
      }).length > 0
    );
  }, [contactsMessags]);

  const deepLinkContentData = deepLinkContent.data;
  useEffect(() => {
    if (deepLinkContent.data.length === 0) return;
    setDeepLinkContent({type: '', data: ''});
    if (deepLinkContent.type === 'Contact') {
      navigate.reset({
        index: 0, // The top-level route index
        routes: [
          {
            name: 'HomeAdmin',
            params: {screen: 'Home'},
          },
          {
            name: 'HomeAdmin',
            params: {screen: 'ContactsPageInit'},
          },
        ],
      });
    } else if (deepLinkContent.type === 'LN') {
      navigate.reset({
        index: 0,
        routes: [
          {
            name: 'HomeAdmin',
            params: {screen: 'Home'},
          },

          {
            name: 'ConfirmPaymentScreen',
            params: {btcAdress: deepLinkContent.data},
          },
        ],
      });
    }
  }, [deepLinkContentData]);

  return (
    <View>
      <View
        style={[
          {
            ...styles.tabsSeperatorBar,
            backgroundColor: backgroundOffset,
          },
        ]}
      />
      <View
        style={{
          backgroundColor: backgroundColor,
          ...styles.tabsContainer,
        }}>
        <View
          style={{
            paddingBottom: insets.bottom < 20 ? 0 : insets.bottom,
            ...styles.tabsInnerContainer,
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
                <View style={styles.iconAndLabelContainer}>
                  <Image
                    style={styles.icon}
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
                    hasUnlookedTransactions &&
                    !isFocused && (
                      <View
                        style={{
                          backgroundColor:
                            theme && darkModeType
                              ? COLORS.darkModeText
                              : COLORS.primary,
                          ...styles.hasMessageDot,
                        }}
                      />
                    )}
                </View>
                <ThemeText
                  styles={styles.labelText}
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

const styles = StyleSheet.create({
  tabsSeperatorBar: {
    width: Dimensions.get('screen').width,
    height: 50,
    position: 'absolute',
    left: 0,
    top: -3,
    zIndex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabsContainer: {
    width: '100%',
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    zIndex: 1,
  },
  tabsInnerContainer: {
    width: 300,
    paddingTop: 15,
    flexDirection: 'row',
    ...CENTER,
  },
  iconAndLabelContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 30,
    height: 30,
  },
  hasMessageDot: {
    position: 'absolute',
    top: 0,
    right: -2.5,
    width: 10,
    height: 10,
    borderRadius: 10,
  },
  labelText: {
    fontSize: SIZES.small,
    marginTop: 2,
    fontWeight: 500,
  },
});
