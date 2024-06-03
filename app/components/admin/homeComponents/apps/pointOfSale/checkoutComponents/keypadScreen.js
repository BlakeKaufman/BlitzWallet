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
import {useNavigation} from '@react-navigation/native';

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
            ((Number(chargeAmount) / 100) * SATSPERBITCOIN) /
              nodeInformation.fiatStats.value, //eventualt replace with nodeinformation.fiatStats.value
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
        onPress={() => {
          if (totalAmount == 0) return;

          console.log('TEST');

          navigate.navigate('CheckoutPaymentScreen', {
            sendingAmount: totalAmount,
            setAddedItems: setAddedItems,
            setChargeAmount: setChargeAmount,
          });
        }}
        style={[
          {
            backgroundColor: COLORS.primary,
            ...CENTER,

            opacity: totalAmount == 0 ? 0.2 : 1,
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
