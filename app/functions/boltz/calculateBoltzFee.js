import {getBoltzSwapPairInformation} from './boltzSwapInfo';

export async function calculateBoltzFee(swapAmountSats, swapType) {
  const pairSwapInfo = await getBoltzSwapPairInformation(swapType);
  if (!pairSwapInfo) return new Promise(resolve => resolve(false));

  const fee = Math.round(
    pairSwapInfo.fees.minerFees +
      swapAmountSats * (pairSwapInfo.fees.percentage / 100),
  );

  return new Promise(resolve => resolve([fee, pairSwapInfo]));
}
