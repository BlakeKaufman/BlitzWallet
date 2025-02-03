import {
  openChannelFee,
  receivePayment,
} from '@breeztech/react-native-breez-sdk';
import {LIGHTNINGAMOUNTBUFFER} from '../../constants/math';
import {getECashInvoice} from '../eCash';
import formatBalanceAmount from '../formatNumber';
import numberConverter from '../numberConverter';
import {getLocalStorageItem} from '../localStorage';
import {BLITZ_DEFAULT_PAYMENT_DESCRIPTION} from '../../constants';
import {breezLiquidReceivePaymentWrapper} from '../breezLiquid';
import {fetchOnchainLimits} from '@breeztech/react-native-breez-sdk-liquid';

export async function initializeAddressProcess(wolletInfo) {
  const {setAddressState, selectedRecieveOption} = wolletInfo;
  try {
    setAddressState(prev => {
      return {
        ...prev,
        isGeneratingInvoice: true,
        generatedAddress: '',
        errorMessageText: {
          type: null,
          text: '',
        },
        swapPegInfo: {},
        isReceivingSwap: false,
        hasGlobalError: false,
      };
    });
    if (selectedRecieveOption.toLowerCase() === 'lightning') {
      const response = await generateLightningAddress(wolletInfo);
      if (!response) throw Error('Not able to generate invoice');
    } else if (selectedRecieveOption.toLowerCase() === 'bitcoin') {
      await generateBitcoinAddress(wolletInfo);
    } else {
      await generateLiquidAddress(wolletInfo);
    }
  } catch (error) {
    console.log(error, 'HANDLING ERROR');
    setAddressState(prev => {
      return {
        ...prev,
        hasGlobalError: true,
      };
    });
  } finally {
    console.log('RUNNING AFTER');
    setAddressState(prev => {
      return {
        ...prev,
        isGeneratingInvoice: false,
      };
    });
  }
}

async function generateLightningAddress(wolletInfo) {
  const {
    receivingAmount,
    description,
    userBalanceDenomination,
    nodeInformation,
    masterInfoObject,
    setAddressState,
    minMaxSwapAmounts,
    mintURL,
    seteCashNavigate,
    navigate,
    setReceiveEcashQuote,
  } = wolletInfo;
  const liquidWalletSettings = masterInfoObject.liquidWalletSettings;
  const hasLightningChannel = !!nodeInformation.userBalance;
  const enabledEcash = masterInfoObject.enabledEcash;

  if (
    (liquidWalletSettings.regulateChannelOpen &&
      liquidWalletSettings.regulatedChannelOpenSize > receivingAmount &&
      !hasLightningChannel) ||
    !liquidWalletSettings.isLightningEnabled ||
    (hasLightningChannel &&
      nodeInformation.inboundLiquidityMsat / 1000 - LIGHTNINGAMOUNTBUFFER <=
        receivingAmount &&
      liquidWalletSettings.regulateChannelOpen &&
      liquidWalletSettings.regulatedChannelOpenSize > receivingAmount) ||
    (enabledEcash &&
      !hasLightningChannel &&
      receivingAmount < minMaxSwapAmounts.min)
  ) {
    if (receivingAmount < minMaxSwapAmounts.min) {
      seteCashNavigate(navigate);
      const eCashInvoice = await getECashInvoice({
        amount: receivingAmount,
        mintURL: mintURL,
        descriptoin: description,
      });

      if (eCashInvoice.request) {
        let localStoredQuotes =
          JSON.parse(await getLocalStorageItem('ecashQuotes')) || [];
        setAddressState(prev => {
          return {
            ...prev,
            fe: 0,
            generatedAddress: eCashInvoice.request,
          };
        });

        setReceiveEcashQuote(
          localStoredQuotes[localStoredQuotes.length - 1].quote,
        );

        return true;
      } else return false;
    } else {
      console.log(description, 'DESCRIPTION');
      const addressResponse = await breezLiquidReceivePaymentWrapper({
        sendAmount: receivingAmount,
        paymentType: 'lightning',
        description: description || BLITZ_DEFAULT_PAYMENT_DESCRIPTION,
      });

      if (!addressResponse) {
        setAddressState(prev => {
          return {
            ...prev,
            generatedAddress: null,
            errorMessageText: {
              type: 'stop',
              text: `Unable to generate lightning address`,
            },
          };
        });
        return;
      }
      const {destination, receiveFeesSat} = addressResponse;

      setAddressState(prev => {
        return {
          ...prev,
          generatedAddress: destination,
          fee: receiveFeesSat,
        };
      });

      return true;
    }
  } else {
    if (
      nodeInformation.inboundLiquidityMsat / 1000 - LIGHTNINGAMOUNTBUFFER >=
      receivingAmount
    ) {
      const invoice = await receivePayment({
        amountMsat: receivingAmount * 1000,
        description: description || BLITZ_DEFAULT_PAYMENT_DESCRIPTION,
      });
      if (invoice) {
        setAddressState(prev => {
          return {
            ...prev,
            fee: 0,
            generatedAddress: invoice.lnInvoice.bolt11,
            errorMessageText: {
              type: null,
              text: '',
            },
          };
        });
        return true;
      } else return false;
    }

    const needsToOpenChannel = await checkRecevingCapacity({
      nodeInformation,
      receivingAmount,
      userBalanceDenomination,
    });

    if (needsToOpenChannel.fee / 1000 > receivingAmount) {
      setAddressState(prev => {
        return {
          ...prev,
          generatedAddress: '',
          errorMessageText: {
            type: needsToOpenChannel.type,
            text: `A ${formatBalanceAmount(
              numberConverter(
                needsToOpenChannel.fee / 1000,
                userBalanceDenomination,
                nodeInformation,
                userBalanceDenomination === 'fiat' ? 2 : 0,
              ),
            )} ${
              userBalanceDenomination === 'fiat'
                ? nodeInformation.fiatStats.coin
                : 'sats'
            } fee needs to be applied, but only ${formatBalanceAmount(
              numberConverter(
                receivingAmount,
                userBalanceDenomination,
                nodeInformation,
                userBalanceDenomination === 'fiat' ? 2 : 0,
              ),
            )} ${
              userBalanceDenomination === 'fiat'
                ? nodeInformation.fiatStats.coin
                : 'sats'
            } was requested.`,
          },
        };
      });
    } else {
      const invoice = await receivePayment({
        amountMsat: receivingAmount * 1000,
        description: description || BLITZ_DEFAULT_PAYMENT_DESCRIPTION,
      });
      setAddressState(prev => {
        return {
          ...prev,
          fee: Math.round(needsToOpenChannel.fee / 1000),
          generatedAddress: invoice.lnInvoice.bolt11,
        };
      });
    }
    return true;
  }
}

