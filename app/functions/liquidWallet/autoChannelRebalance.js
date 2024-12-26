import {nodeInfo, receivePayment} from '@breeztech/react-native-breez-sdk';
import autoOpenChannel from './autoOpenChannel';
import {encriptMessage} from '../messaging/encodingAndDecodingMessages';
import {getLocalStorageItem, setLocalStorageItem} from '../localStorage';
import {breezLiquidReceivePaymentWrapper} from '../breezLiquid';
import {getInfo} from '@breeztech/react-native-breez-sdk-liquid';
import {LIQUIDAMOUTBUFFER} from '../../constants/math';

export default async function autoChannelRebalance({
  nodeInformation,
  liquidNodeInformation,
  masterInfoObject,
  currentMint,
  eCashBalance,
}) {
  const node_information = nodeInformation;
  const liquid_information = liquidNodeInformation;
  console.log(
    liquid_information.userBalance,
    'LIQUID BLAAN C',
    nodeInformation.userBalance,
  );

  if (node_information.blockHeight === 0) return {didRun: false};

  if (eCashBalance > 5000) {
    console.log('RUNNIN IN ECASH AUTO CHANNEL REBALANCE');

    try {
      const response = await breezLiquidReceivePaymentWrapper({
        sendAmount: eCashBalance - 1000,
        paymentType: 'lightning',
        description: 'Auto Channel Rebalance',
      });
      if (!response) return {didRun: false};
      const {destination, receiveFeesSat} = response;
      return new Promise(resolve =>
        resolve({
          type: 'reverseSwap',
          for: 'autoChannelRebalance',
          didRun: true,
          isEcash: true,
          invoice: destination,
        }),
      );
    } catch (err) {
      console.log(err);
      return {didRun: false};
    }
    // const response = await createLNToLiquidSwap(
    //   eCashBalance - 1000,
    //   'Auto Channel Rebalance',
    // );

    // if (response) {
    //   const [
    //     data,
    //     pairSwapInfo,
    //     publicKey,
    //     privateKey,
    //     keys,
    //     preimage,
    //     liquidAddress,
    //   ] = response;

    // console.log(response, 'SWAP RESPONSE');
    // return new Promise(resolve =>
    //   resolve({
    //     type: 'reverseSwap',
    //     for: 'autoChannelRebalance',
    //     didRun: true,
    //     isEcash: true,
    //     swapAmountSat: Number(eCashBalance - 1000),
    //   }),
    // );
    // }
  }

  if (!masterInfoObject.liquidWalletSettings.isLightningEnabled)
    return {didRun: false};

  if (
    node_information.userBalance == 0 ||
    liquid_information.userBalance >
      masterInfoObject.liquidWalletSettings.regulatedChannelOpenSize +
        LIQUIDAMOUTBUFFER
  ) {
    console.log('REGULATING');
    //{swapInfo, privateKey, invoice, didWork}
    const autoChannelInfo = await autoOpenChannel({
      masterInfoObject,
    });

    console.log(autoChannelInfo, 'AUTO OPEN CHANNEL');

    if (!autoChannelInfo) {
      return {didRun: false};
    }
    // if (!autoChannelInfo?.swapInfo)
    //   return new Promise(resolve =>
    //     resolve({
    //       didRun: true,
    //       didWork: false,
    //     }),
    //   );

    return new Promise(resolve => resolve(autoChannelInfo));
  }
  if (!masterInfoObject.liquidWalletSettings.autoChannelRebalance)
    return {didRun: false};

  const lightningBalance = node_information.userBalance;
  const lightningInboundLiquidity =
    node_information.inboundLiquidityMsat / 1000;
  const targetPercentage =
    masterInfoObject.liquidWalletSettings.autoChannelRebalancePercantage;
  const liquidBalance = liquid_information.userBalance;

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

  if (
    offFromTargetSatAmount <
    Number(masterInfoObject.liquidWalletSettings.minAutoSwapAmount)
  ) {
    // only allows auto swaps that are greater than the minimum liimit set run
    return {
      didRun: false,
    };
  }

  if (currentChannelBalancePercentage > targetPercentage) {
    // const response = await createLNToLiquidSwap(
    //   Number(offFromTargetSatAmount),
    //   'Auto Channel Rebalance',
    // );

    // if (response) {
    // const [
    //   data,
    //   pairSwapInfo,
    //   publicKey,
    //   privateKey,
    //   keys,
    //   preimage,
    //   liquidAddress,
    // ] = response;
    const response = await breezLiquidReceivePaymentWrapper({
      sendAmount: Number(offFromTargetSatAmount),
      paymentType: 'lightning',
      description: 'Auto Channel Rebalance',
    });
    if (!response) return {didRun: false};
    const {destination, receiveFeesSat} = response;
    return new Promise(resolve =>
      resolve({
        type: 'reverseSwap',
        for: 'autoChannelRebalance',
        didRun: true,
        isEcash: false,
        invoice: destination,
      }),
    );

    // return new Promise(resolve =>
    //   resolve({
    //     type: 'reverseSwap',
    //     for: 'autoChannelRebalance',
    //     didRun: true,
    //     isEcash: false,
    //     swapAmountSat: Number(offFromTargetSatAmount),
    //   }),
    // );
    // return {
    //   didRun: true,
    //   type: 'ln-liquid',
    //   for: 'autoChannelRebalance',
    //   didWork: true,
    //   swapInfo: data,
    //   privateKey: privateKey,
    //   invoice: liquidAddress,
    //   preimage: preimage,
    // };
    // }
    // else {
    //   return {
    //     didRun: true,
    //     type: 'ln-liquid',
    //     for: 'autoChannelRebalance',
    //     didWork: false,
    //     swapInfo: {},
    //     privateKey: '',
    //     invoice: '',
    //   };
    // }
  } else {
    if (liquidBalance < 1500) return {didRun: false};
    try {
      const actualSendAmount =
        offFromTargetSatAmount > liquidBalance
          ? liquidBalance - 200
          : offFromTargetSatAmount - 200;
      // const invoice = await receivePayment({
      //   amountMsat: actualSendAmount * 1000,
      //   description: 'Auto Channel Rebalance',
      // });

      // const {swapInfo, privateKey} = await createLiquidToLNSwap(
      //   invoice.lnInvoice.bolt11,
      // );
      const invoice = await receivePayment({
        amountMsat: actualSendAmount * 1000,
        description: 'Auto Channel Rebalance',
      });
      return new Promise(resolve =>
        resolve({
          type: 'submarineSwap',
          for: 'autoChannelRebalance',
          didRun: true,
          isEcash: false,
          invoice: invoice,
        }),
      );

      // return new Promise(resolve =>
      //   resolve({
      //     swapInfo,
      //     privateKey,
      //     invoice: invoice.lnInvoice.bolt11,
      //     didWork: true,
      //     type: 'liquid-ln',
      //     for: 'autoChannelRebalance',
      //     didRun: true,
      //   }),
      // );
    } catch (err) {
      return new Promise(resolve =>
        resolve({
          swapInfo: {},
          privateKey: '',
          invoice: '',
          didRun: false,
          type: '',
          for: '',
        }),
      );
    }
  }
}
