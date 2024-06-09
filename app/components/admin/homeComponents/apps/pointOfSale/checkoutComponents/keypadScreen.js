import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {
  BTN,
  CENTER,
  COLORS,
  FONT,
  SATSPERBITCOIN,
  SIZES,
} from '../../../../../../constants';
import {
  formatBalanceAmount,
  numberConverter,
} from '../../../../../../functions';
import {useGlobalContextProvider} from '../../../../../../../context-store/context';
import CheckoutKeypad from './checkoutKeypad';
import {useNavigation} from '@react-navigation/native';
import {ThemeText} from '../../../../../../functions/CustomElements';

export default function CheckoutKeypadScreen({
  totalAmount,
  setChargeAmount,
  chargeAmount,
  setAddedItems,
}) {
  const navigate = useNavigation();
  const {nodeInformation, masterInfoObject, theme} = useGlobalContextProvider();
  return (
    <View style={{flex: 1}}>
      <ThemeText
        styles={{...styles.POSFiatBalance}}
        content={`$${(Number(chargeAmount) / 100).toFixed(2)}`}
      />
      <ThemeText
        content={`${formatBalanceAmount(
          numberConverter(
            ((Number(chargeAmount) / 100) * SATSPERBITCOIN) /
              nodeInformation.fiatStats.value, //eventualt replace with nodeinformation.fiatStats.value
            'sats',
            nodeInformation,
          ),
        )} sats`}
        styles={{...styles.POSSatBalance}}
      />

      <CheckoutKeypad
        chargeAmount={chargeAmount}
        setChargeAmount={setChargeAmount}
        setAddedItems={setAddedItems}
      />

      <TouchableOpacity
        onPress={() => {
          if (totalAmount == 0) return;
          navigate.navigate('CheckoutPaymentScreen', {
            sendingAmount: totalAmount,
            setAddedItems: setAddedItems,
            setChargeAmount: setChargeAmount,
          });
        }}
        style={[
          styles.buttonContainer,
          {
            opacity: totalAmount == 0 ? 0.2 : 1,
          },
        ]}>
        <ThemeText
          styles={{...styles.buttonText}}
          content={`Charge ${(Number(totalAmount) / 100).toFixed(2)}`}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  POSFiatBalance: {
    fontSize: 50,
    width: '90%',
    ...CENTER,
  },
  POSSatBalance: {
    fontSize: SIZES.large,
    width: '90%',
    ...CENTER,
  },

  buttonContainer: {
    backgroundColor: COLORS.primary,
    ...CENTER,

    width: '90%',

    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: COLORS.darkModeText,

    textAlign: 'center',
    paddingVertical: 12,
  },
});
