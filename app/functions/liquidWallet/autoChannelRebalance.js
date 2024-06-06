import createLNToLiquidSwap from '../boltz/LNtoLiquidSwap';
import createLiquidToLNSwap from '../boltz/liquidToLNSwap';
import autoOpenChannel from './autoOpenChannel';

export default async function autoChannelRebalance(
  nodeInformation,
  liquidNodeInformation,
  masterInfoObject,
  toggleMasterInfoObject,
) {
  if (!nodeInformation.blockHeight === 0) return {didRun: false};
  if (
    false &&
    (nodeInformation.userBalance === 0 ||
      liquidNodeInformation.userBalance >
        masterInfoObject.liquidWalletSettings.regulatedChannelOpenSize)
  ) {
    console.log('REGULATING');
    //{swapInfo, privateKey, invoice, didWork}
    const autoChannelInfo = await autoOpenChannel(
      nodeInformation,
      liquidNodeInformation,
      masterInfoObject,
      toggleMasterInfoObject,
    );

    console.log(autoChannelInfo, 'AUTO OPEN CHANNEL');
    if (!autoChannelInfo?.swapInfo)
      return new Promise(resolve =>
        resolve({
          didRun: true,
          didWork: false,
        }),
      );

    return new Promise(resolve =>
      resolve({
        swapInfo: autoChannelInfo.swapInfo,
        privateKey: autoChannelInfo.privateKey,
        invoice: autoChannelInfo.privateKey,
        type: 'liquid-ln',
        for: 'autoChannelOpen',
        didWork: autoChannelInfo.didWork,
        didRun: true,
      }),
    );
  }
  if (!masterInfoObject.liquidWalletSettings.autoChannelRebalance)
    return {didRun: false};

  const lightningBalance = nodeInformation.userBalance;
  const lightningInboundLiquidity = nodeInformation.inboundLiquidityMsat / 1000;
  const targetPercentage =
    masterInfoObject.liquidWalletSettings.autoChannelRebalancePercantage;
  const liquidBalance = liquidNodeInformation.userBalance;

  const totalLightningAmount = lightningBalance + lightningInboundLiquidity;

  const currentChannelBalance = Math.round(
    (lightningBalance / totalLightningAmount) * 100,
  );

  const offFromTargetPercentage = Math.abs(
    currentChannelBalance - targetPercentage,
  );

  const satAmount = Math.round(
    totalLightningAmount * (offFromTargetPercentage / 100),
  );

  console.log(
    satAmount, //5,449,778
    lightningBalance, //37,920.261
    lightningInboundLiquidity, //64,905.739
    targetPercentage, //90
    totalLightningAmount, //102,826
    currentChannelBalance, //37
    offFromTargetPercentage, //53
    'SAT AMOUNT', //SAT AMOUNT
  );

  if (liquidBalance.userBalance - 500 < satAmount) return {didRun: false};
  if (satAmount < totalLightningAmount * 0.05) {
    //gives a 5% buffer
    return {
      didRun: false,
      type: '',
      for: 'autoChannelRebalance',
      didWork: null,
      swapInfo: {},
      privateKey: '',
      invoice: '',
    };
  }

  if (currentChannelBalance > targetPercentage) {
    const response = await createLNToLiquidSwap(satAmount);

    if (response) {
      const [
        data,
        pairSwapInfo,
        publicKey,
        privateKey,
        keys,
        preimage,
        liquidAddress,
      ] = response;

      return {
        didRun: true,
        type: 'ln-liquid',
        for: 'autoChannelRebalance',
        didWork: true,
        swapInfo: data,
        privateKey: privateKey,
        invoice: liquidAddress,
        preimage: preimage,
      };
    } else {
      return {
        didRun: true,
        type: 'ln-liquid',
        for: 'autoChannelRebalance',
        didWork: false,
        swapInfo: {},
        privateKey: '',
        invoice: '',
      };
    }
  } else {
    try {
      console.log('SWAP FROM LIQUID');
      const invoice = await receivePayment({
        amountMsat: satAmount * 1000,
        description: 'Auto Channel Open',
      });
      const {swapInfo, privateKey} = await createLiquidToLNSwap(
        invoice.lnInvoice.bolt11,
      );
      const refundJSON = {
        id: swapInfo.id,
        asset: 'L-BTC',
        version: 3,
        privateKey: privateKey,
        blindingKey: swapInfo.blindingKey,
        claimPublicKey: swapInfo.claimPublicKey,
        timeoutBlockHeight: swapInfo.timeoutBlockHeight,
        swapTree: swapInfo.swapTree,
      };

      toggleMasterInfoObject({
        liquidSwaps: [...masterInfoObject.liquidSwaps].concat(refundJSON),
      });

      return new Promise(resolve =>
        resolve({
          swapInfo,
          privateKey,
          invoice: invoice.lnInvoice.bolt11,
          didWork: true,
          type: 'liquid-ln',
          for: 'autoChannelRebalance',
          didRun: true,
        }),
      );
    } catch (err) {
      return new Promise(resolve =>
        resolve({
          swapInfo: {},
          privateKey: '',
          invoice: '',
          didWork: false,
          type: 'liquid-ln',
          for: 'autoChannelRebalance',
          didRun: true,
        }),
      );
    }
  }
}
