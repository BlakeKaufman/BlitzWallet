import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  TextInput,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import {
  CENTER,
  COLORS,
  FONT,
  ICONS,
  LNURL_WITHDRAWL_CODES,
  SATSPERBITCOIN,
  SHADOWS,
  SIZES,
} from '../../../../constants';

import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useRef, useState} from 'react';
import {retrieveData} from '../../../../functions';
import {sendNostrMessage} from '../../../../functions/noster';

import {randomUUID} from 'expo-crypto';
import Buffer from 'buffer';
import * as bench32 from 'bech32';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import getKeyboardHeight from '../../../../hooks/getKeyboardHeight';
import {pubishMessageToAbly} from '../../../../functions/messaging/publishMessage';

export default function SendAndRequestPage(props) {
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();

  const {
    theme,
    nodeInformation,
    nostrSocket,
    toggleNostrEvents,
    toggleNostrContacts,
    masterInfoObject,
    toggleMasterInfoObject,
  } = useGlobalContextProvider();
  const [amountValue, setAmountValue] = useState(null);
  const [descriptionValue, setDescriptionValue] = useState('');
  const amountRef = useRef(null);
  const descriptionRef = useRef(null);
  const selectedContact = props.route.params.selectedContact;
  const paymentType = props.route.params.paymentType;
  const isBTCdenominated =
    masterInfoObject.userBalanceDenomination === 'hidden' ||
    masterInfoObject.userBalanceDenomination === 'sats';

  return (
    <TouchableWithoutFeedback onPress={() => navigate.goBack()}>
      <View style={{flex: 1, justifyContent: 'flex-end'}}>
        <View
          style={{
            height: '85%',
            width: '100%',
            backgroundColor: theme
              ? COLORS.darkModeBackground
              : COLORS.lightModeBackground,

            borderTopColor: theme
              ? COLORS.darkModeBackgroundOffset
              : COLORS.lightModeBackgroundOffset,
            borderTopWidth: 10,

            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,

            borderRadius: 10,

            paddingBottom: insets.bottom,
          }}>
          <View
            style={[
              styles.topBar,
              {
                backgroundColor: theme
                  ? COLORS.darkModeBackgroundOffset
                  : COLORS.lightModeBackgroundOffset,
                ...CENTER,
              },
            ]}></View>
          <KeyboardAwareScrollView
            enableOnAndroid={true}
            contentContainerStyle={{flex: 1}}>
            <TouchableWithoutFeedback
              style={{flex: 1}}
              onPress={Keyboard.dismiss}>
              <View
                style={{
                  flex: 1,
                }}>
                <View
                  style={[
                    styles.profileImage,
                    {
                      borderColor: theme
                        ? COLORS.darkModeBackgroundOffset
                        : COLORS.lightModeBackgroundOffset,
                      backgroundColor: theme
                        ? COLORS.darkModeText
                        : COLORS.lightModeText,
                      marginBottom: 5,
                    },
                  ]}>
                  <Image
                    source={
                      selectedContact.profileImg
                        ? selectedContact.profileImg
                        : ICONS.userIcon
                    }
                    style={{width: '80%', height: '80%'}}
                  />
                </View>
                <Text
                  style={[
                    styles.profileName,
                    {
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    },
                  ]}>
                  {`${paymentType === 'send' ? 'Send' : 'Request'} money to ${
                    selectedContact.name
                  }`}
                </Text>

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
                <TouchableOpacity
                  onPress={() => {
                    amountRef.current.focus();
                  }}>
                  <View
                    style={[
                      styles.textInputContainer,
                      {
                        backgroundColor: theme
                          ? COLORS.darkModeBackgroundOffset
                          : COLORS.lightModeBackgroundOffset,

                        padding: 10,
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        borderRadius: 8,
                        marginBottom: 50,
                      },
                    ]}>
                    <TextInput
                      ref={amountRef}
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
                          maxWidth: '70%',
                          color: theme
                            ? COLORS.darkModeText
                            : COLORS.lightModeText,
                          padding: 0,
                          margin: 0,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        {
                          fontFamily: FONT.Descriptoin_Regular,
                          fontSize: SIZES.xLarge,
                          color: theme
                            ? COLORS.darkModeText
                            : COLORS.lightModeText,
                          marginLeft: 5,
                        },
                      ]}>
                      {masterInfoObject.userBalanceDenomination === 'sats' ||
                      masterInfoObject.userBalanceDenomination === 'hidden'
                        ? 'sats'
                        : nodeInformation.fiatStats.coin}
                    </Text>
                  </View>
                </TouchableOpacity>

                <Text
                  style={[
                    styles.headerText,
                    {
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    },
                  ]}>
                  Memo
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    descriptionRef.current.focus();
                  }}>
                  <View
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
                      ref={descriptionRef}
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
                          color: theme
                            ? COLORS.darkModeText
                            : COLORS.lightModeText,
                          fontSize: SIZES.medium,
                          height: 'auto',
                          width: 'auto',
                        },
                      ]}
                    />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmit}
                  style={[
                    styles.button,
                    {
                      backgroundColor: theme
                        ? COLORS.darkModeText
                        : COLORS.lightModeText,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.buttonText,
                      {
                        color: theme
                          ? COLORS.lightModeText
                          : COLORS.darkModeText,
                      },
                    ]}>
                    Send
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAwareScrollView>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
  async function handleSubmit() {
    try {
      if (Number(amountValue) === 0) {
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Cannot send a 0 amount',
        });
        return;
      }

      // const nostrProfile = JSON.parse(await retrieveData('myNostrProfile'));
      const blitzWalletContact = JSON.parse(
        await retrieveData('blitzWalletContact'),
      );
      const privateKey = JSON.parse(await retrieveData('contactsPrivateKey'));

      if (!blitzWalletContact.token) {
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Notifications must be turned on',
        });
        return;
      }

      const sendingAmountMsat = isBTCdenominated
        ? amountValue * 1000
        : (amountValue * SATSPERBITCOIN) / nodeInformation.fiatStats.value;

      console.log(sendingAmountMsat * 1000);

      const UUID = randomUUID();
      const data = `https://blitz-wallet.com/.netlify/functions/lnurlwithdrawl?platform=${
        Platform.OS
      }&token=${blitzWalletContact?.token?.data}&amount=${
        sendingAmountMsat / 1000
      }&uuid=${UUID}&desc=${LNURL_WITHDRAWL_CODES[3]}&totalAmount=${1}`;

      const byteArr = Buffer.Buffer.from(data, 'utf8');
      const words = bench32.bech32.toWords(byteArr);
      const encoded = bench32.bech32.encode('lnurl', words, 1500);
      const withdrawLNURL = encoded.toUpperCase();

      pubishMessageToAbly(
        privateKey,
        selectedContact.uuid,
        masterInfoObject.contacts.myProfile.uuid,
        JSON.stringify({
          url: withdrawLNURL,
          amountMsat: sendingAmountMsat,
          description: descriptionValue,
          id: UUID,
          isRedeemed: false,
        }),
        masterInfoObject,
        toggleMasterInfoObject,
        paymentType,
      );

      // sendNostrMessage(
      //   nostrSocket,
      //   JSON.stringify({
      //     url: withdrawLNURL,
      //     amountMsat: sendingAmountMsat,
      //     description: descriptionValue,
      //     id: UUID,
      //     isRedeemed: false,
      //   }),
      //   nostrProfile.privKey,
      //   selectedContact.npub,
      //   toggleNostrEvents,
      //   toggleNostrContacts,
      //   masterInfoObject.nostrContacts,
      // );
      navigate.goBack();
    } catch (err) {
      console.log(err);
    }
  }
}

const styles = StyleSheet.create({
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 125,
    borderWidth: 5,
    backgroundColor: 'red',
    ...CENTER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  profileName: {
    fontSize: SIZES.large,
    fontFamily: FONT.Title_Regular,
    fontWeight: 'bold',
    textAlign: 'center',
    ...CENTER,
    marginBottom: 10,
  },
  topBar: {
    width: 120,
    height: 8,
    marginTop: 10,
    borderRadius: 8,
    marginBottom: 20,
  },

  optionsContainer: {
    width: '100%',
    height: '100%',
  },

  optionRow: {
    width: '95%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    ...CENTER,
  },
  optionText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.large,
  },

  icon: {
    width: 35,
    height: 35,
    marginRight: 15,
  },

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

  textInputContainer: {
    width: '95%',
    margin: 0,
    ...CENTER,
  },
  memoInput: {
    width: '100%',
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.xLarge,
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
