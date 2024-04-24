import {
  SafeAreaView,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  createLiquidWallet,
  gdk,
  generateLiquidMnemonic,
  getSubAccounts,
  getTxDetail,
  listenForLiquidEvents,
  startGDKSession,
} from '../../../../functions/liquidWallet';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useEffect, useRef, useState} from 'react';
import {assetIDS} from '../../../../functions/liquidWallet/assetIDS';

import {COLORS, FONT, ICONS, SIZES} from '../../../../constants';

import {formatBalanceAmount, numberConverter} from '../../../../functions';
import {FormattedLiquidTransactions} from './bankComponents/formattedTransactions';
import {useNavigation} from '@react-navigation/native';
import autoChannelRebalance from '../../../../functions/liquidWallet/autoChannelRebalance';
import createLNToLiquidSwap from '../../../../functions/liquidWallet/LNtoLiquidSwap';

export default function LiquidWallet() {
  const {
    nodeInformation,
    theme,
    masterInfoObject,
    liquidNodeInformation,
    toggleMasterInfoObject,
  } = useGlobalContextProvider();

  const navigate = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text
          style={[
            {
              fontFamily: FONT.Title_Regular,
              fontSize: SIZES.medium,
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              textTransform: 'uppercase',
              marginTop: 10,
            },
          ]}>
          Balance
        </Text>
        <View style={styles.valueContainer}>
          <Text
            style={[
              styles.valueText,
              {
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            {formatBalanceAmount(
              numberConverter(
                liquidNodeInformation.userBalance,
                masterInfoObject.userBalanceDenomination,
                nodeInformation,
              ),
            )}
          </Text>
          <Text
            style={[
              styles.denominatorText,
              {
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            {masterInfoObject.userBalanceDenomination != 'fiat'
              ? 'sats'
              : nodeInformation.fiatStats.coin}
          </Text>
        </View>
      </View>
      <View style={{flex: 1}}>
        <FormattedLiquidTransactions />
      </View>
      <TouchableOpacity
        onPress={() => {
          navigate.navigate('LiquidSettingsPage');
        }}>
        <View style={{alignItems: 'center', paddingTop: 5}}>
          <Text
            style={{
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              fontSize: SIZES.medium,
              fontFamily: FONT.Title_Regular,
            }}>
            Advanced Settings
          </Text>
          <Image
            source={ICONS.leftCheveronIcon}
            style={{width: 20, height: 20, transform: [{rotate: '270deg'}]}}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 5,
  },

  topBar: {
    alignItems: 'center',
  },

  denominatorText: {
    fontSize: SIZES.large,
    fontFamily: FONT.Title_Regular,
  },
  valueText: {
    fontSize: SIZES.xxLarge,
    fontFamily: FONT.Title_Regular,
    marginHorizontal: 5,
  },
});
