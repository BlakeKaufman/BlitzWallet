import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useEffect, useState} from 'react';

import SwipeButton from 'rn-swipe-button';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {ThemeText} from '../../../../functions/CustomElements';
import handleBackPress from '../../../../hooks/handleBackPress';
import {assetIDS} from '../../../../functions/liquidWallet/assetIDS';
import * as FileSystem from 'expo-file-system';

export default function ConfirmExportPayments() {
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();
  const {theme, nodeInformation, liquidNodeInformation} =
    useGlobalContextProvider();
  const totalPayments =
    nodeInformation.transactions.length +
    liquidNodeInformation.transactions.length;

  const [txNumber, setTxNumber] = useState(0);

  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

  return (
    <TouchableWithoutFeedback onPress={() => navigate.goBack()}>
      <View style={{flex: 1}}>
        <View style={{marginTop: 'auto'}}>
          <View
            style={[
              styles.borderTop,
              {
                width: useWindowDimensions().width * 0.99,
                backgroundColor: theme
                  ? COLORS.darkModeBackgroundOffset
                  : COLORS.lightModeBackgroundOffset,
                left: (useWindowDimensions().width * 0.01) / 2,
              },
            ]}></View>
          <View
            style={{
              height: useWindowDimensions().height * 0.5,
              width: '100%',
              backgroundColor: theme
                ? COLORS.darkModeBackground
                : COLORS.lightModeBackground,

              // borderTopColor: theme ? COLORS.darkModeText : COLORS.lightModeText,
              // borderTopWidth: 10,

              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,

              // borderTopLeftRadius: 10,
              // borderTopRightRadius: 10,

              padding: 10,
              paddingBottom: insets.bottom,
              alignItems: 'center',
              position: 'relative',
              zIndex: 1,
            }}>
            <View
              style={[
                styles.topBar,
                {
                  backgroundColor: theme
                    ? COLORS.darkModeBackgroundOffset
                    : COLORS.lightModeBackgroundOffset,
                },
              ]}></View>

            <ThemeText
              content={
                'Export your payment history in CSV (comma seperated value) format.'
              }
            />
            <View style={{marginTop: 'auto', marginBottom: 10}}>
              {txNumber === 0 ? (
                <ThemeText content={`${totalPayments} payments`} />
              ) : (
                <View>
                  <ActivityIndicator
                    color={theme ? COLORS.darkModeText : COLORS.lightModeText}
                  />
                  <ThemeText content={`${txNumber} of ${totalPayments}`} />
                </View>
              )}
            </View>
            <SwipeButton
              containerStyles={{
                width: '90%',
                maxWidth: 350,
                borderColor: theme ? COLORS.darkModeText : COLORS.lightModeText,
                ...CENTER,
                marginBottom: 20,
              }}
              titleStyles={{fontWeight: 'bold', fontSize: SIZES.large}}
              swipeSuccessThreshold={100}
              onSwipeSuccess={() => {
                generateCSV();
                // navigate.goBack();
              }}
              railBackgroundColor={
                theme ? COLORS.lightModeBackground : COLORS.darkModeBackground
              }
              railBorderColor={
                theme ? COLORS.darkModeBackground : COLORS.lightModeBackground
              }
              height={55}
              railStyles={{
                backgroundColor: theme
                  ? COLORS.darkModeBackground
                  : COLORS.lightModeBackground,
                borderColor: theme
                  ? COLORS.darkModeBackground
                  : COLORS.lightModeBackground,
              }}
              thumbIconBackgroundColor={
                theme ? COLORS.darkModeBackground : COLORS.lightModeBackground
              }
              thumbIconBorderColor={
                theme ? COLORS.lightModeBackground : COLORS.lightModeBackground
              }
              titleColor={
                theme ? COLORS.darkModeBackground : COLORS.lightModeBackground
              }
              title="Slide to export"
            />
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
  async function generateCSV() {
    try {
      const lNdata = nodeInformation.transactions;
      const liquidData = liquidNodeInformation.transactions;
      const headers = [
        [
          'Payment Type',
          'Description',
          'Date',
          'Transaction Fees (sat)',
          'Amount (sat)',
          'Sent/Received',
        ],
      ];

      // console.log(liquidData);

      const formatedData = [...liquidData, ...lNdata].map(tx => {
        setTxNumber(prev => (prev += 1));
        const txDate = new Date(
          tx.paymentTime ? tx.paymentTime * 1000 : tx.created_at_ts / 1000,
        );
        return [
          tx.description ? 'Lightning' : 'Liquid',
          tx.description ? tx.description : 'No description',
          txDate.toLocaleString(),
          Math.round(tx.feeMsat / 1000 || tx.fee).toLocaleString(),
          Math.round(
            tx.amountMsat / 1000 || tx.satoshi[assetIDS['L-BTC']],
          ).toLocaleString(),
          tx.paymentType,
        ];
      });
      const csvData = headers.concat(formatedData).join('\n');

      const dir = FileSystem.documentDirectory;

      const fileName = 'BlitzWallet.csv';
      const filePath = `${dir}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, csvData, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      navigate.goBack();

      setTimeout(async () => {
        await Share.share({
          title: 'BlitzWallet',
          // message: `${csvData}`,
          url: `file://${filePath}`,
          type: 'text/csv',
        });
      }, 200);

      console.log(dir);
    } catch (err) {
      console.log(err);
      Alert.alert('Error when creating file');
    }
  }
}

const styles = StyleSheet.create({
  topBar: {
    width: 120,
    height: 8,
    marginTop: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  borderTop: {
    width: '100%',
    height: 60,
    position: 'absolute',
    top: -5,
    zIndex: -1,

    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  optionsContainer: {
    width: '100%',
    height: '100%',
  },
});
