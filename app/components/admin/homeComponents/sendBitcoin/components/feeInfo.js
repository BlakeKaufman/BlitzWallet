import {StyleSheet, View} from 'react-native';
import {ThemeText} from '../../../../../functions/CustomElements';
import {CENTER, SIZES} from '../../../../../constants';
import {formatBalanceAmount, numberConverter} from '../../../../../functions';
import {useGlobalContextProvider} from '../../../../../../context-store/context';

export default function SendTransactionFeeInfo({
  canUseLiquid,
  canUseLightning,
  isLightningPayment,
  fees,
}) {
  const {masterInfoObject, nodeInformation} = useGlobalContextProvider();
  //options
  // LN -> LN which is: instant with 0 Blitz fee
  //LN -> Liquid which is: bank swap fee of
  //Liquid -> Liquid: liquid transaction fee of
  //LIquid -> LN: bank swap fee of
  return (
    <View>
      <ThemeText styles={{...styles.headerText}} content={'Fee and Speed'} />
      {isLightningPayment ? (
        canUseLightning ? (
          <ThemeText
            styles={{...styles.subHeaderText}}
            content={'instant with 0 Blitz fee'}
          />
        ) : (
          <ThemeText
            styles={{...styles.subHeaderText}}
            content={`bank swap fee of ${formatBalanceAmount(
              numberConverter(
                fees.boltzFee + fees.liquidFees,
                masterInfoObject.userBalanceDenomination,
                nodeInformation,
                masterInfoObject.userBalanceDenomination != 'fiat' ? 0 : 2,
              ),
            )}`}
          />
        )
      ) : canUseLiquid ? (
        <ThemeText
          styles={{...styles.subHeaderText}}
          content={`liquid transaction fee of ${formatBalanceAmount(
            numberConverter(
              fees.liquidFees,
              masterInfoObject.userBalanceDenomination,
              nodeInformation,
              masterInfoObject.userBalanceDenomination != 'fiat' ? 0 : 2,
            ),
          )}`}
        />
      ) : canUseLightning ? (
        <ThemeText
          styles={{...styles.subHeaderText}}
          content={`bank swap fee of ${formatBalanceAmount(
            numberConverter(
              fees.boltzFee + fees.liquidFees,
              masterInfoObject.userBalanceDenomination,
              nodeInformation,
              masterInfoObject.userBalanceDenomination != 'fiat' ? 0 : 2,
            ),
          )}`}
        />
      ) : (
        ''
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerText: {
    fontSize: SIZES.xLarge,

    ...CENTER,
  },
  subHeaderText: {
    ...CENTER,
  },
});
