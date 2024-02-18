import {useRef, useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {COLORS, FONT, ICONS, SHADOWS, SIZES} from '../../../../constants';
import {BTN, backArrow, headerText} from '../../../../constants/styles';
import * as Device from 'expo-device';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useNavigation} from '@react-navigation/native';

export default function FaucetSettingsPage(props) {
  const navigate = useNavigation();
  const fauceType = props.route.params.faucetType;
  const {theme} = useGlobalContextProvider();
  const [numberOfPeople, setNumberOfPeople] = useState('');
  const [amountPerPerson, setAmountPerPerson] = useState('');
  const [errorMessage, setErrorMessage] = useState({
    for: null,
    message: '',
  });
  console.log(fauceType);

  function continueFilter() {
    if (!numberOfPeople || !amountPerPerson) {
      setErrorMessage(() => {
        if (!numberOfPeople) {
          return {
            for: 'numberOfPeople',
            message: 'Error. Please add an amount of people for the faucet.',
          };
        } else {
          return {
            for: 'amountPerPerson',
            message: 'Error. Please add an amount per person for the faucet.',
          };
        }
      });
      return;
    }

    navigate.navigate(
      fauceType === 'recieve' ? 'RecieveFaucetPage' : 'SendFaucetPage',
      {
        amountPerPerson: amountPerPerson,
        numberOfPeople: numberOfPeople,
      },
    );
    setErrorMessage({
      for: null,
      message: '',
    });
    Keyboard.dismiss();
  }

  return (
    <View
      style={[
        styles.popupContainer,
        {
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
          paddingVertical: Device.osName === 'ios' ? 0 : 10,
        },
      ]}>
      <KeyboardAvoidingView
        behavior={Device.osName === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
          }}>
          <SafeAreaView style={{flex: 1}}>
            <View style={styles.topBar}>
              <TouchableOpacity
                onPress={() => {
                  setAmountPerPerson('');
                  setNumberOfPeople('');
                  setErrorMessage({
                    for: null,
                    message: '',
                  });
                  Keyboard.dismiss();
                  navigate.goBack();
                }}>
                <Image style={[backArrow]} source={ICONS.leftCheveronIcon} />
              </TouchableOpacity>
              <Text
                style={[
                  headerText,
                  {
                    transform: [{translateX: -12.5}],
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  },
                ]}>
                {fauceType.toLowerCase() === 'recieve' ? 'Recieve' : 'Send'}{' '}
                Faucet
              </Text>
            </View>
            <View style={styles.contentContainer}>
              <View
                style={[
                  styles.inputsContainer,
                  {marginBottom: errorMessage.message ? 50 : 'auto'},
                ]}>
                <View style={styles.inputContainer}>
                  <TextInput
                    onChangeText={setNumberOfPeople}
                    style={[
                      styles.input,
                      {
                        backgroundColor:
                          errorMessage.for === 'numberOfPeople'
                            ? COLORS.cancelRed
                            : COLORS.primary,
                      },
                    ]}
                    selectionColor={COLORS.lightModeBackground}
                    value={numberOfPeople}
                    keyboardType="number-pad"
                  />
                  <Text
                    style={[
                      styles.descriptionText,
                      {
                        color: theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                      },
                    ]}>
                    Number of People
                  </Text>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    onChangeText={setAmountPerPerson}
                    style={[
                      styles.input,
                      {
                        backgroundColor:
                          errorMessage.for === 'amountPerPerson'
                            ? COLORS.cancelRed
                            : COLORS.primary,
                      },
                    ]}
                    selectionColor={COLORS.lightModeBackground}
                    value={amountPerPerson}
                    keyboardType="number-pad"
                  />
                  <Text
                    style={[
                      styles.descriptionText,
                      {
                        color: theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                      },
                    ]}>
                    Amount Per Person
                  </Text>
                </View>
              </View>
              {errorMessage.message && (
                <Text style={styles.errorMessage}>{errorMessage.message}</Text>
              )}
              <TouchableOpacity
                onPress={continueFilter}
                style={[
                  BTN,
                  {backgroundColor: COLORS.primary, marginBottom: 10},
                ]}>
                <Text style={styles.BTNText}>Create Faucet</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}
const styles = StyleSheet.create({
  popupContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  topBar: {
    flexDirection: 'row',
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  //   input
  inputsContainer: {
    // flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 'auto',
  },
  inputContainer: {
    width: '45%',
    alignItems: 'center',
  },
  input: {
    width: 100,
    height: 35,
    backgroundColor: COLORS.primary,
    marginBottom: 10,
    color: COLORS.white,
    fontFamily: FONT.Descriptoin_Regular,
    padding: 10,
    borderRadius: 8,
    ...SHADOWS.medium,
  },
  descriptionText: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
  },

  errorMessage: {
    width: 250,
    marginBottom: 'auto',
    color: COLORS.cancelRed,
    fontSize: SIZES.large,
    fontFamily: FONT.Descriptoin_Regular,
    textAlign: 'center',
  },

  BTNText: {
    fontFamily: FONT.Other_Regular,
    fontSize: SIZES.medium,
    color: COLORS.white,
  },
});
