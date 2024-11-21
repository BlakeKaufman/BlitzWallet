import {useState} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {ThemeText} from '../../../../functions/CustomElements';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import FormattedSatText from '../../../../functions/CustomElements/satTextDisplay';
import {CENTER, ICONS, SIZES} from '../../../../constants';
import {useNavigation} from '@react-navigation/native';
import ThemeImage from '../../../../functions/CustomElements/themeImage';
import {formatBalanceAmount, numberConverter} from '../../../../functions';
import CustomButton from '../../../../functions/CustomElements/button';
import getFormattedHomepageTxs from '../../../../functions/combinedTransactions';
import {useGlobaleCash} from '../../../../../context-store/eCash';
import {useTranslation} from 'react-i18next';

export default function PegOutPage(props) {
  const {
    nodeInformation,
    liquidNodeInformation,
    masterInfoObject,
    onChainInformation,
    toggleOnChainTransactions,
    theme,
  } = useGlobalContextProvider();
  const [bitcoinAddress, setBitcoinAddress] = useState(
    props?.route?.params?.bitcoinAddress || '',
  );
  const showAmount = masterInfoObject.userBalanceDenomination != 'hidden';
  const {ecashTransactions} = useGlobaleCash();
  const navigate = useNavigation();
  const {t} = useTranslation();
  console.log(onChainInformation);
  return (
    <View style={styles.globalContainer}>
      <View style={{...styles.infoContainer, marginTop: 20}}>
        <ThemeText
          styles={{marginRight: 5}}
          content={'Available balance to send'}
        />
        <TouchableOpacity
          onPress={() => {
            navigate.navigate('ExplainScreenPopup', {page: 'pegOutPage'});
          }}>
          <ThemeImage
            styles={{width: 20, height: 20}}
            lightsOutIcon={ICONS.aboutIconWhite}
            lightModeIcon={ICONS.aboutIcon}
            darkModeIcon={ICONS.aboutIcon}
          />
        </TouchableOpacity>
      </View>
      <FormattedSatText
        containerStyles={{...CENTER}}
        neverHideBalance={true}
        iconHeight={15}
        iconWidth={15}
        styles={{includeFontPadding: false, ...styles.balanceText}}
        formattedBalance={formatBalanceAmount(
          numberConverter(
            liquidNodeInformation.userBalance,
            masterInfoObject.userBalanceDenomination,
            nodeInformation,
            masterInfoObject.userBalanceDenomination != 'fiat' ? 0 : 2,
          ),
        )}
      />
      <View style={styles.buttonGlobalContainer}>
        <CustomButton
          buttonStyles={{
            marginRight: 10,
          }}
          textContent={'Transfer'}
        />

        <CustomButton textContent={'Send'} />
      </View>
      <FlatList
        style={{flex: 1, width: '100%', paddingTop: 50, marginTop: 10}}
        showsVerticalScrollIndicator={false}
        data={getFormattedHomepageTxs({
          nodeInformation,
          liquidNodeInformation,
          masterInfoObject,
          theme,
          navigate,
          showAmount,
          isOnChainPage: true,
          ecashTransactions,
          bitcoinTransactions: onChainInformation,
          noTransactionHistoryText:
            'Send an on-chain transaction for it to show up here.',
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
  );
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    alignItems: 'center',
  },
  balanceText: {
    fontSize: SIZES.xxLarge,
  },
  buttonGlobalContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',

    marginTop: 50,
  },
});
