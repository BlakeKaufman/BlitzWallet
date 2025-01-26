import {AppState, Platform, StyleSheet, TouchableOpacity} from 'react-native';
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
import {breezPaymentWrapper, getTransactions} from '../../functions/SDK';
import {useTranslation} from 'react-i18next';
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
import {useNavigation} from '@react-navigation/native';
import ThemeImage from '../../functions/CustomElements/themeImage';
import {
  fetchFiatRates,
  fetchLightningLimits,
  getInfo,
  listFiatCurrencies,
  listPayments,
  rescanOnchainSwaps,
} from '@breeztech/react-native-breez-sdk-liquid';
import connectToLightningNode from '../../functions/connectToLightning';
import connectToLiquidNode from '../../functions/connectToLiquid';
import {
  breezLiquidPaymentWrapper,
  breezLiquidReceivePaymentWrapper,
} from '../../functions/breezLiquid';
import {initializeDatabase} from '../../functions/messaging/cachedMessages';
import {useLiquidEvent} from '../../../context-store/liquidEventContext';
import {useLightningEvent} from '../../../context-store/lightningEventContext';
export default function ConnectingToNodeLoadingScreen({
  navigation: {reset},
  route,
}) {
  const navigate = useNavigation();
  const {onLightningBreezEvent} = useLightningEvent();
  const {onLiquidBreezEvent} = useLiquidEvent();
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
    // setJWT,
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
      const didOpen = await initializeDatabase();
      if (!didOpen) {
        setHasError('Not able to open database');
        return;
      }
      const didSet = await initializeUserSettingsFromHistory({
        setContactsPrivateKey,
        toggleMasterInfoObject,
        setMasterInfoObject,
        toggleGlobalContactsInformation,
        toggleGLobalEcashInformation,
        toggleGlobalAppDataInformation,
      });

      //waits for data to be loaded untill login process can start
      if (!didSet) {
        setHasError('Not able to get account information');
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

    initWallet();
    claimUnclaimedBoltzSwaps();
  }, [masterInfoObject, globalContactsInformation]);

  return (
    <GlobalThemeView useStandardWidth={true} styles={styles.globalContainer}>
      {hasError && (
        <TouchableOpacity
          onPress={() => navigate.navigate('SettingsHome', {isDoomsday: true})}
          style={styles.doomsday}>
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
        content={hasError ? hasError : message}
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
      const [didConnectToNode, didConnectToLiquidNode] = await (masterInfoObject
        .liquidWalletSettings.isLightningEnabled
        ? Promise.all([
            connectToLightningNode(onLightningBreezEvent),
            connectToLiquidNode(onLiquidBreezEvent),
          ])
        : Promise.all([
            Promise.resolve({isConnected: true}),
            connectToLiquidNode(onLiquidBreezEvent),
          ]));

      if (
        (didConnectToNode?.isConnected ||
          !masterInfoObject.liquidWalletSettings.isLightningEnabled) &&
        didConnectToLiquidNode?.isConnected
      ) {
        const [didSetLightning, didSetLiquid] = await (masterInfoObject
          .liquidWalletSettings.isLightningEnabled
          ? Promise.all([
              setNodeInformationForSession(didConnectToNode?.node_info),
              setLiquidNodeInformationForSession(
                didConnectToLiquidNode?.liquid_node_info,
              ),
            ])
          : Promise.all([
              Promise.resolve({}),
              setLiquidNodeInformationForSession(
                didConnectToLiquidNode?.liquid_node_info,
              ),
            ]));

        if (
          (didSetLightning ||
            !masterInfoObject.liquidWalletSettings.isLightningEnabled) &&
          didSetLiquid
        ) {
          if (isInitialLoad || didRestoreWallet) {
            await new Promise(res => setTimeout(res, 5000));
            // A small buffer. Helps to make the transition to the hompage smoother on initial load as there are many write opperations happening
          }
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
        } else
          throw new Error(
            'Either lightning or liquid nodde did not set up properly',
          );
      } else throw new Error('something went wrong');
    } catch (err) {
      toggleNodeInformation({
        didConnectToNode: false,
      });
      setHasError(JSON.stringify(err));
      console.log(err, 'homepage connection to node err');
    }
  }
  async function reconnectToLSP(lspInfo) {
    try {
      const availableLsps = lspInfo;
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

    const [fiatRate] = fiat.filter(rate => {
      return rate.coin.toLowerCase() === currency.toLowerCase();
    });
    if (masterInfoObject?.fiatCurrenciesList?.length < 1) {
      const currenies = await listFiatCurrencies();
      const sourted = currenies.sort((a, b) => a.id.localeCompare(b.id));
      toggleMasterInfoObject({fiatCurrenciesList: sourted});
    }

    return fiatRate;
  }

  async function setNodeInformationForSession(retrivedNodeInfo) {
    try {
      const nodeState = await (retrivedNodeInfo
        ? Promise.resolve(retrivedNodeInfo)
        : nodeInfo());
      const transactions = await getTransactions();
      const heath = await serviceHealthCheck(process.env.API_KEY);
      const msatToSat = nodeState.channelsBalanceMsat / 1000;
      console.log(nodeState, heath, 'TESTIGg');
      // const fiat = await fetchFiatRates();
      const lspInfo = await listLsps();

      // const currency = masterInfoObject.fiatCurrency;
      // const currenies = await listFiatCurrencies();

      // const sourted = currenies.sort((a, b) => a.id.localeCompare(b.id));

      // const [fiatRate] = fiat.filter(rate => {
      //   return rate.coin.toLowerCase() === currency.toLowerCase();
      // });

      const didConnectToLSP = await (nodeState.connectedPeers.length != 0
        ? Promise.resolve(true)
        : reconnectToLSP(lspInfo));

      if (heath.status !== 'operational')
        throw Error('Breez undergoing maintenence');

      const nodeObject = {
        didConnectToNode: didConnectToLSP,
        transactions: transactions,
        userBalance: msatToSat,
        inboundLiquidityMsat: nodeState.totalInboundLiquidityMsats,
        blockHeight: nodeState.blockHeight,
        onChainBalance: nodeState.onchainBalanceMsat,
        // fiatStats: fiatRate,
        lsp: lspInfo,
      };
      toggleNodeInformation(nodeObject);
      return nodeObject;
    } catch (err) {
      console.log(err, 'TESTING');
      return new Promise(resolve => {
        resolve(false);
      });
    }
  }

  async function setLiquidNodeInformationForSession(retrivedLiquidNodeInfo) {
    try {
      const parsedInformation = await (retrivedLiquidNodeInfo
        ? Promise.resolve(retrivedLiquidNodeInfo)
        : getInfo());
      const info = parsedInformation.walletInfo;
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

      let liquidNodeObject = {
        transactions: payments,
        userBalance: balanceSat,
        pendingReceive: info.pendingReceiveSat,
        pendingSend: info.pendingSendSat,
      };

      toggleNodeInformation({fiatStats: fiat_rate});

      console.log(
        didRestoreWallet,
        payments.length,
        !payments.length,
        'CHEKCING RETRY LOGIC',
      );

      if (didRestoreWallet && !payments.length) {
        let runCount = 0;
        while (runCount < 2) {
          console.log('RUNNING RETRY');
          runCount += 1;
          const restoreWalletInfo = await getInfo();

          const restoreWalletBalance = restoreWalletInfo.walletInfo.balanceSat;
          const restoreWalletPayments = await listPayments({});

          console.log(
            restoreWalletInfo.walletInfo.balanceSat,
            restoreWalletPayments.length,
            'RETRY INFO',
          );

          if (restoreWalletPayments.length) {
            liquidNodeObject = {
              transactions: restoreWalletPayments,
              userBalance: restoreWalletBalance,
              pendingReceive: restoreWalletInfo.walletInfo.pendingReceiveSat,
              pendingSend: restoreWalletInfo.walletInfo.pendingSendSat,
            };
            break;
          } else {
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }
      }

      toggleLiquidNodeInformation(liquidNodeObject);

      return liquidNodeObject;
    } catch (err) {
      console.log(err, 'LIQUID INFORMATION ERROR');

      return new Promise(resolve => {
        resolve(false);
      });
    }
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
  doomsday: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
