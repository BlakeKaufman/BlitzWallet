import {useNavigation} from '@react-navigation/native';
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
import {useState} from 'react';
import {
  connectToRelay,
  getConnectToRelayInfo,
} from '../../../../functions/noster';
import receiveEventListener from '../../../../functions/noster/receiveEventListener';
import * as nostr from 'nostr-tools';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import getKeyboardHeight from '../../../../hooks/getKeyboardHeight';

export default function AddContactPage({navigation}) {
  const navigate = useNavigation();
  const {
    theme,
    toggleNostrSocket,
    toggleNostrEvents,
    nostrSocket,
    toggleNostrContacts,
    masterInfoObject,
  } = useGlobalContextProvider();
  const [newContactInfo, setNewContactInfo] = useState({
    name: null,
    npub: null,
    lnurl: null,
    isFavorite: false,
  });
  const keyboardHeight = getKeyboardHeight();
  //   const setUpdateContactsList = props.route.params.setUpdateContactsList;
  const didFillOutContact = Object.keys(newContactInfo).filter(key => {
    return newContactInfo[key];
  });

  function formatNostrContact(data) {
    const parsedData = JSON.parse(data);

    setNewContactInfo({
      name: parsedData.name || null,
      npub: parsedData.npub || null,
      lnurl: parsedData?.lnurl || null,
      isFavorite: false,
    });
  }

  function handleFormInput(text, inputType) {
    setNewContactInfo(prev => {
      return {...prev, [inputType]: text};
    });
  }

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
                  if (didFillOutContact.length === 0) return;
                  addContact();
                }}>
                <Text
                  style={[
                    styles.topBarText,
                    {
                      opacity: didFillOutContact.length === 0 ? 0.4 : 1,
                      color:
                        didFillOutContact.length === 0
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
                  <TextInput
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
                  />
                  <TextInput
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
                  />
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
      nostr.nip19.decode(newContactInfo.npub);
      nostrSocket.close();

      let newContactsList = masterInfoObject.nostrContacts;

      newContactsList.push(newContactInfo);

      toggleNostrContacts(newContactsList, null, null);

      const [generatedNostrProfile, pubKeyOfContacts] =
        await getConnectToRelayInfo(newContactsList);

      connectToRelay(
        pubKeyOfContacts,
        generatedNostrProfile.privKey,
        generatedNostrProfile.pubKey,
        receiveEventListener,
        toggleNostrSocket,
        toggleNostrEvents,
        toggleNostrContacts,
        newContactsList,
      );

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
