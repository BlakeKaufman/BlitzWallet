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
import {CENTER, COLORS, FONT, ICONS, SHADOWS, SIZES} from '../../constants';

import {useGlobalContextProvider} from '../../../context-store/context';
import {useEffect, useRef, useState} from 'react';
import {ConfigurePushNotifications} from '../../hooks/setNotifications';

export default function ContactsPage({navigation}) {
  const {theme, nostrContacts, toggleNostrContacts} =
    useGlobalContextProvider();
  const navigate = useNavigation();
  const [inputText, setInputText] = useState('');

  const textColor = theme ? COLORS.darkModeText : COLORS.lightModeText;

  const pinnedContacts =
    nostrContacts.length > 0 &&
    nostrContacts
      .filter(contact => contact.isFavorite)
      .map((contact, id) => {
        return (
          <TouchableOpacity
            key={id}
            onPress={() => {
              const storedTransactions = contact.transactions || [];
              const unlookedStoredTransactions =
                contact.unlookedTransactions || [];
              const transactions = [
                ...new Set([
                  ...storedTransactions,
                  ...unlookedStoredTransactions,
                ]),
              ];
              toggleNostrContacts(
                {
                  transactions: transactions,
                  unlookedTransactions: [],
                },
                null,
                contact,
              );

              navigate.navigate('ExpandedContactsPage', {
                npub: contact.npub,
              });
            }}>
            <View style={styles.pinnedContact}>
              <View
                style={[
                  styles.pinnedContactImageContainer,
                  {
                    backgroundColor: theme
                      ? COLORS.darkModeBackgroundOffset
                      : COLORS.lightModeBackgroundOffset,
                  },
                ]}>
                <Image
                  style={styles.pinnedContactImage}
                  source={ICONS.userIcon}
                />
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
    nostrContacts.length > 0 &&
    nostrContacts
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
            onPress={() => {
              const storedTransactions = contact.transactions || [];
              const unlookedStoredTransactions =
                contact.unlookedTransactions || [];
              const transactions = [
                ...new Set([
                  ...storedTransactions,
                  ...unlookedStoredTransactions,
                ]),
              ];
              toggleNostrContacts(
                {
                  transactions: transactions,
                  unlookedTransactions: [],
                },
                null,
                contact,
              );

              navigate.navigate('ExpandedContactsPage', {
                npub: contact.npub,
              });
              // opens send page with perameter that has contact.id
              // sendNostrMessage(
              //   nostrSocket,
              //   'do you work now',
              //   userKeys.privKey,
              //   userKeys.pubkey,
              //   'npub1z3v5cjmht48m4494amjq5l48zgwep89xpmxuavdrmjk0uac3c5ps4xpeun',
              // );
            }}>
            <View style={styles.contactRowContainer}>
              <View
                style={[
                  styles.contactImageContainer,
                  {
                    backgroundColor: theme
                      ? COLORS.darkModeBackgroundOffset
                      : COLORS.lightModeBackgroundOffset,
                  },
                ]}>
                <Image style={styles.contactImage} source={ICONS.userIcon} />
              </View>
              <View style={{flex: 1}}>
                <Text style={[styles.contactText, {color: textColor}]}>
                  {contact.name}
                </Text>
                <Text
                  style={[
                    styles.contactText,
                    {fontSize: SIZES.small, color: textColor},
                  ]}>
                  {contact.npub}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.globalContainer}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={[
            styles.globalContainer,
            {
              backgroundColor: theme
                ? COLORS.darkModeBackground
                : COLORS.lightModeBackground,
            },
          ]}>
          <SafeAreaView style={styles.globalContainer}>
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
                style={{flex: 1}}>
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
                        color: theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
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
                        color: theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                      },
                    ]}>
                    You have no contacts
                  </Text>
                </View>
              </View>
            )}

            <View
              style={{width: '100%', alignItems: 'center', marginBottom: 10}}>
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
          </SafeAreaView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
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
    marginBottom: 15,
    paddingHorizontal: 5,
    paddingVertical: 15,
    // backgroundColor: 'black',
    ...CENTER,
  },
  backButton: {
    width: 20,
    height: 20,
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
    overflow: 'hidden',
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
    width: '100%',
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
  },

  myProfileContainer: {},
});
