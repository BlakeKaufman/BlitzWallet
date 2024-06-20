import {
  SafeAreaView,
  View,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
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

import {useEffect, useRef, useState} from 'react';

import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {getPublicKey} from 'nostr-tools';
import {
  decryptMessage,
  encriptMessage,
} from '../../../../functions/messaging/encodingAndDecodingMessages';
import ContactsTransactionItem from './internalComponents/contactsTransactions';
import {ANDROIDSAFEAREA} from '../../../../constants/styles';
import {ThemeText} from '../../../../functions/CustomElements';
import WebView from 'react-native-webview';
import handleWebviewClaimMessage from '../../../../functions/boltz/handle-webview-claim-message';

const webviewHTML = require('boltz-swap-web-context');
export default function ExpandedContactsPage(props) {
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    theme,
    masterInfoObject,
    toggleMasterInfoObject,
    contactsPrivateKey,
    contactsImages,
  } = useGlobalContextProvider();
  const isInitialRender = useRef(true);
  const selectedUUID = props?.route?.params?.uuid || props.uuid;
  const webViewRef = useRef(null);

  const [profileImage, setProfileImage] = useState(null);

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

  const [selectedContact] = decodedAddedContacts.filter(
    contact => contact.uuid === selectedUUID,
  );

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setProfileImage(
      contactsImages.filter((img, index) => {
        if (index != 0) {
          const [uuid, savedImg] = img.split(',');

          return uuid === selectedUUID;
        }
      }),
    );
  }, [contactsImages]);

  useEffect(() => {
    //listening for messages when you're on the contact
    console.log(isInitialRender.current, 'UPDATE USE EFFECT');

    if (isInitialRender.current || selectedContact.unlookedTransactions === 0) {
      setIsLoading(false);
      isInitialRender.current = false;
      return;
    }

    setIsLoading(true);
    // const newTxs = storeNewTxs();

    let newAddedContacts = [...decodedAddedContacts];
    const indexOfContact = decodedAddedContacts.findIndex(
      obj => obj.uuid === selectedContact.uuid,
    );

    let newContact = newAddedContacts[indexOfContact];
    newContact['unlookedTransactions'] = 0;

    setIsLoading(false);

    toggleMasterInfoObject({
      contacts: {
        myProfile: {...masterInfoObject.contacts.myProfile},
        addedContacts: encriptMessage(
          contactsPrivateKey,
          publicKey,
          JSON.stringify(newAddedContacts),
        ),
      },
    });

    setIsLoading(false);
  }, [JSON.stringify(selectedContact.transactions)]);

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
          paddingTop: insets.top === 0 ? ANDROIDSAFEAREA : insets.top,
          // paddingBottom: insets.bottom === 0 ? ANDROIDSAFEAREA : insets.bottom,
        },
      ]}>
      <WebView
        ref={webViewRef}
        containerStyle={{position: 'absolute', top: 1000, left: 1000}}
        source={webviewHTML}
        originWhitelist={['*']}
        onMessage={event =>
          handleWebviewClaimMessage(navigate, event, 'contacts')
        }
      />
      <View style={styles.topBar}>
        <TouchableOpacity
          style={{marginRight: 'auto'}}
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
        <TouchableOpacity
          onPress={() =>
            navigate.navigate('EditMyProfilePage', {
              pageType: 'addedContact',
              selectedAddedContact: selectedContact,
            })
          }>
          <ThemeText styles={{marginLeft: 10}} content={'Edit'} />
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
        {profileImage == null ? (
          <ActivityIndicator size={'large'} />
        ) : (
          <Image
            source={
              profileImage.length != 0
                ? {uri: profileImage[0].split(',')[1]}
                : ICONS.userIcon
            }
            style={
              profileImage.length != 0
                ? {width: '100%', height: undefined, aspectRatio: 1}
                : {width: '80%', height: '80%'}
            }
          />
        )}
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
            navigate.navigate('SendAndRequestPage', {
              selectedContact: selectedContact,
              paymentType: 'request',
            });
            // navigate.navigate('ErrorScreen', {
            //   errorMessage: 'This does not work yet',
            // });
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
      ) : selectedContact.transactions.length != 0 ? (
        <View style={{flex: 1, alignItems: 'center'}}>
          {/* <ScrollView
            showsVerticalScrollIndicator={false}
            style={{
              flex: 1,

              width: '80%',
              ...CENTER,
            }}>
            {transactionHistory}
          </ScrollView> */}

          <FlatList
            showsVerticalScrollIndicator={false}
            style={{
              width: '90%',
            }}
            data={selectedContact.transactions.sort((a, b) => {
              if (a?.uuid && b?.uuid) {
                return b.uuid - a.uuid;
              }
              // If time property is missing, retain the original order
              return 0;
            })}
            renderItem={({item, index}) => {
              return (
                <ContactsTransactionItem
                  key={index}
                  transaction={item}
                  id={index}
                  selectedContact={selectedContact}
                  webViewRef={webViewRef}
                />
              );
            }}
          />
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

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },
  topBar: {
    width: '95%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,

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
