import {
  AppState,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {COLORS, FONT, ICONS} from '../../constants';
import {useGlobalContextProvider} from '../../../context-store/context';
import {useEffect, useRef, useState} from 'react';
import {
  connectLsp,
  fetchFiatRates,
  listFiatCurrencies,
  listLsps,
  nodeInfo,
  parseInput,
  registerWebhook,
  sendPayment,
  serviceHealthCheck,
} from '@breeztech/react-native-breez-sdk';
import {
  connectToNode,
  retrieveData,
  setLocalStorageItem,
  terminateAccount,
} from '../../functions';
import {breezPaymentWrapper, getTransactions} from '../../functions/SDK';
import {useTranslation} from 'react-i18next';
import {initializeAblyFromHistory} from '../../functions/messaging/initalizeAlbyFromHistory';
import RNRestart from 'react-native-restart';
import {
  createLiquidReceiveAddress,
  sendLiquidTransaction,
  updateLiquidWalletInformation,
} from '../../functions/liquidWallet';
// import {assetIDS} from '../../functions/liquidWallet/assetIDS';
import autoChannelRebalance from '../../functions/liquidWallet/autoChannelRebalance';
import initializeUserSettingsFromHistory from '../../functions/initializeUserSettings';
// import {queryContacts} from '../../../db';
// import handleWebviewClaimMessage from '../../functions/boltz/handle-webview-claim-message';
import {getBoltzWsUrl} from '../../functions/boltz/boltzEndpoitns';

import handleReverseClaimWSS from '../../functions/boltz/handle-reverse-claim-wss';
import handleSubmarineClaimWSS from '../../functions/boltz/handle-submarine-claim-wss';

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
import useGlobalOnBreezEvent from '../../hooks/globalOnBreezEvent';
import {useNavigation} from '@react-navigation/native';
import CustomButton from '../../functions/CustomElements/button';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ANDROIDSAFEAREA, CENTER} from '../../constants/styles';
import ThemeImage from '../../functions/CustomElements/themeImage';
import axios from 'axios';
import * as nostr from 'nostr-tools';
import {getPublicKey} from 'nostr-tools';
import {encriptMessage} from '../../functions/messaging/encodingAndDecodingMessages';
import sha256Hash from '../../functions/hash';
import DeviceInfo from 'react-native-device-info';
export default function ConnectingToNodeLoadingScreen({
  navigation: {reset},
  route,
}) {
  const navigate = useNavigation();
  const onBreezEvent = useGlobalOnBreezEvent();
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

  const {webViewRef, setWebViewArgs, toggleSavedIds} = useWebView();
  const {
    decodedAddedContacts,
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
  const insets = useSafeAreaInsets();

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
      // const liquidSession = await startGDKSession();
      const lightningSession = await connectToNode(onBreezEvent);
      const didSetLiquid = await setLiquidNodeInformationForSession();
      // const url = `https://blitz-wallet.com/.netlify/functions/notify?platform=${Platform.OS}&token=${globalContactsInformation.myProfile.uniqueName}`;
      // await registerWebhook(url);

      // console.log('isInitalLoad', isInitialLoad);

      if (lightningSession?.isConnected) {
        const didSetLightning = await setNodeInformationForSession(
          lightningSession?.node_info,
        );

        // toggleNodeInformation({
        //   didConnectToNode: true,
        // });

        if (didSetLightning && didSetLiquid) {
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
            AppState.currentState !== 'active' ||
            (await autoChannelRebalance({
              nodeInformation: didSetLightning,
              liquidNodeInformation: didSetLiquid,
              masterInfoObject,
              currentMint,
              eCashBalance,
            }));

          if (!autoWorkData.didRun) {
            reset({
              index: 0, // The top-level route index
              routes: [
                {
                  name: 'HomeAdmin', // Navigate to HomeAdmin
                  params: {
                    screen: 'Home',
                  },
                },
              ],
              // Array of routes to set in the stack
            });
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
                    reset({
                      index: 0, // The top-level route index
                      routes: [
                        {
                          name: 'HomeAdmin', // Navigate to HomeAdmin
                          params: {
                            screen: 'Home',
                          },
                        },
                      ],
                      // Array of routes to set in the stack
                    });
                  }
                  // send ecash payment
                } else {
                  const parsedInvoice = await parseInput(
                    autoWorkData.swapInfo.invoice,
                  );
                  const didSend = await breezPaymentWrapper({
                    paymentInfo: parsedInvoice,
                    paymentDescription: 'Auto Channel Rebalance',
                  });
                  if (!didSend) {
                    webSocket.close();
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
                  // await sendPayment({bolt11: autoWorkData.swapInfo.invoice});
                }
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
                if (AppState.currentState !== 'active') {
                  webSocket.close();
                  reset({
                    index: 0, // The top-level route index
                    routes: [
                      {
                        name: 'HomeAdmin', // Navigate to HomeAdmin
                        params: {
                          screen: 'Home',
                        },
                      },
                    ],
                  });
                  return;
                }
                const didSend = await sendLiquidTransaction(
                  autoWorkData.swapInfo.expectedAmount,
                  autoWorkData.swapInfo.address,
                  true,
                  true,
                  toggleSavedIds,
                );
                if (!didSend) {
                  reset({
                    index: 0, // The top-level route index
                    routes: [
                      {
                        name: 'HomeAdmin', // Navigate to HomeAdmin
                        params: {
                          screen: 'Home',
                        },
                      },
                    ],
                  });
                  webSocket.close();
                }
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
  async function reconnectToLSP(nodeInformation) {
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
        resolve(nodeInformation.userBalance === 0 ? true : false);
      });
    }
  }

  async function setNodeInformationForSession(node_info) {
    try {
      const nodeState = node_info || (await nodeInfo());
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
        nodeState.connectedPeers.length != 0 ||
        (await reconnectToLSP(nodeInformation));

      if (heath.status !== 'operational')
        throw Error('Breez undergoing maintenence');
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
            inboundLiquidityMsat: nodeState.totalInboundLiquidityMsats,
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
      const didSet = await updateLiquidWalletInformation({
        toggleLiquidNodeInformation,
      });

      return {
        transactions: didSet.transactions,
        userBalance: didSet.balance,
      };
    } catch (err) {
      console.log(err);
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

    const {data} = await axios.post(process.env.CREATE_JWT_URL, {
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
    });

    setLocalStorageItem('blitzWalletJWT', JSON.stringify(data.token));
    setJWT(data.token);
    return true;
  } catch (err) {
    console.log(err);
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
