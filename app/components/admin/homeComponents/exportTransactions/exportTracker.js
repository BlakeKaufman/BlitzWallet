import {
  ActivityIndicator,
  Alert,
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
import {useGlobaleCash} from '../../../../../context-store/eCash';
import GetThemeColors from '../../../../hooks/themeColors';

export default function ConfirmExportPayments() {
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();
  const {theme, nodeInformation, liquidNodeInformation} =
    useGlobalContextProvider();
  const {ecashTransactions} = useGlobaleCash();
  const {textColor, backgroundOffset, backgroundColor} = GetThemeColors();
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
    <View
      style={{
        height: useWindowDimensions().height * 0.5,
        width: '100%',
        backgroundColor: backgroundColor,

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
            backgroundColor: backgroundOffset,
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
            <ActivityIndicator color={textColor} />
            <ThemeText content={`${txNumber} of ${totalPayments}`} />
          </View>
        )}
      </View>
      <SwipeButton
        containerStyles={{
          width: '90%',
          maxWidth: 350,
          borderColor: textColor,
          ...CENTER,
          marginBottom: 20,
        }}
        titleStyles={{fontWeight: 'bold', fontSize: SIZES.large}}
        swipeSuccessThreshold={100}
        onSwipeSuccess={() => {
          generateCSV();
          // navigate.goBack();
        }}
        railBackgroundColor={theme ? COLORS.darkModeText : COLORS.primary}
        railBorderColor={theme ? backgroundColor : COLORS.lightModeBackground}
        height={55}
        railStyles={{
          backgroundColor: theme ? backgroundColor : COLORS.darkModeText,
          borderColor: theme ? backgroundColor : COLORS.darkModeText,
        }}
        thumbIconBackgroundColor={theme ? backgroundColor : COLORS.darkModeText}
        thumbIconBorderColor={theme ? backgroundColor : COLORS.darkModeText}
        titleColor={theme ? backgroundColor : COLORS.darkModeText}
        title="Slide to export"
      />
    </View>
  );
  async function generateCSV() {
    try {
      const lNdata = nodeInformation.transactions;
      const liquidData = liquidNodeInformation.transactions;
      const ecashData = ecashTransactions;
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

      const formatedData = [...liquidData, ...lNdata, ...ecashData].map(tx => {
        setTxNumber(prev => (prev += 1));
        const txDate = new Date(
          tx.type === 'ecash'
            ? tx.time
            : tx.paymentTime
            ? tx.paymentTime * 1000
            : tx.created_at_ts / 1000,
        );
        const isLiquidPayment = !!tx.created_at_ts;
        return [
          tx.type === 'ecash'
            ? 'Ecash'
            : tx.description
            ? 'Lightning'
            : 'Liquid',
          tx.description ? tx.description : 'No description',
          txDate.toLocaleString().replace(/,/g, ' '),
          Math.round(tx.feeMsat / 1000 || tx.fee).toLocaleString(),
          Math.round(
            tx.type === 'ecash'
              ? tx.amount * (tx.paymentType === 'sent' ? -1 : 1)
              : tx.amountMsat / 1000 || tx.satoshi[assetIDS['L-BTC']],
          )
            .toLocaleString()
            .replace(/,/g, ' '),
          isLiquidPayment
            ? tx.type === 'outgoing'
              ? 'Sent'
              : 'Received'
            : tx.paymentType,
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
