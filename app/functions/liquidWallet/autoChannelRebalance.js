import autoOpenChannel from './autoOpenChannel';

export default async function autoChannelRebalance(
  nodeInformation,
  liquidNodeInformation,
  masterInfoObject,
  toggleMasterInfoObject,
) {
  if (nodeInformation.userBalance === 0) {
    const didSucceed = await autoOpenChannel(
      nodeInformation,
      liquidNodeInformation,
      masterInfoObject,
      toggleMasterInfoObject,
    );

    return new Promise(resolve => resolve(didSucceed));
  }
  if (!masterInfoObject.liquidWalletSettings.autoChannelRebalance) return;

  const lightningBalance = nodeInformation.userBalance;
  const lightningInboundLiquidity = nodeInformation.inboundLiquidityMsat / 1000;
  const targetPercentage =
    masterInfoObject.liquidWalletSettings.autoChannelRebalancePercantage;
  const liquidBalance = liquidNodeInformation.userBalance;

  const totalLightningAmount = lightningBalance + lightningInboundLiquidity;

  const currentChannelBalance = Math.round(
    (lightningBalance / totalLightningAmount) * 100,
  );

  console.log(
    lightningBalance,
    lightningInboundLiquidity,
    targetPercentage,
    liquidBalance,
    totalLightningAmount,
    currentChannelBalance,
  );

  if (
    currentChannelBalance &&
    currentChannelBalance - 5 < targetPercentage &&
    currentChannelBalance + 5 > targetPercentage
  ) {
    console.log('SWAP FROM LIGHTNING');
  } else {
    console.log('SWAP FROM LIQUID');
  }
}
