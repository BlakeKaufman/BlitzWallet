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
  } = useGlobalContextProvider();
  const {textColor, backgroundOffset, backgroundColor} = GetThemeColors();

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
  return (
    <GlobalThemeView>
      <View style={styles.innerContainer}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={{position: 'absolute'}}
            onPress={() => {
              navigate.navigate('App Store');
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
            <ThemeText
              styles={{textAlign: 'center', marginTop: 20, marginBottom: 50}}
              content={
                'In order to use ChatGPT, you must buy credits. Choose an option below to begin.'
              }
            />

            <View style={styles.globalContainer}>
              <ScrollView>
                {subscriptionElements}
                <ThemeText
                  styles={{
                    textAlign: 'center',
                    color: COLORS.primary,
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
              actionFunction={payForChatGPTCredits}
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
      </View>
    </GlobalThemeView>
  );

  async function payForChatGPTCredits() {
    try {
      const [selectedPlan] = selectedSubscription.filter(
        subscription => subscription.isSelected,
      );

      let creditPrice = selectedPlan.price;
      creditPrice += 150; //blitz flat fee
      creditPrice += Math.ceil(creditPrice * 0.005);

      if (liquidNodeInformation.userBalance - 50 > creditPrice) {
        try {
          setIsPaying(true);
          const didSend = await sendLiquidTransaction(
            creditPrice,
            process.env.BLITZ_LIQUID_ADDRESS,
          );

          if (didSend) {
            toggleMasterInfoObject({
              chatGPT: {
                conversation: masterInfoObject.chatGPT.conversation,
                credits: masterInfoObject.chatGPT.credits + selectedPlan.price,
              },
            });
            navigate.navigate('AppStorePageIndex', {page: 'chatGPT'});
          } else throw Error('Did not pay');
        } catch (err) {
          setIsPaying(false);
          navigate.navigate('ErrorScreen', {
            errorMessage: 'Error completing payment',
          });
        }
      } else if (nodeInformation.userBalance - 50 > creditPrice) {
        setIsPaying(true);

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
          toggleMasterInfoObject({
            chatGPT: {
              conversation: masterInfoObject.chatGPT.conversation,
              credits: masterInfoObject.chatGPT.credits + selectedPlan.price,
            },
          });
          // await setPaymentMetadata(
          //   paymentResponse.data.paymentHash,
          //   JSON.stringify({
          //     usedAppStore: true,
          //     service: 'chatGPT',
          //   }),
          // );
          navigate.navigate('AppStorePageIndex', {page: 'chatGPT'});
        } else {
          navigate.navigate('ErrorScreen', {
            errorMessage: 'Error processing payment. Try again.',
          });
          setIsPaying(false);
        }
      } else {
        navigate.navigate('ErrorScreen', {errorMessage: 'Not enough funds.'});
        setIsPaying(false);
      }
    } catch (err) {
      console.log(err);
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Error processing payment. Try again.',
      });
      setIsPaying(false);
    }
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    width: WINDOWWIDTH,
    ...CENTER,
  },

  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    ...CENTER,
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
