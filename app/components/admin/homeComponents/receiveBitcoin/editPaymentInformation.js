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
import {useEffect, useState} from 'react';
import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import {WINDOWWIDTH} from '../../../../constants/theme';
import handleBackPress from '../../../../hooks/handleBackPress';
import {backArrow} from '../../../../constants/styles';
import {formatBalanceAmount, numberConverter} from '../../../../functions';
import CustomNumberKeyboard from '../../../../functions/CustomElements/customNumberKeyboard';
import {
  MAXLIQUIDRECEIVEANDSENDAMOUNT,
  MINLIQUIDRECEIVEANDSENDAMOUNT,
} from '../../../../constants/math';

export default function EditReceivePaymentInformation(props) {
  const navigate = useNavigation();
  const {theme, nodeInformation, masterInfoObject} = useGlobalContextProvider();
  const [amountValue, setAmountValue] = useState('');
  // const [descriptionValue, setDescriptionValue] = useState('');
  // const updatePaymentAmount = props.route.params.setSendingAmount;
  // const updatePaymentDescription = props.route.params.setPaymentDescription;
  const fromPage = props.route.params.from;

  const [inputDenomination, setInputDenomination] = useState(
    masterInfoObject.userBalanceDenomination != 'fiat' ? 'sats' : 'fiat',
  );

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
    nodeInformation.userBalance === 0
      ? localSatAmount >= MINLIQUIDRECEIVEANDSENDAMOUNT &&
        localSatAmount <= MAXLIQUIDRECEIVEANDSENDAMOUNT
      : true;

  const convertedValue = () =>
    // formatBalanceAmount(
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
  // );

  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

  console.log(typeof 1, typeof 'test');
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
          {/* <View style={{marginBottom: 5}}>
            <Text
              style={[
                styles.headerText,
                {
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  marginTop: 'auto',
                },
              ]}>
              Amount
            </Text>
          </View> */}

          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
            <TouchableOpacity
              onPress={() => {
                setInputDenomination(prev => {
                  const newPrev = prev === 'sats' ? 'fiat' : 'sats';

                  return newPrev;
                });
                setAmountValue(convertedValue());
              }}
              style={{justifyContent: 'center'}}>
              <View
                style={[
                  styles.textInputContainer,
                  {
                    // backgroundColor: theme
                    //   ? COLORS.darkModeBackgroundOffset
                    //   : COLORS.lightModeBackgroundOffset,

                    // padding: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    // justifyContent: 'center',
                    // borderRadius: 8,
                    // marginBottom: 50,
                  },
                ]}>
                <TextInput
                  style={{
                    ...styles.USDinput,
                    marginRight: 10,
                    includeFontPadding: false,
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    fontFamily: FONT.Title_Regular,
                    maxWidth: 200,
                  }}
                  value={
                    amountValue.length === 0
                      ? '0'
                      : formatBalanceAmount(amountValue)
                  }
                  readOnly={true}
                  placeholderTextColor={COLORS.lightModeText}
                />

                {/* <TextInput

                    placeholder="0"
                    placeholderTextColor={
                      theme ? COLORS.darkModeText : COLORS.lightModeText
                    }
                    keyboardType="decimal-pad"
                    value={
                      amountValue === null || amountValue === 0
                        ? ''
                        : amountValue
                    }
                    onChangeText={e => {
                      if (isNaN(e)) return;
                      setAmountValue(e);
                    }}
                    style={[
                      styles.memoInput,
                      {
                        width: 'auto',
                        maxWidth: '50%',
                        color: theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                        includeFontPadding: false,
                        padding: 0,
                        marginRight: 15,
                      },
                    ]}
                  /> */}
                <ThemeText
                  styles={{...styles.USDinput, includeFontPadding: false}}
                  content={
                    inputDenomination === 'fiat'
                      ? nodeInformation.fiatStats.coin
                      : 'sats'
                  }
                />
              </View>
              <ThemeText
                styles={{...styles.satValue}}
                content={`${formatBalanceAmount(convertedValue())} ${
                  inputDenomination === 'sats'
                    ? nodeInformation.fiatStats.coin
                    : 'sats'
                }`}
              />
            </TouchableOpacity>
          </View>

          <ThemeText
            styles={{
              color: COLORS.cancelRed,
              textAlign: 'center',
            }}
            content={
              isBetweenMinAndMaxLiquidAmount
                ? ' '
                : `Must receive between ${formatBalanceAmount(
                    numberConverter(
                      MINLIQUIDRECEIVEANDSENDAMOUNT,
                      inputDenomination,
                      nodeInformation,
                      inputDenomination === 'fiat' ? 2 : 0,
                    ),
                  )} ${
                    inputDenomination === 'fiat'
                      ? nodeInformation.fiatStats.coin
                      : 'sats'
                  } and  ${formatBalanceAmount(
                    numberConverter(
                      MAXLIQUIDRECEIVEANDSENDAMOUNT,
                      inputDenomination,
                      nodeInformation,
                      inputDenomination === 'fiat' ? 2 : 0,
                    ),
                  )} ${
                    inputDenomination === 'fiat'
                      ? nodeInformation.fiatStats.coin
                      : 'sats'
                  }`
            }
          />

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

        <TouchableOpacity
          onPress={handleSubmit}
          style={[
            styles.button,
            {
              backgroundColor: theme
                ? COLORS.darkModeText
                : COLORS.lightModeText,
              opacity: isBetweenMinAndMaxLiquidAmount ? 1 : 0.5,
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
        </TouchableOpacity>
      </View>
      {/* </KeyboardAvoidingView>
      </TouchableWithoutFeedback> */}
    </GlobalThemeView>
  );

  function handleSubmit() {
    if (!isBetweenMinAndMaxLiquidAmount) return;
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
  swapImage: {
    width: 40,
    height: 40,
    transform: [{rotate: '90deg'}],
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
