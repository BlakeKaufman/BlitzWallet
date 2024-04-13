import {useIsFocused, useNavigation} from '@react-navigation/native';
import {
  View,
  SafeAreaView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useEffect, useState} from 'react';
import {
  connectToRelay,
  getConnectToRelayInfo,
} from '../../../../functions/noster';
import receiveEventListener from '../../../../functions/noster/receiveEventListener';
import * as nostr from 'nostr-tools';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import getKeyboardHeight from '../../../../hooks/getKeyboardHeight';
import {atob} from 'react-native-quick-base64';

export default function AddContactPage({navigation}) {
  const navigate = useNavigation();
  const {
    theme,

    masterInfoObject,
    toggleMasterInfoObject,
  } = useGlobalContextProvider();
  const [newContactInfo, setNewContactInfo] = useState({
    uuid: '',
    name: '',
    // npub: null,
    // lnurl: null,
    bio: '',
    isFavorite: false,
    transactions: [],
    unlookedTransactions: [],
  });
  const keyboardHeight = getKeyboardHeight();

  const isForground = useIsFocused();
  console.log(isForground, 'TEST');

  //   const setUpdateContactsList = props.route.params.setUpdateContactsList;
  const didFillOutContact = newContactInfo.name.trim() != '';

  function formatNostrContact(data) {
    const decoded = atob(data);
    const parsedData = JSON.parse(decoded);

    console.log(parsedData);
    setNewContactInfo({
      name: parsedData.name || null,
      // npub: parsedData.npub || null,
      // lnurl: parsedData?.lnurl || null,
      bio: parsedData.bio || '',
      isFavorite: false,
      transactions: [],
      unlookedTransactions: [],
      uuid: parsedData.uuid,
    });
  }

  function handleFormInput(text, inputType) {
    if (text && !newContactInfo.uuid) {
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Please scan or paste a contact first',
      });

      return;
    }
    setNewContactInfo(prev => {
      return {...prev, [inputType]: text};
    });
  }

  useEffect(() => {
    if (!isForground) return;
    navigate.navigate('CameraModal', {
      updateBitcoinAdressFunc: formatNostrContact,
    });
  }, []);

  return (
    <View
      style={[
        styles.globalContainer,
        {
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
        },
      ]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.globalContainer]}>
          <SafeAreaView style={{flex: 1}}>
            <View style={styles.topBar}>
              <TouchableOpacity
                onPress={() => {
                  //    Add contact function
                  if (!didFillOutContact) return;
                  addContact();
                }}>
                <Text
                  style={[
                    styles.topBarText,
                    {
                      opacity: !didFillOutContact ? 0.4 : 1,
                      color: !didFillOutContact.length
                        ? theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText
                        : COLORS.primary,
                    },
                  ]}>
                  Done
                </Text>
              </TouchableOpacity>
              <Text
                style={[
                  styles.topBarText,
                  {
                    fontWeight: 'bold',
                    transform: [{translateX: -5}],
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  },
                ]}>
                New Contact
              </Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.openDrawer();
                }}>
                <Image style={styles.backButton} source={ICONS.drawerList} />
              </TouchableOpacity>
            </View>
            <KeyboardAwareScrollView
              contentContainerStyle={{flexGrow: 1}}
              scrollToOverflowEnabled={true}
              overScrollMode="auto"
              contentInset={keyboardHeight}>
              <View style={{flex: 1}}>
                <View style={styles.photoContainer}>
                  <View
                    style={[
                      styles.photoIconContainer,
                      {
                        backgroundColor: theme
                          ? COLORS.darkModeBackgroundOffset
                          : COLORS.lightModeBackgroundOffset,
                      },
                    ]}>
                    <Image
                      style={styles.photoTempIcon}
                      source={ICONS.logoIcon}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert('Coming Soon....');
                    }}
                    style={[
                      styles.addPhotoTextContainer,
                      {
                        backgroundColor: theme
                          ? COLORS.darkModeBackgroundOffset
                          : COLORS.lightModeBackgroundOffset,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.addPhotoText,
                        {
                          color: theme
                            ? COLORS.darkModeText
                            : COLORS.lightModeText,
                        },
                      ]}>
                      Add Photo
                    </Text>
                  </TouchableOpacity>
                </View>
                <View
                  style={[
                    styles.inputContainer,

                    {
                      borderColor: theme
                        ? COLORS.darkModeBackground
                        : COLORS.lightModeBackground,
                      backgroundColor: theme
                        ? COLORS.darkModeBackgroundOffset
                        : COLORS.lightModeBackgroundOffset,
                    },
                  ]}>
                  <TextInput
                    onChangeText={text => {
                      handleFormInput(text, 'name');
                    }}
                    value={newContactInfo.name}
                    placeholder="Name"
                    placeholderTextColor={
                      theme ? COLORS.darkModeText : COLORS.lightModeText
                    }
                    style={[
                      styles.textInput,
                      {
                        borderBottomColor: theme
                          ? COLORS.darkModeBackground
                          : COLORS.lightModeBackground,
                        color: theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                      },
                    ]}
                  />
                  {/* <TextInput
                    onChangeText={text => {
                      handleFormInput(text, 'npub');
                    }}
                    placeholder="npub"
                    placeholderTextColor={
                      theme ? COLORS.darkModeText : COLORS.lightModeText
                    }
                    value={newContactInfo.npub}
                    style={[
                      styles.textInput,
                      {
                        borderBottomColor: theme
                          ? COLORS.darkModeBackground
                          : COLORS.lightModeBackground,
                        color: theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                      },
                    ]}
                  /> */}
                  {/* <TextInput
                    onChangeText={text => {
                      handleFormInput(text, 'lnurl');
                    }}
                    value={newContactInfo.lnurl}
                    placeholder="LNURL"
                    placeholderTextColor={
                      theme ? COLORS.darkModeText : COLORS.lightModeText
                    }
                    style={[
                      styles.textInput,
                      {
                        borderBottomWidth: 0,
                        color: theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                      },
                    ]}
                  /> */}
                  <View
                    style={[
                      styles.textInput,
                      {
                        borderBottomColor: theme
                          ? COLORS.darkModeBackground
                          : COLORS.lightModeBackground,

                        height: 100,
                      },
                    ]}>
                    <TextInput
                      onChangeText={text => {
                        handleFormInput(text, 'bio');
                      }}
                      editable
                      multiline
                      // textAlignVertical="top"
                      style={{
                        flex: 1,
                        color: theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                      }}
                      value={newContactInfo.bio}
                      placeholder="Bio"
                      placeholderTextColor={
                        theme ? COLORS.darkModeText : COLORS.lightModeText
                      }
                    />
                    <Text
                      style={[
                        {
                          color: theme
                            ? COLORS.darkModeText
                            : COLORS.lightModeText,
                        },
                      ]}>
                      {newContactInfo.bio.length} / {150}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    width: '100%',
                    alignItems: 'center',
                    marginTop: 'auto',
                    marginBottom: 10,
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      // NEED TO ADD PATH OF SCANNED PROFILE
                      navigate.navigate('CameraModal', {
                        updateBitcoinAdressFunc: formatNostrContact,
                      });
                    }}
                    style={{
                      backgroundColor: theme
                        ? COLORS.darkModeText
                        : COLORS.lightModeText,
                      borderRadius: 8,
                      overflow: 'hidden',
                      marginBottom: 5,
                    }}>
                    <Image
                      style={{
                        width: 20,
                        height: 20,
                        margin: 12,
                      }}
                      source={
                        theme ? ICONS.scanQrCodeDark : ICONS.scanQrCodeLight
                      }
                    />
                  </TouchableOpacity>
                  <Text
                    style={{
                      fontFamily: FONT.Title_Regular,
                      fontSize: SIZES.small,
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    }}>
                    Scan Profile
                  </Text>
                </View>
              </View>
            </KeyboardAwareScrollView>
          </SafeAreaView>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );

  async function addContact() {
    try {
      let savedContacts = [...masterInfoObject.contacts.addedContacts];
      if (
        savedContacts.filter(
          savedContact => savedContact.uuid === newContactInfo.uuid,
        ).length > 0
      ) {
        clearForm();
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Contact already added',
        });
        return;
      }
      savedContacts.push(newContactInfo);
      toggleMasterInfoObject({
        contacts: {
          myProfile: {
            ...masterInfoObject.contacts.myProfile,
          },
          addedContacts: savedContacts,
        },
      });
      // nostr.nip19.decode(newContactInfo.npub);
      // nostrSocket.close();

      // let newContactsList = masterInfoObject.nostrContacts;

      // newContactsList.push(newContactInfo);

      // toggleNostrContacts(newContactsList, null, null);

      // const [generatedNostrProfile, pubKeyOfContacts] =
      //   await getConnectToRelayInfo(newContactsList);

      // connectToRelay(
      //   pubKeyOfContacts,
      //   generatedNostrProfile.privKey,
      //   generatedNostrProfile.pubKey,
      //   receiveEventListener,
      //   toggleNostrSocket,
      //   toggleNostrEvents,
      //   toggleNostrContacts,
      //   newContactsList,
      // );
      clearForm();
      Alert.alert('Contact Saved', '', () => {
        // setUpdateContactsList(prev => {
        //   return (prev = prev + 1);
        // });

        navigation.jumpTo('ContactsPage');
      });
    } catch (err) {
      console.log(err);
      navigate.navigate('ErrorScreen', {errorMessage: 'Invalid npub'});
    }
  }
  function clearForm() {
    setNewContactInfo({
      uuid: '',
      name: '',

      bio: '',
      isFavorite: false,
      transactions: [],
      unlookedTransactions: [],
    });
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },
  topBar: {
    width: '95%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 5,
    ...CENTER,
  },
  backButton: {
    width: 20,
    height: 20,
  },
  topBarText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
  },

  photoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  photoIconContainer: {
    width: 175,
    height: 175,

    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 125,
    ...CENTER,
    marginBottom: 20,
  },
  photoTempIcon: {
    width: '60%',
    height: '60%',
  },

  addPhotoTextContainer: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 15,
  },
  addPhotoText: {
    fontFamily: FONT.Descriptoin_Bold,
    fontSize: SIZES.medium,
  },

  inputContainer: {
    width: '100%',
    height: 'auto',
    borderBottomWidth: 1,
    borderTopWidth: 1,
  },

  textInput: {
    width: '95%',
    padding: 10,
    borderBottomWidth: 1,
    ...CENTER,
  },
});
