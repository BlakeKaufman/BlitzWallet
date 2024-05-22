import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ANDROIDSAFEAREA, CENTER} from '../../../../../constants/styles';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {COLORS, FONT, ICONS, SIZES} from '../../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useEffect, useRef, useState} from 'react';
import {formatBalanceAmount, numberConverter} from '../../../../../functions';

import CheckoutPageSelector from './checkoutComponents/pageSelector';
import CheckoutKeypadScreen from './checkoutComponents/keypadScreen';
import LibraryScreen from './checkoutComponents/libraryScreen';

export default function PointOfSaleCheckout() {
  const {theme, masterInfoObject, nodeInformation} = useGlobalContextProvider();
  const insets = useSafeAreaInsets();
  const navigate = useNavigation();

  const [pageTypeAttributes, setPageTypeAttributes] = useState({
    keypad: {isSelected: true, layoutAttributes: {}},
    library: {isSelected: false, layoutAttributes: {}},
  });

  const [chargeAmount, setChargeAmount] = useState('0'); //in fiat cents
  const [addedItems, setAddedItems] = useState([]);

  const itemCount = addedItems.length;
  const totalAmount = addedItems.reduce((a, b) => {
    return a + Number(b.amount);
  }, 0);

  console.log(totalAmount);

  const [{key: selectedPage, value: selectedPageValues}] =
    (function pageTypeAttributes(pageTypeAttributes) {
      const entries = Object.entries(pageTypeAttributes);
      return entries
        .filter(([key, value]) => value.isSelected)
        .map(([key, value]) => ({key, value}));
    })(pageTypeAttributes);

  const textTheme = theme ? COLORS.darkModeText : COLORS.lightModeText;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme
          ? COLORS.darkModeBackground
          : COLORS.lightModeBackground,
        paddingTop: insets.top < 20 ? ANDROIDSAFEAREA : insets.top,
        paddingBottom: 10,
      }}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigate.goBack()}>
          <Image
            style={[styles.topBarIcon, {transform: [{translateX: -6}]}]}
            source={ICONS.smallArrowLeft}
          />
        </TouchableOpacity>

        <Text style={[styles.topBarText, {color: textTheme}]}>
          Blitz Wallet
        </Text>
      </View>

      <CheckoutPageSelector
        selectedPageValues={selectedPageValues}
        selectedPage={selectedPage}
        pageTypeAttributes={pageTypeAttributes}
        setPageTypeAttributes={setPageTypeAttributes}
      />

      {selectedPage === 'keypad' ? (
        <CheckoutKeypadScreen
          setChargeAmount={setChargeAmount}
          totalAmount={totalAmount}
          chargeAmount={chargeAmount}
          setAddedItems={setAddedItems}
        />
      ) : (
        <LibraryScreen setAddedItems={setAddedItems} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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

  screenType: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Regular,
    marginRight: 15,
  },
  screenTypeTrack: {
    width: '100%',
    height: 4,
    position: 'absolute',
    bottom: 0,
    borderRadius: 10,
  },
  screenTypeSelector: {
    width: 50,
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
});
