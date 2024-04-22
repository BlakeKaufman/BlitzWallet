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
  listenForLiquidEvents,
  startGDKSession,
} from '../../../../functions/liquidWallet';
import {useGlobalContextProvider} from '../../../../../context-store/context';
// import Gdk from '@vulpemventures/react-native-gdk';
import {useEffect, useRef, useState} from 'react';
import {assetIDS} from '../../../../functions/liquidWallet/assetIDS';

import {COLORS, FONT, ICONS, SIZES} from '../../../../constants';

import {formatBalanceAmount, numberConverter} from '../../../../functions';
import {FormattedLiquidTransactions} from './bankComponents/formattedTransactions';
// const gdk = Gdk();
export default function LiquidWallet() {
  const {nodeInformation, theme, masterInfoObject, liquidNodeInformation} =
    useGlobalContextProvider();

  console.log(liquidNodeInformation);

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
        {/* <ScrollView>
          <Button
            title="receive address"
            onPress={async () => {
              try {
                console.log(await gdk.getReceiveAddress({subaccount: 1}));
              } catch (error) {
                console.log('ERROR', error);
              }
            }}
          />
          <Button
            title="get txs"
            onPress={async () => {
              try {
                const txArray = await gdk.getTransactions({
                  subaccount: 1,
                  first: 0,
                  count: 10,
                });

                console.log(txArray.transactions[0].satoshi);
              } catch (error) {
                console.log('ERROR', error);
              }
            }}
          />

          <Button
            title="get balance"
            onPress={async () => {
              try {
                console.log(
                  await gdk.getBalance({subaccount: 1, num_confs: 0}),
                );
              } catch (error) {
                console.log('ERROR', error);
              }
            }}
          />

          <Button
            title="get mnemonic"
            onPress={async () => {
              try {
                console.log(await gdk.getMnemonic({password: ''}));
              } catch (error) {
                console.log('ERROR', error);
              }
            }}
          />

          <Button
            title="send transaction blinded"
            onPress={async () => {
              try {
                const unsignedTx = await gdk.createTransaction({
                  addressees: [
                    {
                      address:
                        'VJL6jrweW7cUogoijJDKrPm3dDr3Jzo4FWibimJ4sdbo4ReFwcy4tzXDVKBSTndZp4h1bmgi59Pae2ur',
                      asset_id: assetIDS['L-BTC'],
                      satoshi: 1000,
                    },
                  ],
                  utxos: (
                    await gdk.getUnspentOutputs({subaccount: 1, num_confs: 0})
                  ).unspent_outputs,
                });
                const blinded = await gdk.blindTransaction(unsignedTx);
                const signed = await gdk.signTransaction(blinded);
                await gdk.sendTransaction(signed);
                console.log('SENT');
              } catch (error) {
                console.log('ERROR', error);
              }
            }}
          />
        </ScrollView> */}
      </View>
      <TouchableOpacity
        onPress={() => {
          console.log('RES');
        }}>
        <View style={{alignItems: 'center', paddingTop: 5}}>
          <Text
            style={{
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              fontSize: SIZES.medium,
              fontFamily: FONT.Title_Regular,
            }}>
            Settings
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
