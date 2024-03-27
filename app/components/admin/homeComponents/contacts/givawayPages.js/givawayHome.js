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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDrawerStatus} from '@react-navigation/drawer';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

export default function GivawayHome({navigation}) {
  const {theme, nodeInformation, userBalanceDenomination, nostrContacts} =
    useGlobalContextProvider();

  const isInitialRender = useRef(true);

  const keyboardHeight = getKeyboardHeight();
  const [descriptionInput, setDescriptionInput] = useState('');
  const [amountPerPerson, setAmountPerPerson] = useState('');
  const [errorMessage, setErrorMessage] = useState({
    for: null,
    message: '',
  });
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  console.log(keyboardHeight, 'HEG');
  const navigate = useNavigation();
  const [addedContacts, setAddedContacts] = useState([]);
  const [inputedContact, setInputedContact] = useState('');
  const isDrawerOpen = useDrawerStatus() === 'open';

  const contactsFocus = useRef(null);
  const amountFocus = useRef(null);
  const descriptionFocus = useRef(null);

  const [isInputFocused, setIsInputFocused] = useState({
    description: false,
    amount: false,
  });

  function toggleInputFocus(input, isFocused) {
    setIsInputFocused(prev => {
      return {...prev, [input]: isFocused};
    });
  }
  const canCreateFaucet = !!amountPerPerson || !!descriptionInput;
  const hasContacts = nostrContacts.length != 0;

  // useEffect(() => {
  //   setIsInitialLoad(true);
  // }, []);

  useEffect(() => {
    if (!isDrawerOpen) {
      contactsFocus.current.focus();
    } else {
      // setInputedContact('');
      // setAddedContacts([]);
      // setDescriptionInput('');
      // setAmountPerPerson('');
    }
  }, [isDrawerOpen]);

  //   function continueFilter() {
  //     if (canCreateFaucet) {
  //       setErrorMessage(() => {
  //         if (!numberOfPeople) {
  //           return {
  //             for: 'numberOfPeople',
  //             message: 'Error. Please add an amount of people for the faucet.',
  //           };
  //         } else {
  //           return {
  //             for: 'amountPerPerson',
  //             message: 'Error. Please add an amount per person for the faucet.',
  //           };
  //         }
  //       });
  //       return;
  //     }

  // navigate.navigate('SendFaucetPage', {
  //   amountPerPerson: amountPerPerson,
  //   numberOfPeople: numberOfPeople,
  // });
  // setErrorMessage({
  //   for: null,
  //   message: '',
  // });
  // Keyboard.dismiss();
  //   }

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
          // paddingBottom: keyboardHeight,
        },
      ]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView behavior="padding" style={{flex: 1}}>
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
                  Keyboard.dismiss();
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
                    fontSize: SIZES.medium,
                  }}>
                  Sending to:
                </Text>
                {addedContactsElements || ''}
                <TextInput
                  onChangeText={setInputedContact}
                  autoFocus={true}
                  keyboardType="default"
                  ref={contactsFocus}
                  value={inputedContact}
                  cursorColor={
                    theme ? COLORS.darkModeText : COLORS.lightModeText
                  }
                  blurOnSubmit={false}
                  style={{
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    fontSize: SIZES.medium,
                  }}
                  onSubmitEditing={() => {
                    if (inputedContact) {
                      // navigate
                      navigate.navigate('ErrorScreen', {
                        errorMessage: 'Not a valid contact',
                      });
                      return;
                    }
                    setIsInitialLoad(false);
                    // contactsFocus.current.blur();
                    descriptionFocus.current.focus();

                    console.log('SUBMIT');
                  }}
                />
              </View>
            </TouchableOpacity>

            {inputedContact ? (
              <View style={styles.contactsListContainer}>
                <Text
                  style={[
                    styles.contactsListHeader,
                    {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                  ]}>
                  From your contacts
                </Text>
                <ScrollView contentContainerStyle={{flex: 1}}>
                  {hasContacts ? (
                    <View>
                      <Text>Contacts List</Text>
                      <Text>{JSON.stringify(nostrContacts)}</Text>
                    </View>
                  ) : (
                    <View style={styles.noContactsContainer}>
                      <Image
                        style={{width: 100, height: 100, marginBottom: 20}}
                        source={ICONS.logoIcon}
                      />
                      <Text
                        style={[
                          styles.noContactsContainerText,
                          {
                            color: theme
                              ? COLORS.darkModeText
                              : COLORS.lightModeText,
                          },
                        ]}>
                        Blitz can help notify givaway recipients. To enable, add
                        a contact.
                      </Text>
                      <TouchableOpacity
                        style={[styles.noContactsContainerBTN]}
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
              <View
                style={[
                  styles.givawayInfoContainer,
                  // {paddingBottom: keyboardHeight},
                ]}>
                <TouchableOpacity
                  onPress={() => {
                    descriptionFocus.current.focus();
                  }}
                  style={[styles.inputContainer, {marginBottom: 20}]}>
                  <View
                    style={[
                      styles.labelContainer,
                      {
                        backgroundColor: theme
                          ? COLORS.darkModeBackgroundOffset
                          : COLORS.lightModeBackgroundOffset,
                      },
                    ]}>
                    <Image style={styles.labelIcon} source={ICONS.bankIcon} />
                  </View>
                  <TextInput
                    placeholder="Enter a description"
                    placeholderTextColor={
                      theme ? COLORS.darkModeText : COLORS.lightModeText
                    }
                    blurOnSubmit={false}
                    ref={descriptionFocus}
                    onChangeText={setDescriptionInput}
                    onFocus={() => {
                      toggleInputFocus('description', true);
                    }}
                    onBlur={() => {
                      toggleInputFocus('description', false);
                    }}
                    onSubmitEditing={() => {
                      // descriptionFocus.current.blur();
                      amountFocus.current.focus();
                    }}
                    cursorColor={
                      theme ? COLORS.darkModeText : COLORS.lightModeText
                    }
                    style={[
                      styles.input,
                      {
                        borderBottomColor: isInputFocused.description
                          ? COLORS.nostrGreen
                          : theme
                          ? COLORS.darkModeBackgroundOffset
                          : COLORS.lightModeBackgroundOffset,
                        color: theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                      },
                    ]}
                    value={descriptionInput}
                    keyboardType="default"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    amountFocus.current.focus();
                  }}
                  style={[styles.inputContainer, {marginBottom: 20}]}>
                  <View
                    style={[
                      styles.labelContainer,
                      {
                        backgroundColor: theme
                          ? COLORS.darkModeBackgroundOffset
                          : COLORS.lightModeBackgroundOffset,
                      },
                    ]}>
                    <Text
                      style={{
                        fontSize: SIZES.small,
                        fontFamily: FONT.Title_Regular,
                        color: theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                      }}>
                      {userBalanceDenomination != 'fiat'
                        ? 'Sats'
                        : nodeInformation.fiatStats.coin}
                    </Text>
                  </View>
                  <TextInput
                    onSubmitEditing={() => {
                      amountFocus.current.focus();
                    }}
                    blurOnSubmit={false}
                    placeholder="0"
                    placeholderTextColor={
                      theme ? COLORS.darkModeText : COLORS.lightModeText
                    }
                    ref={amountFocus}
                    onChangeText={setAmountPerPerson}
                    onFocus={() => {
                      toggleInputFocus('amount', true);
                    }}
                    onBlur={() => {
                      toggleInputFocus('amount', false);
                    }}
                    style={[
                      styles.input,
                      {
                        borderBottomColor: isInputFocused.amount
                          ? COLORS.nostrGreen
                          : theme
                          ? COLORS.darkModeBackgroundOffset
                          : COLORS.lightModeBackgroundOffset,
                        color: theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                      },
                    ]}
                    value={amountPerPerson}
                    keyboardType="number-pad"
                  />
                </TouchableOpacity>
                <View style={styles.bottomTextContainer}>
                  <Text
                    style={[
                      styles.bottomText,
                      {
                        color: theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                      },
                    ]}>
                    Paid by
                  </Text>
                  <TouchableOpacity style={[styles.bottomButton]}>
                    <Text
                      style={[
                        styles.bottomText,
                        {
                          paddingVertical: 3,
                          paddingHorizontal: 4,
                          backgroundColor: theme
                            ? COLORS.darkModeBackgroundOffset
                            : COLORS.lightModeBackgroundOffset,
                          color: theme
                            ? COLORS.darkModeText
                            : COLORS.lightModeText,
                        },
                      ]}>
                      you
                    </Text>
                  </TouchableOpacity>
                  <Text
                    style={[
                      styles.bottomText,
                      {
                        color: theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                      },
                    ]}>
                    and split
                  </Text>
                  <TouchableOpacity
                    style={[styles.bottomButton, {marginRight: 0}]}>
                    <Text
                      style={[
                        styles.bottomText,
                        {
                          paddingVertical: 3,
                          paddingHorizontal: 4,
                          backgroundColor: theme
                            ? COLORS.darkModeBackgroundOffset
                            : COLORS.lightModeBackgroundOffset,
                          color: theme
                            ? COLORS.darkModeText
                            : COLORS.lightModeText,
                        },
                      ]}>
                      equally
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </SafeAreaView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
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

  contactsListContainer: {
    width: '95%',
    height: '100%',
    ...CENTER,
  },
  contactsListHeader: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,

    marginTop: 10,
  },

  noContactsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noContactsContainerText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
    textAlign: 'center',

    marginBottom: 20,
  },
  noContactsContainerBTN: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,

    backgroundColor: COLORS.primary,
  },

  givawayInfoContainer: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputContainer: {
    width: '80%',
    flexDirection: 'row',
  },

  labelContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 12.5,

    alignItems: 'center',
    justifyContent: 'center',

    ...SHADOWS.small,
  },

  labelIcon: {
    width: 25,
    height: 25,
  },

  input: {
    width: '79%',

    borderBottomWidth: 2,

    fontSize: SIZES.large,
    fontFamily: FONT.Descriptoin_Regular,

    // ...SHADOWS.medium,
  },

  bottomTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomText: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.small,
  },
  bottomButton: {
    borderRadius: 3,
    overflow: 'hidden',
    borderColor: COLORS.opaicityGray,
    borderWidth: 1,
    marginHorizontal: 10,
  },
});
