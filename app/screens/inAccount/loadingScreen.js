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
  listFiatCurrencies,
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
import {
  connectToNode,
  getLocalStorageItem,
  setLocalStorageItem,
} from '../../functions';
import {getTransactions} from '../../functions/SDK';
import {useTranslation} from 'react-i18next';
import {initializeAblyFromHistory} from '../../functions/messaging/initalizeAlbyFromHistory';
import {
  createLiquidReceiveAddress,
  // createSubAccount,
  gdk,
  getLiquidBalance,
  getLiquidBalanceAndTransactions,
  getLiquidTransactions,
  // getSubAccounts,
  sendLiquidTransaction,
  startGDKSession,
  updateLiquidWalletInformation,
} from '../../functions/liquidWallet';
// import {assetIDS} from '../../functions/liquidWallet/assetIDS';
import autoChannelRebalance from '../../functions/liquidWallet/autoChannelRebalance';
import initializeUserSettingsFromHistory from '../../functions/initializeUserSettings';
// import {queryContacts} from '../../../db';
// import handleWebviewClaimMessage from '../../functions/boltz/handle-webview-claim-message';
import {
  getBoltzApiUrl,
  getBoltzWsUrl,
} from '../../functions/boltz/boltzEndpoitns';
import WebView from 'react-native-webview';
import handleReverseClaimWSS from '../../functions/boltz/handle-reverse-claim-wss';
import handleSubmarineClaimWSS from '../../functions/boltz/handle-submarine-claim-wss';
import WebviewForBoltzSwaps from '../../functions/boltz/webview';
import claimUnclaimedBoltzSwaps from '../../functions/boltz/claimUnclaimedTxs';
import {useWebView} from '../../../context-store/webViewContext';
import getDeepLinkUser from '../../components/admin/homeComponents/contacts/internalComponents/getDeepLinkUser';
import {useGlobalContacts} from '../../../context-store/globalContacts';
import {
  getCurrentDateFormatted,
  isMoreThan7DaysPast,
} from '../../functions/rotateAddressDateChecker';
import {useGlobaleCash} from '../../../context-store/eCash';
import {useGlobalAppData} from '../../../context-store/appData';
import GetThemeColors from '../../hooks/themeColors';
import {GlobalThemeView, ThemeText} from '../../functions/CustomElements';
import LottieView from 'lottie-react-native';

