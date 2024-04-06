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
import {
  formatBalanceAmount,
  retrieveData,
  storeData,
} from '../../../../../functions';
import {useNavigation} from '@react-navigation/native';
import {
  parseInput,
  payLnurl,
  setPaymentMetadata,
} from '@breeztech/react-native-breez-sdk';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const CREDITOPTIONS = [
  {
    title: 'Tier 1 - Casual Plan',
    price: 100,
    numSerches: '15',
    isSelected: false,
  },
  {title: 'Tier 2 - Pro Plan', price: 300, numSerches: '45', isSelected: true},
  {
    title: 'Tier 3 - Power Plan',
    price: 1000,
    numSerches: '150',
    isSelected: false,
  },
];
//price is in sats

export default function AddChatGPTCredits(props) {
  const {theme, nodeInformation, toggleMasterInfoObject, masterInfoObject} =
    useGlobalContextProvider();
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
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
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
            }}>
            In order to use ChatGPT you must buy credits. Choose an option
            bellow to begin.
          </Text>
          <Text
            style={{
              width: '90%',
              ...CENTER,
              color: themeText,
              fontSize: SIZES.small,
              textAlign: 'center',
              marginTop: 10,
              marginBottom: 50,
            }}>
            *** Depending on the lengh of your question and resposne the number
            of sercehs you get might be different ***
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
                  textAlign: 'center',
                  color: themeText,
                  fontFamily: FONT.Title_Regular,
                  fontSize: SIZES.small,
                }}>
                Blitz takes a fee of 5 sats + 0.5%
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
      creditPrice += 5; //blitz flat fee
      creditPrice += Math.ceil(creditPrice * 0.005);

      if (nodeInformation.userBalance - 50 < creditPrice) {
        navigate.navigate('ErrorScreen', {errorMessage: 'Not enough funds.'});
        return;
      } //create buffer of 50 sats

      setIsPaying(true);

      const input = await parseInput(process.env.GPT_PAYOUT_LNURL);

      toggleMasterInfoObject({
        chatGPT: {
          conversation: masterInfoObject.chatGPT.conversation,
          credits: masterInfoObject.chatGPT.credits + selectedPlan.price,
        },
      });

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
        await setPaymentMetadata(
          paymentResponse.data.paymentHash,
          JSON.stringify({
            usedAppStore: true,
            service: 'chatGPT',
          }),
        );
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
