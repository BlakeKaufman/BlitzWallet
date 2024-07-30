import {
  DrawerActions,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
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
  FlatList,
} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useEffect, useMemo, useRef, useState} from 'react';
import {atob} from 'react-native-quick-base64';
import {getSignleContact, queryContacts} from '../../../../../db';
import {getPublicKey} from 'nostr-tools';
import {
  decryptMessage,
  encriptMessage,
} from '../../../../functions/messaging/encodingAndDecodingMessages';
import {getLocalStorageItem} from '../../../../functions';
import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import handleBackPress from '../../../../hooks/handleBackPress';
import {useGlobalContacts} from '../../../../../context-store/globalContacts';

export default function AddContactPage({navigation}) {
  const navigate = useNavigation();
  const {
    theme,
    masterInfoObject,
    toggleMasterInfoObject,
    contactsPrivateKey,
    deepLinkContent,
    setDeepLinkContent,
  } = useGlobalContextProvider();
  const {globalContactsList, decodedAddedContacts} = useGlobalContacts();

  const isFocused = useIsFocused();
  function handleBackPressFunction() {
    console.log('RUNNIGN IN ADD CONTACT BACK BUGGON');
    navigation.navigate('Contacts Page');
    return true;
  }
  // const publicKey = getPublicKey(contactsPrivateKey);

  // const refreshTimer = useRef(null);
  // const isInitialLoad = useRef(true);
  // const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  // const [contactsList, setContactsList] = useState([]);

  const [searchInput, setSearchInput] = useState('');

  // const decodedAddedContacts =
  //   typeof masterInfoObject.contacts.addedContacts === 'string'
  //     ? [
  //         ...JSON.parse(
  //           decryptMessage(
  //             contactsPrivateKey,
  //             publicKey,
  //             masterInfoObject.contacts.addedContacts,
  //           ),
  //         ),
  //       ]
  //     : [];

  function parseContact(data) {
    const decoded = atob(data);
    const parsedData = JSON.parse(decoded);

    const newContact = {
      name: parsedData.name || '',
      bio: parsedData.bio || '',
      uniqueName: parsedData.uniqueName,
      isFavorite: false,
      transactions: [],
      unlookedTransactions: 0,
      uuid: parsedData.uuid,
      receiveAddress: parsedData.receiveAddress,
      isAdded: true,
    };
    navigate.navigate('ExpandedAddContactsPage', {
      newContact,
      addContact: () =>
        addContact(
          newContact,
          masterInfoObject,
          toggleMasterInfoObject,
          navigate,
          navigation,
          contactsPrivateKey,
          true,
        ),
    });

    // addContact(
    //   newContact,
    //   masterInfoObject,
    //   toggleMasterInfoObject,
    //   navigate,
    //   navigation,
    //   contactsPrivateKey,
    // );
  }

  // useEffect(() => {
  //   if (!isFocused) {
  //     console.log('TEs');
  //     clearInterval(refreshTimer.current);
  //     return;
  //   }
  //   (async () => {
  //     if (isInitialLoad.current) {
  //       isInitialLoad.current = false;
  //       const getcachedContacts = JSON.parse(
  //         await getLocalStorageItem('cachedContactsList'),
  //       );
  //       const users = await getContactsFromDatabase();

  //       setContactsList(
  //         getcachedContacts.length != 0 ? getcachedContacts : users,
  //       );
  //       setIsLoadingContacts(false);
  //     }

  //     refreshTimer.current = setInterval(async () => {
  //       const users = await getContactsFromDatabase();
  //       setContactsList(users);
  //       // setIsLoadingContacts(false);
  //     }, 60000);
  //   })();
  // }, [isFocused]);

  useEffect(() => {
    if (!isFocused) return;
    console.log('ADD CONTACT USE EFFECT');
    handleBackPress(handleBackPressFunction);
  }, [isFocused]);

  useEffect(() => {
    console.log(deepLinkContent);
    if (deepLinkContent?.data?.length === 0 || !deepLinkContent?.data?.length)
      return;
    (async () => {
      const deepLinkUser = deepLinkContent.data.split('u/')[1];

      const rawUser = await getSignleContact(deepLinkUser);
      if (Object.keys(rawUser).length === 0 || !rawUser) {
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Contact does not exist',
        });
        return;
      }
      const user = rawUser[0].data();

      const newContact = {
        name: user.contacts.myProfile.name,
        uuid: user.contacts.myProfile.uuid,
        uniqueName: user.contacts.myProfile.uniqueName,
        receiveAddress: user.contacts.myProfile.receiveAddress,
        isFavorite: false,
        transactions: [],
        unlookedTransactions: 0,
        isAdded: true,
      };

      const isAlreadyAddedd =
        decodedAddedContacts.filter(userContact => {
          return (
            userContact.uniqueName.toLowerCase() ===
            newContact.uniqueName.toLowerCase()
          );
        }).length != 0;

      if (isAlreadyAddedd) {
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Contact already added',
        });
        return;
      }

      if (deepLinkContent.type === 'Contact') {
        navigate.navigate('ExpandedAddContactsPage', {
          newContact,
          addContact: () =>
            addContact(
              newContact,
              masterInfoObject,
              toggleMasterInfoObject,
              navigate,
              navigation,
              contactsPrivateKey,
              true,
            ),
        });
        setDeepLinkContent({type: '', data: ''});
      }
    })();
  }, [deepLinkContent]);

  const potentialContacts = useMemo(() => {
    return globalContactsList.map((savedContact, id) => {
      if (!savedContact) {
        return false;
      }
      if (
        savedContact.uniqueName ===
        masterInfoObject.contacts.myProfile.uniqueName
      )
        return false;

      if (!savedContact.receiveAddress) return false;
      if (
        savedContact.name.toLowerCase().startsWith(searchInput.toLowerCase()) ||
        savedContact.uniqueName
          .toLowerCase()
          .startsWith(searchInput.toLowerCase())
      ) {
        return (
          <ContactListItem
            key={savedContact.uniqueName}
            navigation={navigation}
            id={id}
            savedContact={savedContact}
            contactsPrivateKey={contactsPrivateKey}
          />
        );
      } else return false;
    });
  }, [globalContactsList, searchInput]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      style={{flex: 1}}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <GlobalThemeView useStandardWidth={true} styles={{paddingBottom: 0}}>
          <View style={styles.topBar}>
            <ThemeText styles={styles.headerText} content={'New Contacts'} />
            <TouchableOpacity
              onPress={() => {
                navigation.openDrawer();
              }}>
              <Image style={styles.drawerIcon} source={ICONS.drawerList} />
            </TouchableOpacity>
          </View>
          <View style={{flex: 1}}>
            <View style={styles.inputContainer}>
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
                    backgroundColor: theme
                      ? COLORS.darkModeBackgroundOffset
                      : COLORS.lightModeBackgroundOffset,
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  },
                ]}
              />
            </View>
            {/* {isLoadingContacts ? (
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
                  style={[
                    styles.gettingContacts,
                    {
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    },
                  ]}>
                  Getting all contacts
                </Text>
              </View>
            ) : ( */}
            <FlatList
              showsVerticalScrollIndicator={false}
              data={potentialContacts}
              renderItem={({item}) => item}
            />
            {/* <View style={{flex: 1}}>
              <ScrollView>{potentialContacts}</ScrollView>
            </View> */}
            {/* )} */}
          </View>

          <View style={styles.scanProfileContainer}>
            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                setTimeout(() => {
                  navigate.navigate('CameraModal', {
                    updateBitcoinAdressFunc: parseContact,
                    fromPage: 'addContact',
                  });
                }, 200);
              }}
              style={[
                styles.scanProfileButton,
                {
                  backgroundColor: COLORS.darkModeText,
                },
              ]}>
              <Image
                style={styles.scanProfileImage}
                source={ICONS.scanQrCodeDark}
              />
            </TouchableOpacity>
            <Text
              style={[
                styles.scanProfileText,
                {
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                },
              ]}>
              Scan Profile
            </Text>
          </View>
        </GlobalThemeView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

