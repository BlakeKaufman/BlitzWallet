import {useIsFocused, useNavigation} from '@react-navigation/native';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../constants';

import {useEffect, useMemo, useState} from 'react';

import {useGlobalContextProvider} from '../../../../../context-store/context';
import {getPublicKey} from 'nostr-tools';
import {encriptMessage} from '../../../../functions/messaging/encodingAndDecodingMessages';

import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import handleBackPress from '../../../../hooks/handleBackPress';
import CustomButton from '../../../../functions/CustomElements/button';
import {useGlobalContacts} from '../../../../../context-store/globalContacts';
import GetThemeColors from '../../../../hooks/themeColors';
import ThemeImage from '../../../../functions/CustomElements/themeImage';
import CustomToggleSwitch from '../../../../functions/CustomElements/switch';

export default function ContactsPage({navigation}) {
  const {theme, contactsPrivateKey, deepLinkContent, darkModeType} =
    useGlobalContextProvider();
  const {
    decodedAddedContacts,
    globalContactsInformation,
    toggleGlobalContactsInformation,
  } = useGlobalContacts();
  const {backgroundOffset, textInputColor, textInputBackground} =
    GetThemeColors();
  const isFocused = useIsFocused();
  const navigate = useNavigation();
  const [inputText, setInputText] = useState('');
  const [hideUnknownContacts, setHideUnknownContacts] = useState(false);
  const publicKey = getPublicKey(contactsPrivateKey);
  function handleBackPressFunction() {
    navigation.navigate('Home');
    return true;
  }
  useEffect(() => {
    if (!isFocused) return;

    handleBackPress(handleBackPressFunction);
  }, [isFocused]);

  useEffect(() => {
    if (deepLinkContent.type === 'Contact') {
      navigation.navigate('Add Contact');
    }
  }, [deepLinkContent]);

  const pinnedContacts = useMemo(() => {
    return decodedAddedContacts
      .filter(contact => contact.isFavorite)
      .map((contact, id) => {
        return <PinnedContactElement key={contact.uuid} contact={contact} />;
      });
  }, [decodedAddedContacts, theme, darkModeType]);

  const contactElements = useMemo(() => {
    return decodedAddedContacts
      .filter(contact => {
        return (
          (contact.name.toLowerCase().startsWith(inputText.toLowerCase()) ||
            contact.uniqueName
              .toLowerCase()
              .startsWith(inputText.toLowerCase())) &&
          !contact.isFavorite &&
          (!hideUnknownContacts || contact.isAdded)
        );
      })
      .sort((a, b) => {
        const earliset_A = a.transactions.sort((a, b) => b.uuid - a.uuid)[0]
          ?.uuid;
        const earliset_B = b.transactions.sort((a, b) => b.uuid - a.uuid)[0]
          ?.uuid;

        return (earliset_B || 0) - (earliset_A || 0);
      })
      .map((contact, id) => {
        return <ContactElement key={contact.uuid} contact={contact} />;
      });
  }, [
    decodedAddedContacts,
    theme,
    inputText,
    darkModeType,
    hideUnknownContacts,
  ]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      style={[styles.globalContainer]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <GlobalThemeView useStandardWidth={true} styles={{paddingBottom: 0}}>
          <View style={styles.topBar}>
            <ThemeText styles={styles.headerText} content={'Contacts'} />
            {/* <TouchableOpacity
              onPress={() => navigate.navigate('MyContactProfilePage')}
              style={{
                marginRight: 15,
                marginLeft: 'auto',
              }}>
              <Image style={styles.backButton} source={ICONS.settingsIcon} />
            </TouchableOpacity> */}
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
          {decodedAddedContacts.length !== 0 ? (
            // decodedUnaddedContacts.length != 0
            <View style={{flex: 1}}>
              {pinnedContacts.length != 0 && (
                <View style={styles.pinnedContactsContainer}>
                  {pinnedContacts}
                </View>
              )}
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Search"
                  placeholderTextColor={COLORS.opaicityGray}
                  value={inputText}
                  onChangeText={setInputText}
                  style={[
                    styles.searchInput,
                    {
                      color: textInputColor,
                      backgroundColor: textInputBackground,
                    },
                  ]}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginVertical: 10,
                  }}>
                  <CustomToggleSwitch
                    toggleSwitchFunction={() => {
                      setHideUnknownContacts(prev => {
                        return !prev;
                      });
                    }}
                    stateValue={hideUnknownContacts}
                  />
                  {/* <Switch
                    style={{marginRight: 10}}
                    onChange={() => {
                      setHideUnknownContacts(prev => {
                        return !prev;
                      });
                    }}
                    value={hideUnknownContacts}
                    trackColor={{
                      false: backgroundOffset,
                      true: COLORS.primary,
                    }}
                  /> */}
                  <ThemeText
                    styles={{marginLeft: 10}}
                    content={'Hide Unknown Contacts'}
                  />
                </View>
              </View>
              <View style={{flex: 1}}>
                <ScrollView style={{flex: 1, overflow: 'hidden'}}>
                  {contactElements}
                </ScrollView>
              </View>
            </View>
          ) : (
            <View style={styles.noContactsContainer}>
              <ThemeText
                styles={{...styles.noContactsText}}
                content={'You have no contacts. Would you like to add one?'}
              />

              <CustomButton
                buttonStyles={{
                  ...CENTER,
                  width: 'auto',
                  marginTop: 20,
                }}
                actionFunction={() => navigation.navigate('Add Contact')}
                textContent={'Add contact'}
              />
            </View>
          )}
          {/* <View style={{width: '100%', alignItems: 'center', marginBottom: 10}}>
            <TouchableOpacity
              onPress={() => navigate.navigate('MyContactProfilePage')}
              style={{
                backgroundColor: COLORS.darkModeText,

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
                source={ICONS.scanQrCodeDark}
              />
            </TouchableOpacity>
            <ThemeText
              styles={{fontSize: SIZES.small}}
              content={'My Profile'}
            />
          </View> */}
        </GlobalThemeView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

  function navigateToExpandedContact(contact) {
    if (contact.unlookedTransactions !== 0) {
      if (!contact.isAdded) {
        let newAddedContacts = [...decodedAddedContacts];
        const indexOfContact = decodedAddedContacts.findIndex(
          obj => obj.uuid === contact.uuid,
        );

        let newContact = newAddedContacts[indexOfContact];

        newContact['isAdded'] = true;
        newContact['unlookedTransactions'] = 0;

        toggleGlobalContactsInformation(
          {
            myProfile: {...globalContactsInformation.myProfile},
            addedContacts: encriptMessage(
              contactsPrivateKey,
              publicKey,
              JSON.stringify(newAddedContacts),
            ),
          },
          true,
        );
      } else {
        let newAddedContacts = [...decodedAddedContacts];
        const indexOfContact = decodedAddedContacts.findIndex(
          obj => obj.uuid === contact.uuid,
        );

        let newContact = newAddedContacts[indexOfContact];
        newContact['unlookedTransactions'] = 0;

        toggleGlobalContactsInformation(
          {
            myProfile: {...globalContactsInformation.myProfile},
            addedContacts: encriptMessage(
              contactsPrivateKey,
              publicKey,
              JSON.stringify(newAddedContacts),
            ),
          },
          true,
        );
      }
    }

    navigate.navigate('ExpandedContactsPage', {
      uuid: contact.uuid,
    });
  }

  function ContactElement(props) {
    const {nodeInformation} = useGlobalContextProvider();
    const contact = props.contact;

    return (
      <TouchableOpacity
        onLongPress={() => {
          if (!contact.isAdded) return;
          if (!nodeInformation.didConnectToNode) {
            navigate.navigate('ErrorScreen', {
              errorMessage:
                'Please reconnect to the internet to use this feature',
            });
            return;
          }

          navigate.navigate('ContactsPageLongPressActions', {
            contact: contact,
          });
        }}
        key={contact.uuid}
        onPress={() => navigateToExpandedContact(contact)}>
        <View style={{marginTop: 10}}>
          <View style={styles.contactRowContainer}>
            <View
              style={[
                styles.contactImageContainer,
                {
                  backgroundColor: backgroundOffset,
                  position: 'relative',
                },
              ]}>
              <Image
                source={
                  contact.profileImage
                    ? {uri: contact.profileImage}
                    : darkModeType && theme
                    ? ICONS.userWhite
                    : ICONS.userIcon
                }
                style={
                  contact.profileImage
                    ? {width: '100%', height: undefined, aspectRatio: 1}
                    : {width: '50%', height: '50%'}
                }
              />
            </View>
            <View style={{flex: 1}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <ThemeText
                  styles={{
                    marginRight: contact.unlookedTransactions != 0 ? 5 : 'auto',
                  }}
                  content={
                    contact.name
                      ? contact.name.length > 15
                        ? `${contact.name.slice(0, 15)}...`
                        : contact.name
                      : contact.uniqueName.length > 15
                      ? `${contact.uniqueName.slice(0, 15)}...`
                      : contact.uniqueName
                  }
                />
                {contact.unlookedTransactions != 0 && (
                  <View
                    style={[
                      styles.hasNotification,
                      {
                        marginRight: 'auto',
                        backgroundColor:
                          darkModeType && theme
                            ? COLORS.darkModeText
                            : COLORS.primary,
                      },
                    ]}
                  />
                )}
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <ThemeText
                    styles={{
                      fontSize: SIZES.small,
                      marginRight: 5,
                    }}
                    content={
                      contact.transactions[contact.transactions.length - 1]
                        ?.uuid
                        ? createFormattedDate(
                            contact.transactions.sort(
                              (a, b) => a.uud - b.uuid,
                            )[0]?.uuid,
                          )
                        : ''
                    }
                  />
                  <ThemeImage
                    styles={{
                      width: 20,
                      height: 20,
                      transform: [{rotate: '180deg'}],
                    }}
                    darkModeIcon={ICONS.leftCheveronIcon}
                    lightModeIcon={ICONS.leftCheveronIcon}
                    lightsOutIcon={ICONS.left_cheveron_white}
                  />
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <ThemeText
                  styles={{
                    fontSize: SIZES.small,
                  }}
                  content={
                    // contact.unlookedTransactions != 0
                    //   ? formatMessage(
                    //       contact.unlookedTransactions[
                    //         contact.unlookedTransactions - 1
                    //       ]?.data?.description,
                    //     ) || 'No description'
                    //   :
                    contact.transactions.length != 0
                      ? formatMessage(
                          contact.transactions.sort((a, b) => a.uud - b.uuid)[0]
                            .data.description,
                        ) || 'No description'
                      : 'No transaction history'
                  }
                />
                {!contact.isAdded && (
                  <ThemeText
                    styles={{
                      fontSize: SIZES.small,
                      color:
                        darkModeType && theme
                          ? COLORS.darkModeText
                          : COLORS.primary,
                      marginLeft: 'auto',
                    }}
                    content={'Unknown sender'}
                  />
                )}
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  function PinnedContactElement(props) {
    const contact = props.contact;
    // const [profileImage, setProfileImage] = useState(null);
    // useEffect(() => {
    //   setProfileImage(
    //     contactsImages.filter((img, index) => {
    //       if (index != 0) {
    //         const [uuid, savedImg] = img.split(',');

    //         return uuid === contact.uuid;
    //       }
    //     }),
    //   );
    // }, []);
    return (
      <TouchableOpacity
        onLongPress={() => {
          if (!contact.isAdded) return;
          navigate.navigate('ContactsPageLongPressActions', {
            contact: contact,
          });
        }}
        key={contact.uuid}
        onPress={() => navigateToExpandedContact(contact)}>
        <View style={styles.pinnedContact}>
          <View
            style={[
              styles.pinnedContactImageContainer,
              {
                backgroundColor: backgroundOffset,
                position: 'relative',
              },
            ]}>
            {/* {profileImage == null ? (
              <ActivityIndicator size={'small'} />
            ) : ( */}
            <Image
              source={
                contact.profileImage
                  ? {uri: contact.profileImage}
                  : darkModeType && theme
                  ? ICONS.userWhite
                  : ICONS.userIcon
              }
              style={
                contact.profileImage
                  ? {width: '100%', height: undefined, aspectRatio: 1}
                  : {width: '50%', height: '50%'}
              }
            />
            {/* )} */}
            {contact.unlookedTransactions != 0 && (
              <View
                style={{
                  ...styles.hasNotification,
                  backgroundColor:
                    darkModeType && theme
                      ? COLORS.darkModeText
                      : COLORS.primary,
                }}
              />
            )}
          </View>

          <ThemeText
            styles={{textAlign: 'center', fontSize: SIZES.small}}
            content={
              contact.name.length > 15
                ? contact.name.slice(0, 13) + '...'
                : contact.name ||
                  contact.uniqueName.slice(0, 13) +
                    `${contact.uniqueName.length > 15 ? '...' : ''}`
            }
          />
        </View>
      </TouchableOpacity>
    );
  }
}

function createFormattedDate(time) {
  // Convert timestamp to milliseconds
  const timestampMs = time * 1000;

  // Create a new Date object using the timestamp
  const date = new Date(timestampMs);

  // Get the current date
  const currentDate = new Date();

  // Calculate the difference in milliseconds between the current date and the timestamp
  const differenceMs = currentDate - date;

  // Convert milliseconds to days
  const differenceDays = differenceMs / (1000 * 60 * 60 * 24);

  // Define an array of day names
  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  // Format the time if it's more than one day old
  let formattedTime;
  if (differenceDays > 1) {
    // If it's within the last week, display the day name
    if (differenceDays <= 7) {
      formattedTime = daysOfWeek[date.getDay()];
    } else {
      // If it's past one week old, format the date as "3/24/24"
      const month = date.getMonth() + 1; // Months are zero-based, so we add 1
      const day = date.getDate();
      const year = date.getFullYear() % 100; // Get the last two digits of the year
      formattedTime = `${month}/${day}/${year}`;
    }
  } else {
    // Extract hours, minutes, and AM/PM from the date
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert hours from 24-hour to 12-hour format
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;

    // Add leading zero to minutes if necessary
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

    // Create the formatted time string
    formattedTime = `${formattedHours}:${formattedMinutes} ${ampm}`;
  }

  return formattedTime;
}

function combineTxArrays(arr1, arr2) {
  return arr1.concat(arr2); //sort((a, b) => a.uuid - b.uuid); posibly give options to sort by alphabet or other things later
}

function formatMessage(message) {
  return isJSON(message).description || message;
}

function isJSON(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return false;
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

    // paddingHorizontal: 5,
    marginBottom: 5,
    // backgroundColor: 'black',
    ...CENTER,
  },
  backButton: {
    width: 20,
    height: 20,
  },
  hasNotification: {
    // position: 'absolute',
    // bottom: -5,
    // right: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  headerText: {fontSize: SIZES.large},

  inputContainer: {
    width: '100%',
    ...CENTER,
    marginTop: 10,
  },

  searchInput: {
    width: '100%',
    padding: 10,
    borderRadius: 8,

    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Regular,

    ...CENTER,
  },

  noContactsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noContactsText: {
    fontSize: SIZES.large,
    textAlign: 'center',
    width: '90%',
  },

  pinnedContact: {
    width: 110,
    height: 'auto',
    margin: 5,
    alignItems: 'center',
  },
  pinnedContactsContainer: {
    width: '100%',
    ...CENTER,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  pinnedContactImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    overflow: 'hidden',
  },
  pinnedContactImage: {
    width: 70,
    height: 70,
  },
  contactRowContainer: {
    width: '100%',

    // overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    ...CENTER,
    // marginVertical: 5,
  },

  contactImageContainer: {
    width: 45,
    height: 45,
    backgroundColor: COLORS.opaicityGray,
    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 30,
    marginRight: 10,
    overflow: 'hidden',
  },
  contactImage: {
    width: 25,
    height: 30,
  },
});
