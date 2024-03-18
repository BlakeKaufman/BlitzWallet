import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {COLORS, FONT, SIZES} from '../../constants';
import {useGlobalContextProvider} from '../../../context-store/context';
import globalOnBreezEvent from '../../functions/globalOnBreezEvent';
import * as nostr from 'nostr-tools';
import {useEffect, useState} from 'react';
import {
  connectLsp,
  fetchFiatRates,
  listLsps,
  lspInfo,
  nodeInfo,
  receivePayment,
  serviceHealthCheck,
  setLogStream,
} from '@breeztech/react-native-breez-sdk';
import {
  connectToNode,
  getLocalStorageItem,
  retrieveData,
  setLocalStorageItem,
  storeData,
} from '../../functions';
import {getTransactions} from '../../functions/SDK';
import {useTranslation} from 'react-i18next';
import {
  connectToRelay,
  generateNostrProfile,
  getConnectToRelayInfo,
} from '../../functions/noster';
import receiveEventListener from '../../functions/noster/receiveEventListener';

export default function ConnectingToNodeLoadingScreen({navigation: navigate}) {
  const onBreezEvent = globalOnBreezEvent(navigate);
  const {
    theme,
    toggleNodeInformation,
    toggleNostrSocket,
    toggleNostrEvents,
    toggleNostrContacts,
    nostrContacts,
  } = useGlobalContextProvider();
  const [hasError, setHasError] = useState(null);
  const {t} = useTranslation();

  useEffect(() => {
    initWallet();
  }, []);

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
    try {
      const savedBreezInfo = await getLocalStorageItem('breezInfo');

      if (savedBreezInfo) {
        toggleNodeInformation({
          didConnectToNode: false,
          transactions: JSON.parse(savedBreezInfo)[0],
          userBalance: JSON.parse(savedBreezInfo)[1],
          inboundLiquidityMsat: JSON.parse(savedBreezInfo)[2],
          blockHeight: JSON.parse(savedBreezInfo)[3],
          onChainBalance: JSON.parse(savedBreezInfo)[4],
          fiatStats: JSON.parse(savedBreezInfo)[5],
        });
      }
    } catch (err) {
      console.log(err);
    }
  }
  async function initWallet() {
    console.log('HOME RENDER BREEZ EVENT FIRST LOAD');

    initBalanceAndTransactions(toggleNodeInformation);

    try {
      const [generatedNostrProfile, pubKeyOfContacts] =
        await getConnectToRelayInfo();

      connectToRelay(
        pubKeyOfContacts,
        generatedNostrProfile.privKey,
        generatedNostrProfile.pubKey,
        receiveEventListener,
        toggleNostrSocket,
        toggleNostrEvents,
        toggleNostrContacts,
        nostrContacts,
      );
      navigate.replace('HomeAdmin');
      return;
      const response = await connectToNode(onBreezEvent);
      // console.log(response);
      // setErrMessage(response.errMessage);

      if (response.isConnected) {
        const nodeState = await nodeInfo();
        const transactions = await getTransactions();
        const heath = await serviceHealthCheck();
        const msatToSat = nodeState.channelsBalanceMsat / 1000;
        console.log(nodeState, heath, 'TESTIGg');
        const fiat = await fetchFiatRates();
        const currency = await getLocalStorageItem('currency');
        if (!currency) setLocalStorageItem('currency', 'USD');
        const userSelectedFiat = currency ? currency : 'USD';
        const [fiatRate] = fiat.filter(rate => {
          return rate.coin.toLowerCase() === userSelectedFiat.toLowerCase();
        });

        const didConnectToLSP =
          nodeState.connectedPeers.length === 0 || (await reconnectToLSP());

        // await setLogStream(logHandler);
        // const healthCheck = await serviceHealthCheck();
        // console.log(healthCheck);
        // console.log(nodeState);

        if (didConnectToLSP) {
          await receivePayment({
            amountMsat: 50000000,
            description: '',
          });

          toggleNodeInformation({
            didConnectToNode: response.isConnected,
            transactions: transactions,
            userBalance: msatToSat,
            inboundLiquidityMsat: nodeState.inboundLiquidityMsats,
            blockHeight: nodeState.blockHeight,
            onChainBalance: nodeState.onchainBalanceMsat,
            fiatStats: fiatRate,
          });

          await setLocalStorageItem(
            'breezInfo',
            JSON.stringify([
              transactions,
              msatToSat,
              nodeState.inboundLiquidityMsats,
              nodeState.blockHeight,
              nodeState.onchainBalanceMsat,
              fiatRate,
            ]),
          );
          // const hasNostrProfile = await retrieveData('myNostrProfile');
          // const contacts = await getLocalStorageItem('contacts');

          // const generatedNostrProfile =
          //   hasNostrProfile || (await generateNostrProfile());
          // const pubKeyOfContacts =
          //   contacts &&
          //   contacts.map(contact => {
          //     return contact.npub;
          //   });

          // pubKeyOfContacts &&
          //   connectToRelay(
          //     pubKeyOfContacts,
          //     generatedNostrProfile.privKey,
          //     generatedNostrProfile.pubKey,
          //     receiveEventListener,
          //   );

          navigate.replace('HomeAdmin');
        } else throw new Error('something went wrong');
      } else throw new Error('something went wrong');
      // else if (response.isConnected && !response.reason) {
      //   toggleNodeInformation({
      //     didConnectToNode: response.isConnected,
      //   });
      // }
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
      console.log(availableLsps, 'TT');
      await connectLsp(availableLsps[0].id);
      return new Promise(resolve => {
        resolve(true);
      });
    } catch (err) {
      setHasError(1);
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
    width: '95%',
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
    marginTop: 20,
    textAlign: 'center',
  },
});
