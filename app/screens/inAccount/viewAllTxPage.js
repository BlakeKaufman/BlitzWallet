import {useNavigation} from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../constants';

import {useGlobalContextProvider} from '../../../context-store/context';

import {UserTransactions} from '../../components/admin';
import {backArrow} from '../../constants/styles';
import {GlobalThemeView} from '../../functions/CustomElements';
import {WINDOWWIDTH} from '../../constants/theme';
import {useEffect, useState} from 'react';
import handleBackPress from '../../hooks/handleBackPress';
import getFormattedHomepageTxs from '../../functions/combinedTransactions';
import {useGlobaleCash} from '../../../context-store/eCash';

export default function ViewAllTxPage() {
  const navigate = useNavigation();
  const {theme, nodeInformation, liquidNodeInformation, masterInfoObject} =
    useGlobalContextProvider();
  const {ecashTransactions} = useGlobaleCash();

  function handleBackPressFunction() {
    console.log('RUNNIN IN CONTACTS BACK BUTTON');
    navigate.goBack();
    return true;
  }
  const showAmount = masterInfoObject.userBalanceDenomination != 'hidden';

  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

  return (
    <GlobalThemeView styles={{paddingBottom: 0}}>
      <View style={styles.globalContainer}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={{position: 'absolute', top: 0, left: 0}}
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
            style={{position: 'absolute', top: 0, right: 0}}
            onPress={() => {
              navigate.navigate('ConfirmExportPayments');
            }}>
            <Image style={[backArrow]} source={ICONS.share} />
          </TouchableOpacity>
        </View>

        <FlatList
          style={{flex: 1, width: '100%'}}
          showsVerticalScrollIndicator={false}
          data={getFormattedHomepageTxs({
            nodeInformation,
            liquidNodeInformation,
            masterInfoObject,
            theme,
            navigate,
            showAmount,
            isBankPage: false,
            frompage: 'viewAllTx',
            ecashTransactions,
          })}
          renderItem={({item}) => item}
        />
      </View>
    </GlobalThemeView>
  );
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
    fontSize: SIZES.xLarge,
    ...CENTER,
  },
});
