import {AppState, StyleSheet, TouchableOpacity} from 'react-native';
import {COLORS, FONT, ICONS} from '../../constants';
import {useGlobalContextProvider} from '../../../context-store/context';
import {useEffect, useRef, useState} from 'react';
import {
  connectLsp,
  listLsps,
  nodeInfo,
  parseInput,
  serviceHealthCheck,
} from '@breeztech/react-native-breez-sdk';
import {retrieveData, setLocalStorageItem} from '../../functions';
import {breezPaymentWrapper, getTransactions} from '../../functions/SDK';
import {useTranslation} from 'react-i18next';
import {initializeAblyFromHistory} from '../../functions/messaging/initalizeAlbyFromHistory';
import autoChannelRebalance from '../../functions/liquidWallet/autoChannelRebalance';
import initializeUserSettingsFromHistory from '../../functions/initializeUserSettings';
import claimUnclaimedBoltzSwaps from '../../functions/boltz/claimUnclaimedTxs';
import getDeepLinkUser from '../../components/admin/homeComponents/contacts/internalComponents/getDeepLinkUser';
import {useGlobalContacts} from '../../../context-store/globalContacts';
import {
  getDateXDaysAgo,
  isMoreThan7DaysPast,
} from '../../functions/rotateAddressDateChecker';
import {useGlobaleCash} from '../../../context-store/eCash';
import {useGlobalAppData} from '../../../context-store/appData';
import {GlobalThemeView, ThemeText} from '../../functions/CustomElements';
import LottieView from 'lottie-react-native';
import useGlobalOnBreezEvent from '../../hooks/globalOnBreezEvent';
import {useNavigation} from '@react-navigation/native';
import ThemeImage from '../../functions/CustomElements/themeImage';
import * as nostr from 'nostr-tools';
import {getPublicKey} from 'nostr-tools';
import DeviceInfo from 'react-native-device-info';
import {
  fetchFiatRates,
  fetchLightningLimits,
  getInfo,
  listFiatCurrencies,
  listPayments,
  rescanOnchainSwaps,
} from '@breeztech/react-native-breez-sdk-liquid';
import useGlobalLiquidOnBreezEvent from '../../hooks/globalLiquidBreezEvent';
import connectToLightningNode from '../../functions/connectToLightning';
import connectToLiquidNode from '../../functions/connectToLiquid';
import {
  breezLiquidPaymentWrapper,
  breezLiquidReceivePaymentWrapper,
} from '../../functions/breezLiquid';
import getAppCheckToken from '../../functions/getAppCheckToken';
export default function ConnectingToNodeLoadingScreen({
  navigation: {reset},
  route,
}) {
  const navigate = useNavigation();
  const onBreezEvent = useGlobalOnBreezEvent();
  const liquidBreezEvent = useGlobalLiquidOnBreezEvent();
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
    setMinMaxLiquidSwapAmounts,
  } = useGlobalContextProvider();

  const {toggleGlobalContactsInformation, globalContactsInformation} =
    useGlobalContacts();
  const {
    toggleGLobalEcashInformation,
    currentMint,
    eCashBalance,
    sendEcashPayment,
    seteCashNavigate,
    setEcashPaymentInformation,
  } = useGlobaleCash();

  const {toggleGlobalAppDataInformation} = useGlobalAppData();

  const [hasError, setHasError] = useState(null);
  const {t} = useTranslation();
  // const webViewRef = useRef(null);

  //gets data from either firebase or local storage to load users saved settings
  const didLoadInformation = useRef(false);
  const isInitialLoad = route?.params?.isInitialLoad;
  const didRestoreWallet = route?.params?.didRestoreWallet;
  const isInialredner = useRef(true);

  const [message, setMessage] = useState(t('loadingScreen.message1'));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessage(prevMessage =>
        prevMessage === t('loadingScreen.message1')
          ? t('loadingScreen.message2')
          : t('loadingScreen.message1'),
      );
    }, 5000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!isInialredner.current) return;
    isInialredner.current = false;

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
    didLoadInformation.current = true;
    initializeAblyFromHistory(
      toggleGlobalContactsInformation,
      globalContactsInformation,
      globalContactsInformation.myProfile.uuid,
      contactsPrivateKey,
    );
    (async () => {
      const didGet = await getAppSessionJWT(setJWT);
      if (didGet) {
        initWallet();
      } else {
        setHasError(1);
      }
    })();
    // return;
    claimUnclaimedBoltzSwaps();
  }, [masterInfoObject, globalContactsInformation]);

  return (
    <GlobalThemeView useStandardWidth={true} styles={styles.globalContainer}>
      {hasError && (
        <TouchableOpacity
          onPress={() => navigate.navigate('SettingsHome', {isDoomsday: true})}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
          }}>
          <ThemeImage
            lightModeIcon={ICONS.settingsIcon}
            darkModeIcon={ICONS.settingsIcon}
            lightsOutIcon={ICONS.settingsWhite}
          />
        </TouchableOpacity>
      )}
      <LottieView
        source={
          theme
            ? require('../../assets/MOSCATWALKING2White.json')
            : require('../../assets/MOSCATWALKING2Blue.json')
        }
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
          color: theme ? COLORS.darkModeText : COLORS.primary,
        }}
        content={hasError ? t(`loadingScreen.errorText${hasError}`) : message}
      />
      {/* {hasError && (
        <CustomButton
          buttonStyles={{
            width: 'auto',
            position: 'absolute',
            bottom: 0,
          }}
          actionFunction={async () => {
            const deleted = await terminateAccount();
            if (deleted) {
              RNRestart.restart();
            } else console.log('ERRROR');
          }}
          textContent={'Terminate account'}
        />
      )} */}
    </GlobalThemeView>
  );

  async function initWallet() {
    console.log('HOME RENDER BREEZ EVENT FIRST LOAD');
    // initBalanceAndTransactions(toggleNodeInformation);

    try {
      const [didConnectToNode, didConnectToLiquidNode] = await Promise.all([
        connectToLightningNode(onBreezEvent),
        connectToLiquidNode(liquidBreezEvent),
      ]);

      // const url = `https://blitz-wallet.com/.netlify/functions/notify?platform=${Platform.OS}&token=${globalContactsInformation.myProfile.uniqueName}`;
      // await registerWebhook(url);

      if (
        (didConnectToNode?.isConnected ||
          !masterInfoObject.liquidWalletSettings.isLightningEnabled) &&
        didConnectToLiquidNode?.isConnected
      ) {
        const [didSetLightning, didSetLiquid] = await Promise.all([
          setNodeInformationForSession(),
          setLiquidNodeInformationForSession(),
        ]);

        if (
          (didSetLightning ||
            !masterInfoObject.liquidWalletSettings.isLightningEnabled) &&
          didSetLiquid
        ) {
          if (deepLinkContent.data.length != 0) {
            if (deepLinkContent.type === 'LN') {
              reset({
                index: 0, // The top-level route index
                routes: [
                  {
                    name: 'HomeAdmin', // Navigate to HomeAdmin
                    params: {
                      screen: 'Home',
                    },
                  },
                  {
                    name: 'ConfirmPaymentScreen', // Navigate to ExpandedAddContactsPage
                    params: {
                      btcAdress: deepLinkContent.data,
                    },
                  },
                ],
                // Array of routes to set in the stack
              });
              setDeepLinkContent({type: '', data: ''});
              return;
            } else if (deepLinkContent.type === 'Contact') {
              const deepLinkContact = await getDeepLinkUser({
                deepLinkContent: deepLinkContent.data,
                userProfile: globalContactsInformation.myProfile,
              });

              if (deepLinkContact.didWork) {
                reset({
                  index: 0, // The top-level route index
                  routes: [
                    {
                      name: 'HomeAdmin', // Navigate to HomeAdmin
                      params: {
                        screen: 'Home',
                      },
                    },
                    {
                      name: 'HomeAdmin', // Navigate to HomeAdmin
                      params: {
                        screen: 'ContactsPageInit',
                      },
                    },
                    {
                      name: 'ExpandedAddContactsPage', // Navigate to ExpandedAddContactsPage
                      params: {
                        newContact: deepLinkContact.data,
                      },
                    },
                  ],
                  // Array of routes to set in the stack
                });
                // navigate.replace('ExpandedAddContactsPage', {
                //   newContact: deepLinkContact.data,
                // });
                setDeepLinkContent({type: '', data: ''});
              } else {
                setDeepLinkContent({type: '', data: ''});
                reset({
                  index: 0, // The top-level route index
                  routes: [
                    {
                      name: 'HomeAdmin', // Navigate to HomeAdmin
                      params: {
                        screen: 'Home',
                      },
                    },
                    {
                      name: 'ErrorScreen', // Navigate to HomeAdmin
                      params: {
                        errorMessage: `${deepLinkContact.reason}`,
                      },
                    },
                  ],
                  // Array of routes to set in the stack
                });
              }

              return;
            }
          }

          const autoWorkData =
            process.env.BOLTZ_ENVIRONMENT === 'testnet' ||
            AppState.currentState !== 'active'
              ? Promise.resolve({didRun: false}) // Wrap in Promise
              : autoChannelRebalance({
                  nodeInformation: didSetLightning,
                  liquidNodeInformation: didSetLiquid,
                  masterInfoObject,
                  currentMint,
                  eCashBalance,
                });

          // Then await before logging
          const resolvedData = await autoWorkData;
          console.log('AUTO WORK DATA', resolvedData);

          if (!resolvedData.didRun) {
            reset({
              index: 0,
              routes: [
                {
                  name: 'HomeAdmin',
                  params: {
                    screen: 'Home',
                  },
                },
              ],
            });
            return;
          }

          if (resolvedData.type == 'reverseSwap') {
            if (resolvedData.isEcash) {
              const didSendEcashPayment = await sendEcashPayment(
                resolvedData.invoice,
              );

              if (
                didSendEcashPayment.proofsToUse &&
                didSendEcashPayment.quote
              ) {
                seteCashNavigate(navigate);
                setEcashPaymentInformation({
                  quote: didSendEcashPayment.quote,
                  invoice: resolvedData.invoice,
                  proofsToUse: didSendEcashPayment.proofsToUse,
                  isAutoChannelRebalance: true,
                });
              } else {
                reset({
                  index: 0,
                  routes: [
                    {
                      name: 'HomeAdmin',
                      params: {
                        screen: 'Home',
                      },
                    },
                  ],
                });
              }
            } else {
              const parsedInvoice = await parseInput(resolvedData.invoice);
              console.log(parsedInvoice);
              await breezPaymentWrapper({
                paymentInfo: parsedInvoice,
                paymentDescription: 'Auto Channel Rebalance',
                failureFunction: () => {
                  reset({
                    index: 0,
                    routes: [
                      {
                        name: 'HomeAdmin',
                        params: {
                          screen: 'Home',
                        },
                      },
                    ],
                  });
                },
                confirmFunction: () => {
                  reset({
                    index: 0,
                    routes: [
                      {
                        name: 'HomeAdmin',
                        params: {
                          screen: 'Home',
                        },
                      },
                    ],
                  });
                },
              });
            }
          } else {
            const response = await breezLiquidPaymentWrapper({
              paymentType: 'bolt11',
              invoice: resolvedData.invoice.lnInvoice.bolt11,
            });

            if (response)
              reset({
                index: 0,
                routes: [
                  {
                    name: 'HomeAdmin',
                    params: {
                      screen: 'Home',
                    },
                  },
                ],
              });
          }

          return;
          // setWebViewArgs({navigate: navigate, page: 'loadingScreen'});

          // const webSocket = new WebSocket(
          //   `${getBoltzWsUrl(process.env.BOLTZ_ENVIRONMENT)}`,
          // );

          // if (autoWorkData.type === 'ln-liquid') {
          //   const didHandle = await handleReverseClaimWSS({
          //     ref: webViewRef,
          //     webSocket: webSocket,
          //     liquidAddress: autoWorkData.invoice,
          //     swapInfo: autoWorkData.swapInfo,
          //     preimage: autoWorkData.preimage,
          //     privateKey: autoWorkData.privateKey,
          //     navigate,
          //   });

          //   if (didHandle) {
          //     try {
          //       if (autoWorkData.isEcash) {
          //         console.log(autoWorkData.swapInfo.invoice);
          //         const didSendEcashPayment = await sendEcashPayment(
          //           autoWorkData.swapInfo.invoice,
          //         );

          //         console.log(didSendEcashPayment);

          //         if (
          //           didSendEcashPayment.proofsToUse &&
          //           didSendEcashPayment.quote
          //         ) {
          //           seteCashNavigate(navigate);
          //           setEcashPaymentInformation({
          //             quote: didSendEcashPayment.quote,
          //             invoice: autoWorkData.swapInfo.invoice,
          //             proofsToUse: didSendEcashPayment.proofsToUse,
          //             isAutoChannelRebalance: true,
          //           });
          //         } else {
          //           reset({
          //             index: 0, // The top-level route index
          //             routes: [
          //               {
          //                 name: 'HomeAdmin', // Navigate to HomeAdmin
          //                 params: {
          //                   screen: 'Home',
          //                 },
          //               },
          //             ],
          //             // Array of routes to set in the stack
          //           });
          //         }
          //         // send ecash payment
          //       } else {
          //         const parsedInvoice = await parseInput(
          //           autoWorkData.swapInfo.invoice,
          //         );
          //         const didSend = await breezPaymentWrapper({
          //           paymentInfo: parsedInvoice,
          //           paymentDescription: 'Auto Channel Rebalance',
          //         });
          //         if (!didSend) {
          //           webSocket.close();
          //           reset({
          //             index: 0,
          //             routes: [
          //               {
          //                 name: 'HomeAdmin',
          //                 params: {
          //                   screen: 'Home',
          //                 },
          //               },
          //             ],
          //           });
          //         }
          //         // await sendPayment({bolt11: autoWorkData.swapInfo.invoice});
          //       }
          //       console.log('SEND LN PAYMENT');
          //     } catch (err) {
          //       webSocket.close();
          //       console.log(err);
          //       throw new Error('swap error');
          //       // throw new Error('error sending payment');
          //     }
          //   }
          // } else {
          //   const refundJSON = {
          //     id: autoWorkData.swapInfo.id,
          //     asset: 'L-BTC',
          //     version: 3,
          //     privateKey: autoWorkData.privateKey,
          //     blindingKey: autoWorkData.swapInfo.blindingKey,
          //     claimPublicKey: autoWorkData.swapInfo.claimPublicKey,
          //     timeoutBlockHeight: autoWorkData.swapInfo.timeoutBlockHeight,
          //     swapTree: autoWorkData.swapInfo.swapTree,
          //   };

          //   // toggleMasterInfoObject({
          //   //   liquidSwaps: [...masterInfoObject.liquidSwaps].concat(refundJSON),
          //   // });
          //   const didHandle = await handleSubmarineClaimWSS({
          //     ref: webViewRef,
          //     webSocket: webSocket,
          //     invoiceAddress: autoWorkData.invoice,
          //     swapInfo: autoWorkData.swapInfo,
          //     privateKey: autoWorkData.privateKey,
          //     toggleMasterInfoObject,
          //     masterInfoObject,
          //     contactsPrivateKey,
          //     refundJSON,
          //     navigate,
          //     page: 'loadingScreen',
          //   });

          //   if (didHandle) {
          //     try {
          //       if (AppState.currentState !== 'active') {
          //         webSocket.close();
          //         reset({
          //           index: 0, // The top-level route index
          //           routes: [
          //             {
          //               name: 'HomeAdmin', // Navigate to HomeAdmin
          //               params: {
          //                 screen: 'Home',
          //               },
          //             },
          //           ],
          //         });
          //         return;
          //       }
          //       const didSend = await sendLiquidTransaction(
          //         autoWorkData.swapInfo.expectedAmount,
          //         autoWorkData.swapInfo.address,
          //         true,
          //         true,
          //         toggleSavedIds,
          //       );
          //       if (!didSend) {
          //         reset({
          //           index: 0, // The top-level route index
          //           routes: [
          //             {
          //               name: 'HomeAdmin', // Navigate to HomeAdmin
          //               params: {
          //                 screen: 'Home',
          //               },
          //             },
          //           ],
          //         });
          //         webSocket.close();
          //       }
          //       console.log('SEND LIQUID PAYMENT');
          //     } catch (err) {
          //       webSocket.close();
          //       throw new Error('error sending payment');
          //     }
          //   }
          // }
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

  async function setupFiatCurrencies() {
    const fiat = await fetchFiatRates();
    const currency = masterInfoObject.fiatCurrency;
    const currenies = await listFiatCurrencies();

    const sourted = currenies.sort((a, b) => a.id.localeCompare(b.id));

    const [fiatRate] = fiat.filter(rate => {
      return rate.coin.toLowerCase() === currency.toLowerCase();
    });
    if (masterInfoObject?.fiatCurrenciesList?.length < 1)
      toggleMasterInfoObject({fiatCurrenciesList: sourted});

    return fiatRate;
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
      // const currenies = await listFiatCurrencies();

      // const sourted = currenies.sort((a, b) => a.id.localeCompare(b.id));

      const [fiatRate] = fiat.filter(rate => {
        return rate.coin.toLowerCase() === currency.toLowerCase();
      });

      const didConnectToLSP = await (nodeState.connectedPeers.length != 0
        ? Promise.resolve(true)
        : reconnectToLSP(msatToSat));

      if (heath.status !== 'operational')
        throw Error('Breez undergoing maintenence');
      if (didConnectToLSP) {
        // await receivePayment({
        //   amountMsat: 50000000,
        //   description: '',
        // });

        // if (masterInfoObject?.fiatCurrenciesList?.length < 1)
        //   toggleMasterInfoObject({fiatCurrenciesList: sourted});
        toggleNodeInformation({
          didConnectToNode: true,
          transactions: transactions,
          userBalance: msatToSat,
          inboundLiquidityMsat: nodeState.totalInboundLiquidityMsats,
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
            inboundLiquidityMsat: nodeState.totalInboundLiquidityMsats,
            blockHeight: nodeState.blockHeight,
            onChainBalance: nodeState.onchainBalanceMsat,
            fiatStats: fiatRate,
            lsp: lspInfo,
          });
        });
      } else {
        toggleNodeInformation({
          didConnectToNode: false,
          transactions: transactions,
          userBalance: msatToSat,
          inboundLiquidityMsat: nodeState.totalInboundLiquidityMsats,
          blockHeight: nodeState.blockHeight,
          onChainBalance: nodeState.onchainBalanceMsat,
          // fiatStats: fiatRate,
          lsp: lspInfo,
        });

        return new Promise(resolve => {
          resolve({
            didConnectToNode: false,
            transactions: transactions,
            userBalance: msatToSat,
            inboundLiquidityMsat: nodeState.totalInboundLiquidityMsats,
            blockHeight: nodeState.blockHeight,
            onChainBalance: nodeState.onchainBalanceMsat,
            // fiatStats: fiatRate,
            lsp: lspInfo,
          });
        });
      }

      // if (
      //   masterInfoObject.liquidWalletSettings.regulateChannelOpen &&
      //   nodeState.channelsBalanceMsat === 0
      // ) {
      //   toggleNodeInformation({
      //     didConnectToNode: true,
      //     // transactions: transactions,
      //     // userBalance: msatToSat,
      //     // inboundLiquidityMsat: nodeState.inboundLiquidityMsats,
      //     // blockHeight: nodeState.blockHeight,
      //     // onChainBalance: nodeState.onchainBalanceMsat,
      //     // fiatStats: fiatRate,
      //     // lsp: lspInfo,
      //   });

      //   return new Promise(resolve => {
      //     resolve({
      //       didConnectToNode: true,
      //       transactions: transactions,
      //       userBalance: msatToSat,
      //       inboundLiquidityMsat: nodeState.totalInboundLiquidityMsats,
      //       blockHeight: nodeState.blockHeight,
      //       onChainBalance: nodeState.onchainBalanceMsat,
      //       // fiatStats: fiatRate,
      //       lsp: lspInfo,
      //     });
      //   });
      // } else throw new Error('something went wrong');
    } catch (err) {
      console.log(err, 'TESTING');
      return new Promise(resolve => {
        resolve(false);
      });
    }
  }

  async function setLiquidNodeInformationForSession() {
    try {
      const info = await getInfo();
      const balanceSat = info.balanceSat;
      const payments = await listPayments({});
      await rescanOnchainSwaps();
      const currentLimits = await fetchLightningLimits();
      const fiat_rate = await setupFiatCurrencies();

      if (
        !globalContactsInformation.myProfile.receiveAddress ||
        isMoreThan7DaysPast(globalContactsInformation.myProfile.lastRotated)
      ) {
        const addressResponse = await breezLiquidReceivePaymentWrapper({
          paymentType: 'liquid',
        });
        const {destination, receiveFeesSat} = addressResponse;
        console.log('LIQUID DESTINATION ADDRESS', destination);
        console.log(destination);
        toggleGlobalContactsInformation(
          {
            myProfile: {
              ...globalContactsInformation.myProfile,
              receiveAddress: destination,
              lastRotated: getDateXDaysAgo(0),
            },
          },
          true,
        );
        toggleMasterInfoObject({
          posSettings: {
            ...masterInfoObject.posSettings,
            receiveAddress: destination,
            lastRotated: getDateXDaysAgo(0),
          },
        });
      }

      setMinMaxLiquidSwapAmounts(prev => {
        return {
          ...prev,
          min: currentLimits.receive.minSat,
          max: currentLimits.receive.maxSat,
          maxZeroConf: currentLimits.receive.maxZeroConfSat,
          receive: currentLimits.receive,
          send: currentLimits.send,
        };
      });

      const liquidNodeObject = {
        transactions: payments,
        userBalance: balanceSat,
        pendingReceive: info.pendingReceiveSat,
        pendingSend: info.pendingSendSat,
      };
      toggleLiquidNodeInformation(liquidNodeObject);
      toggleNodeInformation({fiatStats: fiat_rate});

      return liquidNodeObject;
    } catch (err) {
      console.log(err, 'LIQUID INFORMATION ERROR');

      return new Promise(resolve => {
        resolve(false);
      });
    }
  }
}

