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
  ScrollView,
} from 'react-native';
import {COLORS, FONT, ICONS, SHADOWS, SIZES} from '../../../../../constants';
import {BTN, CENTER, headerText} from '../../../../../constants/styles';
import * as Device from 'expo-device';

import {useGlobalContextProvider} from '../../../../../../context-store/context';
import getKeyboardHeight from '../../../../../hooks/getKeyboardHeight';
import {useIsFocused, useNavigation} from '@react-navigation/native';

export default function GivawayHome({navigation}) {
  const {theme, nodeInformation, userBalanceDenomination, nostrContacts} =
    useGlobalContextProvider();
  const isPageFocused = useIsFocused();
  const keyboardHeight = getKeyboardHeight();
  const [numberOfPeople, setNumberOfPeople] = useState('');
  const [amountPerPerson, setAmountPerPerson] = useState('');
  const [errorMessage, setErrorMessage] = useState({
    for: null,
    message: '',
  });
  const navigate = useNavigation();
  const [addedContacts, setAddedContacts] = useState([]);
  const [inputedContact, setInputedContact] = useState('');

  const contactsFocus = useRef(null);
  const amountFocus = useRef(null);

  const canCreateFaucet = !!amountPerPerson || !!numberOfPeople;
  const hasContacts = nostrContacts.length != 0;

  useEffect(() => {
    if (!isPageFocused) return;
    contactsFocus.current.focus();
  }, [isPageFocused]);

  function continueFilter() {
    if (canCreateFaucet) {
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

    // navigate.navigate('SendFaucetPage', {
    //   amountPerPerson: amountPerPerson,
    //   numberOfPeople: numberOfPeople,
    // });
    // setErrorMessage({
    //   for: null,
    //   message: '',
    // });
    // Keyboard.dismiss();
  }

  const addedContactsElements =
    addedContacts.length != 0 &&
    addedContacts.map((contact, id) => {
      return (
        <View key={id}>
          <Text>{contact.name}</Text>
        </View>
      );
    });

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
        <TouchableWithoutFeedback style={{flex: 1}}>
          <SafeAreaView style={{flex: 1}}>
            <View style={styles.topBar}>
              <TouchableOpacity onPress={() => {}}>
                <Text
                  style={[
                    {
                      opacity: canCreateFaucet ? 1 : 0.5,
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                      fontFamily: SIZES.medium,
                      fontFamily: FONT.Title_Regular,
                    },
                  ]}>
                  Create
                </Text>
              </TouchableOpacity>
              <Text
                style={[
                  headerText,
                  {
                    transform: [{translateX: -12.5}],
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  },
                ]}>
                Create a givaway
              </Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.openDrawer();
                }}>
                <Image style={styles.backButton} source={ICONS.drawerList} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => {
                contactsFocus.current.focus();
              }}>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  paddingHorizontal: '2.5%',
                  marginTop: 10,
                  paddingVertical: 5,

                  borderBottomColor: theme
                    ? COLORS.darkModeBackgroundOffset
                    : COLORS.lightModeBackgroundOffset,
                  borderBottomWidth: 1,
                }}>
                <Text
                  style={{
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    marginRight: 10,
                  }}>
                  Sending to:
                </Text>
                {addedContactsElements || ''}
                <TextInput
                  onChangeText={setInputedContact}
                  autoFocus={true}
                  ref={contactsFocus}
                  value={inputedContact}
                  onSubmitEditing={() => {
                    if (inputedContact) {
                      // navigate
                      navigate.navigate('ErrorScreen', {
                        errorMessage: 'Not a valid contact',
                      });
                      return;
                    }
                    contactsFocus.current.blur();
                    amountFocus.current.focus();

                    console.log('SUBMIT');
                  }}
                />
              </View>
            </TouchableOpacity>

            {inputedContact ? (
              <View style={{flex: 1, width: '95%', ...CENTER}}>
                <Text
                  style={{
                    fontFamily: FONT.Title_Regular,
                    fontSize: SIZES.medium,
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    marginTop: 10,
                  }}>
                  From your contacts
                </Text>
                <ScrollView contentContainerStyle={{flex: 1}}>
                  {hasContacts ? (
                    <View>
                      <Text>Contacts List</Text>
                      <Text>{JSON.stringify(nostrContacts)}</Text>
                    </View>
                  ) : (
                    <View
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Image
                        style={{width: 100, height: 100, marginBottom: 20}}
                        source={ICONS.logoIcon}
                      />
                      <Text
                        style={{
                          fontFamily: FONT.Title_Regular,
                          fontSize: SIZES.medium,
                          textAlign: 'center',
                          color: theme
                            ? COLORS.darkModeText
                            : COLORS.lightModeText,

                          marginBottom: 20,
                        }}>
                        Blitz can help notify givaway recipients. To enable, add
                        a contact.
                      </Text>
                      <TouchableOpacity
                        style={[
                          {
                            paddingVertical: 8,
                            paddingHorizontal: 10,
                            borderRadius: 8,

                            backgroundColor: COLORS.primary,
                          },
                        ]}
                        onPress={() => navigation.jumpTo('AddContact')}>
                        <Text
                          style={{
                            color: COLORS.white,
                            fontFamily: FONT.Title_Regular,
                          }}>
                          Add contact
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </ScrollView>
              </View>
            ) : (
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
                      ref={amountFocus}
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
                          textAlign: 'center',
                        },
                      ]}>
                      Amount Per Person (
                      {userBalanceDenomination === 'fiat'
                        ? nodeInformation.fiatStats.coin
                        : 'Sats'}
                      )
                    </Text>
                  </View>
                </View>
                {errorMessage.message && (
                  <Text style={styles.errorMessage}>
                    {errorMessage.message}
                  </Text>
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
            )}
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  popupContainer: {
    flex: 1,
  },

  topBar: {
    width: '95%',
    flexDirection: 'row',
    alignItems: 'center',
    ...CENTER,
  },
  backButton: {
    width: 20,
    height: 20,
  },

  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  //   input
  inputsContainer: {
    // flex: 1,
    alignItems: 'baseline',
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

    backgroundColor: COLORS.primary,
    marginBottom: 10,
    padding: 10,
    color: COLORS.white,
    fontFamily: FONT.Descriptoin_Regular,
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
