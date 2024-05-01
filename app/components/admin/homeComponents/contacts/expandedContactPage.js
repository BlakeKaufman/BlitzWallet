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
import {getPublicKey} from 'nostr-tools';
import {
  decryptMessage,
  encriptMessage,
} from '../../../../functions/messaging/encodingAndDecodingMessages';

export default function ExpandedContactsPage(props) {
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    theme,
    toggleNostrContacts,
    nodeInformation,
    masterInfoObject,
    toggleMasterInfoObject,
    contactsPrivateKey,
  } = useGlobalContextProvider();
  const isInitialRender = useRef(true);
  const selectedUUID = props?.route?.params?.uuid || props.uuid;
  //   const [contactsList, setContactsList] = useState(props.route.params.contacts);
  const publicKey = getPublicKey(contactsPrivateKey);

  const decodedAddedContacts =
    typeof masterInfoObject.contacts.addedContacts === 'string'
      ? JSON.parse(
          decryptMessage(
            contactsPrivateKey,
            publicKey,
            masterInfoObject.contacts.addedContacts,
          ),
        )
      : [];

  const decodedUnaddedContacts =
    typeof masterInfoObject.contacts.unaddedContacts === 'string'
      ? JSON.parse(
          decryptMessage(
            contactsPrivateKey,
            publicKey,
            masterInfoObject.contacts.unaddedContacts,
          ),
        )
      : [];

  const [selectedContact] = [
    ...decodedAddedContacts,
    ...decodedUnaddedContacts,
  ]?.filter(contact => contact.uuid === selectedUUID);

  const [isLoading, setIsLoading] = useState(true);
  const [transactionHistory, setTransactionHistory] = useState([]);

  useEffect(() => {
    //listening for messages when you're on the contact
    if (isInitialRender.current) return;

    const newTxs = storeNewTxs(
      {...selectedContact},
      masterInfoObject,
      toggleMasterInfoObject,
      contactsPrivateKey,
      publicKey,
      decodedAddedContacts,
    );

    const formattedTx = formattedContactsTransactions(
      newTxs.sort((a, b) => a.uuid - b.uuid),
      {
        ...selectedContact,
      },
    );

    setTransactionHistory(formattedTx);
  }, [masterInfoObject.contacts.addedContacts]);

  useEffect(() => {
    //initial render use effect
    const didUpdateTxs = handleInitialRender(selectedContact);

    console.log(didUpdateTxs, 'IN USEEFFECT');

    if (didUpdateTxs) return;

    const formattedTx = formattedContactsTransactions(
      selectedContact.transactions.sort((a, b) => a.uuid - b.uuid),
      {
        ...selectedContact,
      },
    );

    setTransactionHistory(formattedTx);
    setIsLoading(false);
    isInitialRender.current = false;
  }, []);

  // useEffect(() => {
  //   let storedTransactions = [...selectedContact?.transactions] || [];
  //   const formattedTx = formattedContactsTransactions(storedTransactions, {
  //     ...selectedContact,
  //   });

  //   setTransactionHistory(formattedTx);

  //   setIsLoading(false);
  // }, []);

  // useEffect(() => {
  //   setIsLoading(true);
  //   if (isInitialRender.current) {
  //     isInitialRender.current = false;
  //     return;
  //   }
  //   if (selectedContact.unlookedTransactions.length != 0) {
  //     const newTxs = storeNewTxs(
  //       {...selectedContact},
  //       masterInfoObject,
  //       toggleMasterInfoObject,
  //       contactsPrivateKey,
  //       publicKey,
  //       decodedAddedContacts,
  //     );

  //     const formattedTx = formattedContactsTransactions(newTxs, {
  //       ...selectedContact,
  //     });

  //     setTransactionHistory(formattedTx);
  //   }

  //   setIsLoading(false);
  // }, [masterInfoObject.contacts.addedContacts]);

  // useEffect(() => {
  //   let storedTransactions = selectedContact?.transactions || [];

  //   const formattedTx = formattedContactsTransactions(storedTransactions, {
  //     ...selectedContact,
  //   });

  //   setTransactionHistory(formattedTx);

  //   setIsLoading(false);
  // }, []);

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
            console.log(
              JSON.parse(
                decryptMessage(
                  contactsPrivateKey,
                  publicKey,
                  masterInfoObject.contacts.addedContacts,
                ),
              ),
            );

            (async () => {
              toggleMasterInfoObject({
                contacts: {
                  myProfile: {...masterInfoObject.contacts.myProfile},
                  addedContacts: encriptMessage(
                    contactsPrivateKey,
                    publicKey,
                    JSON.stringify(
                      [
                        ...JSON.parse(
                          decryptMessage(
                            contactsPrivateKey,
                            publicKey,
                            masterInfoObject.contacts.addedContacts,
                          ),
                        ),
                      ].map(savedContact => {
                        if (savedContact.uuid === selectedContact.uuid) {
                          return {
                            ...savedContact,
                            isFavorite: !savedContact.isFavorite,
                          };
                        } else return savedContact;
                      }),
                    ),
                  ),

                  unaddedContacts:
                    typeof masterInfoObject.contacts.unaddedContacts ===
                    'string'
                      ? masterInfoObject.contacts.unaddedContacts
                      : [],
                },
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

      {isLoading || !selectedContact ? (
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

  function handleInitialRender(selectedContact) {
    let contact = {...selectedContact};
    let didUpdate = false;

    const storedTransactions = contact.transactions
      ? [...contact.transactions]
      : [];
    const unlookedStoredTransactions = contact.unlookedTransactions
      ? [...contact.unlookedTransactions]
      : [];

    const combinedTransactions = storedTransactions.concat(
      unlookedStoredTransactions,
    );

    if (unlookedStoredTransactions.length !== 0) {
      if (!contact.isAdded) {
        contact['isAdded'] = true;
        contact['transactions'] = combinedTransactions;
        contact['unlookedTransactions'] = [];
        const newAddedContacts = [...decodedAddedContacts].concat([contact]);

        const newUnaddedContacts = [...decodedUnaddedContacts].filter(
          masterContact => masterContact.uuid !== contact.uuid,
        );

        toggleMasterInfoObject({
          contacts: {
            myProfile: {...masterInfoObject.contacts.myProfile},
            addedContacts: encriptMessage(
              contactsPrivateKey,
              publicKey,
              JSON.stringify(newAddedContacts),
            ),
            unaddedContacts: encriptMessage(
              contactsPrivateKey,
              publicKey,
              JSON.stringify(newUnaddedContacts),
            ),
          },
        });
        didUpdate = true;
      } else {
        const newAddedContacts = decodedAddedContacts.map(masterContact => {
          if (contact.uuid === masterContact.uuid) {
            return {
              ...masterContact,
              transactions: combinedTransactions,
              unlookedTransactions: [],
            };
          } else return masterContact;
        });
        toggleMasterInfoObject({
          contacts: {
            myProfile: {...masterInfoObject.contacts.myProfile},
            addedContacts: encriptMessage(
              contactsPrivateKey,
              publicKey,
              JSON.stringify(newAddedContacts),
            ),
            unaddedContacts:
              typeof masterInfoObject.contacts.unaddedContacts === 'string'
                ? masterInfoObject.contacts.unaddedContacts
                : [],
          },
        });
        didUpdate = true;
      }
    }

    return didUpdate;
    console.log(didUpdate);
  }
}

function storeNewTxs(
  contact,
  masterInfoObject,
  toggleMasterInfoObject,
  contactsPrivateKey,
  publicKey,
  decodedAddedContacts,
) {
  const storedTransactions = contact.transactions
    ? [...contact.transactions]
    : [];
  const unlookedStoredTransactions = contact.unlookedTransactions
    ? [...contact.unlookedTransactions]
    : [];

  const transactions = combineTxArrays(
    storedTransactions,
    unlookedStoredTransactions,
  );

  if (unlookedStoredTransactions.length === 0) return storedTransactions;

  const newAddedContacts = decodedAddedContacts.map(masterContact => {
    if (contact.uuid === masterContact.uuid) {
      return {
        ...masterContact,
        transactions: transactions,
        unlookedTransactions: [],
      };
    } else return masterContact;
  });

  toggleMasterInfoObject({
    contacts: {
      myProfile: {...masterInfoObject.contacts.myProfile},
      addedContacts: encriptMessage(
        contactsPrivateKey,
        publicKey,
        JSON.stringify(newAddedContacts),
      ),
      unaddedContacts:
        typeof masterInfoObject.contacts.unaddedContacts === 'string'
          ? masterInfoObject.contacts.unaddedContacts
          : [],
    },
  });

  return transactions;
}

function combineTxArrays(arr1, arr2) {
  return arr1.concat(arr2);
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