async function getAppSessionJWT(setJWT) {
  try {
    const mnemonic = (await retrieveData('mnemonic'))
      .split(' ')
      .filter(word => word.length > 0)
      .join(' ');

    const privateKey = nostr.nip06.privateKeyFromSeedWords(mnemonic);
    const publicKey = getPublicKey(privateKey);
    const appCheckToken = await getAppCheckToken();
    if (!appCheckToken.didWork) return false;
    const response = await fetch(process.env.CREATE_JWT_URL, {
      method: 'POST',
      headers: {'X-Firebase-AppCheck': appCheckToken.token},
      body: JSON.stringify({
        // appPubKey: publicKey,
        // checkContent: encriptMessage(
        //   privateKey,
        //   process.env.BACKEND_PUB_KEY,
        //   JSON.stringify({
        //     checkHash: sha256Hash(mnemonic),
        //     sendTime: new Date(),
        //   }),
        // ),
        id: DeviceInfo.getDeviceId(),
      }),
    });
    const data = await response.json();

    setLocalStorageItem('blitzWalletJWT', JSON.stringify(data.token));
    setJWT(data.token);
    return true;
  } catch (err) {
    console.log(err, 'APP SESSION JWT');
    return false;
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingText: {
    width: 300,
    marginTop: 10,
    textAlign: 'center',
    color: COLORS.primary,
  },
});
