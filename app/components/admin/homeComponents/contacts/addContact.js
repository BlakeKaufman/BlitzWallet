import {useIsFocused, useNavigation} from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  FlatList,
} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {atob} from 'react-native-quick-base64';
import {getSignleContact, queryContacts, searchUsers} from '../../../../../db';
import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import handleBackPress from '../../../../hooks/handleBackPress';
import {useGlobalContacts} from '../../../../../context-store/globalContacts';
import GetThemeColors from '../../../../hooks/themeColors';
import ThemeImage from '../../../../functions/CustomElements/themeImage';
import useDebounce from '../../../../hooks/useDebounce';

export default function AddContactPage({navigation}) {
  const navigate = useNavigation();
  const {contactsPrivateKey, deepLinkContent, setDeepLinkContent} =
    useGlobalContextProvider();
  let debounceTimeout;
  const {globalContactsList, decodedAddedContacts, globalContactsInformation} =
    useGlobalContacts();
  const [searchInput, setSearchInput] = useState('');
  const [users, setUsers] = useState([]);
  const [placeHolderUsers, setPlaceHolderUsers] = useState([]);
  const tabsNavigate = navigation.navigate;
  const {textInputBackground, textInputColor} = GetThemeColors();

  const isFocused = useIsFocused();

  const handleBackPressFunction = useCallback(() => {
    console.log('RUNNIGN IN ADD CONTACT BACK BUGGON');
    tabsNavigate('Contacts Page');
    return true;
  }, [navigate]);

  useEffect(() => {
    setPlaceHolderUsers(
      globalContactsList.map((savedContact, id) => {
        return (
          <ContactListItem
            key={savedContact.uniqueName}
            navigation={navigation}
            id={id}
            savedContact={savedContact}
            contactsPrivateKey={contactsPrivateKey}
          />
        );
      }),
    );
  }, [globalContactsList, contactsPrivateKey, navigation]);

  // Use useMemo to ensure debounce function is not recreated on every render
  // Debounced version of the search function
  const debouncedSearch = useDebounce(async term => {
    console.log(term);
    const results = await searchUsers(term);

    console.log(results, 'TEST');
    const newUsers = results.map((savedContact, id) => {
      console.log(savedContact, 'TEST');
      if (!savedContact) {
        return false;
      }
      if (
        savedContact.uniqueName ===
        globalContactsInformation.myProfile.uniqueName
      )
        return false;
      if (!savedContact.receiveAddress) return false;
      return (
        <ContactListItem
          key={savedContact.uniqueName}
          navigation={navigation}
          id={id}
          savedContact={savedContact}
          contactsPrivateKey={contactsPrivateKey}
        />
      );
    });
    setUsers(newUsers);
  }, 300);

  // Handler function that updates searchTerm and triggers the debounced search
  const handleSearch = term => {
    console.log(term);
    setSearchInput(term);
    debouncedSearch(term);
  };

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
    });
  }

  useEffect(() => {
    if (!isFocused) return;
    handleBackPress(handleBackPressFunction);
  }, [isFocused, handleBackPressFunction]);

  useEffect(() => {
    if (deepLinkContent?.data?.length === 0 || !deepLinkContent?.data?.length)
      return;
    (async () => {
      const deepLinkUser = deepLinkContent.data.split('u/')[1];
      const rawUser = await getSignleContact(deepLinkUser.trim());
      console.log(rawUser);
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
          // addContact: () =>
          //   addContact(
          //     newContact,
          //     masterInfoObject,
          //     toggleMasterInfoObject,
          //     navigate,
          //     navigation,
          //     contactsPrivateKey,
          //     true,
          //   ),
        });
        setDeepLinkContent({type: '', data: ''});
      }
    })();
  }, [deepLinkContent, decodedAddedContacts, navigate, setDeepLinkContent]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      style={{flex: 1}}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <GlobalThemeView useStandardWidth={true} styles={{paddingBottom: 0}}>
          <View style={styles.topBar}>
            <ThemeText styles={styles.headerText} content={'New Contacts'} />
            <TouchableOpacity
              style={{marginRight: 20, marginLeft: 'auto'}}
              onPress={() => {
                Keyboard.dismiss();
                setTimeout(() => {
                  navigate.navigate('CameraModal', {
                    updateBitcoinAdressFunc: parseContact,
                    fromPage: 'addContact',
                  });
                }, 200);
              }}>
              <ThemeImage
                darkModeIcon={ICONS.scanQrCodeBlue}
                lightModeIcon={ICONS.scanQrCodeBlue}
                lightsOutIcon={ICONS.scanQrCodeLight}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.openDrawer();
              }}>
              <ThemeImage
                darkModeIcon={ICONS.drawerList}
                lightModeIcon={ICONS.drawerList}
                lightsOutIcon={ICONS.drawerListWhite}
              />
            </TouchableOpacity>
          </View>
          <View style={{flex: 1}}>
            <View style={styles.inputContainer}>
              <TextInput
                onChangeText={handleSearch}
                value={searchInput}
                placeholder="Username"
                placeholderTextColor={COLORS.opaicityGray}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: textInputBackground,
                    color: textInputColor,
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
                  color={textColor}
                />
                <Text
                  style={[
                    styles.gettingContacts,
                    {
                      color: textColor,
                    },
                  ]}>
                  Getting all contacts
                </Text>
              </View>
            ) : ( */}
            <FlatList
              showsVerticalScrollIndicator={false}
              data={users.length === 0 ? placeHolderUsers : users}
              renderItem={({item}) => item}
            />
            {/* <View style={{flex: 1}}>
              <ScrollView>{potentialContacts}</ScrollView>
            </View> */}
            {/* )} */}
          </View>

          {/* <View style={styles.scanProfileContainer}>
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
                  color: textColor,
                },
              ]}>
              Scan Profile
            </Text>
          </View> */}
        </GlobalThemeView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
  // function debounce(func, wait) {
  //   return function (...args) {
  //     const context = this;
  //     clearTimeout(debounceTimeout);
  //     debounceTimeout = setTimeout(() => func.apply(context, args), wait);
  //   };
  // }
}

