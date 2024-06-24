import {getBoltzSwapPairInformation} from './boltzSwapInfo';

export async function calculateBoltzFee(swapAmountSats, swapType) {
  const pairSwapInfo = await getBoltzSwapPairInformation(swapType);
  if (!pairSwapInfo) return new Promise(resolve => resolve(false));

  const fee =
    swapType === 'liquid-ln'
      ? Math.round(
          pairSwapInfo.fees.minerFees +
            swapAmountSats * (pairSwapInfo.fees.percentage / 100),
        )
      : Math.round(
          pairSwapInfo.fees.minerFees.claim +
            pairSwapInfo.fees.minerFees.lockup +
            swapAmountSats * (pairSwapInfo.fees.percentage / 100),
        );

  return new Promise(resolve => resolve([fee, pairSwapInfo]));
}
