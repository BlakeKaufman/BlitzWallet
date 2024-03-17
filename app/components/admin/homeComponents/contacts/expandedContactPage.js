import {
  SafeAreaView,
  View,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {
  getLocalStorageItem,
  retrieveData,
  updateContactProfile,
} from '../../../../functions';
import {useEffect, useRef, useState} from 'react';
import {sendNostrMessage} from '../../../../functions/noster';
import * as nostr from 'nostr-tools';

export default function ExpandedContactsPage(props) {
  const navigate = useNavigation();
  const {theme, nostrSocket, nostrEvents} = useGlobalContextProvider();
  const selectedNpub = props.route.params.npub;
  const [contactsList, setContactsList] = useState(props.route.params.contacts);
  const [selectedContact] = contactsList?.filter(
    contact => contact.npub === selectedNpub,
  );
  const updateContactsList = props.route.params.setUpdateContactsList;
  const [updateList, setUpdateList] = useState(0);

  useEffect(() => {
    console.log('REFRESH');
    (async () => {
      const contactsList = JSON.parse(await getLocalStorageItem('contacts'));
      if (contactsList) setContactsList(contactsList);
      console.log(contactsList[0].unlookedTransactions, 'IN REFRESH');
      const [selectedContact] = contactsList?.filter(
        contact => contact.npub === selectedNpub,
      );
      if (selectedContact.unlookedTransactions.length != 0) {
        updateContactProfile(
          {
            transactions: [
              ...new Set([
                ...selectedContact.transactions,
                ...selectedContact.unlookedTransactions,
              ]),
            ],
            unlookedTransactions: [],
          },
          contactsList,
          selectedContact,
        );
        setUpdateList(prev => (prev += 1));
      }
    })();
  }, [nostrEvents, updateList]);

  const [starIcon, setStarIcon] = useState(selectedContact.isFavorite);

  const themeBackground = theme
    ? COLORS.darkModeBackground
    : COLORS.lightModeBackground;
  const themeText = theme ? COLORS.darkModeText : COLORS.lightModeText;
  const themeBackgroundOffset = theme
    ? COLORS.darkModeBackgroundOffset
    : COLORS.lightModeBackgroundOffset;

  const transactionHistory =
    selectedContact.transactions.length != 0 &&
    selectedContact.transactions
      .sort((a, b) => {
        if (a.time && b.time) {
          return a.time - b.time;
        }
        // If time property is missing, retain the original order
        return 0;
      })
      .map((transaction, id) => {
        console.log(transaction);
        return (
          <View key={id}>
            <Text>{transaction.content}</Text>
          </View>
        );
      });

  return (
    <View
      style={[
        styles.globalContainer,
        {
          backgroundColor: themeBackground,
        },
      ]}>
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => {
              navigate.goBack();
            }}>
            <Image
              style={{
                width: 30,
                height: 30,
                transform: [{translateX: -7}],
              }}
              source={ICONS.smallArrowLeft}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              (async () => {
                const didSet = await updateContactProfile(
                  {isFavorite: !selectedContact.isFavorite},
                  contactsList,
                  selectedContact,
                );

                if (didSet) {
                  updateContactsList(prev => (prev += 1));
                  setStarIcon(prev => !prev);
                }
              })();
            }}>
            <Image
              style={styles.backButton}
              source={
                starIcon
                  ? ICONS.starBlue
                  : theme
                  ? ICONS.starWhite
                  : ICONS.starBlack
              }
            />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.profileImage,
            {
              borderColor: themeBackgroundOffset,
              backgroundColor: themeText,
            },
          ]}>
          <Image
            source={
              selectedContact.profileImg
                ? selectedContact.profileImg
                : ICONS.userIcon
            }
            style={{width: '80%', height: '80%'}}
          />
        </View>
        <Text style={[styles.profileName, {color: themeText}]}>
          {selectedContact.fName} {selectedContact.lName}
        </Text>

        <View style={styles.buttonGlobalContainer}>
          <TouchableOpacity
            onPress={() => {
              (async () => {
                const nostrProfile = JSON.parse(
                  await retrieveData('myNostrProfile'),
                );

                sendNostrMessage(
                  nostrSocket,
                  'WOO UPDATING',
                  nostrProfile.privKey,
                  selectedContact.npub,
                );
              })();
            }}
            style={[styles.buttonContainer, {backgroundColor: themeText}]}>
            <Text style={[styles.buttonText, {color: themeBackground}]}>
              Send
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buttonContainer, {backgroundColor: themeText}]}>
            <Text style={[styles.buttonText, {color: themeBackground}]}>
              Request
            </Text>
          </TouchableOpacity>
        </View>

        {transactionHistory ? (
          <ScrollView style={{flex: 1}}>{transactionHistory}</ScrollView>
        ) : (
          <View style={{flex: 1, alignItems: 'center'}}>
            <Text style={[styles.buttonText, {color: themeText}]}>
              No Transactions
            </Text>
          </View>
        )}
        <View style={{width: '100%', alignItems: 'center'}}>
          <TouchableOpacity
            style={{
              backgroundColor: COLORS.nostrGreen,
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
              source={ICONS.paperApirplane}
            />
          </TouchableOpacity>
          <Text
            style={{
              fontFamily: FONT.Title_Regular,
              fontSize: SIZES.small,
              color: themeText,
            }}>
            Share contact
          </Text>
        </View>
      </SafeAreaView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
    // backgroundColor: 'black',
    ...CENTER,
  },
  backButton: {
    width: 20,
    height: 20,
  },

  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 125,
    borderWidth: 5,
    backgroundColor: 'red',
    ...CENTER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  profileName: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Regular,
    fontWeight: 'bold',
    ...CENTER,
  },
  buttonGlobalContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 25,
  },

  buttonContainer: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  buttonText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
  },
});
