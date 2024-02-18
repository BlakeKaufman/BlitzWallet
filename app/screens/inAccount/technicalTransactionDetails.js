import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {BTN, CENTER, COLORS, FONT, ICONS, SIZES} from '../../constants';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../context-store/context';
const SATPERBITCOINCONSTANT = 100000000;

export default function TechnicalTransactionDetails(props) {
  console.log('Transaction Detials Page');
  const navigate = useNavigation();
  const {theme, nodeInformation} = useGlobalContextProvider();

  const selectedTX = props.route.params.selectedTX;
  console.log(selectedTX, 'TECH');

  return (
    <View
      style={[
        styles.popupContainer,
        {
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
          padding: 10,
        },
      ]}>
      <SafeAreaView style={{flex: 1}}>
        <TouchableOpacity
          onPress={() => {
            // setStatusBarStyle(theme ? 'light' : 'dark');
            navigate.goBack();
          }}>
          <Image style={styles.backButton} source={ICONS.smallArrowLeft} />
        </TouchableOpacity>
        <View style={styles.innerContainer}>
          <Text
            style={[
              styles.headerText,
              {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
            ]}>
            Payment Hash
          </Text>
          <Text
            style={[
              styles.descriptionText,
              {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
            ]}>
            {selectedTX.details.data.paymentHash}
          </Text>
          <Text
            style={[
              styles.headerText,
              {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
            ]}>
            Payment Preimage
          </Text>
          <Text
            style={[
              styles.descriptionText,
              {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
            ]}>
            {selectedTX.details.data.paymentPreimage}
          </Text>
          <Text
            style={[
              styles.headerText,
              {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
            ]}>
            Payment Id
          </Text>
          <Text
            style={[
              styles.descriptionText,
              {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
            ]}>
            {selectedTX.id}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  popupContainer: {
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
  },
  innerContainer: {
    flex: 1,
    width: '90%',
    paddingTop: 50,
    ...CENTER,
  },
  headerText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
    marginBottom: 5,
  },
  descriptionText: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
    marginBottom: 30,
  },
});
