import {StyleSheet, View, TouchableOpacity, Image} from 'react-native';
import {CENTER, ICONS} from '../../constants';
import {useNavigation} from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import {copyToClipboard, formatBalanceAmount} from '../../functions';
import {GlobalThemeView, ThemeText} from '../../functions/CustomElements';
import {WINDOWWIDTH} from '../../constants/theme';
import handleBackPress from '../../hooks/handleBackPress';
import {useEffect} from 'react';

export default function TechnicalTransactionDetails(props) {
  console.log('Transaction Detials Page');
  const navigate = useNavigation();

  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

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
            copyToClipboard(txItem, navigate);
          }}>
          <ThemeText content={txItem} styles={{...styles.descriptionText}} />
        </TouchableOpacity>
      </View>
    );
  });

  return (
    <GlobalThemeView>
      <View style={{flex: 1, width: WINDOWWIDTH, ...CENTER}}>
        <TouchableOpacity
          onPress={() => {
            navigate.goBack();
          }}>
          <Image style={styles.backButton} source={ICONS.smallArrowLeft} />
        </TouchableOpacity>
        <View style={styles.innerContainer}>{infoElements}</View>
      </View>
    </GlobalThemeView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 40,
    height: 40,
  },
  innerContainer: {
    flex: 1,
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
