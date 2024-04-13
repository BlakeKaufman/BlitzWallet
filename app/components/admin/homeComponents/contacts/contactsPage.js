import {useIsFocused, useNavigation} from '@react-navigation/native';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../constants';

import {useEffect, useRef, useState} from 'react';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useGlobalContextProvider} from '../../../../../context-store/context';

export default function ContactsPage({navigation}) {
  const {theme, toggleNostrContacts, masterInfoObject, toggleMasterInfoObject} =
    useGlobalContextProvider();
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');

  const textColor = theme ? COLORS.darkModeText : COLORS.lightModeText;
  const addedContacts = masterInfoObject.contacts.addedContacts;

  const pinnedContacts =
    addedContacts.length > 0 &&
    addedContacts
      .filter(contact => contact.isFavorite)
      .map((contact, id) => {
        return (
          <TouchableOpacity
            key={id}
            onPress={() => navigateToExpandedContact(contact)}>
            <View style={styles.pinnedContact}>
              <View
                style={[
                  styles.pinnedContactImageContainer,
                  {
                    backgroundColor: theme
                      ? COLORS.darkModeBackgroundOffset
                      : COLORS.lightModeBackgroundOffset,
                    position: 'relative',
                  },
                ]}>
                <Image
                  style={styles.pinnedContactImage}
                  source={ICONS.userIcon}
                />
                {contact.unlookedTransactions.length != 0 && (
                  <View style={styles.hasNotification}></View>
                )}
              </View>

              <Text
                style={[
                  styles.contactText,
                  {
                    color: textColor,
                    textAlign: 'center',
                    fontSize: SIZES.small,
                  },
                ]}>
                {contact.name.length > 15
                  ? contact.name.slice(0, 15) + '...'
                  : contact.name}
              </Text>
            </View>
          </TouchableOpacity>
        );
      });

  const contactElements =
    addedContacts.length > 0 &&
    addedContacts
      .filter(contact => {
        return (
          contact.name.toLowerCase().startsWith(inputText.toLowerCase()) &&
          !contact.isFavorite
        );
      })
      .map((contact, id) => {
        return (
          <TouchableOpacity
            key={id}
            onPress={() => navigateToExpandedContact(contact)}>
            <View style={styles.contactRowContainer}>
              <View
                style={[
                  styles.contactImageContainer,
                  {
                    backgroundColor: theme
                      ? COLORS.darkModeBackgroundOffset
                      : COLORS.lightModeBackgroundOffset,
                    position: 'relative',
                  },
                ]}>
                <Image style={styles.contactImage} source={ICONS.userIcon} />
              </View>
              <View style={{flex: 1}}>
                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                    alignItems: 'center',
                  }}>
                  <Text
                    style={[
                      styles.contactText,
                      {
                        color: textColor,
                        marginRight:
                          contact.unlookedTransactions.length != 0 ? 5 : 'auto',
                      },
                    ]}>
                    {contact.name}
                  </Text>
                  {contact.unlookedTransactions.length != 0 && (
                    <View
                      style={[
                        styles.hasNotification,
                        {marginRight: 'auto'},
                      ]}></View>
                  )}
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text
                      style={[
                        styles.contactText,
                        {color: textColor, marginRight: 5},
                      ]}>
                      {contact.unlookedTransactions.length != 0
                        ? createFormattedDate(
                            contact.unlookedTransactions[
                              contact.unlookedTransactions.length - 1
                            ].uuid,
                          )
                        : contact.transactions.length != 0
                        ? createFormattedDate(
                            contact.transactions[
                              contact.transactions.length - 1
                            ].uuid,
                          )
                        : 'N/A'}
                    </Text>
                    <Image
                      style={{
                        width: 15,
                        height: 15,
                        transform: [{rotate: '180deg'}],
                      }}
                      source={ICONS.leftCheveronIcon}
                    />
                  </View>
                </View>
                <Text
                  style={[
                    styles.contactText,
                    {fontSize: SIZES.small, color: textColor},
                  ]}>
                  {contact.unlookedTransactions.length != 0
                    ? formatMessage(
                        contact.unlookedTransactions[
                          contact.unlookedTransactions.length - 1
                        ]?.data?.description,
                      ) || 'No description'
                    : contact.transactions.length != 0
                    ? formatMessage(
                        contact.transactions[contact.transactions.length - 1]
                          .data.description,
                      ) || 'No description'
                    : 'N/A'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.globalContainer]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={[
            styles.globalContainer,
            {
              backgroundColor: theme
                ? COLORS.darkModeBackground
                : COLORS.lightModeBackground,
              paddingTop: insets.top,
            },
          ]}>
          <View style={styles.topBar}>
            <Text
              style={[
                styles.headerText,
                {
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  // transform: [{translateX: -3.5}],
                },
              ]}>
              Contacts
            </Text>
            <TouchableOpacity
              onPress={() => {
                navigation.openDrawer();
              }}>
              <Image style={styles.backButton} source={ICONS.drawerList} />
            </TouchableOpacity>
          </View>
          {contactElements ? (
            <ScrollView
              stickyHeaderIndices={[pinnedContacts ? 1 : 0]}
              style={{flex: 1, overflow: 'hidden'}}>
              {pinnedContacts && (
                <View
                  style={{
                    width: '90%',
                    ...CENTER,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginBottom: 10,
                  }}>
                  {pinnedContacts}
                </View>
              )}
              <View style={styles.inputContainer}>
                {/* <TouchableOpacity style={styles.searchInputIcon}>
                    <Image
                      style={{width: '100%', height: '100%'}}
                      source={
                        theme ? ICONS.scanQrCodeLight : ICONS.scanQrCodeDark
                      }
                    />
                  </TouchableOpacity> */}

                <TextInput
                  placeholder="Search"
                  placeholderTextColor={
                    theme ? COLORS.darkModeText : COLORS.lightModeText
                  }
                  value={inputText}
                  onChangeText={setInputText}
                  style={[
                    styles.searchInput,
                    {
                      backgroundColor: theme
                        ? COLORS.darkModeBackgroundOffset
                        : COLORS.lightModeBackgroundOffset,
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    },
                  ]}
                />
              </View>

              <View style={{marginVertical: 20}}>{contactElements}</View>
            </ScrollView>
          ) : (
            <View style={styles.noContactsContainer}>
              <View>
                <Text
                  style={[
                    styles.noContactsText,
                    {
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    },
                  ]}>
                  You have no contacts
                </Text>
              </View>
            </View>
          )}
          <View style={{width: '100%', alignItems: 'center', marginBottom: 10}}>
            <TouchableOpacity
              onPress={() => navigate.navigate('MyContactProfilePage')}
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
                color: textColor,
              }}>
              My Profile
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

  function navigateToExpandedContact(contact) {
    const storedTransactions = [...contact.transactions] || [];
    const unlookedStoredTransactions = [...contact.unlookedTransactions] || [];

    const transactions = combineTxArrays(
      storedTransactions,
      unlookedStoredTransactions,
    );

    if (unlookedStoredTransactions.length !== 0) {
      // toggleNostrContacts(
      //   {
      //     transactions: transactions,
      //     unlookedTransactions: [],
      //   },
      //   null,
      //   contact,
      // );
      const newAddedContacts = [...masterInfoObject.contacts.addedContacts].map(
        masterContact => {
          if (contact.uuid === masterContact.uuid) {
            return {
              ...masterContact,
              transactions: transactions,
              unlookedTransactions: [],
            };
          } else return masterContact;
        },
      );

      toggleMasterInfoObject({
        contacts: {
          myProfile: {...masterInfoObject.contacts.myProfile},
          addedContacts: newAddedContacts,
        },
      });
    }

    navigate.navigate('ExpandedContactsPage', {
      uuid: contact.uuid,
    });
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
  return arr1.concat(arr2).sort((a, b) => a.uuid - b.uuid);
}

