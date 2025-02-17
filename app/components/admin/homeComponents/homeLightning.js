import {StyleSheet, View} from 'react-native';
import {UserSatAmount} from './homeLightning/userSatAmount';
import {SendRecieveBTNs} from './homeLightning/sendReciveBTNs';
import {useGlobalContextProvider} from '../../../../context-store/context';
import {GlobalThemeView, ThemeText} from '../../../functions/CustomElements';
import CustomFlatList from './homeLightning/cusomFlatlist/CustomFlatList';
import getFormattedHomepageTxs from '../../../functions/combinedTransactions';
import NavBar from './navBar';
import {useNavigation} from '@react-navigation/native';
import {useUpdateHomepageTransactions} from '../../../hooks/updateHomepageTransactions';
import {useGlobaleCash} from '../../../../context-store/eCash';
import {useEffect, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useGlobalThemeContext} from '../../../../context-store/theme';
import {useNodeContext} from '../../../../context-store/nodeContext';
export default function HomeLightning({tabNavigation}) {
  console.log('HOME LIGHTNING PAGE');
  const {masterInfoObject, setDidGetToHomePage} = useGlobalContextProvider();
  const {nodeInformation, liquidNodeInformation} = useNodeContext();
  const {theme} = useGlobalThemeContext();
  const {ecashTransactions} = useGlobaleCash();
  const navigate = useNavigation();
  const shouldUpdateTransactions = useUpdateHomepageTransactions();
  const {t} = useTranslation();

  const showAmount = masterInfoObject.userBalanceDenomination;
  const masterFailedTransactions = masterInfoObject.failedTransactions;
  const enabledEcash = masterInfoObject.enabledEcash;
  const homepageTxPreferance = masterInfoObject.homepageTxPreferance;

  useEffect(() => {
    setDidGetToHomePage(true);
  }, [setDidGetToHomePage]);

  const flatListData = useMemo(() => {
    return getFormattedHomepageTxs({
      nodeInformation,
      liquidNodeInformation,
      masterInfoObject,
      theme,
      navigate,
      showAmount: showAmount != 'hidden',
      frompage: 'home',
      ecashTransactions,
      viewAllTxText: t('wallet.see_all_txs'),
      noTransactionHistoryText: t('wallet.no_transaction_history'),
      todayText: t('constants.today'),
      yesterdayText: t('constants.yesterday'),
      dayText: t('constants.day'),
      monthText: t('constants.month'),
      yearText: t('constants.year'),
      agoText: t('transactionLabelText.ago'),
    });
  }, [
    ecashTransactions,
    nodeInformation,
    liquidNodeInformation,
    masterFailedTransactions,
    showAmount,
    theme,
    enabledEcash,
    homepageTxPreferance,
    shouldUpdateTransactions,
    navigate,
  ]);

  return (
    <GlobalThemeView styles={{paddingBottom: 0, paddintTop: 0}}>
      <CustomFlatList
        style={{overflow: 'hidden', flex: 1}}
        data={flatListData} // check this
        renderItem={({item}) => item}
        HeaderComponent={<NavBar />}
        StickyElementComponent={
          <GlobalThemeView styles={style.balanceContainer}>
            <ThemeText
              content={t('constants.total_balance')}
              styles={{
                textTransform: 'uppercase',
                marginTop: nodeInformation.userBalance === 0 ? 20 : 0,
              }}
            />
            <UserSatAmount />
            {/* {nodeInformation.userBalance != 0 && <LiquidityIndicator />} */}
          </GlobalThemeView>
        }
        TopListElementComponent={
          <View
            style={{
              alignItems: 'center',
            }}>
            <SendRecieveBTNs tabNavigation={tabNavigation} />
          </View>
        }
      />
    </GlobalThemeView>
  );
}

const style = StyleSheet.create({
  balanceContainer: {paddingTop: 0, paddingBottom: 10, alignItems: 'center'},
});
