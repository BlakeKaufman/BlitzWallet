import {
  receiveOnchain,
  receivePayment,
  openChannelFee,
} from '@breeztech/react-native-breez-sdk';
import {SATSPERBITCOIN} from '../../constants';
import {createLiquidSwap, getSwapPairInformation} from '../LBTC';

async function generateUnifiedAddress(
  nodeInformation,
  userBalanceDenomination,
  amount,
  description,
  isGeneratingAddressFunc,
) {
  try {
    isGeneratingAddressFunc(true);

    const bitcoinAddress = await generateBitcoinAddress(
      nodeInformation,
      userBalanceDenomination,
      amount,
      description,
    );

    const lightningAddress = await generateLightningAddress(
      nodeInformation,
      userBalanceDenomination,
      amount,
      description,
      undefined,
    );

    if (!bitcoinAddress.receiveAddress || !lightningAddress.receiveAddress)
      return new Promise(resolve => {
        resolve({
          receiveAddress: null,
          errorMessage: lightningAddress.errorMessage,
        });
      });

    const unifiedAddress = `bitcoin:${bitcoinAddress.receiveAddress}?amount=${
      userBalanceDenomination === 'fiat'
        ? (amount / nodeInformation.fiatStats.value).toFixed(8)
        : (amount / SATSPERBITCOIN).toFixed(8)
    }&lightning=${lightningAddress.receiveAddress}`;

    isGeneratingAddressFunc(false);
    return new Promise(resolve => {
      resolve({
        receiveAddress: unifiedAddress,
        errorMessage: lightningAddress.errorMessage,
        swapInfo: {
          minMax: bitcoinAddress.swapInfo.minMax,
        },
      });
    });
  } catch (err) {
    console.log(err);
  }
}

async function generateBitcoinAddress(
  nodeInformation,
  userBalanceDenomination,
  amount,
  description,
  isGeneratingAddressFunc,
) {
  try {
    const requestedSatAmount =
      userBalanceDenomination === 'fiat'
        ? Math.floor(
            (amount / nodeInformation.fiatStats.value) * SATSPERBITCOIN,
          )
        : amount;

    isGeneratingAddressFunc && isGeneratingAddressFunc(true);
    const swapInfo = await receiveOnchain({
      description: description,
      amount: requestedSatAmount,
    });

    isGeneratingAddressFunc && isGeneratingAddressFunc(false);

    return new Promise(resolve => {
      resolve({
        receiveAddress: `bitcoin:${swapInfo.bitcoinAddress}?amount=${
          userBalanceDenomination === 'fiat'
            ? (amount / nodeInformation.fiatStats.value).toFixed(8)
            : (amount / SATSPERBITCOIN).toFixed(8)
        }`,
        errorMessage: {
          type: 'none',
          text: 'none',
        },
        swapInfo: {
          minMax: {
            min: swapInfo.minAllowedDeposit,
            max: swapInfo.maxAllowedDeposit,
          },
        },
      });
    });
  } catch (err) {
    return new Promise(resolve => {
      resolve(false);
    });
  }
}

async function generateLightningAddress(
  nodeInformation,
  userBalanceDenomination,
  amount,
  description,
  isGeneratingAddressFunc,
) {
  try {
    const requestedSatAmount =
      userBalanceDenomination === 'fiat'
        ? Math.floor(
            (amount / nodeInformation.fiatStats.value) * SATSPERBITCOIN,
          )
        : amount;

    console.log(requestedSatAmount);

    isGeneratingAddressFunc && isGeneratingAddressFunc(true);
    const {errorMessage} = await checkRecevingCapacity(
      nodeInformation,
      requestedSatAmount,
      userBalanceDenomination,
    );
    console.log(errorMessage);
    if (errorMessage.type === 'stop') {
      return new Promise(resolve => {
        resolve({
          receiveAddress: null,
          errorMessage: errorMessage,
        });
      });
    }
    const invoice = await receivePayment({
      amountMsat: requestedSatAmount * 1000,
      description: description,
    });

    if (invoice) {
      isGeneratingAddressFunc && isGeneratingAddressFunc(false);
      return new Promise(resolve => {
        resolve({
          receiveAddress: invoice.lnInvoice.bolt11,
          errorMessage: errorMessage,
        });
      });
    }
  } catch (err) {
    return new Promise(resolve => {
      resolve(false);
    });
  }
}