function formatMessage(message) {
  return isJSON(message).description || message;
}

function isJSON(str) {
  try {
    return JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },

  topBar: {
    width: '95%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingHorizontal: 5,
    paddingVertical: 15,
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

  headerText: {fontFamily: FONT.Title_Bold, fontSize: SIZES.large},

  inputContainer: {
    width: '90%',
    ...CENTER,
    marginTop: 5,
  },

  searchInputIcon: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 30,
    height: 30,
    zIndex: 1,
  },

  searchInput: {
    width: '100%',
    padding: 10,
    paddingVertical: 15,
    // paddingRight: 55,
    borderRadius: 8,

    ...CENTER,
  },

  noContactsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noContactsText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.large,
  },

  pinnedContact: {
    width: 110,
    height: 'auto',
    margin: 5,
    alignItems: 'center',
  },

  pinnedContactImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  pinnedContactImage: {
    width: 70,
    height: 70,
  },
  contactRowContainer: {
    width: '90%',
    // overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    ...CENTER,
    marginVertical: 5,
  },

  contactImageContainer: {
    width: 35,
    height: 35,
    backgroundColor: COLORS.opaicityGray,
    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 8,
    marginRight: 10,
  },
  contactImage: {
    width: 25,
    height: 30,
  },
  contactText: {
    // width: '100%',
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
  },

  myProfileContainer: {},
});