function ContactListItem(props) {
  const {textColor, backgroundOffset} = GetThemeColors();
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
          // addContact: () =>
          //   addContact(
          //     newContact,
          //     masterInfoObject,
          //     toggleMasterInfoObject,
          //     navigate,
          //     props.navigation,
          //     props.contactsPrivateKey,
          //     true,
          //   ),
        })
      }>
      <View style={[styles.contactListContainer, {}]}>
        <View
          style={[
            styles.contactListLetterImage,
            {
              borderColor: textColor,
              backgroundColor: backgroundOffset,
            },
          ]}>
          <Text
            style={[
              styles.contactListName,
              {
                color: textColor,
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
                color: textColor,
              },
            ]}>
            {newContact.uniqueName}
          </Text>
          <Text
            style={[
              styles.contactListName,
              {
                color: textColor,
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

// function addContact(
//   newContact,
//   masterInfoObject,
//   toggleMasterInfoObject,
//   navigate,
//   navigation,
//   contactsPrivateKey,
//   isFromExpandedPage,
// ) {
//   try {
//     const publicKey = getPublicKey(contactsPrivateKey);
//     let savedContacts =
//       typeof globalContactsInformation.addedContacts === 'string'
//         ? [
//             ...JSON.parse(
//               decryptMessage(
//                 contactsPrivateKey,
//                 publicKey,
//                 globalContactsInformation.addedContacts,
//               ),
//             ),
//           ]
//         : [];

//     if (globalContactsInformation.myProfile.uuid === newContact.uuid) {
//       navigate.navigate('ErrorScreen', {
//         errorMessage: 'Cannot add yourself',
//       });
//       return;
//     } else if (
//       savedContacts.filter(
//         savedContact =>
//           savedContact.uuid === newContact.uuid ||
//           newContact.uuid === globalContactsInformation.myProfile.uuid,
//       ).length > 0
//     ) {
//       navigate.navigate('ErrorScreen', {
//         errorMessage: 'Contact already added',
//       });
//       return;
//     }

//     savedContacts.push(newContact);

//     toggleMasterInfoObject({
//       contacts: {
//         myProfile: {
//           ...globalContactsInformation.myProfile,
//         },
//         addedContacts: encriptMessage(
//           contactsPrivateKey,
//           publicKey,
//           JSON.stringify(savedContacts),
//         ),
//         // unaddedContacts:
//         //   typeof globalContactsInformation.unaddedContacts === 'string'
//         //     ? globalContactsInformation.unaddedContacts
//         //     : [],
//       },
//     });
//     console.log(isFromExpandedPage, 'TESTING');

//     // if (isFromExpandedPage) {
//     //   navigate.goBack();
//     // }

//     // setTimeout(() => {
//     //   navigate.navigate('ErrorScreen', {
//     //     errorMessage: 'Contact saved',
//     //     navigationFunction: {
//     //       navigator: navigation.jumpTo,
//     //       destination: 'Contacts Page',
//     //     },
//     //   });
//     // }, 800);
//   } catch (err) {
//     console.log(err);

//     navigate.navigate('ErrorScreen', {errorMessage: 'Error adding contact'});
//   }
// }

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,

    ...CENTER,
  },
  headerText: {fontSize: SIZES.large},
  drawerIcon: {
    width: 20,
    height: 20,
  },
  inputContainer: {
    width: '100%',
    ...CENTER,
    marginTop: 10,
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
  scanProfileButton: {
    // borderRadius: 8,
    // overflow: 'hidden',
    marginBottom: 5,
    marginLeft: 'auto',
  },
  scanProfileImage: {
    width: 20,
    height: 20,
    // margin: 12,
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
