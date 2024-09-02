import {StyleSheet, View} from 'react-native';
import {ThemeText} from '../../../../../functions/CustomElements';
import {formatBalanceAmount, numberConverter} from '../../../../../functions';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import FormattedSatText from '../../../../../functions/CustomElements/satTextDisplay';

export default function TransactionWarningText({
  canSendPayment,
  isUsingLiquidWithZeroInvoice,
  canUseLiquid,
  canUseLightning,
  isLightningPayment,
  sendingAmount,
  // fees,
  // boltzSwapInfo,
}) {
  const {nodeInformation, masterInfoObject, minMaxLiquidSwapAmounts} =
    useGlobalContextProvider();
  // LN
  //  Lightning with normal lightning
  //  Lighting with zero invoice
  //  Lightning with LNURL pay
  //  Lightning

  console.log(minMaxLiquidSwapAmounts, !sendingAmount);
  const textItem = (() => {
    if (!canSendPayment && sendingAmount)
      return (
        <ThemeText
          styles={{includeFontPadding: false}}
          content={'Cannot send Payment'}
        />
      );

    if (!sendingAmount)
      return (
        <ThemeText
          styles={{includeFontPadding: false}}
          content={'Please enter a send amount'}
        />
      );

    if (isLightningPayment) {
      if (canUseLightning) {
        return <ThemeText content={''} />;
      } else if (isUsingLiquidWithZeroInvoice) {
        return (
          <ThemeText
            styles={{includeFontPadding: false, textAlign: 'center'}}
            content={
              'Zero Amount Invoices are not allowed when paying from the bank or ecash'
            }
          />
        );
      } else if (canUseLiquid) {
        if (
          sendingAmount < minMaxLiquidSwapAmounts.min ||
          sendingAmount > minMaxLiquidSwapAmounts.max
        )
          return (
            <FormattedSatText
              frontText={`Minimum swap amount `}
              neverHideBalance={true}
              iconHeight={15}
              iconWidth={15}
              styles={{includeFontPadding: false}}
              formattedBalance={formatBalanceAmount(
                numberConverter(
                  minMaxLiquidSwapAmounts.min,
                  masterInfoObject.userBalanceDenomination,
                  nodeInformation,
                  masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
                ),
              )}
            />
          );
      } else return <ThemeText content={'Cannot send Payment'} />;
    } else {
      console.log(canUseLiquid, canUseLightning);
      if (canUseLiquid || canUseLightning) {
        if (
          sendingAmount >=
          (canUseLiquid
            ? 1000
            : minMaxLiquidSwapAmounts.submarineSwapStats?.limits?.minimal ||
              1000)
        ) {
          return <ThemeText content={''} />;
        }
        return (
          <FormattedSatText
            frontText={`Minimum swap amount `}
            neverHideBalance={true}
            iconHeight={15}
            iconWidth={15}
            styles={{includeFontPadding: false}}
            formattedBalance={formatBalanceAmount(
              numberConverter(
                canUseLiquid
                  ? 1000
                  : minMaxLiquidSwapAmounts.submarineSwapStats?.limits
                      ?.minimal || 1000,
                masterInfoObject.userBalanceDenomination,
                nodeInformation,
                masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
              ),
            )}
          />
        );
      } else
        return (
          <ThemeText
            styles={{includeFontPadding: false}}
            content={'Cannot send Payment'}
          />
        );
    }
  })();
  console.log(textItem);
  return (
    <View style={styles.container}>
      {textItem}
      {/* <ThemeText
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
                      minMaxLiquidSwapAmounts.min,
                      masterInfoObject.userBalanceDenomination,
                      nodeInformation,
                      masterInfoObject.userBalanceDenomination === 'fiat'
                        ? 2
                        : 0,
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
                    masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
                  ),
                )} ${
                  masterInfoObject.userBalanceDenomination != 'fiat'
                    ? 'sats'
                    : nodeInformation.fiatStats.coin
                }`
              : canUseLightning
              ? `Minimum swap amount ${formatBalanceAmount(
                  numberConverter(
                    minMaxLiquidSwapAmounts.min,
                    masterInfoObject.userBalanceDenomination,
                    nodeInformation,
                    masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
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
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 'auto',
    marginBottom: 10,
    alignItems: 'center',
  },
  warningText: {
    textAlign: 'center',
  },
});
