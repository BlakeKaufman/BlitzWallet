import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  GlobalThemeView,
  ThemeText,
} from '../../../../../functions/CustomElements';
import ThemeImage from '../../../../../functions/CustomElements/themeImage';
import {
  CENTER,
  COLORS,
  ICONS,
  SATSPERBITCOIN,
  SIZES,
} from '../../../../../constants';
import {formatBalanceAmount} from '../../../../../functions';
import {useState} from 'react';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import GetThemeColors from '../../../../../hooks/themeColors';
import CustomButton from '../../../../../functions/CustomElements/button';
import {ANDROIDSAFEAREA} from '../../../../../constants/styles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import RenderHTML from 'react-native-render-html';
import FormattedSatText from '../../../../../functions/CustomElements/satTextDisplay';
import {useGlobalAppData} from '../../../../../../context-store/appData';
import {useNavigation} from '@react-navigation/native';
import FullLoadingScreen from '../../../../../functions/CustomElements/loadingScreen';
import {
  parseInput,
  reportIssue,
  ReportIssueRequestVariant,
  sendPayment,
} from '@breeztech/react-native-breez-sdk';
import {
  LIGHTNINGAMOUNTBUFFER,
  LIQUIDAMOUTBUFFER,
} from '../../../../../constants/math';
import createLiquidToLNSwap from '../../../../../functions/boltz/liquidToLNSwap';
import {getBoltzWsUrl} from '../../../../../functions/boltz/boltzEndpoitns';
import handleSubmarineClaimWSS from '../../../../../functions/boltz/handle-submarine-claim-wss';
import {useWebView} from '../../../../../../context-store/webViewContext';
import {sendLiquidTransaction} from '../../../../../functions/liquidWallet';
import getGiftCardAPIEndpoint from './getGiftCardAPIEndpoint';
import callGiftCardsAPI from './giftCardAPI';

