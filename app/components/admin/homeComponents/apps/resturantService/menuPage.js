import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {
  CENTER,
  COLORS,
  FONT,
  ICONS,
  SATSPERBITCOIN,
  SIZES,
} from '../../../../../constants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ANDROIDSAFEAREA} from '../../../../../constants/styles';
import {formatBalanceAmount, numberConverter} from '../../../../../functions';

export default function MenuPage({
  route: {
    params: {menuItems, setLoadedMenu, setProducts, categName},
  },
  navigation,
}) {
  const {theme} = useGlobalContextProvider();
  const insets = useSafeAreaInsets();
  console.log(navigation);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme
          ? COLORS.darkModeBackground
          : COLORS.lightModeBackground,
        paddingTop: insets.top < 20 ? ANDROIDSAFEAREA : insets.top,
        paddingBottom: insets.bottom < 20 ? ANDROIDSAFEAREA : insets.bottom,
      }}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={{marginRight: 'auto'}}
          onPress={() => {
            setLoadedMenu(false);
            // could save products here to optimize for user expirnce. If a uesr clicks out the products are saved if they scan the same menu the second time.
            setProducts([]);
          }}>
          <Image
            style={[styles.topBarIcon, {transform: [{translateX: -6}]}]}
            source={ICONS.smallArrowLeft}
          />
        </TouchableOpacity>
        <Text
          style={[
            styles.topBarText,
            {
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              marginRight: 10,
            },
          ]}>
          Menu
        </Text>
        <TouchableOpacity
          onPress={() => {
            navigation.openDrawer();
          }}>
          <Image style={{width: 20, height: 20}} source={ICONS.drawerList} />
        </TouchableOpacity>
      </View>
      <Text
        style={{
          fontFamily: FONT.Title_Regular,
          fontSize: SIZES.xxLarge,
          color: theme ? COLORS.darkModeText : COLORS.lightModeText,

          textAlign: 'center',
        }}>
        {categName}
      </Text>

      <FlatList
        contentContainerStyle={{width: '90%', ...CENTER}}
        renderItem={({item}) => <MenuListItem {...item} />}
        data={menuItems}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function MenuListItem({name, price_info, attributes}) {
  const {theme, masterInfoObject, nodeInformation} = useGlobalContextProvider();
  console.log(attributes);
  return (
    <View
      style={{
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
      }}>
      <Text
        style={{
          fontFamily: FONT.Title_Regular,
          fontSize: SIZES.medium,
          color: theme ? COLORS.darkModeText : COLORS.lightModeText,
        }}>
        {name}
      </Text>

      <View style={{flexDirection: 'row'}}>
        <Text
          style={{
            fontFamily: FONT.Title_Regular,
            fontSize: SIZES.medium,
            color: theme ? COLORS.darkModeText : COLORS.lightModeText,
            marginRight: 10,
          }}>
          {formatBalanceAmount(
            numberConverter(
              (SATSPERBITCOIN / nodeInformation.fiatStats.value) *
                price_info.display_price_default,
              masterInfoObject.userBalanceDenomination,
              nodeInformation,
            ),
          )}
        </Text>
        <Text
          style={{
            fontFamily: FONT.Title_Regular,
            fontSize: SIZES.medium,
            color: theme ? COLORS.darkModeText : COLORS.lightModeText,
          }}>
          {masterInfoObject.userBalanceDenomination != 'fiat'
            ? 'sats'
            : nodeInformation.fiatStats.coin}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',

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
