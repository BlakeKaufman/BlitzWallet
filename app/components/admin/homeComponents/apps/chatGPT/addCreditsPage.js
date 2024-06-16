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
import {formatBalanceAmount} from '../../../../../functions';
import {useNavigation} from '@react-navigation/native';
import {
  parseInput,
  payLnurl,
  setPaymentMetadata,
} from '@breeztech/react-native-breez-sdk';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {sendLiquidTransaction} from '../../../../../functions/liquidWallet';
import {ANDROIDSAFEAREA} from '../../../../../constants/styles';

const CREDITOPTIONS = [
  {
    title: 'Tier 1 - Casual Plan',
    price: 2200,
    numSerches: '100',
    isSelected: false,
  },
  {
    title: 'Tier 2 - Pro Plan',
    price: 3300,
    numSerches: '150',
    isSelected: true,
  },
  {
    title: 'Tier 3 - Power Plan',
    price: 4400,
    numSerches: '200',
    isSelected: false,
  },
];
//price is in sats

export default function AddChatGPTCredits(props) {
  const {
    theme,
    nodeInformation,
    toggleMasterInfoObject,
    masterInfoObject,
    liquidNodeInformation,
  } = useGlobalContextProvider();
  const themeText = theme ? COLORS.darkModeText : COLORS.lightModeText;

  const [selectedSubscription, setSelectedSubscription] =
    useState(CREDITOPTIONS);
  const [isPaying, setIsPaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();

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
          style={{
            width: '100%',
            padding: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 8,
            borderWidth: 1,

            borderColor: themeText,
            backgroundColor: subscription.isSelected
              ? theme
                ? COLORS.darkModeBackgroundOffset
                : COLORS.lightModeBackgroundOffset
              : 'transparent',
          }}>
          <View>
            <Text
              style={{
                color: themeText,
                fontSize: SIZES.medium,
                marginBottom: 10,
                fontWeight: 700,
              }}>
              {subscription.title}
            </Text>
            <Text style={{color: themeText, fontSize: SIZES.medium}}>
              Price: {formatBalanceAmount(subscription.price)} sats
            </Text>
          </View>

          <Text
            style={{
              color: themeText,
              fontSize: SIZES.medium,
              textAlign: 'left',
            }}>
            Est. searches: {subscription.numSerches}
          </Text>
        </View>
      </TouchableOpacity>
    );
  });
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme
          ? COLORS.darkModeBackground
          : COLORS.lightModeBackground,
        paddingTop: insets.top === 0 ? ANDROIDSAFEAREA : insets.top,
        paddingBottom: insets.bottom === 0 ? ANDROIDSAFEAREA : insets.bottom,
      }}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => {
            props.navigation.navigate('App Store');
          }}>
          <Image
            style={{
              width: 30,
              height: 30,
              transform: [{translateX: -7}],
            }}
            source={ICONS.smallArrowLeft}
          />
        </TouchableOpacity>
        <Text
          style={{
            color: themeText,
            fontSize: SIZES.large,
            fontFamily: FONT.Title_Regular,
          }}>
          Add Credits
        </Text>
      </View>
      {!isPaying ? (
        <>
          <Text
            style={{
              width: '90%',
              ...CENTER,
              color: themeText,
              fontSize: SIZES.medium,
              textAlign: 'center',
              marginTop: 20,
              marginBottom: 50,
            }}>
            In order to use ChatGPT you must buy credits. Choose an option
            bellow to begin.
          </Text>

          <View
            style={{
              flex: 1,
              width: '90%',
              ...CENTER,
            }}>
            <ScrollView>
              {subscriptionElements}
              <Text
                style={{
                  width: '90%',
                  ...CENTER,
                  color: COLORS.primary,
                  fontSize: SIZES.small,
                  textAlign: 'center',
                  marginTop: 10,
                }}>
                Depending on the length of your question and response, the
                number of searches you get might be different. Blitz adds a 150
                sat fee + 0.5% of purchase price onto all purchases.
              </Text>
            </ScrollView>
          </View>

          <TouchableOpacity
            onPress={payForChatGPTCredits}
            style={[
              BTN,
              {backgroundColor: COLORS.primary, ...CENTER, marginBottom: 20},
            ]}>
            <Text
              style={{
                fontFamily: FONT.Title_Regular,
                fontSize: SIZES.medium,
                color: COLORS.darkModeText,
              }}>
              Pay
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <ActivityIndicator size={'large'} color={themeText} />
          <Text
            style={{
              width: '90%',
              color: themeText,
              fontFamily: FONT.Title_Regular,
              fontSize: SIZES.large,
              marginTop: 10,
              textAlign: 'center',
            }}>
            {errorMessage.length === 0 ? 'Processing...' : errorMessage}
          </Text>
        </View>
      )}
    </View>
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
          await sendLiquidTransaction(
            creditPrice,
            process.env.BLITZ_LIQUID_ADDRESS,
          );

          toggleMasterInfoObject({
            chatGPT: {
              conversation: masterInfoObject.chatGPT.conversation,
              credits: masterInfoObject.chatGPT.credits + selectedPlan.price,
            },
          });
          navigate.navigate('AppStorePageIndex', {page: 'chatGPT'});
          console.log('USING LIQUID', process.env.BLITZ_LIQUID_ADDRESS);
        } catch (err) {
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
          toggleMasterInfoObject({
            chatGPT: {
              conversation: masterInfoObject.chatGPT.conversation,
              credits: 0,
            },
          });

          setErrorMessage('Error processing payment. Try again.');
        }
      } else
        navigate.navigate('ErrorScreen', {errorMessage: 'Not enough funds.'});
    } catch (err) {
      setErrorMessage('Error processing payment. Try again.');
      console.log(err);
    }
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },

  topBar: {
    width: '95%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
    // backgroundColor: 'black',
    ...CENTER,
  },
});
