import {
  receiveOnchain,
  receivePayment,
  openChannelFee,
} from '@breeztech/react-native-breez-sdk';
import {SATSPERBITCOIN} from '../../constants';

async function generateUnifiedAddress(
  nodeInformation,
  userBalanceDenomination,
  amount,
  description,
  isGeneratingAddressFunc,
  setMinMaxSwapAmount,
  setErrorMessageText,
) {
  try {
    isGeneratingAddressFunc(true);

    const bitcoinAddress = await generateBitcoinAddress(
      nodeInformation,
      userBalanceDenomination,
      amount,
      description,
      undefined,
      setMinMaxSwapAmount,
      setErrorMessageText,
    );

    const lightningAddress = await generateLightningAddress(
      nodeInformation,
      userBalanceDenomination,
      amount,
      description,
      undefined,
      setErrorMessageText,
    );

    if (!bitcoinAddress || !lightningAddress) return;

    const unifiedAddress = `bitcoin:${bitcoinAddress}?amount=${
      userBalanceDenomination === 'fiat'
        ? (amount / nodeInformation.fiatStats.value).toFixed(8)
        : (amount / SATSPERBITCOIN).toFixed(8)
    }&lightning=${lightningAddress}`;

    isGeneratingAddressFunc(false);
    console.log(unifiedAddress);
    return new Promise(resolve => {
      resolve(unifiedAddress);
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
  setMinMaxSwapAmount,
  setErrorMessageText,
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
    const swapInfo = await receiveOnchain({
      description: description,
      amount: requestedSatAmount,
    });
    setMinMaxSwapAmount({
      min: swapInfo.minAllowedDeposit,
      max: swapInfo.maxAllowedDeposit,
    });
    isGeneratingAddressFunc && isGeneratingAddressFunc(false);

    return new Promise(resolve => {
      resolve(swapInfo.bitcoinAddress);
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
  setErrorMessageText,
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
    if (requestedSatAmount === 0) {
      setErrorMessageText('Must set invoice for more than 0 sats');
      return;
    }
    setErrorMessageText('');
    const channelFee = await openChannelFee({
      amountMsat: requestedSatAmount * 1000,
    });
    if (nodeInformation.inboundLiquidityMsat < requestedSatAmount * 1000) {
      setErrorMessageText(
        `Amount is above your receiving capacity. Sending this payment will incur a ${Math.ceil(
          channelFee.feeMsat / 1000,
        ).toLocaleString()} sat fee`,
      );
    }
    if (
      channelFee.feeMsat != 0 &&
      channelFee.feeMsat + 500 * 1000 > requestedSatAmount * 1000
    ) {
      setErrorMessageText(
        `It costs ${Math.ceil(
          channelFee.feeMsat / 1000 + 500,
        ).toLocaleString()} sat to open a channel, but only ${Math.ceil(
          requestedSatAmount / 1000,
        ).toLocaleString()} sat was requested.`,
      );
      return;
    }
    const invoice = await receivePayment({
      amountMsat: requestedSatAmount * 1000,
      description: description,
    });

    if (invoice) {
      return new Promise(resolve => {
        resolve(invoice.lnInvoice.bolt11);
      });
    }
  } catch (err) {
    return new Promise(resolve => {
      resolve(false);
    });
  }
}

export {
  generateUnifiedAddress,
  generateLightningAddress,
  generateBitcoinAddress,
};
