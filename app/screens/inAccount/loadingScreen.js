import {
  ActivityIndicator,
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
  serviceHealthCheck,
  setLogStream,
  withdrawLnurl,
} from '@breeztech/react-native-breez-sdk';
import {connectToNode} from '../../functions';
import {getTransactions} from '../../functions/SDK';
import {useTranslation} from 'react-i18next';
import {
  connectToRelay,
  generateNostrProfile,
  getConnectToRelayInfo,
} from '../../functions/noster';
import receiveEventListener from '../../functions/noster/receiveEventListener';
import {useNavigation} from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import {generateRandomContact} from '../../functions/contacts';
import {connectToAlby} from '../../functions/messaging/getToken';
import {initializeAblyFromHistory} from '../../functions/messaging/initalizeAlbyFromHistory';
import {
  createSubAccount,
  gdk,
  getSubAccounts,
  startGDKSession,
} from '../../functions/liquidWallet';
import {assetIDS} from '../../functions/liquidWallet/assetIDS';
import autoChannelRebalance from '../../functions/liquidWallet/autoChannelRebalance';
import initializeUserSettingsFromHistory from '../../functions/initializeUserSettings';

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
  const [connecting, setIsConnecting] = useState(true);
  const [giftCode, setGiftCode] = useState('');
  const [isClaimingGift, setIsClaimingGift] = useState(false);

  //gets data from either firebase or local storage to load users saved settings
  // const fromGiftPath = route?.params?.fromGiftPath;
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

    // initializeAblyFromHistory(
    //   toggleMasterInfoObject,
    //   masterInfoObject,
    //   masterInfoObject.contacts.myProfile.uuid,
    //   contactsPrivateKey,
    // );

    // return;

    try {
      const liquidSession = await startGDKSession();
      const lightningSession =
        // {isConnected: true} ||
        await connectToNode(onBreezEvent, isInitialLoad);

      // initializeAblyFromHistory(
      //   toggleMasterInfoObject,
      //   masterInfoObject,
      //   masterInfoObject.contacts.myProfile.uuid,
      //   contactsPrivateKey,
      // );
      // navigate.replace('HomeAdmin');
      // return;
      // if (fromGiftPath) {
      //   if (lightningSession?.isConnected) {
      //     const didSet = await setNodeInformationForSession();
      //     const didSetLiquid = await setLiquidNodeInformationForSession();

      //     if (didSet && didSetLiquid) {
      //       setIsConnecting(false);

      //       navigate.navigate('CameraModal', {
      //         updateBitcoinAdressFunc: setGiftCode,
      //       });
      //       return;
      //     } else setHasError(1);
      //   } else setHasError(1);

      //   console.log('GIFT PATH');
      //   return;
      // }

      if (lightningSession?.isConnected && liquidSession) {
        const didSetLightning = true || (await setNodeInformationForSession());
        const didSetLiquid = await setLiquidNodeInformationForSession();

        toggleNodeInformation({
          didConnectToNode: true,
        });

        const didAutoWork =
          true ||
          (await autoChannelRebalance(
            nodeInformation,
            liquidNodeInformation,
            masterInfoObject,
            toggleMasterInfoObject,
          ));

        if (didSetLightning && didSetLiquid && didAutoWork)
          navigate.replace('HomeAdmin');
        else
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
  async function reconnectToLSP(lspInfo) {
    try {
      // const availableLsps = await listLsps();

      console.log(lspInfo, 'TT');
      await connectLsp(lspInfo[0].id);
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
      // const nodeState = await nodeInfo();
      // const transactions = await getTransactions();
      const heath = await serviceHealthCheck();
      // const msatToSat = nodeState.channelsBalanceMsat / 1000;
      // console.log(nodeState, heath, 'TESTIGg');
      const fiat = await fetchFiatRates();
      // const lspInfo = await listLsps();
      const currency = masterInfoObject.currency;

      const [fiatRate] = fiat.filter(rate => {
        return rate.coin.toLowerCase() === currency.toLowerCase();
      });

      const didConnectToLSP =
        (false && nodeState.connectedPeers.length != 0) ||
        (await reconnectToLSP(lspInfo));

      if (didConnectToLSP) {
        await receivePayment({
          amountMsat: 50000000,
          description: '',
        });

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
          resolve(true);
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
          resolve(true);
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
        // transaction.transactions[0].
        toggleLiquidNodeInformation({
          transactions: transaction.transactions,
          userBalance: liquidBalance,
        });
        return new Promise(resolve => {
          resolve(true);
        });
      } else {
        return new Promise(resolve => {
          setTimeout(async () => {
            const didCreateSubAccount = await createSubAccount();

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
                transaction: [],
                userBalance: 0,
              });

              resolve(true);
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

  async function redeemGift() {
    try {
      const input = await parseInput(giftCode);

      if (input.type === InputTypeVariant.LN_URL_WITHDRAW) {
        try {
          setIsClaimingGift(true);
          await withdrawLnurl({
            data: input.data,
            amountMsat: input.data.minWithdrawable,
            description: input.data.defaultDescription,
          });
        } catch (err) {
          console.log(err);
          navigate.navigate('ErrorScreen', {
            errorMessage: 'Error while claiming gift',
          });
        }
      } else throw new Error('not a valid gift');
    } catch (err) {
      navigate.navigate('ErrorScreen', {errorMessage: 'Not a valid gift code'});
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
    width: '95%',
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
    marginTop: 20,
    textAlign: 'center',
  },
});
