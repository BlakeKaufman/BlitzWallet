import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {BTN, CENTER, COLORS, FONT, SIZES} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import * as Clipboard from 'expo-clipboard';
import {useNavigation} from '@react-navigation/native';

export default function ViewInProgressSwap(props) {
  const navigate = useNavigation();
  const {theme} = useGlobalContextProvider();
  const inProgressSwapInfo = props.route.params.inProgressSwapInfo;

  const inProgressSwapTxIds = inProgressSwapInfo.unconfirmedTxIds.map(
    (id, key) => {
      return (
        <View
          key={key}
          style={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
            flexWrap: 'wrap',
          }}>
          <Text style={styles.confirmingSwapTXID}>Tx id:</Text>
          <TouchableOpacity onPress={() => copyToClipboard(id)}>
            <Text
              style={{
                fontFamily: FONT.Descriptoin_Regular,
                fontSize: SIZES.medium,
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              }}>
              {id}
            </Text>
          </TouchableOpacity>
        </View>
      );
    },
  );
  return (
    <View
      style={[
        {
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
          flex: 1,
        },
      ]}>
      <SafeAreaView style={styles.confirmingSwapContainer}>
        <Text
          style={[
            styles.confirmingSwapHeader,
            {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
          ]}>
          Swap in progress
        </Text>
        <ActivityIndicator
          size="large"
          color={theme ? COLORS.darkModeText : COLORS.lightModeText}
          style={{marginVertical: 50}}
        />
        <View style={{height: 150, width: '90%', ...CENTER}}>
          <ScrollView style={{flex: 1}}>{inProgressSwapTxIds}</ScrollView>
        </View>

        <Text style={styles.swapErrorMessage}>
          Swaps become refundable after 288 blocks or around 2 days. If your
          swap has not come through before then, come back to this page and
          click the button below.
        </Text>
        <TouchableOpacity
          style={[BTN, {backgroundColor: COLORS.primary}]}
          onPress={() => navigate.navigate('RefundBitcoinTransactionPage')}>
          <Text
            style={{
              color: COLORS.darkModeText,
              fontFamily: FONT.Descriptoin_Regular,
            }}>
            Issue refund
          </Text>
        </TouchableOpacity>
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
  confirmingSwapContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmingSwapHeader: {
    fontFamily: FONT.Title_Bold,
    fontSize: SIZES.large,
    marginBottom: 20,
  },
  confirmingSwapTXID: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
    color: COLORS.primary,
    marginRight: 5,
  },
  swapErrorMessage: {
    color: COLORS.cancelRed,
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
    width: '90%',
    textAlign: 'center',
    marginTop: 20,
  },
});
