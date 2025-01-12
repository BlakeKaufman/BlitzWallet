import {receivePayment} from '@breeztech/react-native-breez-sdk';
import autoOpenChannel from './autoOpenChannel';
import {breezLiquidReceivePaymentWrapper} from '../breezLiquid';
import {LIQUIDAMOUTBUFFER} from '../../constants/math';

export default async function autoChannelRebalance({
  nodeInformation,
  liquidNodeInformation,
  masterInfoObject,
  eCashBalance,
}) {
  const node_information = nodeInformation;
  const liquid_information = liquidNodeInformation;
  console.log(
    liquid_information.userBalance,
    'LIQUID BLANCE',
    nodeInformation.userBalance,
  );

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
  }

  if (
    !masterInfoObject.liquidWalletSettings.isLightningEnabled ||
    !node_information.userBalance
  )
    return {didRun: false};

  if (
    node_information.userBalance == 0 ||
    liquid_information.userBalance >
      masterInfoObject.liquidWalletSettings.regulatedChannelOpenSize +
        LIQUIDAMOUTBUFFER
  ) {
    console.log('REGULATING');
    const autoChannelInfo = await autoOpenChannel({
      masterInfoObject,
    });

    console.log(autoChannelInfo, 'AUTO OPEN CHANNEL');

    if (!autoChannelInfo) {
      return {didRun: false};
    }

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

  if (currentChannelBalancePercentage > targetPercentage) {
    const actualSendAmount =
      offFromTargetSatAmount > lightningBalance
        ? lightningBalance - 200
        : offFromTargetSatAmount - 200;

    if (
      actualSendAmount <
      Number(masterInfoObject.liquidWalletSettings.minAutoSwapAmount)
    ) {
      // only allows auto swaps that are greater than the minimum liimit set run
      return {
        didRun: false,
      };
    }
    const response = await breezLiquidReceivePaymentWrapper({
      sendAmount: Number(actualSendAmount),
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
  } else {
    if (liquidBalance < 1500) return {didRun: false};
    try {
      const actualSendAmount =
        offFromTargetSatAmount > liquidBalance
          ? liquidBalance - 200
          : offFromTargetSatAmount - 200;

      if (
        actualSendAmount <
        Number(masterInfoObject.liquidWalletSettings.minAutoSwapAmount)
      ) {
        // only allows auto swaps that are greater than the minimum liimit set run
        return {
          didRun: false,
        };
      }
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
