import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {BTN, COLORS, FONT, SIZES} from '../../constants';
import {useGlobalContextProvider} from '../../../context-store/context';
import globalOnBreezEvent from '../../functions/globalOnBreezEvent';
import * as nostr from 'nostr-tools';
import {useEffect, useRef, useState} from 'react';
import {
  InputTypeVariant,
  connectLsp,
  fetchFiatRates,
  listLsps,
  lspInfo,
  nodeInfo,
  parseInput,
  receivePayment,
  sendPayment,
  serviceHealthCheck,
  setLogStream,
  withdrawLnurl,
} from '@breeztech/react-native-breez-sdk';
import {connectToNode, setLocalStorageItem} from '../../functions';
import {getTransactions} from '../../functions/SDK';
import {useTranslation} from 'react-i18next';
import {initializeAblyFromHistory} from '../../functions/messaging/initalizeAlbyFromHistory';
import {
  createSubAccount,
  gdk,
  getSubAccounts,
  sendLiquidTransaction,
  startGDKSession,
} from '../../functions/liquidWallet';
import {assetIDS} from '../../functions/liquidWallet/assetIDS';
import autoChannelRebalance from '../../functions/liquidWallet/autoChannelRebalance';
import initializeUserSettingsFromHistory from '../../functions/initializeUserSettings';
import {queryContacts} from '../../../db';
import handleWebviewClaimMessage from '../../functions/boltz/handle-webview-claim-message';
import {
  getBoltzApiUrl,
  getBoltzWsUrl,
} from '../../functions/boltz/boltzEndpoitns';
import WebView from 'react-native-webview';
import handleReverseClaimWSS from '../../functions/boltz/handle-reverse-claim-wss';
import handleSubmarineClaimWSS from '../../functions/boltz/handle-submarine-claim-wss';
const webviewHTML = require('boltz-swap-web-context');

