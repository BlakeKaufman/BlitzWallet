import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {
  BTN,
  CENTER,
  COLORS,
  FONT,
  ICONS,
  SIZES,
} from '../../../../../constants';
import {useState} from 'react';
import {formatBalanceAmount, numberConverter} from '../../../../../functions';
import {useNavigation} from '@react-navigation/native';
import {
  parseInput,
  payLnurl,
  setPaymentMetadata,
} from '@breeztech/react-native-breez-sdk';
import {sendLiquidTransaction} from '../../../../../functions/liquidWallet';
import {backArrow} from '../../../../../constants/styles';
import {
  GlobalThemeView,
  ThemeText,
} from '../../../../../functions/CustomElements';
import {WINDOWWIDTH} from '../../../../../constants/theme';
import FullLoadingScreen from '../../../../../functions/CustomElements/loadingScreen';
import CustomButton from '../../../../../functions/CustomElements/button';
import Icon from '../../../../../functions/CustomElements/Icon';
import FormattedSatText from '../../../../../functions/CustomElements/satTextDisplay';
import GetThemeColors from '../../../../../hooks/themeColors';
import ThemeImage from '../../../../../functions/CustomElements/themeImage';
import {
  LIGHTNINGAMOUNTBUFFER,
  LIQUIDAMOUTBUFFER,
} from '../../../../../constants/math';
import {useGlobalAppData} from '../../../../../../context-store/appData';
import {AI_MODEL_COST} from './contants/AIModelCost';

const CREDITOPTIONS = [
  {
    title: 'Casual Plan',
    price: 2200,
    numSerches: '100',
    isSelected: false,
  },
  {
    title: 'Pro Plan',
    price: 3300,
    numSerches: '150',
    isSelected: true,
  },
  {
    title: 'Power Plan',
    price: 4400,
    numSerches: '200',
    isSelected: false,
  },
];
//price is in sats

