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
  ActivityIndicator,
} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useEffect, useState} from 'react';
import {atob} from 'react-native-quick-base64';
import {queryContacts} from '../../../../../db';

export default function AddContactPage({navigation}) {
  const navigate = useNavigation();
  const {theme, masterInfoObject, toggleMasterInfoObject} =
    useGlobalContextProvider();

  const isForground = useIsFocused();
  console.log(isForground, 'TEST');

  const [contactsList, setContactsList] = useState([]);

  const [searchInput, setSearchInput] = useState('');

  const [isLoadingContacts, setIsLoadingContacts] = useState(true);

  function parseContact(data) {
    const decoded = atob(data);
    const parsedData = JSON.parse(decoded);

    const newContact = {
      name: parsedData.name || null,
      bio: parsedData.bio || '',
      isFavorite: false,
      transactions: [],
      unlookedTransactions: [],
      uuid: parsedData.uuid,
    };

    addContact(
      newContact,
      masterInfoObject,
      toggleMasterInfoObject,
      navigate,
      navigation,
    );
  }

  useEffect(() => {
    (async () => {
      let users = await queryContacts('blitzWalletUsers');

      users = users['docs'].map(doc => {
        return {
          name: doc['_document'].data.value.mapValue.fields.contacts.mapValue
            .fields.myProfile.mapValue.fields.name.stringValue,
          uuid: doc['_document'].data.value.mapValue.fields.contacts.mapValue
            .fields.myProfile.mapValue.fields.uuid.stringValue,

          bio: doc['_document'].data.value.mapValue.fields.contacts.mapValue
            .fields.myProfile.mapValue.fields.bio.stringValue,
        };
      });

      setContactsList(users);
      setIsLoadingContacts(false);
    })();
  }, []);

  const potentialContacts =
    contactsList.length != 0 &&
    contactsList.map((savedContact, id) => {
      if (savedContact.name === masterInfoObject.contacts.myProfile.name)
        return false;
      if (
        savedContact.name.toLowerCase().startsWith(searchInput.toLowerCase())
      ) {
        return (
          <ContactListItem
            navigation={navigation}
            id={id}
            savedContact={savedContact}
          />
        );
      } else return false;
    });

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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          style={{flex: 1}}>
          <SafeAreaView style={{flex: 1}}>
            <View style={styles.topBar}>
              <Text
                style={[
                  styles.topBarText,
                  {
                    fontWeight: 'bold',
                    // transform: [{translateX: -12}],
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

            <View style={{flex: 1}}>
              <TextInput
                onChangeText={setSearchInput}
                value={searchInput}
                placeholder="Username"
                placeholderTextColor={
                  theme ? COLORS.darkModeText : COLORS.lightModeText
                }
                style={[
                  styles.textInput,

                  {
                    borderWidth: 1,
                    borderRadius: 50,
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    borderColor: COLORS.primary,
                  },
                ]}
              />
              {isLoadingContacts ? (
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <ActivityIndicator
                    size="large"
                    color={theme ? COLORS.darkModeText : COLORS.lightModeText}
                  />
                  <Text
                    style={{
                      fontSize: SIZES.medium,
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                      marginTop: 10,
                    }}>
                    Getting all contacts
                  </Text>
                </View>
              ) : (
                <View style={{flex: 1}}>
                  {/* PEOPLE CONTAINEr */}
                  <ScrollView>{potentialContacts}</ScrollView>
                </View>
              )}
            </View>

            {/* CONTETN */}
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
                    updateBitcoinAdressFunc: parseContact,
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
                  source={theme ? ICONS.scanQrCodeDark : ICONS.scanQrCodeLight}
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
          </SafeAreaView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
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
    fontSize: SIZES.small,
    fontFamily: FONT.Title_Regular,
  },
});

function ContactListItem(props) {
  const {theme, masterInfoObject, toggleMasterInfoObject} =
    useGlobalContextProvider();
  const navigate = useNavigation();
  const newContact = {
    ...props.savedContact,
    isFavorite: false,
    transactions: [],
    unlookedTransactions: [],
  };

  return (
    <TouchableOpacity
      key={props.id}
      onPress={() =>
        navigate.navigate('ConfirmAddContact', {
          addContact: () =>
            addContact(
              newContact,
              masterInfoObject,
              toggleMasterInfoObject,
              navigate,
              props.navigation,
            ),
        })
      }>
      <View
        style={{
          width: '95%',
          ...CENTER,
          padding: 10,

          borderRadius: 10,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <View
          style={{
            height: 30,
            width: 30,
            borderRadius: 15,
            backgroundColor: theme
              ? COLORS.darkModeBackgroundOffset
              : COLORS.lightModeBackgroundOffset,
            alignItems: 'center',
            justifyContent: 'center',

            borderWidth: 1,
            borderColor: theme ? COLORS.darkModeText : COLORS.lightModeText,
            marginRight: 10,
          }}>
          <Text
            style={{
              fontFamily: FONT.Title_Regular,
              fontSize: SIZES.medium,
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
            }}>
            {newContact.name[0]}
          </Text>
        </View>
        <View>
          <Text
            style={{
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              fontFamily: FONT.Title_Regular,
              fontSize: SIZES.medium,
            }}>
            {newContact.name}
          </Text>
          <Text
            style={{
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              fontFamily: FONT.Title_Regular,
              fontSize: SIZES.small,
            }}>
            {newContact.bio || 'no bio'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function addContact(
  newContact,
  masterInfoObject,
  toggleMasterInfoObject,
  navigate,
  navigation,
) {
  try {
    let savedContacts = [...masterInfoObject.contacts.addedContacts];

    if (masterInfoObject.contacts.myProfile.uuid === newContact.uuid) {
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Contact add yourself',
      });
      return;
    } else if (
      savedContacts.filter(
        savedContact =>
          savedContact.uuid === newContact.uuid ||
          newContact.uuid === masterInfoObject.contacts.myProfile.uuid,
      ).length > 0
    ) {
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Contact already added',
      });
      return;
    }

    savedContacts.push(newContact);

    toggleMasterInfoObject({
      contacts: {
        myProfile: {
          ...masterInfoObject.contacts.myProfile,
        },
        addedContacts: savedContacts,
      },
    });

    navigate.navigate('ErrorScreen', {
      errorMessage: 'Contact saved',
      navigationFunction: {
        navigator: navigation.jumpTo,
        destination: 'ContactsPage',
      },
    });
  } catch (err) {
    console.log(err);

    navigate.navigate('ErrorScreen', {errorMessage: 'Error adding contact'});
  }
}
