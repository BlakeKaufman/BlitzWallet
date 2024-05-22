import {Text, TouchableOpacity, View} from 'react-native';
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

export default function CheckoutKeypadScreen({
  totalAmount,
  setChargeAmount,
  chargeAmount,
  setAddedItems,
}) {
  const {nodeInformation, masterInfoObject, theme} = useGlobalContextProvider();
  return (
    <View style={{flex: 1}}>
      <Text
        style={{
          fontSize: 50,
          width: '90%',
          ...CENTER,
          fontFamily: FONT.Title_Regular,
          color: theme ? COLORS.darkModeText : COLORS.lightModeText,
        }}>
        ${(Number(chargeAmount) / 100).toFixed(2)}
      </Text>
      <Text
        style={{
          fontSize: SIZES.large,
          width: '90%',
          ...CENTER,
          fontFamily: FONT.Title_Regular,
          color: theme ? COLORS.darkModeText : COLORS.lightModeText,
        }}>
        {formatBalanceAmount(
          numberConverter(
            ((Number(chargeAmount) / 100) * SATSPERBITCOIN) / 60000, //eventualt replace with nodeinformation.fiatStats.value
            'sats',
            nodeInformation,
          ),
        )}{' '}
        sats
      </Text>

      <CheckoutKeypad
        chargeAmount={chargeAmount}
        setChargeAmount={setChargeAmount}
        setAddedItems={setAddedItems}
      />

      <TouchableOpacity
        style={[
          {
            backgroundColor: COLORS.primary,
            ...CENTER,

            width: '90%',

            borderRadius: 5,
            marginTop: 10,
          },
        ]}>
        <Text
          style={{
            color: COLORS.darkModeText,
            fontSize: SIZES.medium,
            fontFamily: FONT.Title_Regular,
            textAlign: 'center',
            paddingVertical: 12,
          }}>
          Charge ${(Number(totalAmount) / 100).toFixed(2)}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
