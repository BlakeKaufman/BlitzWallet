import {StyleSheet, Text, View} from 'react-native';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {ThemeText} from '../../../../../functions/CustomElements';
import {CENTER, COLORS} from '../../../../../constants';

export default function InvoiceInfo({
  isLightningPayment,
  paymentInfo,
  btcAdress,
}) {
  const {theme} = useGlobalContextProvider();
  return (
    <View
      style={[
        styles.invoiceContainer,
        {
          backgroundColor: theme
            ? COLORS.darkModeBackgroundOffset
            : COLORS.lightModeBackgroundOffset,
        },
      ]}>
      <ThemeText
        styles={{textAlign: 'left'}}
        content={
          isLightningPayment
            ? paymentInfo?.addressInfo?.description
              ? paymentInfo?.addressInfo?.description.length > 100
                ? paymentInfo?.addressInfo?.description?.slice(0, 100) + '...'
                : paymentInfo?.addressInfo?.description
              : paymentInfo?.data?.lnAddress || 'No description'
            : btcAdress.slice(0, 100) + '...'
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  invoiceContainer: {
    width: '95%',
    padding: 8,
    borderRadius: 8,

    marginBottom: 20,
    ...CENTER,
  },
});
