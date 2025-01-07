import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Platform,
} from 'react-native';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {COLORS, FONT, ICONS, SIZES} from '../../../../constants';
import {formatBalanceAmount, numberConverter} from '../../../../functions';
import {useNavigation} from '@react-navigation/native';
import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import getFormattedHomepageTxs from '../../../../functions/combinedTransactions';
import FormattedSatText from '../../../../functions/CustomElements/satTextDisplay';
import {useGlobaleCash} from '../../../../../context-store/eCash';
import ThemeImage from '../../../../functions/CustomElements/themeImage';
import {useTranslation} from 'react-i18next';
import CustomButton from '../../../../functions/CustomElements/button';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ANDROIDSAFEAREA} from '../../../../constants/styles';
import {useWebView} from '../../../../../context-store/webViewContext';

export default function LiquidWallet() {
  const {
    nodeInformation,
    masterInfoObject,
    liquidNodeInformation,
    theme,
    isConnectedToTheInternet,
  } = useGlobalContextProvider();
  const {ecashTransactions} = useGlobaleCash();
  const showAmount = masterInfoObject.userBalanceDenomination != 'hidden';
  const navigate = useNavigation();
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const {autoChannelRebalanceIDs} = useWebView();

  const bottomPadding = Platform.select({
    ios: insets.bottom,
    android: ANDROIDSAFEAREA,
  });

  return (
    <GlobalThemeView useStandardWidth={true} styles={styles.container}>
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={{position: 'absolute', top: 0, left: 0, zIndex: 1}}
          onPress={() => {
            Keyboard.dismiss();

            navigate.goBack();
          }}>
          <ThemeImage
            lightsOutIcon={ICONS.arrow_small_left_white}
            darkModeIcon={ICONS.smallArrowLeft}
            lightModeIcon={ICONS.smallArrowLeft}
          />
        </TouchableOpacity>
        <ThemeText content={'Bank'} styles={{...styles.topBarText}} />

        <TouchableOpacity
          style={{position: 'absolute', top: 0, right: 0, zIndex: 1}}
          onPress={() => {
            Keyboard.dismiss();

            if (!isConnectedToTheInternet) {
              navigate.navigate('ErrorScreen', {
                errorMessage:
                  'Please reconnect to the internet to use this feature',
              });
              return;
            }
            navigate.navigate('LiquidSettingsPage');
            return;
          }}>
          <ThemeImage
            lightsOutIcon={ICONS.settingsWhite}
            darkModeIcon={ICONS.settingsIcon}
            lightModeIcon={ICONS.settingsIcon}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.topBar}>
        <ThemeText
          content={'Balance'}
          styles={{marginTop: 10, textTransform: 'uppercase', marginBottom: 10}}
        />
        <View style={styles.valueContainer}>
          <FormattedSatText
            iconHeight={25}
            iconWidth={25}
            styles={{...styles.valueText}}
            formattedBalance={formatBalanceAmount(
              numberConverter(
                liquidNodeInformation.userBalance,
                masterInfoObject.userBalanceDenomination,
                nodeInformation,
              ),
            )}
          />
        </View>
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
          isBankPage: true,
          ecashTransactions,
          noTransactionHistoryText: t('wallet.no_transaction_history'),
          todayText: t('constants.today'),
          yesterdayText: t('constants.yesterday'),
          dayText: t('constants.day'),
          monthText: t('constants.month'),
          yearText: t('constants.year'),
          agoText: t('transactionLabelText.ago'),
          autoChannelRebalanceIDs,
        })}
        renderItem={({item}) => item}
        ListFooterComponent={
          <View
            style={{
              width: '100%',
              height: bottomPadding + 60,
            }}
          />
        }
      />

      <CustomButton
        buttonStyles={{
          width: 'auto',
          position: 'absolute',
          bottom: bottomPadding,
        }}
        textStyles={{}}
        textContent={'Get Address'}
        actionFunction={() =>
          navigate.navigate('CustomHalfModal', {
            wantedContent: 'liquidAddressModal',
            sliderHight: 0.5,
          })
        }
      />
    </GlobalThemeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 0,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBar: {
    alignItems: 'center',
  },
  topBarText: {
    fontSize: SIZES.xLarge,
    width: '100%',
    textAlign: 'center',
    fontFamily: FONT.Title_Regular,
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

    marginBottom: 25,
  },

  denominatorText: {
    fontSize: SIZES.large,
    fontFamily: FONT.Title_Regular,
  },
  valueText: {
    fontSize: SIZES.xxLarge,
    fontFamily: FONT.Title_Regular,
  },
});
