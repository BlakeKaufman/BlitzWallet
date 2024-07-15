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

import {useEffect, useMemo, useRef, useState} from 'react';

import {getPublicKey} from 'nostr-tools';
import {
  decryptMessage,
  encriptMessage,
} from '../../../../functions/messaging/encodingAndDecodingMessages';
import ContactsTransactionItem from './internalComponents/contactsTransactions';
import {backArrow} from '../../../../constants/styles';
import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import WebView from 'react-native-webview';
import handleWebviewClaimMessage from '../../../../functions/boltz/handle-webview-claim-message';
import {WINDOWWIDTH} from '../../../../constants/theme';
import {useWebView} from '../../../../../context-store/webViewContext';
import handleBackPress from '../../../../hooks/handleBackPress';

export default function ExpandedContactsPage(props) {
  const navigate = useNavigation();

  const {
    theme,
    masterInfoObject,
    toggleMasterInfoObject,
    contactsPrivateKey,
    contactsImages,
  } = useGlobalContextProvider();

  const isInitialRender = useRef(true);
  const selectedUUID = props?.route?.params?.uuid || props.uuid;

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

  const [selectedContact] = useMemo(
    () => decodedAddedContacts.filter(contact => contact.uuid === selectedUUID),
    [decodedAddedContacts],
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

  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

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
    <GlobalThemeView>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={{marginRight: 'auto'}}
          onPress={() => {
            navigate.goBack();
          }}>
          <Image style={[backArrow]} source={ICONS.smallArrowLeft} />
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
            style={[backArrow]}
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
          <ThemeText
            styles={{marginLeft: 10, includeFontPadding: false}}
            content={'Edit'}
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
      <ThemeText
        styles={{...styles.profileName}}
        content={selectedContact.name || selectedContact.uniqueName}
      />

      <View style={styles.buttonGlobalContainer}>
        <TouchableOpacity
          onPress={() => {
            navigate.navigate('SendAndRequestPage', {
              selectedContact: selectedContact,
              paymentType: 'send',
            });
          }}
          style={[styles.buttonContainer, {backgroundColor: themeText}]}>
          <ThemeText reversed={true} content={'Send'} />
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
          <ThemeText reversed={true} content={'Request'} />
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
                />
              );
            }}
          />
        </View>
      ) : (
        <View style={{flex: 1, alignItems: 'center'}}>
          <ThemeText reversed={true} content={' No Transactions'} />
        </View>
      )}
    </GlobalThemeView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    width: WINDOWWIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    ...CENTER,
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
    fontWeight: 'bold',
    fontSize: SIZES.large,
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
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5,
  },
});
