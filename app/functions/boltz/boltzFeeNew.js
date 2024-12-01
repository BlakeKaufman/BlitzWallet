import {BLITZ_RECEIVE_FEE, BLITZ_SEND_FEE} from '../../constants';

export function calculateBoltzFeeNew(swapAmountSats, swapType, swapInfo) {
  const fee =
    swapType === 'liquid-ln'
      ? Math.round(
          swapInfo.fees.minerFees +
            swapAmountSats *
              ((swapInfo.fees.percentage + BLITZ_SEND_FEE) / 100),
        )
      : Math.round(
          swapInfo.fees.minerFees.claim +
            swapInfo.fees.minerFees.lockup +
            swapAmountSats *
              ((swapInfo.fees.percentage + BLITZ_RECEIVE_FEE) / 100),
        );

  return fee;
}
