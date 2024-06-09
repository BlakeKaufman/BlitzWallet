import {StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';
import {CENTER} from '../../../../../constants/styles';
import {COLORS, FONT, ICONS, SIZES} from '../../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useState} from 'react';
import CheckoutPageSelector from './checkoutComponents/pageSelector';
import CheckoutKeypadScreen from './checkoutComponents/keypadScreen';
import LibraryScreen from './checkoutComponents/libraryScreen';
import {ThemeText} from '../../../../../functions/CustomElements';

export default function PointOfSaleCheckout() {
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

  return (
    <>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigate.goBack()}>
          <Image
            style={[styles.topBarIcon, {transform: [{translateX: -6}]}]}
            source={ICONS.smallArrowLeft}
          />
        </TouchableOpacity>

        <ThemeText content={'Blitz Wallet'} styles={{...styles.topBarText}} />
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
        <LibraryScreen
          setAddedItems={setAddedItems}
          setPageTypeAttributes={setPageTypeAttributes}
        />
      )}
    </>
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
    fontSize: SIZES.large,
    transform: [{translateX: -5}],
  },
  topBarIcon: {
    width: 30,
    height: 30,
  },
});
