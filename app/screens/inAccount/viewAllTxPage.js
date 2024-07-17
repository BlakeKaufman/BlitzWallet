import {useNavigation} from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../constants';
import icons from '../../constants/icons';

import {useGlobalContextProvider} from '../../../context-store/context';

import * as FileSystem from 'expo-file-system';
import {UserTransactions} from '../../components/admin';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ANDROIDSAFEAREA, backArrow} from '../../constants/styles';
import {GlobalThemeView} from '../../functions/CustomElements';
import {WINDOWWIDTH} from '../../constants/theme';
import {useEffect} from 'react';
import handleBackPress from '../../hooks/handleBackPress';
import {assetIDS} from '../../functions/liquidWallet/assetIDS';

export default function ViewAllTxPage() {
  const navigate = useNavigation();
  const {theme, nodeInformation, liquidNodeInformation} =
    useGlobalContextProvider();

  function handleBackPressFunction() {
    console.log('RUNNIN IN CONTACTS BACK BUTTON');
    navigate.goBack();
    return true;
  }

  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

  return (
    <GlobalThemeView styles={{paddingBottom: 0}}>
      <View style={styles.globalContainer}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => {
              navigate.goBack();
            }}>
            <Image style={[backArrow]} source={ICONS.smallArrowLeft} />
          </TouchableOpacity>
          <Text
            style={[
              styles.mainHeader,
              {
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            Transactions
          </Text>
          <TouchableOpacity
            onPress={() => {
              generateCSV();
            }}>
            <Text
              style={[
                styles.shareText,
                {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
              ]}>
              Share
            </Text>
          </TouchableOpacity>
        </View>

        <UserTransactions from="viewAllTxPage" />
      </View>
    </GlobalThemeView>
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

      const formatedData = [...liquidData].map(tx => {
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

      await Share.share({
        title: 'BlitzWallet',
        // message: `${csvData}`,
        url: `file://${filePath}`,
        type: 'text/csv',
      });

      console.log(dir);
    } catch (err) {
      Alert.alert('Error when creating file');
    }
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
    width: WINDOWWIDTH,
    ...CENTER,
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mainHeader: {
    fontFamily: FONT.Title_Bold,
    fontSize: SIZES.large,
  },
  shareText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
  },
});
