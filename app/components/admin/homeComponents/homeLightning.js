import {ScrollView, StyleSheet, Text, View} from 'react-native';

import {CENTER, SIZES, FONT, COLORS} from '../../../constants';

import {UserSatAmount} from './homeLightning/userSatAmount';
import {SendRecieveBTNs} from './homeLightning/sendReciveBTNs';
import {useEffect, useRef, useState} from 'react';
import LiquidityIndicator from './homeLightning/liquidityIndicator';
import {useGlobalContextProvider} from '../../../../context-store/context';
import {getLocalStorageItem} from '../../../functions';
import {UserTransactions} from './homeLightning/userTransactions';

export default function HomeLightning() {
  console.log('HOME LIGHTNING PAGE');
  const {theme} = useGlobalContextProvider();

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
      <LiquidityIndicator />
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
      <View style={{flex: 1, width: '100%'}}>
        <View
          style={[
            style.shadowContainer,
            {
              backgroundColor: theme
                ? COLORS.darkModeBackground
                : COLORS.lightModeBackground,

              shadowColor: theme
                ? COLORS.darkModeBackground
                : COLORS.lightModeBackground,
            },
          ]}></View>
        <UserTransactions from="homepage" />
      </View>
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

  shadowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 10,

    opacity: 0.7,

    shadowOffset: {height: 8, width: 0},

    shadowOpacity: 1,
    elevation: 2,
    zIndex: 1,
  },
});
