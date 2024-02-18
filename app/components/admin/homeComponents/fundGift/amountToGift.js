import {useNavigation, useTheme} from '@react-navigation/native';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {BTN, CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useEffect, useRef, useState} from 'react';
import {getLocalStorageItem, setLocalStorageItem} from '../../../../functions';
import {getFiatRates} from '../../../../functions/SDK';
import {sendSpontaneousPayment} from '@breeztech/react-native-breez-sdk';

export default function AmountToGift(props) {
  const isInitialRender = useRef(true);
  const navigate = useNavigation();
  const {theme, nodeInformation} = useGlobalContextProvider();

  const [currencyInfo, setCurrencyInfo] = useState({
    currency: '',
    value: 0,
  });

  const [giftAmount, setGiftAmount] = useState(0);
  const nodeID = props.route.params.nodeId;
  const openChannelFee = props.route.params.channelOpenFee;

  const [errorText, setErrorText] = useState('');

  console.log(nodeID, openChannelFee);
  useEffect(() => {
    if (isInitialRender.current) {
      getUserSelectedCurrency();
      isInitialRender.current = false;
    }
  }, []);

  return (
    <View
      style={[
        styles.globalContainer,
        {
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
          paddingVertical: Platform.OS === 'ios' ? 0 : 10,
        },
      ]}>
      <KeyboardAvoidingView
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <SafeAreaView style={{flex: 1}}>
            <View style={styles.topbar}>
              <TouchableOpacity
                onPress={() => {
                  navigate.goBack();
                  isInitialRender.current = true;
                }}>
                <Image
                  style={styles.topBarIcon}
                  source={ICONS.leftCheveronIcon}
                />
              </TouchableOpacity>
              <Text
                style={[
                  styles.topBarText,
                  {
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  },
                ]}>
                Set Amount
              </Text>
            </View>
            <Text
              style={[
                styles.topBarText,
                {
                  fontWeight: 'normal',
                  fontSize: SIZES.medium,
                  marginTop: 10,
                  transform: [{translateX: 0}],
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                },
              ]}>
              How much would you like to load?
            </Text>

            <View style={[styles.contentContainer]}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.sendingAmtBTC,
                    {
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                      marginTop: 0,
                    },
                  ]}
                  placeholderTextColor={
                    theme ? COLORS.darkModeText : COLORS.lightModeText
                  }
                  // value={String(sendingAmount / 1000)}
                  keyboardType="numeric"
                  placeholder="0"
                  onChangeText={e => {
                    if (isNaN(e)) return;
                    setGiftAmount(Number(e) * 1000);
                  }}
                />
                <Text
                  style={[
                    styles.satText,
                    {
                      transform: [
                        {translateY: Platform.OS === 'ios' ? 0 : -10},
                      ],
                    },
                  ]}>
                  Sat
                </Text>
              </View>
              <View>
                <Text>
                  ={' '}
                  {(
                    (giftAmount / 1000) *
                    (currencyInfo.value / 100000000)
                  ).toFixed(2)}{' '}
                  {currencyInfo.currency}
                </Text>
              </View>
              <Text
                style={{
                  width: '95%',
                  fontFamily: FONT.Descriptoin_Regular,
                  color: COLORS.cancelRed,
                  marginTop: 20,
                  fontSize: SIZES.medium,
                  textAlign: 'center',
                }}>
                {errorText ? errorText : ' '}
              </Text>
            </View>
            <TouchableOpacity
              onPress={sendPayment}
              style={[
                BTN,
                {
                  backgroundColor: COLORS.primary,
                  marginTop: 'auto',
                  marginBottom: Platform.OS === 'ios' ? 10 : 35,
                  ...CENTER,
                },
              ]}>
              <Text style={styles.buttonText}>Send Gift</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
  async function getUserSelectedCurrency() {
    try {
      const currency = await getLocalStorageItem('currency');
      if (!currency) setLocalStorageItem('currency', 'USD');
      const value = await getFiatRates();
      const [userSelectedFiatRate] = value.filter(item => {
        if (item.coin.toLowerCase() === currency.toLowerCase()) return item;
        else return false;
      });
      setCurrencyInfo({
        currency: userSelectedFiatRate.coin,
        value: userSelectedFiatRate.value,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async function sendPayment() {
    setErrorText('');
    try {
      // const utf8Encoder = new TextEncoder();
      console.log(openChannelFee, giftAmount);
      if (openChannelFee >= giftAmount) {
        setErrorText('Payment must be larger than minimum gift amount');
        return;
      } else if (nodeInformation.userBalance + 10 <= giftAmount / 1000) {
        setErrorText('Not enough funds to gift wallet');
        return;
      }

      const sendPaymentResponse = await sendSpontaneousPayment({
        nodeId: nodeID,
        amountMsat: giftAmount,
        // extraTlvs: [{value: utf8Encoder.encode('Gift Wallet Payment')}],
      });
      // ADD USER FEEDBACK
      console.log(sendPaymentResponse);
    } catch (err) {
      setErrorText('Error when sending payment');
      console.log(err);
    }
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },

  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBarIcon: {
    width: 25,
    height: 25,
  },
  topBarText: {
    fontSize: SIZES.large,
    marginRight: 'auto',
    marginLeft: 'auto',
    transform: [{translateX: -12.5}],
    fontFamily: FONT.Title_Bold,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentItem: {
    width: '90%',
    marginVertical: 10,
  },
  contentHeader: {
    fontFamily: FONT.Title_Bold,
    fontSize: SIZES.medium,
    marginBottom: 10,
  },
  contentDescriptionContainer: {
    padding: 10,
    borderRadius: 8,
  },
  contentDescription: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
    marginBottom: 10,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  sendingAmtBTC: {
    fontSize: SIZES.xxLarge,
    fontFamily: FONT.Title_Regular,

    padding: 0,
  },

  satText: {
    fontSize: SIZES.large,
    fontFamily: FONT.Title_Regular,
    color: COLORS.primary,
    marginLeft: 10,
  },

  buttonText: {
    color: COLORS.white,
    fontFamily: FONT.Other_Regular,
  },
});
