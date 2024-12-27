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
import Icon from '../../../../functions/CustomElements/Icon';
import FormattedSatText from '../../../../functions/CustomElements/satTextDisplay';
import GetThemeColors from '../../../../hooks/themeColors';
import ThemeImage from '../../../../functions/CustomElements/themeImage';
import {useTranslation} from 'react-i18next';
import {calculateBoltzFeeNew} from '../../../../functions/boltz/boltzFeeNew';
import CustomSearchInput from '../../../../functions/CustomElements/searchInput';

export default function EditReceivePaymentInformation(props) {
  const navigate = useNavigation();
  const {nodeInformation, masterInfoObject, minMaxLiquidSwapAmounts} =
    useGlobalContextProvider();
  const [amountValue, setAmountValue] = useState('');
  const [isKeyboardFocused, setIsKeyboardFocused] = useState(false);
  const [paymentDescription, setPaymentDescription] = useState('');
  const {textColor} = GetThemeColors();
  const {t} = useTranslation();

  const fromPage = props.route.params.from;
  const [inputDenomination, setInputDenomination] = useState(
    masterInfoObject.userBalanceDenomination != 'fiat' ? 'sats' : 'fiat',
  );

  console.log(minMaxLiquidSwapAmounts);
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
      ? localSatAmount >= minMaxLiquidSwapAmounts.receive.minSat &&
        localSatAmount <= minMaxLiquidSwapAmounts.receive.maxSat
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
                      width={35}
                      height={35}
                      name={'bitcoinB'}
                    />
                  )}
                <TextInput
                  style={{
                    width: 'auto',
                    maxWidth: '70%',
                    includeFontPadding: false,
                    color: textColor,
                    fontSize: 50,
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
                  styles={{fontSize: 50, includeFontPadding: false}}
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
                        localSatAmount < minMaxLiquidSwapAmounts.receive.maxSat
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
                        <TouchableOpacity
                          onPress={() =>
                            navigate.navigate('InformationPopup', {
                              textContent:
                                'You are currently receiving enough Bitcoin to open a lightning channel and to do so costs an initial fee.',
                              buttonText: 'I understand',
                            })
                          }
                          style={{
                            marginTop: 10,
                          }}>
                          <Text
                            style={{
                              color: textColor,
                              fontSize: SIZES.medium,
                              fontFamily: FONT.Title_Regular,
                              width: 200,
                              textAlign: 'center',
                              ...CENTER,
                            }}>
                            Fee will be shown on the next page{' '}
                            <ThemeImage
                              styles={{width: 15, height: 15}}
                              lightsOutIcon={ICONS.aboutIconWhite}
                              lightModeIcon={ICONS.aboutIcon}
                              darkModeIcon={ICONS.aboutIcon}
                            />
                          </Text>
                        </TouchableOpacity>
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
                              calculateBoltzFeeNew(
                                localSatAmount,
                                'ln-liquid',
                                minMaxLiquidSwapAmounts['reverseSwapStats'],
                              ),
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
                (localSatAmount > minMaxLiquidSwapAmounts.receive.maxSat ||
                  localSatAmount < minMaxLiquidSwapAmounts.receive.minSat) &&
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
                        minMaxLiquidSwapAmounts.receive[
                          localSatAmount <
                          minMaxLiquidSwapAmounts.receive.minSat
                            ? 'minSat'
                            : 'maxSat'
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

          <CustomSearchInput
            setInputText={setPaymentDescription}
            placeholderText={t(
              'wallet.receivePages.editPaymentInfo.descriptionInputPlaceholder',
            )}
            inputText={paymentDescription}
            textInputStyles={styles.textInputStyles}
            onFocusFunction={() => setIsKeyboardFocused(true)}
            onBlurFunction={() =>
              setTimeout(() => {
                setIsKeyboardFocused(false);
              }, 200)
            }
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
    marginBottom: Platform.OS === 'ios' ? 20 : 0,
    includeFontPadding: false,
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
