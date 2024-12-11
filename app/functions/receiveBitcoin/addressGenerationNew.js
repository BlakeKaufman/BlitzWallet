import {
  openChannelFee,
  receivePayment,
} from '@breeztech/react-native-breez-sdk';
import {LIGHTNINGAMOUNTBUFFER, SATSPERBITCOIN} from '../../constants/math';
import {getBoltzWsUrl} from '../boltz/boltzEndpoitns';
import handleReverseClaimWSS from '../boltz/handle-reverse-claim-wss';
import createLNToLiquidSwap from '../boltz/LNtoLiquidSwap';
import {getECashInvoice} from '../eCash';
import formatBalanceAmount from '../formatNumber';
import numberConverter from '../numberConverter';
import {assetIDS} from '../liquidWallet/assetIDS';
import {createLiquidReceiveAddress} from '../liquidWallet';
import {getSideSwapApiUrl} from '../sideSwap/sideSwapEndpoitns';
import {
  getLocalStorageItem,
  removeLocalStorageItem,
  setLocalStorageItem,
} from '../localStorage';
import {isMoreThan40MinOld} from '../rotateAddressDateChecker';
import {BLITZ_DEFAULT_PAYMENT_DESCRIPTION} from '../../constants';

export async function initializeAddressProcess(wolletInfo) {
  const {setAddressState, selectedRecieveOption, bitcoinWSSRef} = wolletInfo;
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
        bitcoinConfirmations: '',
        isReceivingSwap: false,
        hasGlobalError: false,
      };
    });
    if (selectedRecieveOption.toLowerCase() === 'lightning') {
      if (bitcoinWSSRef.current) bitcoinWSSRef.current.close();
      const response = await generateLightningAddress(wolletInfo);

      if (!response) throw Error('Not able to generate invoice');
    } else if (selectedRecieveOption.toLowerCase() === 'bitcoin') {
      await generateBitcoinAddress(wolletInfo);
    } else {
      if (bitcoinWSSRef.current) bitcoinWSSRef.current.close();
      generateLiquidAddress(wolletInfo);
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
    webViewRef,
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
            generatedAddress: eCashInvoice.request,
          };
        });

        setReceiveEcashQuote(
          localStoredQuotes[localStoredQuotes.length - 1].quote,
        );

        return true;
      } else return false;
    } else {
      const swapResponse = await getLNToLiquidSwapAddress({
        receivingAmount,
        description,
      });
      const webSocket = new WebSocket(
        `${getBoltzWsUrl(process.env.BOLTZ_ENVIRONMENT)}`,
      );
      if (swapResponse) {
        const didHandle = await handleReverseClaimWSS({
          ref: webViewRef,
          webSocket,
          liquidAddress: swapResponse.liquidAddress,
          swapInfo: swapResponse.claimData,
          preimage: swapResponse.preimage,
          privateKey: swapResponse.privateKey,
          fromPage: 'receivePage',
          isReceivingSwapFunc: () =>
            setAddressState(prev => {
              return {
                ...prev,
                isReceivingSwap: true,
              };
            }),
        });
        if (didHandle) {
          setAddressState(prev => {
            return {
              ...prev,
              generatedAddress: swapResponse.receiveAddress,
              errorMessageText: {
                type: null,
                text: '',
              },
            };
          });
          return true;
        } else return false;
      } else return false;
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
          generatedAddress: invoice.lnInvoice.bolt11,
          errorMessageText: {
            type: needsToOpenChannel.type,
            text: needsToOpenChannel.text,
          },
        };
      });
    }
    return true;
  }
}

async function generateLiquidAddress(wolletInfo) {
  const {receivingAmount, setAddressState} = wolletInfo;

  const {address} = await createLiquidReceiveAddress();
  const receiveAddress = `${
    process.env.BOLTZ_ENVIRONMENT === 'testnet'
      ? 'liquidtestnet:'
      : 'liquidnetwork:'
  }${address}?amount=${(receivingAmount / SATSPERBITCOIN).toFixed(8)}&assetid=${
    assetIDS['L-BTC']
  }`;
  setAddressState(prev => {
    return {
      ...prev,
      generatedAddress: receiveAddress,
    };
  });
}

