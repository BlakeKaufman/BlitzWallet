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
import {CENTER, COLORS, FONT, SIZES} from '../../constants';
import icons from '../../constants/icons';
import {UserTransactions} from '../../components/admin/homeComponents/homeLightning/userTransactions';
import {useGlobalContextProvider} from '../../../context-store/context';
import {useEffect, useState} from 'react';
import {getLocalStorageItem} from '../../functions';
import {getWallet} from '../../functions/eCash';
import * as FileSystem from 'expo-file-system';

export default function ViewAllTxPage() {
  const navigate = useNavigation();
  const {theme, nodeInformation} = useGlobalContextProvider();
  const [showAmount, setShowAmount] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const displayAmount = JSON.parse(
        await getLocalStorageItem('showBalance'),
      );

      if (displayAmount != null) {
        setShowAmount(displayAmount);
      } else setShowAmount(true);
      setIsLoaded(true);
    })();
  }, []);

  if (!isLoaded) return null;
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
      <SafeAreaView style={styles.globalContainer}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => {
              navigate.goBack();
            }}>
            <Image style={styles.backButton} source={icons.xSmallIcon} />
          </TouchableOpacity>
          <Text
            style={[
              styles.mainHeader,
              {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
            ]}>
            Transactions
          </Text>
          <TouchableOpacity
            onPress={() => {
              // getWallet();
              generateCSV();
              return;
              Alert.alert('This does not work yet!');
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

        <UserTransactions
          transactions={nodeInformation.transactions}
          theme={theme}
          showAmount={showAmount}
          numTx={'all'}
          from={'viewAll'}
        />
      </SafeAreaView>
    </View>
  );
  async function generateCSV() {
    try {
      const data = nodeInformation.transactions;
      const headers = [
        [
          'Description',
          'Date',
          'Transaction Fees (sat)',
          'Amount (sat)',
          'Sent/Received',
        ],
      ];

      const formatedData = data.map(tx => {
        const txDate = new Date(tx.paymentTime * 1000);
        return [
          tx.description ? tx.description : 'No description',
          txDate.toLocaleString(),
          Math.round(tx.feeMsat / 1000).toLocaleString(),
          Math.round(tx.amountMsat / 1000).toLocaleString(),
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
  },
  topBar: {
    width: '95%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...CENTER,
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
  backButton: {
    width: 40,
    height: 40,
  },
});
