import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {CENTER, COLORS, ICONS, SIZES} from '../../../../../constants';
import {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {parseInput} from '@breeztech/react-native-breez-sdk';
import {
  GlobalThemeView,
  ThemeText,
} from '../../../../../functions/CustomElements';
import FullLoadingScreen from '../../../../../functions/CustomElements/loadingScreen';
import CustomButton from '../../../../../functions/CustomElements/button';
import FormattedSatText from '../../../../../functions/CustomElements/satTextDisplay';
import GetThemeColors from '../../../../../hooks/themeColors';
import ThemeImage from '../../../../../functions/CustomElements/themeImage';
import {
  LIGHTNINGAMOUNTBUFFER,
  LIQUIDAMOUTBUFFER,
  SATSPERBITCOIN,
} from '../../../../../constants/math';
import {useGlobalAppData} from '../../../../../../context-store/appData';
import {AI_MODEL_COST} from './contants/AIModelCost';
import {getLNAddressForLiquidPayment} from '../../sendBitcoin/functions/payments';
import {breezPaymentWrapper} from '../../../../../functions/SDK';
import {breezLiquidPaymentWrapper} from '../../../../../functions/breezLiquid';
import {useGlobalThemeContext} from '../../../../../../context-store/theme';
import {useNodeContext} from '../../../../../../context-store/nodeContext';

const CREDITOPTIONS = [
  {
    title: 'Casual Plan',
    price: 2200,
    numSerches: '40',
    isSelected: false,
  },
  {
    title: 'Pro Plan',
    price: 3300,
    numSerches: '100',
    isSelected: true,
  },
  {
    title: 'Power Plan',
    price: 4400,
    numSerches: '150',
    isSelected: false,
  },
];
//price is in sats

export default function AddChatGPTCredits({props}) {
  const {nodeInformation, liquidNodeInformation} = useNodeContext();
  const {theme, darkModeType} = useGlobalThemeContext();
  const {
    decodedChatGPT,
    toggleGlobalAppDataInformation,
    globalAppDataInformation,
  } = useGlobalAppData();
  const {textColor, backgroundOffset, backgroundColor} = GetThemeColors();

  const [selectedSubscription, setSelectedSubscription] =
    useState(CREDITOPTIONS);
  const [isPaying, setIsPaying] = useState(false);
  const navigate = useNavigation();

  useEffect(() => {
    // FUNCTION TO PURCHASE CREDITS
    if (!props?.purchaseCredits) return;
    navigate.setParams({purchaseCredits: null});
    payForChatGPTCredits();
  }, [props?.purchaseCredits]);

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
              styles={{...styles.infoDescriptions}}
              frontText={'Price: '}
              balance={subscription.price}
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
        // try {
        // Need to create BIP21 liquid address to pay to with message 'Store - chatGPT'
        const liquidBip21 = `liquidnetwork:${
          process.env.BLITZ_LIQUID_ADDRESS
        }?assetid=6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d&amount=${(
          creditPrice / SATSPERBITCOIN
        ).toFixed(8)}&message=${encodeURI('Store - chatGPT')}`;

        const response = await breezLiquidPaymentWrapper({
          paymentType: 'liquid',
          invoice: liquidBip21,
        });

        if (!response.didWork) {
          navigate.navigate('ErrorScreen', {
            errorMessage: 'Error completing payment',
          });
          setIsPaying(false);
          return;
        }
        await toggleGlobalAppDataInformation(
          {
            chatGPT: {
              conversation: globalAppDataInformation.chatGPT.conversation || [],
              credits: decodedChatGPT.credits + selectedPlan.price,
            },
          },
          true,
        );
        setIsPaying(false);

        console.log(liquidBip21);

        return;
      } else if (
        nodeInformation.userBalance - LIGHTNINGAMOUNTBUFFER >
        creditPrice
      ) {
        const input = await parseInput(process.env.GPT_PAYOUT_LNURL);
        const lnInvoice = await getLNAddressForLiquidPayment(
          input,
          creditPrice,
        );
        const parsedLnInvoice = await parseInput(lnInvoice);

        breezPaymentWrapper({
          paymentInfo: parsedLnInvoice,
          amountMsat: parsedLnInvoice?.invoice?.amountMsat,
          paymentDescription: 'Store - chatGPT',
          failureFunction: () => {
            navigate.navigate('ErrorScreen', {
              errorMessage: 'Error processing payment. Try again.',
            });
            setIsPaying(false);
          },
          confirmFunction: () => {
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
            setIsPaying(false);
          },
        });
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
