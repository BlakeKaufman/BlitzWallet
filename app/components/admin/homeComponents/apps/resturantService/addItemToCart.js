import {
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  BTN,
  CENTER,
  COLORS,
  FONT,
  SHADOWS,
  SIZES,
} from '../../../../../constants';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {useNavigation} from '@react-navigation/native';
import {
  getLocalStorageItem,
  setLocalStorageItem,
} from '../../../../../functions';

export default function AddResturantItemToCart({
  route: {
    params: {selectedItem, setCartItems},
  },
}) {
  const {theme} = useGlobalContextProvider();
  const navigate = useNavigation();

  return (
    <TouchableWithoutFeedback onPress={navigate.goBack}>
      <View
        style={{
          backgroundColor: COLORS.opaicityGray,
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View
          style={{
            width: '80%',
            backgroundColor: theme
              ? COLORS.darkModeBackgroundOffset
              : COLORS.lightModeBackgroundOffset,
            borderRadius: 8,
          }}>
          <Text
            style={{
              textAlign: 'center',
              marginVertical: 10,
              fontWeight: 'bold',
              fontSize: SIZES.large,
            }}>
            {selectedItem.name}
          </Text>

          <TouchableOpacity
            onPress={() =>
              addItemToCart({selectedItem, setCartItems, navigate})
            }
            style={{
              backgroundColor: COLORS.primary,
              ...CENTER,

              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 4,
              marginBottom: 10,
            }}>
            <Text
              style={{
                color: COLORS.darkModeText,
                fontSize: SIZES.medium,
                fontFamily: FONT.Title_Regular,
                textAlign: 'center',
              }}>
              Add to cart
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

async function addItemToCart({selectedItem, setCartItems, navigate}) {
  // Eventualy put selected sauces + extras here
  setCartItems(prev => {
    const newCartItems = prev.concat([selectedItem]);
    setLocalStorageItem(
      'resturantCartItems',
      JSON.stringify({dateAdded: new Date(), data: newCartItems}),
    );
    return newCartItems;
  });
  navigate.goBack();
}