function ContactListItem(props) {
  const {theme, masterInfoObject, toggleMasterInfoObject} =
    useGlobalContextProvider();
  const navigate = useNavigation();
  const newContact = {
    ...props.savedContact,
    isFavorite: false,
    transactions: [],
    unlookedTransactions: 0,
    isAdded: true,
  };

  return (
    <TouchableOpacity
      key={props.savedContact.uniqueName}
      onPress={() =>
        navigate.navigate('ExpandedAddContactsPage', {
          newContact: newContact,
          addContact: () =>
            addContact(
              newContact,
              masterInfoObject,
              toggleMasterInfoObject,
              navigate,
              props.navigation,
              props.contactsPrivateKey,
              true,
            ),
        })
      }>
      <View style={[styles.contactListContainer, {}]}>
        <View
          style={[
            styles.contactListLetterImage,
            {
              borderColor: theme ? COLORS.darkModeText : COLORS.lightModeText,
              backgroundColor: theme
                ? COLORS.darkModeBackgroundOffset
                : COLORS.lightModeBackgroundOffset,
            },
          ]}>
          <Text
            style={[
              styles.contactListName,
              {
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                includeFontPadding: false,
              },
            ]}>
            {newContact.uniqueName[0]}
          </Text>
        </View>
        <View>
          <Text
            style={[
              styles.contactListName,
              {
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            {newContact.uniqueName}
          </Text>
          <Text
            style={[
              styles.contactListName,
              {
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                fontSize: SIZES.small,
              },
            ]}>
            {newContact.name || 'No name set'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

async function getContactsFromDatabase() {
  let users = await queryContacts('blitzWalletUsers');

  return users.map(doc => {
    const {
      contacts: {myProfile},
    } = doc.data();

    const returnObject = {
      name: myProfile.name,
      uuid: myProfile.uuid,
      uniqueName: myProfile.uniqueName,
      receiveAddress: myProfile.receiveAddress,
    };
    return returnObject;
  });
}

function addContact(
  newContact,
  masterInfoObject,
  toggleMasterInfoObject,
  navigate,
  navigation,
  contactsPrivateKey,
  isFromExpandedPage,
) {
  try {
    const publicKey = getPublicKey(contactsPrivateKey);
    let savedContacts =
      typeof masterInfoObject.contacts.addedContacts === 'string'
        ? [
            ...JSON.parse(
              decryptMessage(
                contactsPrivateKey,
                publicKey,
                masterInfoObject.contacts.addedContacts,
              ),
            ),
          ]
        : [];

    if (masterInfoObject.contacts.myProfile.uuid === newContact.uuid) {
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Cannot add yourself',
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
        addedContacts: encriptMessage(
          contactsPrivateKey,
          publicKey,
          JSON.stringify(savedContacts),
        ),
        // unaddedContacts:
        //   typeof masterInfoObject.contacts.unaddedContacts === 'string'
        //     ? masterInfoObject.contacts.unaddedContacts
        //     : [],
      },
    });
    console.log(isFromExpandedPage, 'TESTING');

    // if (isFromExpandedPage) {
    //   navigate.goBack();
    // }

    // setTimeout(() => {
    //   navigate.navigate('ErrorScreen', {
    //     errorMessage: 'Contact saved',
    //     navigationFunction: {
    //       navigator: navigation.jumpTo,
    //       destination: 'Contacts Page',
    //     },
    //   });
    // }, 800);
  } catch (err) {
    console.log(err);

    navigate.navigate('ErrorScreen', {errorMessage: 'Error adding contact'});
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    ...CENTER,
  },
  headerText: {fontFamily: FONT.Title_Bold, fontSize: SIZES.large},
  drawerIcon: {
    width: 20,
    height: 20,
  },
  inputContainer: {
    width: '100%',
    ...CENTER,
    marginTop: 10,
  },
  topBarText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.large,
    fontWeight: 'bold',
  },

  gettingContacts: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Regular,
    marginTop: 10,
  },

  textInput: {
    width: '100%',
    padding: 10,
    ...CENTER,
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Regular,
    borderRadius: 8,
  },

  scanProfileContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 10,
  },
  scanProfileButton: {borderRadius: 8, overflow: 'hidden', marginBottom: 5},
  scanProfileImage: {
    width: 20,
    height: 20,
    margin: 12,
  },
  scanProfileText: {fontFamily: FONT.Title_Regular, fontSize: SIZES.small},

  contactListContainer: {
    width: '100%',
    ...CENTER,
    paddingVertical: 10,

    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  contactListLetterImage: {
    height: 30,
    width: 30,
    borderRadius: 15,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,

    marginRight: 10,
  },

  contactListName: {fontFamily: FONT.Title_Regular, fontSize: SIZES.medium},
});