async function generateLiquidAddress(wolletInfo) {
  const {receivingAmount, setAddressState, description} = wolletInfo;

  const addressResponse = await breezLiquidReceivePaymentWrapper({
    sendAmount: receivingAmount,
    paymentType: 'liquid',
    description: description,
  });
  if (!addressResponse) {
    setAddressState(prev => {
      return {
        ...prev,
        generatedAddress: null,
        errorMessageText: {
          type: 'stop',
          text: `Unable to generate liquid address`,
        },
      };
    });
    return;
  }

  const {destination, receiveFeesSat} = addressResponse;

  setAddressState(prev => {
    return {
      ...prev,
      generatedAddress: destination,
      fee: receiveFeesSat,
    };
  });
}

async function generateBitcoinAddress(wolletInfo) {
  const {setAddressState, receivingAmount} = wolletInfo;
  // Fetch the Onchain lightning limits
  const currentLimits = await fetchOnchainLimits();
  console.log(`Minimum amount, in sats: ${currentLimits.receive.minSat}`);
  console.log(`Maximum amount, in sats: ${currentLimits.receive.maxSat}`);

  const addressResponse = await breezLiquidReceivePaymentWrapper({
    paymentType: 'bitcoin',
    sendAmount: receivingAmount,
  });
  if (!addressResponse) {
    setAddressState(prev => {
      return {
        ...prev,
        generatedAddress: null,
        errorMessageText: {
          type: 'stop',
          text: `Output amount is ${
            currentLimits.receive.minSat > receivingAmount
              ? 'below minimum ' +
                formatBalanceAmount(currentLimits.receive.minSat)
              : 'above maximum ' +
                formatBalanceAmount(currentLimits.receive.maxSat)
          }`,
        },

        minMaxSwapAmount: {
          min: currentLimits.receive.minSat,
          max: currentLimits.receive.maxSat,
        },
      };
    });
    return;
  }
  const {destination, receiveFeesSat} = addressResponse;

  setAddressState(prev => {
    return {
      ...prev,
      generatedAddress: destination,
      fee: receiveFeesSat,
    };
  });
}

async function checkRecevingCapacity({
  nodeInformation,
  receivingAmount,
  userBalanceDenomination,
}) {
  try {
    const channelFee = await openChannelFee({
      amountMsat: receivingAmount * 1000,
    });

    if (channelFee.feeMsat != 0) {
      return {
        fee: channelFee.feeMsat,
        type: 'warning',
        text: `A ${formatBalanceAmount(
          numberConverter(
            channelFee.feeMsat / 1000,
            userBalanceDenomination,
            nodeInformation,
            userBalanceDenomination === 'fiat' ? 2 : 0,
          ),
        )} ${
          userBalanceDenomination === 'fiat'
            ? nodeInformation.fiatStats.coin
            : 'sats'
        } fee will be applied.`,
      };
    } else return false;
  } catch (err) {
    console.log(err);
    return false;
  }
}
