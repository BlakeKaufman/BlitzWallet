import {StyleSheet, View} from 'react-native';
import {ThemeText} from '../../../../../functions/CustomElements';
import {CENTER, SIZES} from '../../../../../constants';
import {formatBalanceAmount, numberConverter} from '../../../../../functions';
import {useGlobalContextProvider} from '../../../../../../context-store/context';

export default function SendTransactionFeeInfo({
  canUseLiquid,
  canUseLightning,
  isLightningPayment,
  // fees,
  swapFee,
  liquidTxFee,
  canSendPayment,
  convertedSendAmount,
}) {
  console.log(swapFee, 'TEST');
  const {masterInfoObject, nodeInformation, minMaxLiquidSwapAmounts} =
    useGlobalContextProvider();
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
            content={'Instant with 0 Blitz fee'}
          />
        ) : (
          <ThemeText
            styles={{...styles.subHeaderText}}
            content={`Bank swap fee of ${formatBalanceAmount(
              numberConverter(
                swapFee + liquidTxFee,
                masterInfoObject.userBalanceDenomination,
                nodeInformation,
                masterInfoObject.userBalanceDenomination != 'fiat' ? 0 : 2,
              ),
            )} ${
              masterInfoObject.userBalanceDenomination != 'fiat'
                ? 'sats'
                : nodeInformation.fiatStats.coin
            }`}
          />
        )
      ) : canUseLiquid ? (
        <ThemeText
          styles={{...styles.subHeaderText}}
          content={
            canSendPayment && convertedSendAmount >= 1000
              ? `Liquid transaction fee of ${formatBalanceAmount(
                  numberConverter(
                    liquidTxFee,
                    masterInfoObject.userBalanceDenomination,
                    nodeInformation,
                    masterInfoObject.userBalanceDenomination != 'fiat' ? 0 : 2,
                  ),
                )} ${
                  masterInfoObject.userBalanceDenomination != 'fiat'
                    ? 'sats'
                    : nodeInformation.fiatStats.coin
                }`
              : ''
          }
        />
      ) : canUseLightning ? (
        <ThemeText
          styles={{...styles.subHeaderText}}
          content={`Swap fee of ${formatBalanceAmount(
            numberConverter(
              swapFee,
              masterInfoObject.userBalanceDenomination,
              nodeInformation,
              masterInfoObject.userBalanceDenomination != 'fiat' ? 0 : 2,
            ),
          )} ${
            masterInfoObject.userBalanceDenomination != 'fiat'
              ? 'sats'
              : nodeInformation.fiatStats.coin
          }`}
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
