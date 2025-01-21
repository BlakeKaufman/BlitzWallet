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
import {fetchOnchainLimits} from '@breeztech/react-native-breez-sdk-liquid';
import CustomButton from '../../../../../functions/CustomElements/button';
import {useEffect, useState} from 'react';
import CustomNumberKeyboard from '../../../../../functions/CustomElements/customNumberKeyboard';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {formatBalanceAmount, numberConverter} from '../../../../../functions';
import Icon from '../../../../../functions/CustomElements/Icon';
import GetThemeColors from '../../../../../hooks/themeColors';
import FormattedSatText from '../../../../../functions/CustomElements/satTextDisplay';
import FullLoadingScreen from '../../../../../functions/CustomElements/loadingScreen';

export default function BuyBitcoinHome() {
  const {masterInfoObject, nodeInformation} = useGlobalContextProvider();
  const navigate = useNavigation();
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [inputDenomination, setInputDenomination] = useState(
    masterInfoObject.userBalanceDenomination != 'fiat' ? 'sats' : 'fiat',
  );
  const {textColor} = GetThemeColors();
  const [onChainAmounts, setOnChainAmounts] = useState({});

  const convertedValue = () =>
    !purchaseAmount
      ? ''
      : inputDenomination === 'fiat'
      ? String(
          Math.round(
            (SATSPERBITCOIN / (nodeInformation.fiatStats?.value || 65000)) *
              Number(purchaseAmount),
          ),
        )
      : String(
          (
            ((nodeInformation.fiatStats?.value || 65000) / SATSPERBITCOIN) *
            Number(purchaseAmount)
          ).toFixed(2),
        );

  const localSatAmount =
    inputDenomination === 'sats'
      ? purchaseAmount
      : Math.round(
          SATSPERBITCOIN / (nodeInformation.fiatStats?.value || 65000),
        ) * purchaseAmount;

  useEffect(() => {
    async function getOnChainLimits() {
      const currentLimits = await fetchOnchainLimits();
      setOnChainAmounts(currentLimits.receive);
    }
    getOnChainLimits();
  }, []);

  const canPurchase =
    localSatAmount &&
    localSatAmount >= onChainAmounts.minSat &&
    localSatAmount <= onChainAmounts.maxSat;

  if (!Object.keys(onChainAmounts).length) {
    return (
      <FullLoadingScreen textStyles={{textAlign: 'center'}} text={'Loading'} />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
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
        <ScrollView
          contentContainerStyle={{
            flex: 1,
            justifyContent: 'center',
            width: '100%',
          }}>
          <TouchableOpacity
            onPress={() => {
              Keyboard.dismiss();
              setInputDenomination(prev => {
                const newPrev = prev === 'sats' ? 'fiat' : 'sats';

                return newPrev;
              });
              setPurchaseAmount(convertedValue() || '');
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
                (inputDenomination === 'sats' ||
                  (inputDenomination === 'hidden' && true)) && (
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
                  (inputDenomination === 'sats' ||
                    (inputDenomination === 'hidden' && true))
                    ? ''
                    : inputDenomination === 'fiat'
                    ? ` ${nodeInformation.fiatStats.coin || 'USD'}`
                    : inputDenomination === 'hidden' && !true
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
                inputDenomination === 'sats' || inputDenomination === 'hidden'
                  ? 'fiat'
                  : 'sats'
              }
              formattedBalance={formatBalanceAmount(convertedValue())}
            />
          </TouchableOpacity>

          {!canPurchase && (
            <>
              <ThemeText
                styles={{
                  textAlign: 'center',
                  marginTop: 10,
                }}
                content={`${
                  localSatAmount < onChainAmounts.minSat ? 'Minimum' : 'Maximum'
                } purchase amount:`}
              />
              <FormattedSatText
                neverHideBalance={true}
                iconHeight={15}
                iconWidth={15}
                frontText={``}
                containerStyles={{marginTop: 10}}
                styles={{includeFontPadding: false}}
                globalBalanceDenomination={inputDenomination}
                formattedBalance={formatBalanceAmount(
                  numberConverter(
                    localSatAmount < onChainAmounts.minSat
                      ? onChainAmounts.minSat
                      : onChainAmounts.maxSat,
                    inputDenomination,
                    nodeInformation,
                    inputDenomination != 'fiat' ? 0 : 2,
                  ),
                )}
              />
            </>
          )}
        </ScrollView>

        <CustomNumberKeyboard
          showDot={inputDenomination === 'fiat'}
          frompage="sendContactsPage"
          setInputValue={setPurchaseAmount}
        />

        <CustomButton
          buttonStyles={{
            ...CENTER,
            opacity: canPurchase ? 1 : 0.5,
            width: 'auto',
          }}
          textContent={'Check Fees'}
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
      navigate.navigate('CustomHalfModal', {
        wantedContent: 'confirmBitcoinPurchase',
        purchaseAmount: purchaseAmount,
        sliderHight: 0.5,
      });
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
