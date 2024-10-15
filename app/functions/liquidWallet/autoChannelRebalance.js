import {receivePayment} from '@breeztech/react-native-breez-sdk';
import createLNToLiquidSwap from '../boltz/LNtoLiquidSwap';
import createLiquidToLNSwap from '../boltz/liquidToLNSwap';
import autoOpenChannel from './autoOpenChannel';
import {encriptMessage} from '../messaging/encodingAndDecodingMessages';
import {getLocalStorageItem, setLocalStorageItem} from '../localStorage';

export default async function autoChannelRebalance({
  nodeInformation,
  liquidNodeInformation,
  masterInfoObject,
  currentMint,
  eCashBalance,
}) {
  if (nodeInformation.blockHeight === 0) return {didRun: false};

  if (eCashBalance > 5000) {
    console.log('RUNNIN IN ECASH AUTO CHANNEL REBALANCE');
    const response = await createLNToLiquidSwap(
      eCashBalance - 1000,
      'Auto Channel Rebalance',
    );

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

      console.log(response, 'SWAP RESPONSE');
      return new Promise(resolve =>
        resolve({
          didRun: true,
          type: 'ln-liquid',
          for: 'autoChannelRebalance',
          didWork: true,
          swapInfo: data,
          privateKey: privateKey,
          invoice: liquidAddress,
          preimage: preimage,
          isEcash: true,
        }),
      );
    }
  }

  if (!masterInfoObject.liquidWalletSettings.isLightningEnabled)
    return {didRun: false};

  if (
    nodeInformation.userBalance === 0 ||
    liquidNodeInformation.userBalance >
      masterInfoObject.liquidWalletSettings.regulatedChannelOpenSize
  ) {
    console.log('REGULATING');
    //{swapInfo, privateKey, invoice, didWork}
    const autoChannelInfo = await autoOpenChannel({
      liquidNodeInformation,
      masterInfoObject,
    });

    console.log(autoChannelInfo, 'AUTO OPEN CHANNEL');

    if (!autoChannelInfo) {
      return {didRun: false};
    }
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
        invoice: autoChannelInfo.invoice,
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

  const totalLightningAmount =
    lightningBalance + lightningInboundLiquidity - 2000;

  const currentChannelBalancePercentage = Math.round(
    (lightningBalance / totalLightningAmount) * 100,
  );

  const offFromTargetPercentage = Math.abs(
    currentChannelBalancePercentage - targetPercentage,
  );

  const offFromTargetSatAmount = Math.round(
    totalLightningAmount * (offFromTargetPercentage / 100),
  );

  console.log(
    offFromTargetSatAmount, //5,449,778
    lightningBalance, //37,920.261
    lightningInboundLiquidity, //64,905.739
    targetPercentage, //90
    totalLightningAmount, //102,826
    currentChannelBalancePercentage, //37
    offFromTargetPercentage, //53
    'SAT AMOUNT', //SAT AMOUNT
    liquidBalance,
  );

  if (offFromTargetSatAmount < totalLightningAmount * 0.05) {
    //gives a 5% buffer
    return {
      didRun: false,
    };
  }

  if (currentChannelBalancePercentage > targetPercentage) {
    const response = await createLNToLiquidSwap(
      offFromTargetSatAmount,
      'Auto Channel Rebalance',
    );

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
    if (liquidBalance < 5000) return {didRun: false};
    try {
      const actualSendAmount =
        offFromTargetSatAmount > liquidBalance
          ? liquidBalance - 1000
          : offFromTargetSatAmount;
      console.log('SWAP FROM LIQUID');
      const invoice = await receivePayment({
        amountMsat: actualSendAmount * 1000,
        description: 'Auto Channel Rebalance',
      });

      console.log(invoice);
      const {swapInfo, privateKey} = await createLiquidToLNSwap(
        invoice.lnInvoice.bolt11,
      );
      // const refundJSON = {
      //   id: swapInfo.id,
      //   asset: 'L-BTC',
      //   version: 3,
      //   privateKey: privateKey,
      //   blindingKey: swapInfo.blindingKey,
      //   claimPublicKey: swapInfo.claimPublicKey,
      //   timeoutBlockHeight: swapInfo.timeoutBlockHeight,
      //   swapTree: swapInfo.swapTree,
      // };

      // const savedSwaps =
      //   JSON.parse(await getLocalStorageItem('savedLiquidSwaps')) || [];

      // const encripted = encriptMessage(
      //   contactsPrivateKey,
      //   masterInfoObject.contacts.myProfile.uuid,
      //   JSON.stringify(refundJSON),
      // );

      // setLocalStorageItem(
      //   'savedLiquidSwaps',
      //   JSON.stringify([...savedSwaps, refundJSON]),
      // );

      // console.log(encripted);
      // toggleMasterInfoObject({
      //   liquidSwaps: [...masterInfoObject.liquidSwaps].concat(encripted),
      // });

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
