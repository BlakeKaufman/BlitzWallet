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
import {useEffect, useState} from 'react';
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

export default function ConnectingToNodeLoadingScreen({
  navigation: navigate,
  route,
}) {
  const onBreezEvent = globalOnBreezEvent(navigate);
  const {
    theme,
    toggleNodeInformation,
    toggleNostrSocket,
    toggleNostrEvents,
    toggleNostrContacts,
    nostrContacts,
    toggleMasterInfoObject,
    masterInfoObject,
    contactsPrivateKey,
  } = useGlobalContextProvider();
  const [hasError, setHasError] = useState(null);
  const {t} = useTranslation();
  const [connecting, setIsConnecting] = useState(true);
  const [giftCode, setGiftCode] = useState('');
  const [isClaimingGift, setIsClaimingGift] = useState(false);

  const fromGiftPath = route?.params?.fromGiftPath;
  console.log(giftCode);

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
      {fromGiftPath ? (
        connecting ? (
          <>
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
          </>
        ) : giftCode ? (
          !isClaimingGift ? (
            <>
              {/* <Text
                style={{
                  width: '95%',
                  fontFamily: FONT.Title_Bold,
                  fontSize: SIZES.medium,
                  color: COLORS.lightModeText,
                  marginBottom: 20,
                  textAlign: 'center',
                }}>
                {giftCode}
              </Text> */}
              <TouchableOpacity
                style={[
                  BTN,
                  {
                    backgroundColor: theme
                      ? COLORS.darkModeBackgroundOffset
                      : COLORS.lightModeBackgroundOffset,
                    marginTop: 0,
                  },
                ]}
                onPress={redeemGift}>
                <Text
                  style={{
                    fontFamily: FONT.Title_Regular,
                    fontSize: SIZES.medium,
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  }}>
                  Claim Gift
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <ActivityIndicator
                size="large"
                color={theme ? COLORS.darkModeText : COLORS.lightModeText}
              />
              <Text
                style={[
                  styles.waitingText,
                  {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                ]}>
                Your gift is being claimed
              </Text>
            </>
          )
        ) : (
          <>
            <TouchableOpacity
              style={[
                BTN,
                {
                  backgroundColor: theme
                    ? COLORS.darkModeBackgroundOffset
                    : COLORS.lightModeBackgroundOffset,
                },
              ]}
              onPress={() => {
                navigate.navigate('CameraModal', {
                  updateBitcoinAdressFunc: setGiftCode,
                });
              }}>
              <Text
                style={{
                  fontFamily: FONT.Title_Regular,
                  fontSize: SIZES.medium,
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                }}>
                Get Code
              </Text>
            </TouchableOpacity>
          </>
        )
      ) : (
        <>
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
        </>
      )}
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
    // initBalanceAndTransactions(toggleNodeInformation);

    try {
      // navigate.replace('HomeAdmin');
      // return;
      const response = await connectToNode(onBreezEvent);
      connectToAlby();
      initializeAblyFromHistory(
        toggleMasterInfoObject,
        masterInfoObject,
        masterInfoObject.contacts.myProfile.uuid,
        contactsPrivateKey,
        // masterInfoObject.contacts.myProfile.uuid,
      );

      if (fromGiftPath) {
        if (response?.isConnected) {
          const didSet = await setNodeInformationForSession();

          if (didSet) {
            setIsConnecting(false);

            navigate.navigate('CameraModal', {
              updateBitcoinAdressFunc: setGiftCode,
            });
            return;
          } else setHasError(1);
        } else setHasError(1);

        console.log('GIFT PATH');
        return;
      }

      console.log('HOME RENDER BREEZ EVENT FIRST LOAD');

      // const contact =
      //   masterInfoObject.contacts?.myProfile?.uuid || generateRandomContact();
      // const [generatedNostrProfile, pubKeyOfContacts] =
      //   await getConnectToRelayInfo(masterInfoObject.nostrContacts);

      // toggleMasterInfoObject({
      //   contacts: {
      //     myProfile: masterInfoObject.contacts?.myProfile
      //       ? masterInfoObject.contacts.myProfile
      //       : {myProfile: {...contact}},
      //     addedContacts: masterInfoObject.contacts?.addedContacts
      //       ? masterInfoObject.contacts?.addedContacts
      //       : {},
      //   },
      // });

      // connectToRelay(
      //   pubKeyOfContacts,
      //   generatedNostrProfile.privKey,
      //   generatedNostrProfile.pubKey,
      //   receiveEventListener,
      //   toggleNostrSocket,
      //   toggleNostrEvents,
      //   toggleNostrContacts,
      //   masterInfoObject.nostrContacts,
      // );

      // console.log(response);
      // setErrMessage(response.errMessage);
      // navigate.replace('HomeAdmin');
      // return;

      if (response?.isConnected) {
        const didSet = await setNodeInformationForSession();

        if (didSet) navigate.replace('HomeAdmin');
        else throw new Error('something went wrong');
      } else throw new Error('something went wrong');
    } catch (err) {
      toggleNodeInformation({
        didConnectToNode: true, //Make sure to change back to false
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

  async function setNodeInformationForSession() {
    try {
      const nodeState = await nodeInfo();
      const transactions = await getTransactions();
      const heath = await serviceHealthCheck();
      const msatToSat = nodeState.channelsBalanceMsat / 1000;
      console.log(nodeState, heath, 'TESTIGg');
      const fiat = await fetchFiatRates();
      const currency = masterInfoObject.currency;

      const [fiatRate] = fiat.filter(rate => {
        return rate.coin.toLowerCase() === currency.toLowerCase();
      });

      const didConnectToLSP =
        nodeState.connectedPeers.length != 0 || (await reconnectToLSP());

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
        });

        return new Promise(resolve => {
          resolve(true);
        });
      } else throw new Error('something went wrong');
    } catch (err) {
      console.log(err);
      return new Promise(resolve => {
        resolve(false);
      });
      console.log(err);
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
