import {StyleSheet, View} from 'react-native';
import {ThemeText} from '../../../../../functions/CustomElements';
import {formatBalanceAmount, numberConverter} from '../../../../../functions';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import FormattedSatText from '../../../../../functions/CustomElements/satTextDisplay';
import {InputTypeVariant} from '@breeztech/react-native-breez-sdk';
import {useNodeContext} from '../../../../../../context-store/nodeContext';
import {DUST_LIMIT_FOR_LBTC_CHAIN_PAYMENTS} from '../../../../../constants/math';
import {useAppStatus} from '../../../../../../context-store/appStatus';

export default function TransactionWarningText({
  canSendPayment,
  isUsingLiquidWithZeroInvoice,
  canUseLiquid,
  canUseLightning,
  isLightningPayment,
  sendingAmount,
  paymentInfo,
  isCalculatingFees,
  // fees,
  // boltzSwapInfo,
}) {
  const {masterInfoObject} = useGlobalContextProvider();
  const {nodeInformation} = useNodeContext();
  const {minMaxLiquidSwapAmounts} = useAppStatus();
  // LN
  //  Lightning with normal lightning
  //  Lighting with zero invoice
  //  Lightning with LNURL pay
  //  Lightning

  console.log(
    canSendPayment,
    sendingAmount,
    isLightningPayment,
    canUseLightning,
  );
  const textItem = (() => {
    if (isCalculatingFees) {
      return (
        <ThemeText
          styles={{includeFontPadding: false}}
          content={'Calculating fees'}
        />
      );
    }
    if (!canSendPayment && sendingAmount) {
      if (
        sendingAmount < minMaxLiquidSwapAmounts.min ||
        sendingAmount > minMaxLiquidSwapAmounts.max
      ) {
        return (
          <FormattedSatText
            frontText={`Minimum send amount `}
            neverHideBalance={true}
            styles={{includeFontPadding: false}}
            balance={minMaxLiquidSwapAmounts.min}
          />
        );
      } else
        return (
          <ThemeText
            styles={{includeFontPadding: false}}
            content={'Not enough funds to cover fees'}
          />
        );
    }

    if (!sendingAmount)
      return (
        <ThemeText
          styles={{includeFontPadding: false}}
          content={'Please enter a send amount'}
        />
      );

    if (
      isLightningPayment ||
      paymentInfo?.type === InputTypeVariant.LN_URL_PAY
    ) {
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
              frontText={`Minimum send amount `}
              neverHideBalance={true}
              styles={{includeFontPadding: false}}
              balance={minMaxLiquidSwapAmounts.min}
            />
          );
      } else return <ThemeText content={'Cannot send Payment'} />;
    } else {
      if (canUseLiquid || canUseLightning) {
        if (
          sendingAmount >=
          (canUseLiquid ? 1000 : minMaxLiquidSwapAmounts.min || 1000)
        ) {
          return <ThemeText content={''} />;
        }
        return (
          <FormattedSatText
            frontText={`Minimum send amount `}
            neverHideBalance={true}
            styles={{includeFontPadding: false}}
            balance={
              canUseLiquid
                ? DUST_LIMIT_FOR_LBTC_CHAIN_PAYMENTS
                : minMaxLiquidSwapAmounts.min || 1000
            }
            formattedBalance={formatBalanceAmount(
              numberConverter(
                canUseLiquid ? 1000 : minMaxLiquidSwapAmounts.min || 1000,
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

  return <View style={styles.container}>{textItem}</View>;
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
