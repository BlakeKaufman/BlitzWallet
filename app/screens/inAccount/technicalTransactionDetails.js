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
import * as Clipboard from 'expo-clipboard';
import {formatBalanceAmount} from '../../functions';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ANDROIDSAFEAREA} from '../../constants/styles';

export default function TechnicalTransactionDetails(props) {
  console.log('Transaction Detials Page');
  const navigate = useNavigation();
  const {theme, nodeInformation} = useGlobalContextProvider();
  const selectedTX = props.route.params.selectedTX;
  const isLiquidPayment = props.route.params.isLiquidPayment;
  const isAClosedChannelTx = selectedTX.description
    ?.toLowerCase()
    ?.includes('closed channel');
  const insets = useSafeAreaInsets();

  const paymentDetails = isLiquidPayment
    ? ['Transaction Hash', 'Blinding Key', 'block Height']
    : isAClosedChannelTx
    ? ['Closing TxId', 'Funding TxId', 'Short Channel Id']
    : ['Payment Hash', 'Payment Preimage', 'Payment Id'];

  const infoElements = paymentDetails.map((item, id) => {
    const txItem = isLiquidPayment
      ? id === 0
        ? selectedTX.txhash
        : id === 1
        ? selectedTX.type === 'incoming'
          ? 'No blinding key'
          : selectedTX.inputs[0].blinding_key
        : formatBalanceAmount(selectedTX.block_height)
      : isAClosedChannelTx
      ? id === 0
        ? selectedTX.details.data.closingTxid
        : id === 1
        ? selectedTX.details.data.fundingTxid
        : selectedTX.details.data.shortChannelId
      : id === 0
      ? selectedTX.details.data.paymentHash
      : id === 1
      ? selectedTX.details.data.paymentPreimage
      : selectedTX.id;
    return (
      <View key={id}>
        <Text
          style={[
            styles.headerText,
            {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
          ]}>
          {item}
        </Text>
        <TouchableOpacity
          onPress={() => {
            copyToClipboard(txItem);
          }}>
          <Text
            style={[
              styles.descriptionText,
              {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
            ]}>
            {txItem}
          </Text>
        </TouchableOpacity>
      </View>
    );
  });

  return (
    <View
      style={[
        styles.popupContainer,
        {
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
          padding: 10,
          paddingTop: insets.top === 0 ? ANDROIDSAFEAREA : 0,
          paddingBottom: insets.bottom === 0 ? ANDROIDSAFEAREA : 0,
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
        <View style={styles.innerContainer}>{infoElements}</View>
      </SafeAreaView>
    </View>
  );

  async function copyToClipboard(address) {
    try {
      await Clipboard.setStringAsync(address);
      navigate.navigate('ClipboardCopyPopup', {didCopy: true});
      return;

      // Alert.alert('Text Copied to Clipboard');
    } catch (err) {
      navigate.navigate('ClipboardCopyPopup', {didCopy: false});
      // Alert.alert('ERROR WITH COPYING');
    }
  }
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
