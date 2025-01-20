import {
  Keyboard,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {ThemeText} from '../../../../../functions/CustomElements';
import {useNavigation} from '@react-navigation/native';
import {CENTER, ICONS, SATSPERBITCOIN, SIZES} from '../../../../../constants';
import ThemeImage from '../../../../../functions/CustomElements/themeImage';
import {FONT, WINDOWWIDTH} from '../../../../../constants/theme';
import {
  buyBitcoin,
  BuyBitcoinProvider,
  fetchOnchainLimits,
  prepareBuyBitcoin,
} from '@breeztech/react-native-breez-sdk-liquid';
import CustomButton from '../../../../../functions/CustomElements/button';
import {useEffect, useState} from 'react';
import CustomNumberKeyboard from '../../../../../functions/CustomElements/customNumberKeyboard';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {formatBalanceAmount} from '../../../../../functions';
import Icon from '../../../../../functions/CustomElements/Icon';
import GetThemeColors from '../../../../../hooks/themeColors';
import FormattedSatText from '../../../../../functions/CustomElements/satTextDisplay';
import FullLoadingScreen from '../../../../../functions/CustomElements/loadingScreen';

export default function BuyBitcoinHome() {
  const {masterInfoObject, nodeInformation} = useGlobalContextProvider();
  const navigate = useNavigation();
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [localSatAmount, setLocalSatAmount] = useState(
    masterInfoObject.userBalanceDenomination,
  );
  const [isAmountFocused, setIsAmountFocused] = useState(true);
  const {textColor} = GetThemeColors();
  const [onChainAmounts, setOnChainAmounts] = useState({});
  console.log(purchaseAmount);

  const convertedValue = () => {
    return localSatAmount === 'fiat'
      ? Math.round(
          (SATSPERBITCOIN / (nodeInformation.fiatStats?.value || 65000)) *
            Number(purchaseAmount),
        )
      : String(
          (
            ((nodeInformation.fiatStats?.value || 65000) / SATSPERBITCOIN) *
            Number(purchaseAmount)
          ).toFixed(2),
        );
  };
  console.log(onChainAmounts);

  const satAmount =
    localSatAmount === 'sats' || localSatAmount === 'hidden'
      ? purchaseAmount
      : convertedValue();

  useEffect(() => {
    async function getOnChainLimits() {
      const currentLimits = await fetchOnchainLimits();
      setOnChainAmounts(currentLimits.receive);
    }
    getOnChainLimits();
  }, []);

  console.log(satAmount, 'SAT AMOUNT');

  if (!Object.keys(onChainAmounts).length) {
    return (
      <FullLoadingScreen textStyles={{textAlign: 'center'}} text={'Loading'} />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          //   style={{position: 'absolute', zIndex: 99}}
          onPress={() => {
            navigate.goBack();
          }}>
          <ThemeImage
            darkModeIcon={ICONS.smallArrowLeft}
            lightModeIcon={ICONS.smallArrowLeft}
            lightsOutIcon={ICONS.arrow_small_left_white}
          />
        </TouchableOpacity>
      </View>
      <View
        style={{
          flex: 1,
        }}>
        <ScrollView>
          <TouchableOpacity
            onPress={() => {
              Keyboard.dismiss();
              setPurchaseAmount(convertedValue());
              setLocalSatAmount(prev => {
                if (prev === 'fiat') {
                  return 'sats';
                } else return 'fiat';
              });

              setTimeout(() => {
                setIsAmountFocused(true);
              }, 200);
            }}
            style={[
              styles.textInputContainer,
              {
                alignItems: 'center',
                opacity: !purchaseAmount ? 0.5 : 1,
              },
            ]}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {masterInfoObject.satDisplay === 'symbol' &&
                (localSatAmount === 'sats' ||
                  (localSatAmount === 'hidden' && true)) && (
                  <Icon
                    color={textColor}
                    width={35}
                    height={35}
                    name={'bitcoinB'}
                  />
                )}
              <TextInput
                style={{
                  ...styles.memoInput,
                  width: 'auto',
                  maxWidth: '70%',
                  includeFontPadding: false,
                  color: textColor,
                  fontSize: 50,
                  padding: 0,
                  pointerEvents: 'none',
                }}
                value={formatBalanceAmount(purchaseAmount)}
                readOnly={true}
                maxLength={150}
              />
              <ThemeText
                content={`${
                  masterInfoObject.satDisplay === 'symbol' &&
                  (localSatAmount === 'sats' ||
                    (localSatAmount === 'hidden' && true))
                    ? ''
                    : localSatAmount === 'fiat'
                    ? ` ${nodeInformation.fiatStats.coin || 'USD'}`
                    : localSatAmount === 'hidden' && !true
                    ? '* * * * *'
                    : ' sats'
                }`}
                styles={{
                  fontSize: SIZES.xxLarge,
                  includeFontPadding: false,
                }}
              />
            </View>

            <FormattedSatText
              containerStyles={{opacity: !purchaseAmount ? 0.5 : 1}}
              neverHideBalance={true}
              iconHeight={15}
              iconWidth={15}
              styles={{includeFontPadding: false}}
              globalBalanceDenomination={
                localSatAmount === 'sats' || localSatAmount === 'hidden'
                  ? 'fiat'
                  : 'sats'
              }
              formattedBalance={formatBalanceAmount(convertedValue())}
            />
          </TouchableOpacity>
        </ScrollView>

        {isAmountFocused && (
          <CustomNumberKeyboard
            showDot={localSatAmount === 'fiat'}
            frompage="sendContactsPage"
            setInputValue={setPurchaseAmount}
          />
        )}
        <CustomButton
          buttonStyles={{...CENTER}}
          textContent={'Purchase'}
          actionFunction={startBitcoinPurchase}
        />
      </View>
    </View>
  );

  async function startBitcoinPurchase() {
    if (
      purchaseAmount < onChainAmounts.minSat ||
      purchaseAmount > onChainAmounts.maxSat
    )
      return;
    try {
      const currentLimits = await fetchOnchainLimits();

      console.log(`Minimum amount, in sats: ${currentLimits.receive.minSat}`);
      console.log(`Maximum amount, in sats: ${currentLimits.receive.maxSat}`);
      const prepareRes = await prepareBuyBitcoin({
        provider: BuyBitcoinProvider.MOONPAY,
        amountSat: currentLimits.receive.minSat,
      });

      // Check the fees are acceptable before proceeding
      const receiveFeesSat = prepareRes.feesSat;
      console.log(`Fees: ${receiveFeesSat} sats`);
      const url = await buyBitcoin({
        prepareResponse: prepareRes,
      });
      console.log(url);
    } catch (err) {
      console.error(err);
    }
  }
}

const styles = StyleSheet.create({
  container: {flex: 1, width: WINDOWWIDTH, ...CENTER},
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',

    ...CENTER,
  },
  topBarText: {
    fontSize: SIZES.large,
    textTransform: 'capitalize',
    includeFontPadding: false,
    ...CENTER,
  },
  textInputContainer: {
    width: '95%',
    margin: 0,
    ...CENTER,
  },
  memoInput: {
    width: '100%',
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.xxLarge,
  },
});