export default function ExpandedGiftCardPage(props) {
  const {
    theme,
    darkModeType,
    nodeInformation,
    liquidNodeInformation,
    contactsPrivateKey,
  } = useGlobalContextProvider();
  const {backgroundOffset, textColor} = GetThemeColors();
  const {decodedGiftCards, toggleGlobalAppDataInformation} = useGlobalAppData();
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();
  const [numberOfGiftCards, setNumberOfGiftCards] = useState('1');
  const selectedItem = props.route?.params?.selectedItem;
  const [selectedDenomination, setSelectedDenomination] = useState(
    selectedItem.denominationType === 'Variable'
      ? ''
      : selectedItem.denominations[0],
  );
  const navigate = useNavigation();
  const {webViewRef, setWebViewArgs} = useWebView();

  const [isPurchasingGift, setIsPurchasingGift] = useState({
    isPurasing: false,
    hasError: false,
    errorMessage: '',
  });

  const canPurchaseCard =
    selectedDenomination >= selectedItem.denominations[0] &&
    selectedDenomination <=
      selectedItem.denominations[selectedItem.denominations.length - 1];

  const isDescriptionHTML = selectedItem.description.includes('<p>');
  const isTermsHTML = selectedItem.terms.includes('<p>');

  // console.log(
  //   selectedItem,
  //   formatBalanceAmount(
  //     Math.round(
  //       (selectedDenomination / nodeInformation.fiatStats.value) *
  //         SATSPERBITCOIN *
  //         (selectedItem.defaultSatsBackPercentage / 100),
  //     ),
  //   ),
  //   canPurchaseCard,
  //   selectedItem.denominations,
  // );

  console.log(selectedDenomination);
  return (
    <KeyboardAvoidingView style={{flex: 1}}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <GlobalThemeView styles={{paddingBottom: 0}} useStandardWidth={true}>
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => {
                props.navigation.goBack();
              }}
              style={{marginRight: 'auto'}}>
              <ThemeImage
                lightModeIcon={ICONS.smallArrowLeft}
                darkModeIcon={ICONS.smallArrowLeft}
                lightsOutIcon={ICONS.arrow_small_left_white}
              />
            </TouchableOpacity>
          </View>
          {isPurchasingGift.isPurasing ? (
            <FullLoadingScreen
              showLoadingIcon={isPurchasingGift.hasError ? false : true}
              text={
                isPurchasingGift.hasError
                  ? isPurchasingGift.errorMessage
                  : 'Purchasing gift card, do not leave the page.'
              }
            />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{height: 30}}></View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 20,
                }}>
                <Image
                  style={{
                    width: 80,
                    height: 80,
                    marginRight: 20,
                    borderRadius: 15,
                  }}
                  source={{uri: selectedItem.logo}}
                />
                <View>
                  <ThemeText
                    styles={{
                      fontWeight: '500',
                      marginBottom: 5,
                      fontSize: SIZES.xLarge,
                      marginBottom: 15,
                    }}
                    content={selectedItem.name}
                  />
                  <ThemeText
                    content={`Get up to ${selectedItem.defaultSatsBackPercentage}% stats back`}
                  />
                </View>
              </View>

              <ThemeText
                styles={{marginBottom: 15}}
                content={'Select an amount'}
              />

              <View
                style={{
                  padding: 20,
                  backgroundColor: backgroundOffset,

                  borderRadius: 10,
                }}>
                {selectedItem.denominationType === 'Variable' && (
                  <>
                    <TextInput
                      keyboardType={'number-pad'}
                      value={String(selectedDenomination)}
                      onChangeText={value => setSelectedDenomination(value)}
                      placeholder={`$${selectedItem.denominations[0]} - $${selectedItem.denominations[1]}`}
                      placeholderTextColor={COLORS.opaicityGray}
                      style={{
                        ...styles.textInput,
                        backgroundColor: COLORS.darkModeText,
                        borderWidth: 1,
                        borderColor:
                          !canPurchaseCard && selectedDenomination
                            ? COLORS.cancelRed
                            : backgroundOffset,
                        color: COLORS.lightModeText,
                      }}
                    />
                    {!canPurchaseCard && !!selectedDenomination && (
                      <ThemeText
                        styles={{
                          color:
                            theme && darkModeType
                              ? COLORS.white
                              : COLORS.cancelRed,
                          marginBottom: 10,
                          textAlign: 'center',
                        }}
                        content={`You can buy a ${
                          selectedDenomination <= selectedItem.denominations[0]
                            ? 'min'
                            : 'max'
                        } amount of $${
                          selectedDenomination <= selectedItem.denominations[0]
                            ? selectedItem.denominations[0]
                            : selectedItem.denominations[1]
                        }`}
                      />
                    )}
                  </>
                )}

                <View
                  style={{
                    flexDirection: 'row',
                    //   justifyContent: 'center',
                    rowGap: Platform.OS === 'ios' ? '15%' : '2%',
                    columnGap: Platform.OS === 'ios' ? '15%' : '2%',
                    flexWrap: 'wrap',
                  }}>
                  {selectedItem[
                    selectedItem.denominationType === 'Variable'
                      ? 'defaultDenoms'
                      : 'denominations'
                  ].map(item => {
                    return (
                      <TouchableOpacity
                        onPress={() => setSelectedDenomination(item)}
                        key={item}
                        style={{
                          width: '32%',
                          minWidth: 100,
                          paddingVertical: 10,
                          paddingHorizontal: 20,
                          borderRadius: 8,
                          backgroundColor:
                            theme && darkModeType
                              ? selectedDenomination == item
                                ? COLORS.lightsOutBackground
                                : COLORS.white
                              : selectedDenomination == item
                              ? theme
                                ? COLORS.darkModeBackground
                                : COLORS.primary
                              : theme
                              ? COLORS.darkModeText
                              : COLORS.lightBlueForGiftCards,
                          alignItems: 'center',
                        }}>
                        <ThemeText
                          styles={{
                            color:
                              theme && darkModeType
                                ? selectedDenomination == item
                                  ? COLORS.darkModeText
                                  : COLORS.lightModeText
                                : selectedDenomination == item
                                ? theme
                                  ? COLORS.darkModeText
                                  : COLORS.white
                                : theme
                                ? COLORS.lightModeText
                                : COLORS.white,
                          }}
                          content={`$${item}`}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginVertical: Platform.OS === 'ios' ? 25 : 15,
                  }}>
                  <ThemeText styles={{}} content={'Quantity'} />
                  <TextInput
                    keyboardType="number-pad"
                    onChangeText={setNumberOfGiftCards}
                    value={numberOfGiftCards}
                    style={{
                      ...styles.textInput,
                      width: 'auto',
                      marginRight: 0,
                      marginBottom: 0,
                      paddingHorizontal: Platform.OS == 'ios' ? 15 : 10,
                      color: COLORS.lightModeText,
                      textAlign: 'center',
                    }}
                  />
                </View>
                <FormattedSatText
                  containerStyles={{marginTop: 0, marginRight: 'auto'}}
                  neverHideBalance={true}
                  iconHeight={25}
                  iconWidth={25}
                  styles={{
                    includeFontPadding: false,
                  }}
                  frontText={'Rewards: '}
                  globalBalanceDenomination={'sats'}
                  formattedBalance={
                    selectedDenomination == 0 || !canPurchaseCard
                      ? 0
                      : formatBalanceAmount(
                          Math.round(
                            (selectedDenomination /
                              nodeInformation.fiatStats.value) *
                              SATSPERBITCOIN *
                              (selectedItem.defaultSatsBackPercentage / 100),
                          ),
                        )
                  }
                />
              </View>

              <CustomButton
                buttonStyles={{
                  width: 'auto',
                  ...CENTER,
                  marginBottom: 40,
                  marginTop: 50,
                  backgroundColor:
                    theme && darkModeType
                      ? COLORS.lightsOutBackgroundOffset
                      : COLORS.primary,
                  opacity: canPurchaseCard && numberOfGiftCards >= 1 ? 1 : 0.4,
                }}
                textStyles={{
                  color: COLORS.darkModeText,
                  paddingVertical: 10,
                }}
                textContent={'Purchase gift card'}
                actionFunction={() => {
                  if (!canPurchaseCard || numberOfGiftCards < 1) return;
                  navigate.navigate('CustomHalfModal', {
                    wantedContent: 'giftCardConfirm',
                    quantity: numberOfGiftCards,
                    price: selectedDenomination,
                    productId: selectedItem.id,
                    purchaseGiftCard: () => purchaseGiftCard(),

                    sliderHight: 0.5,
                  });
                }}
              />
              <ThemeText
                styles={{
                  fontSize: SIZES.large,
                  fontWeight: 500,
                  marginBottom: 20,
                  textAlign: 'center',
                }}
                content={'Terms'}
              />

              {selectedItem.description && (
                <>
                  {isDescriptionHTML ? (
                    <RenderHTML
                      tagsStyles={{
                        p: {color: textColor, fontSize: SIZES.medium},
                        span: {color: textColor, fontSize: SIZES.medium},
                        div: {color: textColor, fontSize: SIZES.medium},
                        li: {color: textColor, fontSize: SIZES.medium},
                        ul: {color: textColor, fontSize: SIZES.medium},
                        ol: {color: textColor, fontSize: SIZES.medium},
                      }}
                      contentWidth={width}
                      source={{html: selectedItem.description}}
                    />
                  ) : (
                    <ThemeText content={selectedItem.description} />
                  )}
                </>
              )}
              <View style={{height: 40}}></View>

              {isTermsHTML ? (
                <RenderHTML
                  tagsStyles={{
                    // Apply styles to all text elements
                    p: {color: textColor},
                    span: {color: textColor},
                    div: {color: textColor},
                    li: {color: textColor},
                    // Add other tags if necessary
                  }}
                  contentWidth={width}
                  source={{html: selectedItem.terms}}
                />
              ) : (
                <ThemeText content={selectedItem.terms} />
              )}

              {Platform.OS === 'ios' && (
                <View
                  style={{
                    height: insets.bottom + 20,
                  }}
                />
              )}
            </ScrollView>
          )}
        </GlobalThemeView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

  async function purchaseGiftCard() {
    try {
      setIsPurchasingGift(prev => {
        return {...prev, isPurasing: true};
      });

      const purchaseGiftResponse = await callGiftCardsAPI({
        apiEndpoint: 'buyGiftCard',
        accessToken: decodedGiftCards.profile?.accessToken,
        productId: selectedItem.id, //string
        cardValue: Number(selectedDenomination), //number
        quantity: Number(numberOfGiftCards), //number
      });
      // const response = await fetch(
      //   `${getGiftCardAPIEndpoint()}.netlify/functions/theBitcoinCompany`,
      //   {
      //     method: 'POST',
      //     body: JSON.stringify({
      //       type: 'buyGiftCard',
      //       access_token: decodedGiftCards.profile?.accessToken,
      //       productId: selectedItem.id, //string
      //       cardValue: Number(selectedDenomination), //number
      //       quantity: Number(numberOfGiftCards), //number
      //     }),
      //   },
      // );

      // const data = await response.json();

      if (purchaseGiftResponse.statusCode === 400) {
        setIsPurchasingGift(prev => {
          return {...prev, hasError: true, errorMessage: data.error};
        });
        return;
      }
      const responseInvoice = purchaseGiftResponse.body.response.result.invoice;
      const parsedInput = await parseInput(responseInvoice);
      const sendingAmountSat = parsedInput.invoice.amountMsat / 1000;

      if (
        nodeInformation.userBalance >=
        sendingAmountSat + LIGHTNINGAMOUNTBUFFER
      ) {
        try {
          await sendPayment({
            bolt11: responseInvoice,
          });
          // save invoice detials to db
        } catch (err) {
          try {
            setIsPurchasingGift(prev => {
              return {...prev, hasError: true, errorMessage: 'Payment failed'};
            });
            const paymentHash = parsedInput.invoice.paymentHash;
            await reportIssue({
              type: ReportIssueRequestVariant.PAYMENT_FAILURE,
              data: {paymentHash},
            });
          } catch (err) {
            console.log(err);
          }
        }
      } else if (
        liquidNodeInformation.userBalance >=
        sendingAmountSat + LIQUIDAMOUTBUFFER
      ) {
        const {swapInfo, privateKey} = await createLiquidToLNSwap(
          responseInvoice,
        );

        if (!swapInfo?.expectedAmount || !swapInfo?.address) {
          navigate.navigate('ErrorScreen', {
            errorMessage: 'Error paying with liquid',
          });
          setIsPaying(false);
          return;
        }

        const refundJSON = {
          id: swapInfo.id,
          asset: 'L-BTC',
          version: 3,
          privateKey: privateKey,
          blindingKey: swapInfo.blindingKey,
          claimPublicKey: swapInfo.claimPublicKey,
          timeoutBlockHeight: swapInfo.timeoutBlockHeight,
          swapTree: swapInfo.swapTree,
        };

        const webSocket = new WebSocket(
          `${getBoltzWsUrl(process.env.BOLTZ_ENVIRONMENT)}`,
        );
        setWebViewArgs({navigate: navigate, page: 'giftCardsPage'});

        const didHandle = await handleSubmarineClaimWSS({
          ref: webViewRef,
          webSocket: webSocket,
          invoiceAddress: responseInvoice,
          swapInfo,
          privateKey,
          toggleMasterInfoObject: null,
          masterInfoObject: null,
          contactsPrivateKey,
          refundJSON,
          navigate,
          page: 'GiftCards',
        });
        if (didHandle) {
          const didSend = await sendLiquidTransaction(
            swapInfo.expectedAmount,
            swapInfo.address,
          );

          if (!didSend) {
            webSocket.close();
            setIsPurchasingGift(prev => {
              return {...prev, hasError: true, errorMessage: 'Payment failed'};
            });
          }
        }
      } else {
        setIsPurchasingGift(prev => {
          return {...prev, hasError: true, errorMessage: 'Not enough funds'};
        });
      }
    } catch (err) {
      setIsPurchasingGift(prev => {
        return {
          ...prev,
          hasError: true,
          errorMessage:
            'Not able to get gift cards invoice, are you sure you are connected to the internet?',
        };
      });

      console.log(err);
    }
  }
}
const styles = StyleSheet.create({
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    ...CENTER,
  },
  textInput: {
    width: '100%',
    backgroundColor: COLORS.darkModeText,
    paddingVertical: Platform.OS === 'ios' ? 15 : null,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
    ...CENTER,
  },
});