export default function AddChatGPTCredits() {
  const {
    nodeInformation,
    toggleMasterInfoObject,
    masterInfoObject,
    liquidNodeInformation,
    theme,
    darkModeType,
  } = useGlobalContextProvider();
  const {
    decodedChatGPT,
    toggleGlobalAppDataInformation,
    globalAppDataInformation,
  } = useGlobalAppData();
  const {textColor, backgroundOffset, backgroundColor} = GetThemeColors();

  console.log(decodedChatGPT);
  const [selectedSubscription, setSelectedSubscription] =
    useState(CREDITOPTIONS);
  const [isPaying, setIsPaying] = useState(false);
  const navigate = useNavigation();

  const subscriptionElements = selectedSubscription.map((subscription, id) => {
    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedSubscription(prev => {
            return prev.map(item => {
              if (item.title === subscription.title) {
                return {...item, isSelected: true};
              } else return {...item, isSelected: false};
            });
          });
        }}
        style={{
          width: '100%',
          marginBottom: id === selectedSubscription.length ? 0 : 20,
        }}
        key={id}>
        <View
          style={[
            styles.optionContainer,
            {
              borderColor: textColor,
              backgroundColor: subscription.isSelected
                ? backgroundOffset
                : 'transparent',
            },
          ]}>
          <View>
            <ThemeText
              styles={{fontWeight: 'bold', marginBottom: 10}}
              content={subscription.title}
            />
            <FormattedSatText
              neverHideBalance={true}
              iconHeight={15}
              iconWidth={15}
              styles={{...styles.infoDescriptions}}
              frontText={'Price: '}
              formattedBalance={formatBalanceAmount(
                numberConverter(
                  subscription.price,
                  masterInfoObject.userBalanceDenomination,
                  nodeInformation,
                  masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
                ),
              )}
            />
          </View>

          <ThemeText content={` Est. searches: ${subscription.numSerches}`} />
        </View>
      </TouchableOpacity>
    );
  });

  const availableModels = AI_MODEL_COST.map(item => {
    return (
      <ThemeText
        key={item.name}
        styles={{fontSize: SIZES.small, marginVertical: 2.5}}
        content={item.name}
      />
    );
  });
  return (
    <GlobalThemeView useStandardWidth={true}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={{position: 'absolute'}}
          onPress={() => {
            navigate.goBack();
          }}>
          <ThemeImage
            lightsOutIcon={ICONS.arrow_small_left_white}
            lightModeIcon={ICONS.smallArrowLeft}
            darkModeIcon={ICONS.smallArrowLeft}
          />
        </TouchableOpacity>
        <ThemeText
          styles={{
            fontSize: SIZES.large,
            marginRight: 'auto',
            marginLeft: 'auto',
          }}
          content={'Add Credits'}
        />
      </View>
      {!isPaying ? (
        <>
          <View style={styles.globalContainer}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{paddingVertical: 20}}>
              <ThemeText
                styles={{textAlign: 'center', marginBottom: 20}}
                content={
                  'In order to use the latest generative AI models, you must buy credits. Choose an option below to begin.'
                }
              />
              {subscriptionElements}
              <View style={{marginTop: 0, alignItems: 'center'}}>
                <ThemeText
                  styles={{fontWeight: 500, fontSize: SIZES.large}}
                  content={'Supported Models'}
                />
                {availableModels}
              </View>
              <ThemeText
                styles={{
                  textAlign: 'center',
                  color:
                    theme && darkModeType
                      ? COLORS.darkModeText
                      : COLORS.primary,
                  fontSize: SIZES.small,
                  marginTop: 10,
                }}
                content="Depending on the length of your question and response, the number of searches you get might be different. Blitz adds a 150 sat fee + 0.5% of purchase price onto all purchases."
              />
            </ScrollView>
          </View>

          <CustomButton
            buttonStyles={{
              width: 'auto',
              ...CENTER,
            }}
            textStyles={{fontSize: SIZES.large}}
            actionFunction={() => {
              const [selectedPlan] = selectedSubscription.filter(
                subscription => subscription.isSelected,
              );
              navigate.navigate('CustomHalfModal', {
                wantedContent: 'chatGPT',
                price: selectedPlan.price,
                plan: selectedPlan.title,
                payForPlan: payForChatGPTCredits,
                sliderHight: 0.5,
              });
            }}
            textContent={'Pay'}
          />
        </>
      ) : (
        <FullLoadingScreen
          text={'Processing...'}
          textStyles={{
            fontSize: SIZES.large,
            textAlign: 'center',
          }}
        />
      )}
    </GlobalThemeView>
  );

  async function payForChatGPTCredits() {
    try {
      setIsPaying(true);
      const [selectedPlan] = selectedSubscription.filter(
        subscription => subscription.isSelected,
      );

      let creditPrice = selectedPlan.price;
      creditPrice += 150; //blitz flat fee
      creditPrice += Math.ceil(creditPrice * 0.005);

      if (liquidNodeInformation.userBalance - LIQUIDAMOUTBUFFER > creditPrice) {
        try {
          const didSend = await sendLiquidTransaction(
            creditPrice,
            process.env.BLITZ_LIQUID_ADDRESS,
          );

          if (didSend) {
            toggleGlobalAppDataInformation(
              {
                chatGPT: {
                  conversation:
                    globalAppDataInformation.chatGPT.conversation || [],
                  credits: decodedChatGPT.credits + selectedPlan.price,
                },
              },
              true,
            );
            navigate.reset({
              index: 0, // The top-level route index
              routes: [
                {
                  name: 'HomeAdmin',
                  params: {screen: 'Home'},
                },
                {
                  name: 'HomeAdmin',
                  params: {screen: 'App Store'},
                },
                {name: 'AppStorePageIndex', params: {page: 'chatGPT'}},
              ],
            });
          } else throw Error('Did not pay');
        } catch (err) {
          navigate.navigate('ErrorScreen', {
            errorMessage: 'Error completing payment',
          });
        }
      } else if (
        nodeInformation.userBalance - LIGHTNINGAMOUNTBUFFER >
        creditPrice
      ) {
        const input = await parseInput(process.env.GPT_PAYOUT_LNURL);

        // let blitzWalletContact = JSON.parse(
        //   await retrieveData('blitzWalletContact'),
        // );
        // blitzWalletContact['chatGPTCredits'] =
        //   selectedPlan.price + blitzWalletContact['chatGPTCredits'] || 0;

        // const didSet = await storeData(
        //   'blitzWalletContact',
        //   JSON.stringify(blitzWalletContact),
        // );

        const paymentResponse = await payLnurl({
          data: input.data,
          amountMsat: creditPrice * 1000,
          comment: 'Store - chatGPT',
        });

        if (paymentResponse.type === 'endpointSuccess') {
          toggleGlobalAppDataInformation(
            {
              chatGPT: {
                conversation:
                  globalAppDataInformation.chatGPT.conversation || [],
                credits: decodedChatGPT.credits + selectedPlan.price,
              },
            },
            true,
          );
          // await setPaymentMetadata(
          //   paymentResponse.data.paymentHash,
          //   JSON.stringify({
          //     usedAppStore: true,
          //     service: 'chatGPT',
          //   }),
          // );
          navigate.reset({
            index: 0, // The top-level route index
            routes: [
              {
                name: 'HomeAdmin',
                params: {screen: 'Home'},
              },
              {
                name: 'HomeAdmin',
                params: {screen: 'App Store'},
              },
              {name: 'AppStorePageIndex', params: {page: 'chatGPT'}},
            ],
          });
        } else {
          navigate.navigate('ErrorScreen', {
            errorMessage: 'Error processing payment. Try again.',
          });
        }
      } else {
        navigate.navigate('ErrorScreen', {errorMessage: 'Not enough funds.'});
      }
    } catch (err) {
      console.log(err);
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Error processing payment. Try again.',
      });
    } finally {
      setIsPaying(false);
    }
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },

  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  optionContainer: {
    width: '100%',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    borderWidth: 1,
  },
});