export default function ConnectingToNodeLoadingScreen({
  navigation: navigate,
  route,
}) {
  const onBreezEvent = globalOnBreezEvent(navigate);
  const {
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
    deepLinkContent,
    setDeepLinkContent,
    theme,
  } = useGlobalContextProvider();

  const {webViewRef, setWebViewArgs} = useWebView();
  const {
    decodedAddedContacts,
    updateGlobalContactsList,
    toggleGlobalContactsInformation,
    globalContactsInformation,
  } = useGlobalContacts();
  const {
    toggleGLobalEcashInformation,
    currentMint,
    eCashBalance,
    sendEcashPayment,
    seteCashNavigate,
    setEcashPaymentInformation,
  } = useGlobaleCash();
  const {textColor} = GetThemeColors();

  const {toggleGlobalAppDataInformation} = useGlobalAppData();

  const [hasError, setHasError] = useState(null);
  const {t} = useTranslation();
  // const webViewRef = useRef(null);

  //gets data from either firebase or local storage to load users saved settings
  const didLoadInformation = useRef(false);
  const isInitialLoad = route?.params?.isInitialLoad;
  const didRestoreWallet = route?.params?.didRestoreWallet;

  const [message, setMessage] = useState('Setting things up');

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessage(prevMessage =>
        prevMessage === 'Setting things up' ? 'Keep calm' : 'Setting things up',
      );
    }, 5000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    (async () => {
      const didSet = await initializeUserSettingsFromHistory({
        setContactsPrivateKey,
        setJWT,
        toggleMasterInfoObject,
        setMasterInfoObject,
        toggleGlobalContactsInformation,
        toggleGLobalEcashInformation,
        toggleGlobalAppDataInformation,
      });

      console.log(didSet, 'INITIALIZE USER SETTINGS');

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
      didLoadInformation.current ||
      Object.keys(globalContactsInformation).length === 0
    )
      return;

    claimUnclaimedBoltzSwaps();
    initWallet();
    createLiquidReceiveAddress();
    // cacheContactsList();
    didLoadInformation.current = true;
  }, [masterInfoObject, globalContactsInformation]);

  return (
    <GlobalThemeView styles={styles.globalContainer}>
      <LottieView
        source={require('../../assets/MOSCATWALKING2Blue.json')}
        autoPlay
        loop={true}
        style={{
          width: 150, // adjust as necessary
          height: 150, // adjust as necessary
        }}
        // style={styles.lottie}
      />
      {/* <ActivityIndicator size="large" color={textColor} /> */}
      <ThemeText
        styles={{
          ...styles.waitingText,
        }}
        content={hasError ? t(`loadingScreen.errorText${hasError}`) : message}
      />
    </GlobalThemeView>
  );

  async function initWallet() {
    console.log('HOME RENDER BREEZ EVENT FIRST LOAD');
    // initBalanceAndTransactions(toggleNodeInformation);

    try {
      // const liquidSession = await startGDKSession();
      const lightningSession = await connectToNode(onBreezEvent);

      initializeAblyFromHistory(
        toggleGlobalContactsInformation,
        globalContactsInformation,
        globalContactsInformation.myProfile.uuid,
        contactsPrivateKey,
      );
      console.log('isInitalLoad', isInitialLoad);
      if (isInitialLoad) {
        updateGlobalContactsList();
      }

      if (lightningSession?.isConnected && true) {
        const didSetLightning = await setNodeInformationForSession();
        const didSetLiquid = await setLiquidNodeInformationForSession();

        toggleNodeInformation({
          didConnectToNode: true,
        });

        if (didSetLightning && didSetLiquid) {
          if (deepLinkContent.data.length != 0) {
            if (deepLinkContent.type === 'LN') {
              navigate.replace('ConfirmPaymentScreen', {
                btcAdress: deepLinkContent.data,
              });
              setDeepLinkContent({type: '', data: ''});
              return;
            } else if (deepLinkContent.type === 'Contact') {
              const deepLinkContact = await getDeepLinkUser({
                decodedAddedContacts,
                deepLinkContent: deepLinkContent.data,
              });

              if (deepLinkContact.didWork) {
                navigate.replace('ExpandedAddContactsPage', {
                  newContact: deepLinkContact.data,
                });
                setDeepLinkContent({type: '', data: ''});
              } else {
                setDeepLinkContent({type: '', data: ''});
                setTimeout(() => {
                  navigate.replace('HomeAdmin');
                  navigate.navigate('ErrorScreen', {
                    errorMessage: `${deepLinkContact.reason}`,
                  });
                }, 500);
              }

              return;
            }
          }

          const autoWorkData =
            process.env.BOLTZ_ENVIRONMENT === 'testnet' || Platform.OS === 'ios'
              ? {didRun: false}
              : await autoChannelRebalance({
                  nodeInformation: didSetLightning,
                  liquidNodeInformation: didSetLiquid,
                  masterInfoObject,
                  currentMint,
                  eCashBalance,
                });

          console.log(autoWorkData);
          if (!autoWorkData.didRun) {
            navigate.replace('HomeAdmin');
            return;
          } else if (!autoWorkData.didWork) {
            throw new Error('error creating swap');
          }
          setWebViewArgs({navigate: navigate, page: 'loadingScreen'});

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
                if (autoWorkData.isEcash) {
                  console.log(autoWorkData.swapInfo.invoice);
                  const didSendEcashPayment = await sendEcashPayment(
                    autoWorkData.swapInfo.invoice,
                  );

                  console.log(didSendEcashPayment);

                  if (
                    didSendEcashPayment.proofsToUse &&
                    didSendEcashPayment.quote
                  ) {
                    seteCashNavigate(navigate);
                    setEcashPaymentInformation({
                      quote: didSendEcashPayment.quote,
                      invoice: autoWorkData.swapInfo.invoice,
                      proofsToUse: didSendEcashPayment.proofsToUse,
                      isAutoChannelRebalance: true,
                    });
                  } else {
                    navigate.replace('HomeAdmin');
                  }
                  // send ecash payment
                } else
                  await sendPayment({bolt11: autoWorkData.swapInfo.invoice});
                console.log('SEND LN PAYMENT');
              } catch (err) {
                webSocket.close();
                console.log(err);
                throw new Error('swap error');
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
      const currency = masterInfoObject.fiatCurrency;
      const currenies = await listFiatCurrencies();

      const sourted = currenies.sort((a, b) => a.id.localeCompare(b.id));

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

        if (masterInfoObject.fiatCurrenciesList.length < 1)
          toggleMasterInfoObject({fiatCurrenciesList: sourted});
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
      // const hasSubAccount = await getSubAccounts();

      // if (hasSubAccount) {
      //   const {[assetIDS['L-BTC']]: liquidBalance} = await gdk.getBalance({
      //     subaccount: 1,
      //     num_confs: 0,
      //   });
      //   const transaction = await gdk.getTransactions({
      //     subaccount: 1,
      //     first: 0,
      //     count: 10000,
      //   });
      //   const receiveAddress = await gdk.getReceiveAddress({subaccount: 1});

      //   if (
      //     !globalContactsInformation.myProfile.receiveAddress ||
      //     isMoreThan7DaysPast(globalContactsInformation.myProfile?.lastRotated)
      //   ) {
      //     toggleGlobalContactsInformation(
      //       {
      //         ...globalContactsInformation.contacts,
      //         myProfile: {
      //           ...globalContactsInformation.myProfile,
      //           receiveAddress: receiveAddress.address,
      //           lastRotated: getCurrentDateFormatted(),
      //         },
      //       },
      //       true,
      //     );
      //   }
      //   if (
      //     !masterInfoObject.posSettings.receiveAddress ||
      //     isMoreThan7DaysPast(masterInfoObject.posSettings?.lastRotated)
      //   ) {
      //     const posReceiveAddress = await gdk.getReceiveAddress({
      //       subaccount: 1,
      //     });

      //     toggleMasterInfoObject({
      //       posSettings: {
      //         ...masterInfoObject.posSettings,
      //         receiveAddress: posReceiveAddress.address,
      //         lastRotated: getCurrentDateFormatted(),
      //       },
      //     });
      //   }
      //   toggleLiquidNodeInformation({
      //     transactions: transaction.transactions,
      //     userBalance: liquidBalance,
      //   });
      //   return new Promise(resolve => {
      //     resolve({
      //       transactions: transaction.transactions,
      //       userBalance: liquidBalance,
      //     });
      //   });
      // } else {

      // return new Promise(resolve => {
      //   setTimeout(async () => {
      // const didCreateSubAccount = await createSubAccount();
      // const transaction = await gdk.getTransactions({
      //   subaccount: 1,
      //   first: 0,
      //   count: 10000,
      // });
      // const transactions = await getLiquidTransactions();
      // const balance = await getLiquidBalance();

      // const liquidBalanceAndTransactions =
      //   await getLiquidBalanceAndTransactions();

      if (
        !globalContactsInformation.myProfile.receiveAddress ||
        isMoreThan7DaysPast(globalContactsInformation.myProfile?.lastRotated)
      ) {
        const receiveAddress = await createLiquidReceiveAddress();
        toggleGlobalContactsInformation(
          {
            ...globalContactsInformation.contacts,
            myProfile: {
              ...globalContactsInformation.myProfile,
              receiveAddress: receiveAddress.address,
              lastRotated: getCurrentDateFormatted(),
            },
          },
          true,
        );
      }
      if (
        !masterInfoObject.posSettings.receiveAddress ||
        isMoreThan7DaysPast(masterInfoObject.posSettings?.lastRotated)
      ) {
        const receiveAddress = await createLiquidReceiveAddress();
        toggleMasterInfoObject({
          posSettings: {
            ...masterInfoObject.posSettings,
            receiveAddress: receiveAddress.address,
            lastRotated: getCurrentDateFormatted(),
          },
        });
      }

      // if (liquidBalanceAndTransactions) {
      //   const {transactions, balance} = liquidBalanceAndTransactions;
      //   toggleLiquidNodeInformation({
      //     transactions: transactions,
      //     userBalance: balance,
      //   });
      updateLiquidWalletInformation({
        toggleLiquidNodeInformation,
        firstLoad: true,
      });

      return new Promise(resolve => {
        setTimeout(() => {
          resolve(true);
        }, 4000);
      });
      // } else return false;

      // const {[assetIDS['L-BTC']]: liquidBalance} = await gdk.getBalance({
      //   subaccount: 1,
      //   num_confs: 0,
      // });
      // if (didCreateSubAccount) {
      //   const receiveAddress = await gdk.getReceiveAddress({
      //     subaccount: 1,
      //   });

      //   if (
      //     !globalContactsInformation.myProfile.receiveAddress ||
      //     isMoreThan7DaysPast(globalContactsInformation.myProfile?.lastRotated)
      //   ) {
      //     toggleGlobalContactsInformation(
      //       {
      //         ...globalContactsInformation.contacts,
      //         myProfile: {
      //           ...globalContactsInformation.myProfile,
      //           receiveAddress: receiveAddress.address,
      //           lastRotated: getCurrentDateFormatted(),
      //         },
      //       },
      //       true,
      //     );
      //   }
      //   if (
      //     !masterInfoObject.posSettings.receiveAddress ||
      //     isMoreThan7DaysPast(masterInfoObject.posSettings?.lastRotated)
      //   ) {
      //     const posReceiveAddress = await gdk.getReceiveAddress({
      //       subaccount: 1,
      //     });

      //     toggleMasterInfoObject({
      //       posSettings: {
      //         ...masterInfoObject.posSettings,
      //         receiveAddress: posReceiveAddress.address,
      //         lastRotated: getCurrentDateFormatted(),
      //       },
      //     });
      //   }
      //   toggleLiquidNodeInformation({
      //     transaction: transaction.transactions,
      //     userBalance: liquidBalance,
      //   });

      //   resolve({
      //     transactions: transaction.transactions,
      //     userBalance: liquidBalance,
      //   });
      // } else {
      //   resolve(false);
      // }
      //   }, 5000);
      // });
      // }
    } catch (err) {
      console.log(err);
      return new Promise(resolve => {
        resolve(false);
      });
    }
  }
}

// async function cacheContactsList() {
//   let users = await queryContacts('blitzWalletUsers');
//   if (users?.length === 0) return;
//   users = users.slice(0, 50).map(doc => {
//     const {
//       contacts: {myProfile},
//     } = doc.data();

//     const returnObject = {
//       name: myProfile.name,
//       uuid: myProfile.uuid,
//       uniqueName: myProfile.uniqueName,
//       receiveAddress: myProfile.receiveAddress,
//     };
//     return returnObject;
//   });

//   setLocalStorageItem('cachedContactsList', JSON.stringify(users));
// }

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingText: {
    width: '95%',
    maxWidth: 200,
    marginTop: 10,
    textAlign: 'center',
    color: COLORS.primary,
  },
});
