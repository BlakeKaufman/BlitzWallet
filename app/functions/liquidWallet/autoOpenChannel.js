import createLiquidToLNSwap from './liquidToLNSwap';

export default async function autoOpenChannel(
  nodeInformation,
  liquidNodeInformation,
  masterInfoObject,
  toggleMasterInfoObject,
) {
  if (!masterInfoObject.liquidWalletSettings.regulateChannelOpen)
    return new Promise(resolve => resolve(true));

  if (
    liquidNodeInformation.userBalance <
    masterInfoObject.liquidWalletSettings.regulatedChannelOpenSize
  )
    return new Promise(resolve => resolve(true));

  const wasSwapSuccessfull = await createLiquidToLNSwap(
    masterInfoObject.liquidWalletSettings.regulatedChannelOpenSize,
    toggleMasterInfoObject,
    masterInfoObject,
  );

  return new Promise(resolve => resolve(wasSwapSuccessfull));
}