export default function ConnectingToNodeLoadingScreen({
  navigation: navigate,
  route,
}) {
  const onBreezEvent = globalOnBreezEvent(navigate);
  const {
    theme,
    toggleNodeInformation,
    // toggleNostrSocket,
    // toggleNostrEvents,
    // toggleNostrContacts,
    // nostrContacts,
    toggleMasterInfoObject,
    masterInfoObject,
    contactsPrivateKey,
    toggleLiquidNodeInformation,
    nodeInformation,
    liquidNodeInformation,
    setContactsPrivateKey,
    setMasterInfoObject,
    setJWT,
    setContactsImages,
  } = useGlobalContextProvider();

  const [hasError, setHasError] = useState(null);
  const {t} = useTranslation();
  const webViewRef = useRef(null);

  //gets data from either firebase or local storage to load users saved settings
  const didLoadInformation = useRef(false);
  const isInitialLoad = route?.params?.isInitialLoad;

  useEffect(() => {
    (async () => {
      const didSet = await initializeUserSettingsFromHistory({
        setContactsPrivateKey,
        setJWT,
        setContactsImages,
        toggleMasterInfoObject,
        setMasterInfoObject,
      });

      //waits for data to be loaded untill login process can start
      if (!didSet) {
        setHasError(1);
        return;
      }
    })();
  }, []);

  useEffect(() => {
    if (
      Object.keys(masterInfoObject).length === 0 ||
      didLoadInformation.current
    )
      return;

    initWallet();
    cacheContactsList();
    didLoadInformation.current = true;
  }, [masterInfoObject]);

  return (
    <View
      style={[
        styles.globalContainer,
        {
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
        },
      ]}>
      {/* This webview is used to call WASM code in browser as WASM code cannot be called in react-native */}
      <WebView
        javaScriptEnabled={true}
        ref={webViewRef}
        containerStyle={{position: 'absolute', top: 1000, left: 1000}}
        source={webviewHTML}
        originWhitelist={['*']}
        onMessage={event =>
          handleWebviewClaimMessage(navigate, event, 'loadingScreen')
        }
      />
      <ActivityIndicator
        size="large"
        color={theme ? COLORS.darkModeText : COLORS.lightModeText}
      />
      <Text
        style={[
          styles.waitingText,
          {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
        ]}>
        {hasError
          ? t(`loadingScreen.errorText${hasError}`)
          : t('loadingScreen.loadingText')}
      </Text>
    </View>
  );

  async function initBalanceAndTransactions() {
    //   try {
    //     // const savedBreezInfo = await getLocalStorageItem('breezInfo');
    //     // if (savedBreezInfo) {
    //     //   toggleNodeInformation({
    //     //     didConnectToNode: false,
    //     //     transactions: JSON.parse(savedBreezInfo)[0],
    //     //     userBalance: JSON.parse(savedBreezInfo)[1],
    //     //     inboundLiquidityMsat: JSON.parse(savedBreezInfo)[2],
    //     //     blockHeight: JSON.parse(savedBreezInfo)[3],
    //     //     onChainBalance: JSON.parse(savedBreezInfo)[4],
    //     //     fiatStats: JSON.parse(savedBreezInfo)[5],
    //     //   });
    //     // }
    //   } catch (err) {
    //     console.log(err);
    //   }
  }

  async function initWallet() {
    console.log('HOME RENDER BREEZ EVENT FIRST LOAD');
    // initBalanceAndTransactions(toggleNodeInformation);

    try {
      const liquidSession = await startGDKSession();
      const lightningSession =
        Platform.OS === 'ios'
          ? {isConnected: true} ||
            (await connectToNode(onBreezEvent, isInitialLoad))
          : await connectToNode(onBreezEvent, isInitialLoad);

      initializeAblyFromHistory(
        toggleMasterInfoObject,
        masterInfoObject,
        masterInfoObject.contacts.myProfile.uuid,
        contactsPrivateKey,
      );

      if (lightningSession?.isConnected && liquidSession) {
        const didSetLightning =
          Platform.OS === 'ios' ? true : await setNodeInformationForSession();
        const didSetLiquid = await setLiquidNodeInformationForSession();

        toggleNodeInformation({
          didConnectToNode: true,
        });

        if (didSetLightning && didSetLiquid) {
          const autoWorkData =
            process.env.BOLTZ_ENVIRONMENT === 'testnet'
              ? {didRun: false}
              : await autoChannelRebalance(
                  didSetLightning,
                  didSetLiquid,
                  masterInfoObject,
                  toggleMasterInfoObject,
                  contactsPrivateKey,
                );

          console.log(autoWorkData);
          if (!autoWorkData.didRun) {
            navigate.replace('HomeAdmin');
            return;
          } else if (!autoWorkData.didWork) {
            throw new Error('error creating swap');
          }

          const webSocket = new WebSocket(
            `${getBoltzWsUrl(process.env.BOLTZ_ENVIRONMENT)}`,
          );

          if (autoWorkData.type === 'ln-liquid') {
            const didHandle = await handleReverseClaimWSS({
              ref: webViewRef,
              webSocket: webSocket,
              liquidAddress: autoWorkData.invoice,
              swapInfo: autoWorkData.swapInfo,
              preimage: autoWorkData.preimage,
              privateKey: autoWorkData.privateKey,
              navigate,
            });

            if (didHandle) {
              try {
                await sendPayment(autoWorkData.swapInfo.invoice);
                console.log('SEND LN PAYMENT');
              } catch (err) {
                webSocket.close();
                // throw new Error('error sending payment');
              }
            }
          } else {
            const refundJSON = {
              id: autoWorkData.swapInfo.id,
              asset: 'L-BTC',
              version: 3,
              privateKey: autoWorkData.privateKey,
              blindingKey: autoWorkData.swapInfo.blindingKey,
              claimPublicKey: autoWorkData.swapInfo.claimPublicKey,
              timeoutBlockHeight: autoWorkData.swapInfo.timeoutBlockHeight,
              swapTree: autoWorkData.swapInfo.swapTree,
            };

            // toggleMasterInfoObject({
            //   liquidSwaps: [...masterInfoObject.liquidSwaps].concat(refundJSON),
            // });
            const didHandle = await handleSubmarineClaimWSS({
              ref: webViewRef,
              webSocket: webSocket,
              invoiceAddress: autoWorkData.invoice,
              swapInfo: autoWorkData.swapInfo,
              privateKey: autoWorkData.privateKey,
              toggleMasterInfoObject,
              masterInfoObject,
              contactsPrivateKey,
              refundJSON,
              navigate,
              page: 'loadingScreen',
            });

            if (didHandle) {
              try {
                await sendLiquidTransaction(
                  autoWorkData.swapInfo.expectedAmount,
                  autoWorkData.swapInfo.address,
                );
                console.log('SEND LIQUID PAYMENT');
              } catch (err) {
                webSocket.close();
                throw new Error('error sending payment');
              }
            }
          }
        } else
          throw new Error(
            'Either lightning or liquid nodde did not set up properly',
          );
      } else throw new Error('something went wrong');
    } catch (err) {
      toggleNodeInformation({
        didConnectToNode: false,
      });
      setHasError(1);
      console.log(err, 'homepage connection to node err');
    }
  }
  async function reconnectToLSP() {
    try {
      const availableLsps = await listLsps();
      console.log(availableLsps);

      await connectLsp(availableLsps[0].id);
      return new Promise(resolve => {
        resolve(true);
      });
    } catch (err) {
      console.log(err, 'CONNECTING TO LSP ERROR');
      // setHasError(1);
      return new Promise(resolve => {
        resolve(false);
      });
    }
  }

  async function setNodeInformationForSession() {
    try {
      const nodeState = await nodeInfo();
      const transactions = await getTransactions();
      const heath = await serviceHealthCheck(process.env.API_KEY);
      const msatToSat = nodeState.channelsBalanceMsat / 1000;
      console.log(nodeState, heath, 'TESTIGg');
      const fiat = await fetchFiatRates();
      const lspInfo = await listLsps();
      const currency = masterInfoObject.currency;

      const [fiatRate] = fiat.filter(rate => {
        return rate.coin.toLowerCase() === currency.toLowerCase();
      });

      const didConnectToLSP =
        nodeState.connectedPeers.length != 0 || (await reconnectToLSP());

      if (didConnectToLSP) {
        // await receivePayment({
        //   amountMsat: 50000000,
        //   description: '',
        // });

        toggleNodeInformation({
          didConnectToNode: true,
          transactions: transactions,
          userBalance: msatToSat,
          inboundLiquidityMsat: nodeState.inboundLiquidityMsats,
          blockHeight: nodeState.blockHeight,
          onChainBalance: nodeState.onchainBalanceMsat,
          fiatStats: fiatRate,
          lsp: lspInfo,
        });

        return new Promise(resolve => {
          resolve({
            didConnectToNode: true,
            transactions: transactions,
            userBalance: msatToSat,
            inboundLiquidityMsat: nodeState.inboundLiquidityMsats,
            blockHeight: nodeState.blockHeight,
            onChainBalance: nodeState.onchainBalanceMsat,
            fiatStats: fiatRate,
            lsp: lspInfo,
          });
        });
      } else if (
        masterInfoObject.liquidWalletSettings.regulateChannelOpen &&
        nodeState.channelsBalanceMsat === 0
      ) {
        toggleNodeInformation({
          didConnectToNode: true,
          // transactions: transactions,
          // userBalance: msatToSat,
          // inboundLiquidityMsat: nodeState.inboundLiquidityMsats,
          // blockHeight: nodeState.blockHeight,
          // onChainBalance: nodeState.onchainBalanceMsat,
          fiatStats: fiatRate,
          // lsp: lspInfo,
        });

        return new Promise(resolve => {
          resolve({
            didConnectToNode: true,
            transactions: transactions,
            userBalance: msatToSat,
            inboundLiquidityMsat: nodeState.inboundLiquidityMsats,
            blockHeight: nodeState.blockHeight,
            onChainBalance: nodeState.onchainBalanceMsat,
            fiatStats: fiatRate,
            lsp: lspInfo,
          });
        });
      } else throw new Error('something went wrong');
    } catch (err) {
      console.log(err, 'TESTING');
      return new Promise(resolve => {
        resolve(false);
      });
    }
  }

  async function setLiquidNodeInformationForSession() {
    try {
      const hasSubAccount = await getSubAccounts();

      if (hasSubAccount) {
        const {[assetIDS['L-BTC']]: liquidBalance} = await gdk.getBalance({
          subaccount: 1,
          num_confs: 0,
        });
        const transaction = await gdk.getTransactions({
          subaccount: 1,
          first: 0,
          count: 10000,
        });
        const receiveAddress = await gdk.getReceiveAddress({subaccount: 1});

        if (!masterInfoObject.contacts.myProfile.receiveAddress) {
          toggleMasterInfoObject({
            contacts: {
              ...masterInfoObject.contacts,
              myProfile: {
                ...masterInfoObject.contacts.myProfile,
                receiveAddress: receiveAddress.address,
              },
            },
          });
        }

        toggleLiquidNodeInformation({
          transactions: transaction.transactions,
          userBalance: liquidBalance,
        });
        return new Promise(resolve => {
          resolve({
            transactions: transaction.transactions,
            userBalance: liquidBalance,
          });
        });
      } else {
        return new Promise(resolve => {
          setTimeout(async () => {
            const didCreateSubAccount = await createSubAccount();
            const transaction = await gdk.getTransactions({
              subaccount: 1,
              first: 0,
              count: 10000,
            });
            const {[assetIDS['L-BTC']]: liquidBalance} = await gdk.getBalance({
              subaccount: 1,
              num_confs: 0,
            });
            if (didCreateSubAccount) {
              const receiveAddress = await gdk.getReceiveAddress({
                subaccount: 1,
              });

              if (!masterInfoObject.contacts.myProfile.receiveAddress) {
                toggleMasterInfoObject({
                  contacts: {
                    ...masterInfoObject.contacts,
                    myProfile: {
                      ...masterInfoObject.contacts.myProfile,
                      receiveAddress: receiveAddress.address,
                    },
                  },
                });
              }
              toggleLiquidNodeInformation({
                transaction: transaction.transactions,
                userBalance: liquidBalance,
              });

              resolve({
                transactions: transaction.transactions,
                userBalance: liquidBalance,
              });
            } else {
              resolve(false);
            }
          }, 5000);
        });
      }
    } catch (err) {
      console.log(err);
      return new Promise(resolve => {
        resolve(false);
      });
    }
  }

  function getClaimReverseSubmarineSwapJS({
    address,
    swapInfo,
    preimage,
    privateKey,
  }) {
    const args = JSON.stringify({
      apiUrl: getBoltzApiUrl(process.env.BOLTZ_ENVIRONMENT),
      network: process.env.BOLTZ_ENVIRONMENT,
      address,
      feeRate: 1,
      swapInfo,
      privateKey,
      preimage,
    });

    webViewRef.current.injectJavaScript(
      `window.claimReverseSubmarineSwap(${args}); void(0);`,
    );
  }
  function getClaimSubmarineSwapJS({invoiceAddress, swapInfo, privateKey}) {
    const args = JSON.stringify({
      apiUrl: getBoltzApiUrl(process.env.BOLTZ_ENVIRONMENT),
      network: process.env.BOLTZ_ENVIRONMENT,
      invoice: invoiceAddress,
      swapInfo,
      privateKey,
    });

    webViewRef.current.injectJavaScript(
      `window.claimSubmarineSwap(${args}); void(0);`,
    );
  }
}

async function cacheContactsList() {
  let users = await queryContacts('blitzWalletUsers');
  if (users?.length === 0) return;
  users = users.map(doc => {
    return {
      name: doc['_document'].data.value.mapValue.fields.contacts.mapValue.fields
        .myProfile.mapValue.fields.name.stringValue,
      uuid: doc['_document'].data.value.mapValue.fields.contacts.mapValue.fields
        .myProfile.mapValue.fields.uuid.stringValue,
      uniqueName:
        doc['_document'].data.value.mapValue.fields.contacts.mapValue.fields
          .myProfile.mapValue.fields.uniqueName.stringValue,
      bio: doc['_document'].data.value.mapValue.fields.contacts.mapValue.fields
        .myProfile.mapValue.fields.bio.stringValue,
      receiveAddress:
        doc['_document'].data.value.mapValue.fields.contacts.mapValue.fields
          .myProfile.mapValue.fields.receiveAddress.stringValue,
    };
  });

  setLocalStorageItem('cachedContactsList', JSON.stringify(users.slice(0, 50)));
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingText: {
    width: '95%',
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
    marginTop: 20,
    textAlign: 'center',
  },
});
