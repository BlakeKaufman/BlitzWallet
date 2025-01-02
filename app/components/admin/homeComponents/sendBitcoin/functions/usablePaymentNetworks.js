import {InputTypeVariant} from '@breeztech/react-native-breez-sdk';
import {
  LIGHTNINGAMOUNTBUFFER,
  LIQUIDAMOUTBUFFER,
} from '../../../../../constants/math';

export default function usablePaymentNetwork({
  liquidNodeInformation,
  nodeInformation,
  eCashBalance,
  masterInfoObject,
  convertedSendAmount,
  liquidTxFee,
  swapFee,
  minMaxLiquidSwapAmounts,
  isLiquidPayment,
  isLightningPayment,
  paymentInfo,
  lightningFee,
}) {
  const canUseLiquid = isLiquidPayment
    ? liquidNodeInformation.userBalance >=
        convertedSendAmount + liquidTxFee + LIQUIDAMOUTBUFFER &&
      convertedSendAmount >= minMaxLiquidSwapAmounts.min
    : isLightningPayment
    ? liquidNodeInformation.userBalance >=
        convertedSendAmount + liquidTxFee + swapFee + LIQUIDAMOUTBUFFER &&
      convertedSendAmount >= minMaxLiquidSwapAmounts.min
    : liquidNodeInformation.userBalance >= convertedSendAmount &&
      convertedSendAmount > paymentInfo?.data?.limits?.minSat + 100 &&
      convertedSendAmount < paymentInfo?.data?.limits?.maxSat;

  const canUseEcash =
    nodeInformation.userBalance === 0 &&
    masterInfoObject.enabledEcash &&
    eCashBalance >= convertedSendAmount + 2 &&
    (!paymentInfo.canEditPayment ||
      paymentInfo?.type === InputTypeVariant.LN_URL_PAY);

  const canUseLightning = isLightningPayment
    ? canUseEcash ||
      nodeInformation.userBalance >=
        convertedSendAmount + convertedSendAmount * 0.01 + LIGHTNINGAMOUNTBUFFER
    : isLiquidPayment
    ? convertedSendAmount >= minMaxLiquidSwapAmounts.min &&
      nodeInformation.userBalance >=
        convertedSendAmount +
          swapFee +
          LIGHTNINGAMOUNTBUFFER +
          convertedSendAmount * 0.01
    : nodeInformation.userBalance >= convertedSendAmount &&
      convertedSendAmount > paymentInfo?.data?.limits?.minSat + 100 &&
      convertedSendAmount < paymentInfo?.data?.limits?.maxSat;

  return {canUseEcash, canUseLiquid, canUseLightning};
}
