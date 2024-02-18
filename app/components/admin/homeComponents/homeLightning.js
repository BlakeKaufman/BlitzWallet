import {ScrollView, StyleSheet, Text, View} from 'react-native';

import {CENTER, SIZES, FONT, COLORS} from '../../../constants';

import {UserSatAmount} from './homeLightning/userSatAmount';
import {SendRecieveBTNs} from './homeLightning/sendReciveBTNs';
import {useEffect, useRef, useState} from 'react';
import LiquidityIndicator from './homeLightning/liquidityIndicator';
import {useGlobalContextProvider} from '../../../../context-store/context';
import {getLocalStorageItem} from '../../../functions';
import {HomeTransactions} from './homeLightning/homeTransactions';

export default function HomeLightning() {
  console.log('HOME LIGHTNING PAGE');
  const [showAmount, setShowAmount] = useState(true);
  const {userTxPreferance, theme} = useGlobalContextProvider();

  return (
    <View style={style.globalContainer}>
      <Text
        style={[
          style.headerText,
          {
            color: theme ? COLORS.darkModeText : COLORS.lightModeText,
            textTransform: 'uppercase',
            marginTop: 30,
          },
        ]}>
        Total Balance
      </Text>
      <UserSatAmount />
      {/* {!nodeInformation.didConnectToNode ? (
        <View style={style.errorContainer}>
          <Text style={style.errorText}>
            Not connected to node. Your balance and transactions may not be up
            to date.
          </Text>
        </View>
      ) : ( */}
      <LiquidityIndicator />
      {/* )} */}
      <SendRecieveBTNs />
      <Text
        style={[
          style.headerText,
          {
            color: theme ? COLORS.darkModeText : COLORS.lightModeText,
            paddingBottom: 5,
          },
        ]}>
        Transactions
      </Text>
      <HomeTransactions numTx={userTxPreferance} />
    </View>
  );
}

const style = StyleSheet.create({
  globalContainer: {
    flex: 1,
    alignItems: 'center',
  },

  headerText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
  },
});
