import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ANDROIDSAFEAREA, BTN, CENTER} from '../../../../../constants/styles';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {COLORS, FONT, ICONS, SIZES} from '../../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useEffect, useRef, useState} from 'react';
import MenuPage from './menuPage';
import ResturantAppNavigator from '../../../../../../navigation/drawers/resturantApp';

export default function ResturantHomepage() {
  const insets = useSafeAreaInsets();
  const {theme} = useGlobalContextProvider();
  const navigate = useNavigation();
  const [APICallAddress, setAPICallAddress] = useState('');
  const isInitialRender = useRef(true);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [loadedMenu, setLoadedMenu] = useState(false);
  const [products, setProducts] = useState([]);

  console.log(loadedMenu, products.length === 0);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    if (!APICallAddress) return;
    retriveMenuItems(APICallAddress);
  }, [APICallAddress]);
  return (
    <View
      style={{
        flex: 1,

        backgroundColor: theme
          ? COLORS.darkModeBackground
          : COLORS.lightModeBackground,
      }}>
      {loadedMenu && products.length != 0 ? (
        <ResturantAppNavigator
          setLoadedMenu={setLoadedMenu}
          setProducts={setProducts}
          menu={products}
        />
      ) : (
        <View
          style={{
            flex: 1,
            paddingTop: insets.top < 20 ? ANDROIDSAFEAREA : insets.top,
            paddingBottom: insets.bottom < 20 ? ANDROIDSAFEAREA : insets.bottom,
          }}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigate.goBack()}>
              <Image
                style={[styles.topBarIcon, {transform: [{translateX: -6}]}]}
                source={ICONS.smallArrowLeft}
              />
            </TouchableOpacity>
            <Text
              style={[
                styles.topBarText,
                {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
              ]}>
              Home
            </Text>
          </View>
          {isLoadingMenu ? (
            <View
              style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <ActivityIndicator
                size={'large'}
                color={theme ? COLORS.darkModeText : COLORS.lightModeText}
              />
              <Text
                style={{
                  fontFamily: FONT.Title_Regular,
                  fontSize: SIZES.large,
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  marginTop: 10,
                  textAlign: 'center',
                }}>
                Loading Menu
              </Text>
            </View>
          ) : (
            <View
              style={{
                flex: 1,
              }}>
              <Text
                style={{
                  fontFamily: FONT.Title_Regular,
                  fontSize: SIZES.huge,
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  textAlign: 'center',
                  marginTop: 50,
                }}>
                Welcome
              </Text>
              <Text
                style={{
                  fontFamily: FONT.Title_Regular,
                  fontSize: SIZES.medium,
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  textAlign: 'center',
                  width: '90%',
                  ...CENTER,
                }}>
                Enjoy your dining experience with seamless and instant
                transactions with the power of Bitcoin.
              </Text>

              <View
                style={{
                  alignItems: 'center',
                  marginTop: 'auto',
                  marginBottom: 'auto',
                }}>
                <TouchableOpacity
                  onPress={() => {
                    navigate.navigate('ErrorScreen', {
                      errorMessage: 'Coming Soon...',
                    });
                  }}
                  style={[BTN, {backgroundColor: COLORS.primary}]}>
                  <Text
                    style={{
                      fontFamily: FONT.Title_Regular,
                      fontSize: SIZES.medium,
                      color: COLORS.darkModeText,
                    }}>
                    Find a resturant
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    retriveMenuItems();
                    return;
                    navigate.navigate('CameraModal', {
                      updateBitcoinAdressFunc: setAPICallAddress,
                    });
                  }}
                  style={[
                    BTN,
                    {
                      backgroundColor: theme
                        ? COLORS.darkModeBackgroundOffset
                        : COLORS.lightModeBackgroundOffset,
                      marginTop: 20,
                    },
                  ]}>
                  <Text
                    style={{
                      fontFamily: FONT.Title_Regular,
                      fontSize: SIZES.medium,
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    }}>
                    Scan a menu
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );

  async function retriveMenuItems(APICallAddress) {
    // const URL = APICallAddress;
    const URL =
      'https://odoo17.wetakelightning.com/pos-self/3?access_token=ae075cd73e354ea6&table_identifier=2750551d';
    // APICallAddress;

    try {
      setIsLoadingMenu(true);
      const request = await (await fetch(URL)).text();

      const objectString = request.match(/var odoo = ({[\s\S]*?});/)[1];

      // Parse the extracted string into an object
      const parsedObject = eval('(' + objectString + ')');

      setLoadedMenu(true);
      setIsLoadingMenu(false);
      setProducts(
        parsedObject['__session_info__']['pos_self_order_data']['products'],
      );
    } catch (err) {
      console.log(err);
    }
  }
}

const styles = StyleSheet.create({
  topBar: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...CENTER,
  },
  topBarText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.large,
    transform: [{translateX: -5}],
  },
  topBarIcon: {
    width: 30,
    height: 30,
  },
});
