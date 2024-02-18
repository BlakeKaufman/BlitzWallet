import React, {useState} from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';

import {COLORS, FONT, ICONS, SIZES, BTN, Background} from '../../constants';

export default function CreateAccountHome({navigation: {navigate}}) {
  return (
    <View style={Background}>
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.container}>
          <View style={styles.logo}>
            <Image
              source={ICONS.logoIcon}
              style={{width: '100%', height: '100%'}}
            />
          </View>
          <Text style={styles.title}>Blitz wallet</Text>
          <Text style={styles.sub_title}>
            A self-custodial bitcoin lightning wallet.
          </Text>
          <TouchableOpacity
            style={[BTN, {backgroundColor: COLORS.primary}]}
            onPress={() => {
              navigate('DisclaimerPage');
            }}>
            <Text style={styles.button_full_text}>Create New Wallet</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button_empty, {marginBottom: 'auto'}]}
            onPress={() => {
              navigate('RestoreWallet');
            }}>
            <Text style={styles.button_empty_text}>
              Restore Existing Wallet
            </Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={[styles.button_empty, {marginTop: 'auto'}]}
            onPress={() => {
              navigate('ReceiveGiftHome');
            }}>
            <Text style={styles.button_empty_text}>Receive Gift</Text>
          </TouchableOpacity> */}
          <Text style={styles.disclamer_text}>
            Your wallet, your coins, 100% open-source
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    height: '100%',
    width: '100%',

    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',

    padding: 10,
  },
  logo: {
    width: 100,
    height: 100,
    marginTop: 'auto',
    marginBottom: 20,
  },
  title: {
    color: COLORS.secondary,
    fontSize: SIZES.huge,
    marginBottom: 10,
    fontFamily: FONT.Title_Regular,
  },
  sub_title: {
    maxWidth: '95%',
    color: COLORS.secondary,
    fontSize: SIZES.large,
    textAlign: 'center',
    fontFamily: FONT.Other_Regular,
  },
  button_full: {
    backgroundColor: COLORS.primary,
    width: '100%',
    maxWidth: 300,
    height: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    borderRadius: 5,
  },
  button_full_text: {
    color: COLORS.white,
    fontSize: SIZES.large,
    fontFamily: FONT.Other_Regular,
  },
  button_empty: {
    width: '100%',
    maxWidth: 300,
    marginTop: 30,
  },
  button_empty_text: {
    color: COLORS.primary,
    fontSize: SIZES.large,
    textAlign: 'center',
    fontFamily: FONT.Other_Regular,
  },
  disclamer_text: {
    color: COLORS.black,
    marginTop: 20,
    fontFamily: FONT.Other_Regular,
  },
});
