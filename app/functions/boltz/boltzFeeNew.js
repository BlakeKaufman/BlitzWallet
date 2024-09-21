export function calculateBoltzFeeNew(swapAmountSats, swapType, swapInfo) {
  const fee =
    swapType === 'liquid-ln'
      ? Math.round(
          swapInfo.fees.minerFees +
            swapAmountSats * (swapInfo.fees.percentage / 100),
        )
      : Math.round(
          swapInfo.fees.minerFees.claim +
            swapInfo.fees.minerFees.lockup +
            swapAmountSats * (swapInfo.fees.percentage / 100),
        );

  return fee;
}
