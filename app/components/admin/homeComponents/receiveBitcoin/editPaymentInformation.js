import {useNavigation} from '@react-navigation/native';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
import {useCallback, useEffect, useState} from 'react';
import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import {WINDOWWIDTH} from '../../../../constants/theme';
import handleBackPress from '../../../../hooks/handleBackPress';

import {formatBalanceAmount, numberConverter} from '../../../../functions';
import CustomNumberKeyboard from '../../../../functions/CustomElements/customNumberKeyboard';
import CustomButton from '../../../../functions/CustomElements/button';
import {calculateBoltzFee} from '../../../../functions/boltz/calculateBoltzFee';
import Icon from '../../../../functions/CustomElements/Icon';
import FormattedSatText from '../../../../functions/CustomElements/satTextDisplay';
import GetThemeColors from '../../../../hooks/themeColors';
import ThemeImage from '../../../../functions/CustomElements/themeImage';
import {useTranslation} from 'react-i18next';

export default function EditReceivePaymentInformation(props) {
  const navigate = useNavigation();
  const {nodeInformation, masterInfoObject, minMaxLiquidSwapAmounts} =
    useGlobalContextProvider();
  const [amountValue, setAmountValue] = useState('');
  const [isKeyboardFocused, setIsKeyboardFocused] = useState(false);
  const [paymentDescription, setPaymentDescription] = useState('');
  const {textColor, textInputBackground, textInputColor} = GetThemeColors();
  const {t} = useTranslation();

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
  const isOverInboundLiquidity =
    nodeInformation.inboundLiquidityMsat / 1000 < localSatAmount;

  const isBetweenMinAndMaxLiquidAmount =
    nodeInformation.userBalance === 0 ||
    isOverInboundLiquidity ||
    !masterInfoObject.liquidWalletSettings.isLightningEnabled
      ? localSatAmount >= minMaxLiquidSwapAmounts.min &&
        localSatAmount <= minMaxLiquidSwapAmounts.max
      : true;

  const convertedValue = () =>
    !amountValue
      ? ''
      : inputDenomination === 'fiat'
      ? String(
          Math.round(
            (SATSPERBITCOIN / (nodeInformation.fiatStats?.value || 65000)) *
              Number(amountValue),
          ),
        )
      : String(
          (
            ((nodeInformation.fiatStats?.value || 65000) / SATSPERBITCOIN) *
            Number(amountValue)
          ).toFixed(2),
        );

  const handleBackPressFunction = useCallback(() => {
    navigate.goBack();
    return true;
  }, [navigate]);

  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, [handleBackPressFunction]);

  return (
    <GlobalThemeView>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : null}>
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
            <ThemeImage
              darkModeIcon={ICONS.smallArrowLeft}
              lightModeIcon={ICONS.smallArrowLeft}
              lightsOutIcon={ICONS.arrow_small_left_white}
            />
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
                      color={textColor}
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
                    color: textColor,
                    fontSize: SIZES.huge,
                    pointerEvents: 'none',
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

            {(masterInfoObject.liquidWalletSettings.regulateChannelOpen ||
              !masterInfoObject.liquidWalletSettings.isLightningEnabled) && (
              <View>
                {!!localSatAmount ? (
                  !isBetweenMinAndMaxLiquidAmount &&
                  !masterInfoObject.enabledEcash &&
                  (nodeInformation.userBalance == 0 ||
                    !masterInfoObject.liquidWalletSettings
                      .isLightningEnabled) ? (
                    <ThemeText
                      styles={{
                        textAlign: 'center',
                        marginTop: 10,
                      }}
                      content={`${
                        localSatAmount < minMaxLiquidSwapAmounts.max
                          ? t('constants.minimum')
                          : t('constants.maximum')
                      } ${t(
                        'wallet.receivePages.editPaymentInfo.receive_amount',
                      )}:`}
                    />
                  ) : (masterInfoObject.enabledEcash &&
                      localSatAmount < 1000) ||
                    (nodeInformation.userBalance != 0 &&
                      masterInfoObject.liquidWalletSettings
                        .isLightningEnabled &&
                      !isOverInboundLiquidity) ? (
                    <FormattedSatText
                      neverHideBalance={true}
                      iconHeight={15}
                      iconWidth={15}
                      frontText={`${t('constants.fee')}: `}
                      containerStyles={{marginTop: 10}}
                      styles={{includeFontPadding: false}}
                      globalBalanceDenomination={inputDenomination}
                      formattedBalance={formatBalanceAmount(
                        numberConverter(
                          0,
                          inputDenomination,
                          nodeInformation,
                          inputDenomination != 'fiat' ? 0 : 2,
                        ),
                      )}
                    />
                  ) : (
                    // localSatAmount
                    <View>
                      {masterInfoObject.liquidWalletSettings
                        .regulatedChannelOpenSize <= localSatAmount &&
                      masterInfoObject.liquidWalletSettings
                        .isLightningEnabled ? (
                        <ThemeText
                          styles={{
                            textAlign: 'center',
                            width: '80%',
                            ...CENTER,
                            marginTop: 10,
                          }}
                          content={
                            'Channel open fee will be shown on the next page'
                          }
                        />
                      ) : (
                        <FormattedSatText
                          neverHideBalance={true}
                          iconHeight={15}
                          iconWidth={15}
                          frontText={`${t('constants.fee')}: `}
                          containerStyles={{marginTop: 10}}
                          styles={{includeFontPadding: false}}
                          globalBalanceDenomination={inputDenomination}
                          formattedBalance={formatBalanceAmount(
                            numberConverter(
                              minMaxLiquidSwapAmounts.reverseSwapStats?.fees
                                ?.minerFees?.claim +
                                minMaxLiquidSwapAmounts.reverseSwapStats?.fees
                                  ?.minerFees?.lockup +
                                Math.round(localSatAmount * 0.0025),
                              inputDenomination,
                              nodeInformation,
                              inputDenomination != 'fiat' ? 0 : 2,
                            ),
                          )}
                        />
                      )}
                    </View>
                  )
                ) : (
                  <ThemeText
                    styles={{
                      textAlign: 'center',
                      marginTop: 10,
                    }}
                    content={` `}
                  />
                )}

                {!!localSatAmount &&
                (localSatAmount > minMaxLiquidSwapAmounts.max ||
                  localSatAmount < minMaxLiquidSwapAmounts.min) &&
                !masterInfoObject.enabledEcash &&
                (nodeInformation.userBalance === 0 ||
                  !masterInfoObject.liquidWalletSettings.isLightningEnabled) ? (
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
                  <ThemeText content={' '} />
                )}
              </View>
            )}
          </ScrollView>

          <TextInput
            onChangeText={setPaymentDescription}
            onFocus={
              () =>
                // setTimeout(() => {
                setIsKeyboardFocused(true)
              // }, 1)
            }
            onBlur={() =>
              setTimeout(() => {
                setIsKeyboardFocused(false);
              }, 200)
            }
            style={{
              ...styles.textInputStyles,
              color: textInputColor,
              backgroundColor: textInputBackground,
            }}
            placeholder={t(
              'wallet.receivePages.editPaymentInfo.descriptionInputPlaceholder',
            )}
            placeholderTextColor={COLORS.opaicityGray}
          />
          {!isKeyboardFocused && (
            <>
              <CustomNumberKeyboard
                showDot={inputDenomination === 'fiat'}
                setInputValue={setAmountValue}
              />

              <CustomButton
                buttonStyles={{
                  opacity:
                    (isBetweenMinAndMaxLiquidAmount ||
                      !masterInfoObject.liquidWalletSettings
                        .regulateChannelOpen ||
                      masterInfoObject.enabledEcash) &&
                    !!localSatAmount
                      ? 1
                      : 0.5,
                  ...CENTER,
                }}
                actionFunction={() => {
                  console.log(localSatAmount);
                  handleSubmit(localSatAmount);
                }}
                textContent={t('constants.request')}
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </GlobalThemeView>
  );

  function handleSubmit(localSatAmount) {
    if (
      !isBetweenMinAndMaxLiquidAmount &&
      masterInfoObject.liquidWalletSettings.regulateChannelOpen &&
      !masterInfoObject.enabledEcash
    )
      return;

    if (!localSatAmount) return;
    if (fromPage === 'homepage') {
      navigate.replace('ReceiveBTC', {
        receiveAmount: Number(localSatAmount),
        description: paymentDescription,
      });
    } else {
      navigate.navigate('ReceiveBTC', {
        receiveAmount: Number(localSatAmount),
        description: paymentDescription,
      });
    }

    setAmountValue(0);
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },

  satValue: {
    textAlign: 'center',
  },

  textInputContainer: {
    width: '95%',
  },

  textInputStyles: {
    width: '90%',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: Platform.OS === 'ios' ? 20 : 0,
    includeFontPadding: false,
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
    ...CENTER,
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
});