async function generateLiquidAddress(
  nodeInformation,
  userBalanceDenomination,
  amount,
  paymentDescription,
  isGeneratingAddressFunc,
  setSendingAmount,
) {
  try {
    isGeneratingAddressFunc && isGeneratingAddressFunc(true);
    const requestedSatAmount =
      userBalanceDenomination === 'fiat'
        ? Math.floor(
            (amount / nodeInformation.fiatStats.value) * SATSPERBITCOIN,
          )
        : amount;

    const pairSwapInfo = await getSwapPairInformation();
    if (!pairSwapInfo) new Error('no swap info');
    const adjustedSatAmount = Math.round(
      requestedSatAmount -
        pairSwapInfo.fees.minerFees -
        requestedSatAmount * (pairSwapInfo.fees.percentage / 100),
    );

    if (adjustedSatAmount < pairSwapInfo.limits.minimal * 2.5) {
      setSendingAmount(pairSwapInfo.limits.minimal * 2.5);
      return;
    }

    if (requestedSatAmount > pairSwapInfo.limits.maximalZeroConf) {
      return new Promise(resolve => {
        resolve({
          receiveAddress: null,
          errorMessage: {
            type: 'stop',
            text: 'Amount is greater than max swap limit',
          },
        });
      });
    }

    const {errorMessage} = await checkRecevingCapacity(
      nodeInformation,
      requestedSatAmount,
      userBalanceDenomination,
    );

    if (errorMessage.type === 'stop') {
      return new Promise(resolve => {
        resolve({
          receiveAddress: null,
          errorMessage: errorMessage,
        });
      });
    }

    console.log(adjustedSatAmount);
    const invoice = await receivePayment({
      amountMsat: adjustedSatAmount * 1000,
      description: 'Liquid Swap',
    });

    if (invoice) {
      const [swapInfo, privateKey] = await createLiquidSwap(
        invoice.lnInvoice.bolt11,
        pairSwapInfo.hash,
      );
      isGeneratingAddressFunc && isGeneratingAddressFunc(false);
      return new Promise(resolve => {
        resolve({
          receiveAddress: swapInfo.bip21,
          errorMessage: errorMessage,
          swapInfo: {
            minMax: {
              min: pairSwapInfo.limits.minimal * 2.5,
              max: pairSwapInfo.limits.maximalZeroConf,
            },
            pairSwapInfo: {
              id: swapInfo.id,
              asset: 'L-BTC',
              version: 3,
              privateKey: privateKey,
              blindingKey: swapInfo.blindingKey,
              claimPublicKey: swapInfo.claimPublicKey,
              timeoutBlockHeight: swapInfo.timeoutBlockHeight,
              swapTree: swapInfo.swapTree,
              adjustedSatAmount: adjustedSatAmount,
            },
          },
        });
      });
    }
  } catch (err) {
    console.log(err);
    return new Promise(resolve => {
      resolve(false);
    });
  }
}

async function checkRecevingCapacity(
  nodeInformation,
  satAmount,
  userBalanceDenomination,
) {
  if (satAmount === 0) {
    return new Promise(resolve => {
      resolve({
        errorMessage: {
          type: 'stop',
          text: 'Must set invoice for more than 0 sats',
        },
      });
    });
  }

  const channelFee = await openChannelFee({
    amountMsat: satAmount * 1000,
  });

  if (
    channelFee.feeMsat != 0 &&
    channelFee.feeMsat + 500 * 1000 > satAmount * 1000
  ) {
    return new Promise(resolve => {
      resolve({
        errorMessage: {
          type: 'stop',
          text: `It costs ${Math.ceil(
            userBalanceDenomination === 'fiat'
              ? (
                  (channelFee.feeMsat / 1000 + 500) *
                  (nodeInformation.fiatStats.value / SATSPERBITCOIN)
                ).toFixed(2)
              : channelFee.feeMsat / 1000 + 500,
          ).toLocaleString()} ${
            userBalanceDenomination === 'fiat'
              ? nodeInformation.fiatStats.coin
              : 'sat'
          } to open a channel, but only ${Math.ceil(
            userBalanceDenomination === 'fiat'
              ? (
                  satAmount *
                  (nodeInformation.fiatStats.value / SATSPERBITCOIN)
                ).toFixed(2)
              : satAmount,
          ).toLocaleString()} ${
            userBalanceDenomination === 'fiat'
              ? nodeInformation.fiatStats.coin
              : 'sat'
          } was requested.`,
        },
      });
    });
  }

  if (nodeInformation.inboundLiquidityMsat < satAmount * 1000) {
    return new Promise(resolve => {
      resolve({
        errorMessage: {
          type: 'warning',
          text: `Amount is above your receiving capacity. Sending this payment will incur a ${Math.ceil(
            userBalanceDenomination === 'fiat'
              ? (
                  (channelFee.feeMsat / 1000 + 500) *
                  (nodeInformation.fiatStats.value / SATSPERBITCOIN)
                ).toFixed(2)
              : channelFee.feeMsat / 1000 + 500,
          ).toLocaleString()} ${
            userBalanceDenomination === 'fiat'
              ? nodeInformation.fiatStats.coin
              : 'sat'
          } fee`,
        },
      });
    });
  }

  return new Promise(resolve => {
    resolve({
      errorMessage: {
        type: 'none',
        text: 'none',
      },
    });
  });
}

export {
  generateUnifiedAddress,
  generateLightningAddress,
  generateBitcoinAddress,
  generateLiquidAddress,
};
