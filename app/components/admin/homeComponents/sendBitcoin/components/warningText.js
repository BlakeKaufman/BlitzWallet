import {StyleSheet, View} from 'react-native';
import {ThemeText} from '../../../../../functions/CustomElements';
import {formatBalanceAmount, numberConverter} from '../../../../../functions';
import {useGlobalContextProvider} from '../../../../../../context-store/context';

export default function TransactionWarningText({
  canSendPayment,
  isUsingLiquidWithZeroInvoice,
  canUseLiquid,
  canUseLightning,
  isLightningPayment,
  sendingAmount,
  fees,
  boltzSwapInfo,
}) {
  const {nodeInformation, masterInfoObject} = useGlobalContextProvider();
  // LN
  //  Lightning with normal lightning
  //  Lighting with zero invoice
  //  Lightning with LNURL pay
  //  Lightning
  return (
    <View style={styles.container}>
      <ThemeText
        styles={{...styles.warningText}}
        content={
          canSendPayment
            ? isLightningPayment
              ? canUseLightning
                ? ''
                : isUsingLiquidWithZeroInvoice
                ? 'Zero Amount Invoices are not allowed when paying from the bank'
                : canUseLiquid
                ? `Minimum bank swap ${formatBalanceAmount(
                    numberConverter(
                      boltzSwapInfo.minimal + fees.boltzFee + fees.liquidFees,
                      masterInfoObject.userBalanceDenomination,
                      nodeInformation,
                    ),
                  )} ${
                    masterInfoObject.userBalanceDenomination != 'fiat'
                      ? 'sats'
                      : nodeInformation.fiatStats.coin
                  }`
                : 'Cannot send payment'
              : canUseLiquid
              ? `Minium send amount from bank is ${formatBalanceAmount(
                  numberConverter(
                    1000,
                    masterInfoObject.userBalanceDenomination,
                    nodeInformation,
                  ),
                )} ${
                  masterInfoObject.userBalanceDenomination != 'fiat'
                    ? 'sats'
                    : nodeInformation.fiatStats.coin
                }`
              : canUseLightning
              ? `Minimum swap amount ${formatBalanceAmount(
                  numberConverter(
                    (boltzSwapInfo.minimal + fees.boltzFee) * 1.25,
                    masterInfoObject.userBalanceDenomination,
                    nodeInformation,
                  ),
                )} ${
                  masterInfoObject.userBalanceDenomination != 'fiat'
                    ? 'sats'
                    : nodeInformation.fiatStats.coin
                }`
              : 'Cannot send payment'
            : sendingAmount === 0
            ? 'Please enter a send amount'
            : 'Cannot send payment'
        }
      />
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
