import {StyleSheet, View} from 'react-native';
import {ThemeText} from '../../../../../functions/CustomElements';

export default function TransactionWarningText({
  canSendPayment,
  isUsingLiquidWithZeroInvoice,
  canUseLiquid,
  canUseLightning,
}) {
  return (
    <View style={styles.container}>
      <ThemeText styles={{...styles.warningText}} content={'TESTING'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 'auto',
    marginBottom: 10,
  },
  warningText: {
    textAlign: 'center',
  },
});
