import {
  SafeAreaView,
  View,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  CENTER,
  COLORS,
  FONT,
  ICONS,
  SATSPERBITCOIN,
  SIZES,
} from '../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {formatBalanceAmount} from '../../../../functions';
import {useEffect, useRef, useState} from 'react';
import {
  InputTypeVariant,
  parseInput,
  withdrawLnurl,
} from '@breeztech/react-native-breez-sdk';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {createNewAddedContactsList} from '../../../../functions/contacts/createNewAddedContactsList';
import formattedContactsTransactions from './internalComponents/contactsTransactions';

export default function ExpandedContactsPage(props) {
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    theme,
    toggleNostrContacts,
    nodeInformation,
    masterInfoObject,
    toggleMasterInfoObject,
  } = useGlobalContextProvider();
  const selectedUUID = props?.route?.params?.uuid || props.uuid;
  //   const [contactsList, setContactsList] = useState(props.route.params.contacts);
  const [selectedContact] = masterInfoObject.contacts.addedContacts?.filter(
    contact => contact.uuid === selectedUUID,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [transactionHistory, setTransactionHistory] = useState([]);

  useEffect(() => {
    setIsLoading(true);

    let storedTransactions = selectedContact?.transactions || [];

    if (selectedContact.unlookedTransactions.length != 0)
      storeNewTxs(selectedContact, masterInfoObject, toggleMasterInfoObject);

    const formattedTx = formattedContactsTransactions(
      storedTransactions,
      selectedContact,
    );

    setTransactionHistory(formattedTx);

    setIsLoading(false);
  }, [masterInfoObject.contacts.addedContacts]);

  const themeBackground = theme
    ? COLORS.darkModeBackground
    : COLORS.lightModeBackground;
  const themeText = theme ? COLORS.darkModeText : COLORS.lightModeText;
  const themeBackgroundOffset = theme
    ? COLORS.darkModeBackgroundOffset
    : COLORS.lightModeBackgroundOffset;

  if (!selectedContact) return;

  return (
    <View
      style={[
        styles.globalContainer,
        {
          backgroundColor: themeBackground,
          paddingTop: insets.top,
        },
      ]}>
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
              toggleMasterInfoObject({
                contacts: {
                  myProfile: {...masterInfoObject.contacts.myProfile},
                  addedContacts: [
                    ...masterInfoObject.contacts.addedContacts,
                  ].map(savedContact => {
                    if (savedContact.uuid === selectedContact.uuid) {
                      return {
                        ...savedContact,
                        isFavorite: !savedContact.isFavorite,
                      };
                    } else return savedContact;
                  }),
                },
                unaddedContacts: [...masterInfoObject.contacts.unaddedContacts],
              });
            })();
          }}>
          <Image
            style={styles.backButton}
            source={
              selectedContact.isFavorite
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
        {selectedContact.name || selectedContact.uniqueName}
      </Text>

      <View style={styles.buttonGlobalContainer}>
        <TouchableOpacity
          onPress={() => {
            navigate.navigate('SendAndRequestPage', {
              selectedContact: selectedContact,
              paymentType: 'send',
            });
          }}
          style={[styles.buttonContainer, {backgroundColor: themeText}]}>
          <Text style={[styles.buttonText, {color: themeBackground}]}>
            Send
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigate.navigate('ErrorScreen', {
              errorMessage: 'This does not work yet',
            });
          }}
          style={[styles.buttonContainer, {backgroundColor: themeText}]}>
          <Text style={[styles.buttonText, {color: themeBackground}]}>
            Request
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator
            size="large"
            color={theme ? COLORS.darkModeText : COLORS.lightModeText}
          />
        </View>
      ) : transactionHistory.length != 0 ? (
        <View style={{flex: 1}}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{
              flex: 1,

              width: '80%',
              ...CENTER,
            }}>
            {transactionHistory}
          </ScrollView>
        </View>
      ) : (
        <View style={{flex: 1, alignItems: 'center'}}>
          <Text style={[styles.buttonText, {color: themeText}]}>
            No Transactions
          </Text>
        </View>
      )}
    </View>
  );
}

function storeNewTxs(contact, masterInfoObject, toggleMasterInfoObject) {
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
        unaddedContacts: [...masterInfoObject.contacts.unaddedContacts],
      },
    });
  }
}

function combineTxArrays(arr1, arr2) {
  return arr1.concat(arr2).sort((a, b) => a.uuid - b.uuid);
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

  gradient: {
    height: 100,
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },

  transactionContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'start',
    marginVertical: 12.5,
  },
  icons: {
    width: 30,
    height: 30,
    marginRight: 15,
  },

  descriptionText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Descriptoin_Regular,
  },
  dateText: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.small,
  },
  amountText: {
    marginLeft: 'auto',
    fontFamily: FONT.Other_Regular,
    fontSize: SIZES.medium,
  },
  transactionTimeBanner: {
    width: '100%',
    alignItems: 'center',

    fontFamily: FONT.Title_Bold,
    fontSize: SIZES.medium,

    padding: 5,
    borderRadius: 2,
    overflow: 'hidden',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    width: '85%',
    alignItems: 'center',
  },
  noTransactionsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noTransactionsText: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: FONT.Descriptoin_Regular,
  },

  mostRecentTxContainer: {
    width: 'auto',
    ...CENTER,
    alignItems: 'center',
  },

  acceptOrPayBTN: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 15,
    padding: 5,
    alignItems: 'center',
  },
});
