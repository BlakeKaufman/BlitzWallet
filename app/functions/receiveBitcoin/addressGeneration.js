import {
  receiveOnchain,
  receivePayment,
  openChannelFee,
} from '@breeztech/react-native-breez-sdk';
import {SATSPERBITCOIN} from '../../constants';
// import {createLiquidSwap, getSwapPairInformation} from '../LBTC';

import {createLiquidReceiveAddress, getLiquidFees} from '../liquidWallet';
import createLiquidToLNSwap from '../boltz/liquidToLNSwap';
import createLNToLiquidSwap from '../boltz/LNtoLiquidSwap';
import {getBoltzSwapPairInformation} from '../boltz/boltzSwapInfo';
import {assetIDS} from '../liquidWallet/assetIDS';
import {getSideSwapApiUrl} from '../sideSwap/sideSwapEndpoitns';
import {getLocalStorageItem, setLocalStorageItem} from '../localStorage';

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
    const liquidAddress = await createLiquidReceiveAddress();
    const webSocket = new WebSocket(
      `${getSideSwapApiUrl(process.env.BOLTZ_ENVIRONMENT)}`,
    );

    let savedPegId = JSON.parse(await getLocalStorageItem('savedPegId'));

    const swapInfo1 =
      savedPegId &&
      (await (async () => {
        return new Promise(resolve => {
          webSocket.onopen = () => {
            console.log('did un websocket open');
            webSocket.send(
              JSON.stringify({
                id: 1,
                method: 'peg_status',
                params: {
                  peg_in: true,
                  order_id: savedPegId.order_id,
                },
              }),
            );
          };

          webSocket.onmessage = rawMsg => {
            const msg = JSON.parse(rawMsg.data);
            console.log(msg);
            resolve(msg.result);
          };
        });
      })());

    if (
      savedPegId &&
      (Math.round(savedPegId.created_at / 1000) -
        Math.round(new Date().getTime() / 1000) <
        24 * 60 * 60 * 1000 ||
        swapInfo1.list.filter(
          item => item.tx_state_code === 3 || item.tx_state_code === 2,
        ).length > 0) &&
      swapInfo1.list.filter(item => item.tx_state_code === 4).length === 0
    ) {
      console.log('DID MAKE IT TO RETURN');
      webSocket.close();
      return new Promise(resolve => {
        resolve({
          receiveAddress: savedPegId.peg_addr,
          isSavedSwap: true,
          swapPegInfo: swapInfo1,
          errorMessage: {
            type: 'none',
            text: 'none',
          },
          swapInfo: {
            minMax: {
              min: 0,
              max: 0,
            },
          },
        });
      });

      // Handle if swap is pending or not
    }

    console.log('NOT GOING THOUGH TFUNC');
    console.log(liquidAddress.address);
    const pegInfo = await (async () => {
      return new Promise(resolve => {
        console.log('did un websocket open');
        webSocket.send(
          JSON.stringify({
            id: 1,
            method: 'peg',
            params: {
              peg_in: true,
              recv_addr: liquidAddress.address,
            },
          }),
        );

        webSocket.onmessage = rawMsg => {
          const msg = JSON.parse(rawMsg.data);
          console.log(msg, 'PEG MESSAGW');
          resolve(msg.result);
        };
      });
    })();

    const swapInfoForNewSwap = await (async () => {
      return new Promise(resolve => {
        webSocket.send(
          JSON.stringify({
            id: 1,
            method: 'peg_status',
            params: {
              peg_in: true,
              order_id: pegInfo.order_id,
            },
          }),
        );

        webSocket.onmessage = rawMsg => {
          const msg = JSON.parse(rawMsg.data);
          console.log(msg);
          resolve(msg.result);
        };
      });
    })();

    setLocalStorageItem('savedPegId', JSON.stringify(pegInfo));

    // console.log(savedPegId);

    // const swapStats = await (async () => {
    //   return new Promise(resolve => {
    //     webSocket.onopen = () => {
    //       console.log('did un websocket open');
    //       webSocket.send(
    //         JSON.stringify({
    //           id: 1,
    //           method: 'server_status',
    //           params: null,
    //         }),
    //       );
    //     };

    //     webSocket.onmessage = rawMsg => {
    //       const msg = JSON.parse(rawMsg.data);
    //       resolve(msg);
    //       webSocket.close();
    //     };
    //   });
    // })();

    // console.log(pegInfo);
    webSocket.close();
    return new Promise(resolve => {
      resolve({
        receiveAddress: pegInfo.peg_addr,
        isSavedSwap: false,
        swapPegInfo: swapInfoForNewSwap,

        errorMessage: {
          type: 'none',
          text: 'none',
        },
        swapInfo: {
          minMax: {
            min: 0,
            max: 0,
          },
        },
      });
    });

    // webSocket.onopen = () => {
    //   console.log('did un websocket open');
    //   webSocket.send(
    //     JSON.stringify({
    //       id: 1,
    //       method: 'peg',
    //       params: {
    //         peg_in: true,
    //         recv_addr: liquidAddress.address,
    //       },
    //     }),
    //   );
    //   webSocket.send(
    //     JSON.stringify({
    //       id: 1,
    //       method: 'server_status',
    //       params: null,
    //     }),
    //   );
    // };

    // let returnOBject = {
    //   errorMessage: {
    //     type: 'none',
    //     text: 'none',
    //   },
    // };

    // webSocket.onmessage = rawMsg => {
    //   const msg = JSON.parse(rawMsg.data);
    //   console.log(msg);

    //   if (msg.method === 'peg') {
    //     returnOBject['receiveAddress'] = msg.result.peg_addr;
    //   } else if (msg.method === 'server_status') {
    //     returnOBject['swapInfo'] = {
    //       minMax: {
    //         min: msg.result.min_peg_in_amount,
    //         max: 0,
    //       },
    //     };
    //   }
    // };

    // console.log(returnOBject);
    return;
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
          requestedSatAmount >= 1200 && requestedSatAmount <= 25000000
            ? 'Adding to bank'
            : 'Minimum request amount is 1 200 sats, and maximum request amount is 25 000 000',
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
      if (
        masterInfoObject.liquidWalletSettings.regulateChannelOpen &&
        requestedSatAmount < 100000
      ) {
        const response = await getLNToLiquidSwapAddress(
          requestedSatAmount,
          setSendingAmount,
          isGeneratingAddressFunc,
          requestedSatAmount >= 1200 && requestedSatAmount <= 25000000
            ? 'Adding to bank'
            : 'Minimum request amount is 1 200 sats, and maximum request amount is 25 000 000',
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

    const requestedSatAmount = getSatValue(
      userBalanceDenomination,
      nodeInformation,
      amount,
    );

    if (requestedSatAmount < 1500)
      setSendingAmount(userBalanceDenomination === 'fiat' ? 2 : 1500);
    console.log(requestedSatAmount);

    const {address} = await createLiquidReceiveAddress();
    const receiveAddress = `${
      process.env.BOLTZ_ENVIRONMENT === 'testnet'
        ? 'liquidtestnet:'
        : 'liquidnetwork:'
    }${address}?amount=${
      userBalanceDenomination === 'fiat'
        ? (amount / (nodeInformation.fiatStats.value || 70000)).toFixed(8)
        : (amount / SATSPERBITCOIN).toFixed(8)
    }&assetid=${assetIDS['L-BTC']}`;

    isGeneratingAddressFunc && isGeneratingAddressFunc(false);
    return new Promise(resolve => {
      resolve({
        receiveAddress: receiveAddress,
        errorMessage: {
          type: 'none',
          text: 'none',
        },
      });
    });

    return;
    // const requestedSatAmount =
    //   userBalanceDenomination === 'fiat'
    //     ? Math.floor(
    //         (amount / nodeInformation.fiatStats.value) * SATSPERBITCOIN,
    //       )
    //     : amount;

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
  try {
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
  } catch (err) {
    console.log(err);
    return new Promise(resolve => {
      resolve({
        errorMessage: {
          type: 'stop',
          text: 'Error connnecting to LSP, swapping to bank',
        },
      });
    });
  }
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
          // ...data,
          // publicKey: publicKey,
          keys: keys,
          preimage: preimage,
          initSwapInfo: data,
          liquidAddress: liquidAddress,
        },
        swapInfo: {
          minMax: {
            min: pairSwapInfo.limits.minimal + 500,
            max: pairSwapInfo.limits.maximal - 500,
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
  try {
    const pairSwapInfo = await getBoltzSwapPairInformation('liquid-ln');
    console.log(pairSwapInfo);
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
        invoice.lnInvoice.bolt11,
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
    console.log(err, 'EERRR');
  }
}

function getSatValue(userBalanceDenomination, nodeInformation, amount) {
  return userBalanceDenomination === 'fiat'
    ? Math.floor((amount / nodeInformation.fiatStats.value) * SATSPERBITCOIN)
    : amount;
}

export {
  generateUnifiedAddress,
  generateLightningAddress,
  generateBitcoinAddress,
  generateLiquidAddress,
};
