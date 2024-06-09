import {StyleSheet, View, TouchableOpacity, Image} from 'react-native';
import {CENTER, ICONS} from '../../constants';
import {useNavigation} from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import {formatBalanceAmount} from '../../functions';
import {GlobalThemeView, ThemeText} from '../../functions/CustomElements';

export default function TechnicalTransactionDetails(props) {
  console.log('Transaction Detials Page');
  const navigate = useNavigation();

  const selectedTX = props.route.params.selectedTX;
  const isLiquidPayment = props.route.params.isLiquidPayment;
  const isFailedPayment = props.route.params.isFailedPayment;
  const isAClosedChannelTx = selectedTX.description
    ?.toLowerCase()
    ?.includes('closed channel');

  const paymentDetails = isFailedPayment
    ? ['Payment Hash', 'Payment Secret', 'Node ID']
    : isLiquidPayment
    ? ['Transaction Hash', 'Blinding Key', 'block Height']
    : isAClosedChannelTx
    ? ['Closing TxId', 'Funding TxId', 'Short Channel Id']
    : ['Payment Hash', 'Payment Preimage', 'Payment Id'];

  const infoElements = paymentDetails.map((item, id) => {
    const txItem = isFailedPayment
      ? id === 0
        ? selectedTX.invoice.paymentHash
        : id === 1
        ? JSON.stringify(selectedTX.invoice.paymentSecret)
        : selectedTX.nodeId
      : isLiquidPayment
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
        <ThemeText content={item} styles={{...styles.headerText}} />
        <TouchableOpacity
          onPress={() => {
            copyToClipboard(txItem);
          }}>
          <ThemeText content={txItem} styles={{...styles.descriptionText}} />
        </TouchableOpacity>
      </View>
    );
  });

  return (
    <GlobalThemeView
      styles={{
        padding: 10,
      }}>
      <TouchableOpacity
        onPress={() => {
          navigate.goBack();
        }}>
        <Image style={styles.backButton} source={ICONS.smallArrowLeft} />
      </TouchableOpacity>
      <View style={styles.innerContainer}>{infoElements}</View>
    </GlobalThemeView>
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
    marginBottom: 5,
  },
  descriptionText: {
    marginBottom: 30,
  },
});
