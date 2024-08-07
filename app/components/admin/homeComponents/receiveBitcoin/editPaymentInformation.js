import {useNavigation} from '@react-navigation/native';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  CENTER,
  COLORS,
  FONT,
  ICONS,
  SATSPERBITCOIN,
  SHADOWS,
  SIZES,
} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useEffect, useMemo, useState} from 'react';
import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import {WINDOWWIDTH} from '../../../../constants/theme';
import handleBackPress from '../../../../hooks/handleBackPress';
import {backArrow} from '../../../../constants/styles';
import {formatBalanceAmount, numberConverter} from '../../../../functions';
import CustomNumberKeyboard from '../../../../functions/CustomElements/customNumberKeyboard';
import CustomButton from '../../../../functions/CustomElements/button';
import {calculateBoltzFee} from '../../../../functions/boltz/calculateBoltzFee';
import Icon from '../../../../functions/CustomElements/Icon';
import FormattedSatText from '../../../../functions/CustomElements/satTextDisplay';

export default function EditReceivePaymentInformation(props) {
  const navigate = useNavigation();
  const {theme, nodeInformation, masterInfoObject, minMaxLiquidSwapAmounts} =
    useGlobalContextProvider();
  const [amountValue, setAmountValue] = useState('');

  // const [descriptionValue, setDescriptionValue] = useState('');
  // const updatePaymentAmount = props.route.params.setSendingAmount;
  // const updatePaymentDescription = props.route.params.setPaymentDescription;
  const fromPage = props.route.params.from;

  const [inputDenomination, setInputDenomination] = useState(
    masterInfoObject.userBalanceDenomination != 'fiat' ? 'sats' : 'fiat',
  );

  console.log(inputDenomination, 'T');
  const localSatAmount =
    inputDenomination === 'sats'
      ? amountValue
      : Math.round(
          SATSPERBITCOIN / (nodeInformation.fiatStats?.value || 65000),
        ) * amountValue;
  const globalSatAmount =
    masterInfoObject.userBalanceDenomination != 'fiat'
      ? Math.round(localSatAmount)
      : (
          ((nodeInformation.fiatStats?.value || 65000) / SATSPERBITCOIN) *
          localSatAmount
        ).toFixed(2);
  const isBetweenMinAndMaxLiquidAmount =
    nodeInformation.userBalance === 0 ||
    localSatAmount > nodeInformation.inboundLiquidityMsat / 1000
      ? localSatAmount >= minMaxLiquidSwapAmounts.min &&
        localSatAmount <= minMaxLiquidSwapAmounts.max
      : true;

  const convertedValue = () =>
    !amountValue
      ? ''
      : inputDenomination === 'fiat'
      ? Math.round(
          (SATSPERBITCOIN / (nodeInformation.fiatStats?.value || 65000)) *
            Number(amountValue),
        )
      : (
          ((nodeInformation.fiatStats?.value || 65000) / SATSPERBITCOIN) *
          Number(amountValue)
        ).toFixed(2);

  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

  const boltzFeeText = useMemo(() => {
    return `Fee ${formatBalanceAmount(
      numberConverter(
        minMaxLiquidSwapAmounts.reverseSwapStats?.fees?.minerFees?.claim +
          minMaxLiquidSwapAmounts.reverseSwapStats?.fees?.minerFees?.lockup +
          Math.round(localSatAmount * 0.0025),
        inputDenomination,
        nodeInformation,
        inputDenomination != 'fiat' ? 0 : 2,
      ),
    )} ${
      inputDenomination != 'fiat' ? 'sats' : nodeInformation.fiatStats.coin
    }`;
  }, [localSatAmount, inputDenomination]);

  return (
    <GlobalThemeView>
      {/* <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}>
        <KeyboardAvoidingView
          style={{flex: 1, alignItems: 'center'}}
          behavior={Platform.OS === 'ios' ? 'padding' : null}> */}
      <View
        style={{
          flex: 1,
          width: WINDOWWIDTH,
          ...CENTER,
        }}>
        <TouchableOpacity
          onPress={() => {
            navigate.goBack();
          }}>
          <Image source={ICONS.smallArrowLeft} style={[backArrow]} />
        </TouchableOpacity>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flex: 1,
            justifyContent: 'center',
            width: '100%',
          }}>
          <View style={{alignItems: 'center'}}>
            <TouchableOpacity
              onPress={() => {
                setInputDenomination(prev => {
                  const newPrev = prev === 'sats' ? 'fiat' : 'sats';

                  return newPrev;
                });
                setAmountValue(convertedValue() || '');
              }}
              style={[
                styles.textInputContainer,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: !amountValue ? 0.5 : 1,
                },
              ]}>
              {masterInfoObject.satDisplay === 'symbol' &&
                inputDenomination === 'sats' && (
                  <Icon
                    color={theme ? COLORS.darkModeText : COLORS.lightModeText}
                    width={30}
                    height={30}
                    name={'bitcoinB'}
                  />
                )}
              <TextInput
                style={{
                  width: 'auto',
                  maxWidth: '70%',
                  includeFontPadding: false,
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  fontSize: SIZES.huge,
                }}
                value={formatBalanceAmount(amountValue)}
                readOnly={true}
              />

              <ThemeText
                content={`${
                  masterInfoObject.satDisplay === 'symbol' &&
                  inputDenomination === 'sats'
                    ? ''
                    : inputDenomination === 'fiat'
                    ? ` ${nodeInformation.fiatStats.coin}`
                    : inputDenomination === 'hidden'
                    ? '* * * * *'
                    : ' sats'
                }`}
                styles={{fontSize: SIZES.huge, includeFontPadding: false}}
              />
            </TouchableOpacity>

            <FormattedSatText
              containerStyles={{opacity: !amountValue ? 0.5 : 1}}
              neverHideBalance={true}
              iconHeight={15}
              iconWidth={15}
              styles={{includeFontPadding: false, ...styles.satValue}}
              globalBalanceDenomination={
                inputDenomination === 'sats' ? 'fiat' : 'sats'
              }
              formattedBalance={formatBalanceAmount(convertedValue())}
            />
          </View>

          {masterInfoObject.liquidWalletSettings.regulateChannelOpen && (
            <>
              <ThemeText
                styles={{
                  textAlign: 'center',
                  marginTop: 10,
                }}
                content={
                  !isBetweenMinAndMaxLiquidAmount
                    ? `${
                        localSatAmount < minMaxLiquidSwapAmounts.max
                          ? 'Minimum'
                          : 'Maximum'
                      } receive amount:`
                    : boltzFeeText
                }
              />
              {localSatAmount > minMaxLiquidSwapAmounts.max ||
              localSatAmount < minMaxLiquidSwapAmounts.min ? (
                <FormattedSatText
                  neverHideBalance={true}
                  iconHeight={15}
                  iconWidth={15}
                  styles={{includeFontPadding: false}}
                  globalBalanceDenomination={inputDenomination}
                  formattedBalance={formatBalanceAmount(
                    numberConverter(
                      minMaxLiquidSwapAmounts[
                        localSatAmount < minMaxLiquidSwapAmounts.max
                          ? 'min'
                          : 'max'
                      ],
                      inputDenomination,
                      nodeInformation,
                      inputDenomination === 'fiat' ? 2 : 0,
                    ),
                  )}
                />
              ) : (
                <Text> </Text>
              )}
            </>
          )}

          {/* <View>
            <Text
              style={[
                styles.headerText,
                {
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                },
              ]}>
              Memo
            </Text>
          </View> */}

          {/* <View
            style={[
              styles.textInputContainer,
              {
                backgroundColor: theme
                  ? COLORS.darkModeBackgroundOffset
                  : COLORS.lightModeBackgroundOffset,
                height: 145,
                padding: 10,
                borderRadius: 8,
              },
            ]}>
            <TextInput
              placeholder="Description"
              placeholderTextColor={
                theme ? COLORS.darkModeText : COLORS.lightModeText
              }
              onChangeText={value => setDescriptionValue(value)}
              editable
              multiline
              textAlignVertical="top"
              numberOfLines={4}
              maxLength={150}
              lineBreakStrategyIOS="standard"
              value={descriptionValue}
              style={[
                styles.memoInput,
                {
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  fontSize: SIZES.medium,
                  height: 'auto',
                  width: 'auto',
                },
              ]}
            />
          </View> */}
        </ScrollView>

        <CustomNumberKeyboard
          showDot={inputDenomination === 'fiat'}
          setInputValue={setAmountValue}
        />

        <CustomButton
          buttonStyles={{
            opacity:
              isBetweenMinAndMaxLiquidAmount ||
              !masterInfoObject.liquidWalletSettings.regulateChannelOpen
                ? 1
                : 0.5,
            ...CENTER,
          }}
          textStyles={{textTransform: 'uppercase'}}
          actionFunction={handleSubmit}
          textContent={'Request'}
        />

        {/* <TouchableOpacity
          onPress={handleSubmit}
          style={[
            styles.button,
            {
              backgroundColor: theme
                ? COLORS.darkModeText
                : COLORS.lightModeText,
              opacity:
                isBetweenMinAndMaxLiquidAmount ||
                !masterInfoObject.liquidWalletSettings.regulateChannelOpen
                  ? 1
                  : 0.5,
            },
          ]}>
          <Text
            style={[
              styles.buttonText,
              {
                color: theme ? COLORS.lightModeText : COLORS.darkModeText,
              },
            ]}>
            Request
          </Text>
        </TouchableOpacity> */}
      </View>
      {/* </KeyboardAvoidingView>
      </TouchableWithoutFeedback> */}
    </GlobalThemeView>
  );

  function handleSubmit() {
    if (
      !isBetweenMinAndMaxLiquidAmount &&
      masterInfoObject.liquidWalletSettings.regulateChannelOpen
    )
      return;
    if (fromPage === 'homepage') {
      navigate.replace('ReceiveBTC', {receiveAmount: Number(globalSatAmount)});
    } else {
      navigate.navigate('ReceiveBTC', {receiveAmount: Number(globalSatAmount)});
    }
    //  else {
    //   if (Number(amountValue)) updatePaymentAmount(Number(amountValue));
    //   else
    //     updatePaymentAmount(
    //       masterInfoObject.userBalanceDenomination === 'sats' ||
    //         masterInfoObject.userBalanceDenomination === 'hidden'
    //         ? 1
    //         : (nodeInformation.fiatStats.value / SATSPERBITCOIN) * 1,
    //     );
    //   navigate.navigate('ReceiveBTC');
    // }
    setAmountValue(0);
    // if (descriptionValue) updatePaymentDescription(descriptionValue);
    // else updatePaymentDescription('');
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },

  headerText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.xLarge,
    textAlign: 'center',
  },
  amountDenomination: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
    textAlign: 'center',
  },
  USDinput: {
    fontSize: SIZES.huge,
  },
  satValue: {
    textAlign: 'center',
  },

  textInputContainer: {
    width: '95%',
    // margin: 0,
    // ...CENTER,
  },
  memoInput: {
    width: '100%',
    fontSize: SIZES.huge,
  },

  button: {
    width: 120,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    ...SHADOWS.small,
    ...CENTER,
    marginBottom: 0,
    marginTop: 'auto',
  },
  buttonText: {
    fontFamily: FONT.Other_Regular,
    fontSize: SIZES.large,
  },
});
