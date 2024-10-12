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
import {backArrow} from '../../constants/styles';
import {GlobalThemeView} from '../../functions/CustomElements';
import {WINDOWWIDTH} from '../../constants/theme';
import {useEffect, useState} from 'react';
import handleBackPress from '../../hooks/handleBackPress';
import getFormattedHomepageTxs from '../../functions/combinedTransactions';
import {useGlobaleCash} from '../../../context-store/eCash';
import ThemeImage from '../../functions/CustomElements/themeImage';
import {useTranslation} from 'react-i18next';

export default function ViewAllTxPage() {
  const navigate = useNavigation();
  const {theme, nodeInformation, liquidNodeInformation, masterInfoObject} =
    useGlobalContextProvider();
  const {ecashTransactions} = useGlobaleCash();
  const {t} = useTranslation();

  function handleBackPressFunction() {
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
            <ThemeImage
              darkModeIcon={ICONS.smallArrowLeft}
              lightModeIcon={ICONS.smallArrowLeft}
              lightsOutIcon={ICONS.arrow_small_left_white}
            />
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
              navigate.navigate('CustomHalfModal', {
                wantedContent: 'exportTransactions',
                sliderHight: 0.5,
              });
            }}>
            <ThemeImage
              darkModeIcon={ICONS.share}
              lightModeIcon={ICONS.share}
              lightsOutIcon={ICONS.shareWhite}
            />
          </TouchableOpacity>
        </View>

        <FlatList
          initialNumToRender={20}
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
            noTransactionHistoryText: t('wallet.no_transaction_history'),
            todayText: t('constants.today'),
            yesterdayText: t('constants.yesterday'),
            dayText: t('constants.day'),
            monthText: t('constants.month'),
            yearText: t('constants.year'),
            agoText: t('transactionLabelText.ago'),
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
