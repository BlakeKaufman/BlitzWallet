import {
  receiveOnchain,
  receivePayment,
  openChannelFee,
} from '@breeztech/react-native-breez-sdk';
import {SATSPERBITCOIN} from '../../constants';
// import {createLiquidSwap, getSwapPairInformation} from '../LBTC';

import {createLiquidReceiveAddress, getLiquidFees} from '../liquidWallet';
import {getBoltzSwapPairInformation} from '../boltz/createKeys';
import createLiquidToLNSwap from '../boltz/liquidToLNSwap';
import createLNToLiquidSwap from '../boltz/LNtoLiquidSwap';

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

    const unifiedAddress = `${bitcoinAddress.receiveAddress}&lightning=${lightningAddress.receiveAddress}`;

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
    console.log('IS IN FUNCTION');
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
      resolve({
        receiveAddress: null,
        errorMessage: {
          type: 'stop',
          text: 'Too low of a payment to perform swap',
        },
      });
    });
  }
}

async function generateLightningAddress(
  nodeInformation,
  userBalanceDenomination,
  amount,
  description,
  isGeneratingAddressFunc,
  masterInfoObject,
  setSendingAmount,
) {
  try {
    const requestedSatAmount =
      userBalanceDenomination === 'fiat'
        ? Math.floor(
            (amount / nodeInformation.fiatStats.value) * SATSPERBITCOIN,
          )
        : amount;

    isGeneratingAddressFunc && isGeneratingAddressFunc(true);
    const {errorMessage} = await checkRecevingCapacity(
      nodeInformation,
      requestedSatAmount,
      userBalanceDenomination,
    );

    if (errorMessage.type === 'stop') {
      if (masterInfoObject.liquidWalletSettings.regulateChannelOpen) {
        const response = await getLNToLiquidSwapAddress(
          requestedSatAmount,
          setSendingAmount,
          isGeneratingAddressFunc,
          requestedSatAmount >= 1500 && requestedSatAmount <= 25000000
            ? 'Adding to bank'
            : 'Minimum request amount is 1 500 sats, and maximum request amount is 25 000 000',
        );

        return new Promise(resolve => {
          resolve(response);
        });
      } else {
        return new Promise(resolve => {
          resolve({
            receiveAddress: null,
            errorMessage: errorMessage,
          });
        });
      }
    } else if (errorMessage.type === 'warning') {
      if (masterInfoObject.liquidWalletSettings.regulateChannelOpen) {
        const response = await getLNToLiquidSwapAddress(
          requestedSatAmount,
          setSendingAmount,
          isGeneratingAddressFunc,
          requestedSatAmount >= 1500 && requestedSatAmount <= 25000000
            ? 'Adding to bank'
            : 'Minimum request amount is 1 500 sats, and maximum request amount is 25 000 000',
        );

        return new Promise(resolve => {
          resolve(response);
        });
      } else {
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
      }
    } else {
      const invoice = await receivePayment({
        amountMsat: requestedSatAmount * 1000,
        description: description,
      });

      if (invoice) {
        isGeneratingAddressFunc && isGeneratingAddressFunc(false);
        return new Promise(resolve => {
          resolve({
            receiveAddress: invoice.lnInvoice.bolt11,
            errorMessage: {
              type: 'none',
              text: 'none',
            },
          });
        });
      }
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
  masterInfoObject,
) {
  try {
    isGeneratingAddressFunc && isGeneratingAddressFunc(true);
    const requestedSatAmount =
      userBalanceDenomination === 'fiat'
        ? Math.floor(
            (amount / nodeInformation.fiatStats.value) * SATSPERBITCOIN,
          )
        : amount;

    const {errorMessage} = await checkRecevingCapacity(
      nodeInformation,
      requestedSatAmount,
      userBalanceDenomination,
    );

    if (errorMessage.type === 'stop') {
      if (masterInfoObject.liquidWalletSettings.regulateChannelOpen) {
        const {address} = await createLiquidReceiveAddress();

        const {fees} = await getLiquidFees();

        setSendingAmount(1000);
        isGeneratingAddressFunc && isGeneratingAddressFunc(false);
        return new Promise(resolve => {
          resolve({
            receiveAddress: address,
            errorMessage: {
              type: 'warning',
              text: 'Adding to bank',
            },
          });
        });
      }
      return new Promise(resolve => {
        resolve({
          receiveAddress: null,
          errorMessage: errorMessage,
        });
      });
    } else if (errorMessage.type === 'warning') {
      if (masterInfoObject.liquidWalletSettings.regulateChannelOpen) {
        const {address} = await createLiquidReceiveAddress();
        isGeneratingAddressFunc && isGeneratingAddressFunc(false);
        return new Promise(resolve => {
          resolve({
            receiveAddress: address,
            errorMessage: {
              type: 'warning',
              text: 'Adding to bank',
            },
          });
        });
      } else {
        const response = await liquidToLNSwap(
          requestedSatAmount,
          setSendingAmount,
          isGeneratingAddressFunc,
          errorMessage,
        );
        return new Promise(resolve => {
          resolve(response);
        });
      }
    }
    const response = await liquidToLNSwap(
      requestedSatAmount,
      setSendingAmount,
      isGeneratingAddressFunc,
      errorMessage,
    );
    return new Promise(resolve => {
      resolve(response);
    });
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

async function getLNToLiquidSwapAddress(
  requestedSatAmount,
  setSendingAmount,
  isGeneratingAddressFunc,
  text,
) {
  const [
    data,
    pairSwapInfo,
    publicKey,
    privateKey,
    keys,
    preimage,
    liquidAddress,
  ] = await createLNToLiquidSwap(requestedSatAmount, setSendingAmount);

  if (data) {
    isGeneratingAddressFunc && isGeneratingAddressFunc(false);
    return new Promise(resolve => {
      resolve({
        receiveAddress: data.invoice,
        errorMessage: {
          type: 'warning',
          text: text,
        },
        data: {
          ...data,
          publicKey: publicKey,
          keys: keys,
          preimage: preimage,
          initSwapInfo: data,
          liquidAddress: liquidAddress,
        },
        swapInfo: {
          minMax: {
            min: pairSwapInfo.limits.minimal * 2.5,
            max: pairSwapInfo.limits.maximalZeroConf,
          },

          pairSwapInfo: {
            id: data.id,
            asset: 'L-BTC',
            version: 3,
            privateKey: privateKey,
            blindingKey: data.blindingKey,
            claimPublicKey: data.claimPublicKey,
            timeoutBlockHeight: data.timeoutBlockHeight,
            swapTree: data.swapTree,
            adjustedSatAmount: requestedSatAmount,
          },
        },
      });
    });
  } else {
  }
}

async function liquidToLNSwap(
  requestedSatAmount,
  setSendingAmount,
  isGeneratingAddressFunc,
  errorMessage,
) {
  const pairSwapInfo = await getBoltzSwapPairInformation('liquid-ln');
  if (!pairSwapInfo) new Error('no swap info');
  const adjustedSatAmount = Math.round(
    requestedSatAmount -
      pairSwapInfo.fees.minerFees -
      requestedSatAmount * (pairSwapInfo.fees.percentage / 100),
  );

  if (requestedSatAmount < pairSwapInfo.limits.minimal * 2.5) {
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

  const invoice = await receivePayment({
    amountMsat: adjustedSatAmount * 1000,
    description: 'Liquid Swap',
  });

  if (invoice) {
    const {swapInfo, privateKey} = await createLiquidToLNSwap(
      invoice,
      pairSwapInfo.hash,
    );

    console.log(swapInfo);
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
}

export {
  generateUnifiedAddress,
  generateLightningAddress,
  generateBitcoinAddress,
  generateLiquidAddress,
};