async function generateBitcoinAddress(wolletInfo) {
  const {setAddressState, navigate, bitcoinWSSRef} = wolletInfo;
  return new Promise(async resolve => {
    try {
      if (process.env.BOLTZ_ENVIRONMENT === 'testnet') resolve(false);
      const {address} = await createLiquidReceiveAddress();

      if (bitcoinWSSRef.current?.readyState === WebSocket.OPEN)
        bitcoinWSSRef.current.close();
      bitcoinWSSRef.current = new WebSocket(
        `${getSideSwapApiUrl(process.env.BOLTZ_ENVIRONMENT)}`,
      );
      console.log('RUNNING HERES');

      let savedPegId = JSON.parse(await getLocalStorageItem('savedPegId'));

      console.log(savedPegId, 'TEST');

      bitcoinWSSRef.current.onopen = () => {
        if (bitcoinWSSRef.current.readyState != WebSocket.OPEN) return;

        bitcoinWSSRef.current.send(
          JSON.stringify({
            id: 1,
            method: 'login_client',
            params: {
              api_key: process.env.SIDESWAP_REWARDS_KEY,
              cookie: null,
              user_agent: 'BlitzWallet',
              version: '1.2.3',
            },
          }),
        );
        bitcoinWSSRef.current.send(
          JSON.stringify({
            id: 1,
            method: 'server_status',
            params: null,
          }),
        );
        if (savedPegId?.order_id) {
          console.log('SAVED');
          bitcoinWSSRef.current.send(
            JSON.stringify({
              id: 1,
              method: 'peg_status',
              params: {
                peg_in: true,
                order_id: savedPegId.order_id,
              },
            }),
          );
        } else {
          console.log('New');
          bitcoinWSSRef.current.send(
            JSON.stringify({
              id: 1,
              method: 'peg',
              params: {
                peg_in: true,
                recv_addr: address,
              },
            }),
          );
        }
      };

      bitcoinWSSRef.current.onmessage = rawMsg => {
        const msg = JSON.parse(rawMsg.data);

        console.log(msg, 'WEBOCKED ON MESSAGE FOR BITCOIN');

        if (msg.method === 'login_client') {
        } else if (msg.method === 'server_status') {
          setAddressState(prev => {
            return {
              ...prev,
              minMaxSwapAmount: {
                min:
                  msg.result?.min_peg_in_amount || msg.params.min_peg_in_amount,
                max: 0,
              },
            };
          });
        } else if (msg.method === 'peg_status') {
          const swapList = msg.result?.list || msg.params.list;
          console.log('BITCOIN SWAP LIST', swapList);

          if (swapList.length) {
            const isConfirming = swapList.filter(
              item => item.tx_state_code === 3 || item.tx_state_code === 2,
            );
            if (isConfirming.length > 0) {
              setAddressState(prev => {
                return {
                  ...prev,
                  bitcoinConfirmations: swapList[0].status,
                  swapPegInfo: isConfirming[0],
                  isReceivingSwap: true,
                };
              });
            } else if (
              swapList.filter(item => item.tx_state_code === 4).length === 1
            ) {
              removeLocalStorageItem('savedPegId');

              if (isMoreThan40MinOld(new Date(msg.result.created_at))) {
                bitcoinWSSRef.current.send(
                  JSON.stringify({
                    id: 1,
                    method: 'peg',
                    params: {
                      peg_in: true,
                      recv_addr: address,
                    },
                  }),
                );
                return;
              }

              navigate.navigate('HomeAdmin');
              navigate.navigate('ConfirmTxPage', {
                for: 'paymentSucceed',
                information: {},
              });
            }
            resolve(false);
          } else if (
            savedPegId &&
            msg.result.order_id === savedPegId.order_id
          ) {
            setAddressState(prev => {
              return {
                ...prev,
                generatedAddress: savedPegId.peg_addr,
                isSavedSwap: true,
                swapPegInfo: msg.result,
              };
            });
            resolve(true);
          } else {
            bitcoinWSSRef.current.send(
              JSON.stringify({
                id: 1,
                method: 'peg',
                params: {
                  peg_in: true,
                  recv_addr: address,
                },
              }),
            );
          }
        } else {
          console.log('RUNNING IN LOCALSTORAGE');
          if (!msg?.result?.peg_addr) return;
          setLocalStorageItem('savedPegId', JSON.stringify(msg.result));

          setAddressState(prev => {
            return {
              ...prev,
              generatedAddress: msg.result.peg_addr,
              isSavedSwap: false,
            };
          });
          resolve(true);
        }
      };
      bitcoinWSSRef.current.onclose = () => {
        console.log('WebSocket connection closed.');
      };

      return;
    } catch (err) {
      console.log(err);
      return false;
    }
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

async function getLNToLiquidSwapAddress({receivingAmount, description}) {
  try {
    const paymentDescription = description || '';
    const [
      data,
      pairSwapInfo,
      publicKey,
      privateKey,
      keys,
      preimage,
      liquidAddress,
    ] = await createLNToLiquidSwap(receivingAmount, paymentDescription);

    if (data.invoice) {
      return {
        receiveAddress: data.invoice,
        errorMessage: {
          type: '',
          text: '',
        },
        claimData: data,
        liquidAddress: liquidAddress,
        preimage: preimage,
        privateKey: keys.privateKey.toString('hex'),
      };
    } else return false;
  } catch (err) {
    return false;
  }
}
