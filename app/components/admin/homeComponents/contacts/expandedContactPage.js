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
import handleBackPress from '../../../../hooks/handleBackPress';
import CustomButton from '../../../../functions/CustomElements/button';
import {useGlobalContacts} from '../../../../../context-store/globalContacts';

export default function ExpandedContactsPage(props) {
  const navigate = useNavigation();
  const {theme, contactsPrivateKey, nodeInformation} =
    useGlobalContextProvider();
  const {
    decodedAddedContacts,
    globalContactsInformation,
    toggleGlobalContactsInformation,
  } = useGlobalContacts();

  const isInitialRender = useRef(true);
  const selectedUUID = props?.route?.params?.uuid || props.uuid;

  const publicKey = getPublicKey(contactsPrivateKey);

  const [selectedContact] = useMemo(
    () => decodedAddedContacts.filter(contact => contact.uuid === selectedUUID),
    [decodedAddedContacts],
  );

  const contactTransactions = selectedContact.transactions;

  const [isLoading, setIsLoading] = useState(true);

  function handleBackPressFunction() {
    if (navigate.canGoBack()) navigate.goBack();
    else navigate.replace('HomeAdmin');
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

    let newAddedContacts = [...decodedAddedContacts];
    const indexOfContact = decodedAddedContacts.findIndex(
      obj => obj.uuid === selectedContact.uuid,
    );

    let newContact = newAddedContacts[indexOfContact];
    newContact['unlookedTransactions'] = 0;

    setIsLoading(false);

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

    setIsLoading(false);
  }, [contactTransactions]);

  const themeBackgroundOffset = theme
    ? COLORS.darkModeBackgroundOffset
    : COLORS.lightModeBackgroundOffset;

  if (!selectedContact) return;
  return (
    <GlobalThemeView useStandardWidth={true} styles={{paddingBottom: 0}}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={{marginRight: 'auto'}}
          onPress={() => {
            if (navigate.canGoBack()) navigate.goBack();
            else navigate.replace('HomeAdmin');
          }}>
          <Image style={[backArrow]} source={ICONS.smallArrowLeft} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            (async () => {
              if (!nodeInformation.didConnectToNode) {
                navigate.navigate('ErrorScreen', {
                  errorMessage:
                    'Please reconnect to the internet to use this feature',
                });
                return;
              }
              toggleGlobalContactsInformation(
                {
                  myProfile: {...globalContactsInformation.myProfile},
                  addedContacts: encriptMessage(
                    contactsPrivateKey,
                    publicKey,
                    JSON.stringify(
                      [
                        ...JSON.parse(
                          decryptMessage(
                            contactsPrivateKey,
                            publicKey,
                            globalContactsInformation.addedContacts,
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
                true,
              );
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
          onPress={() => {
            if (!nodeInformation.didConnectToNode) {
              navigate.navigate('ErrorScreen', {
                errorMessage:
                  'Please reconnect to the internet to use this feature',
              });
              return;
            }
            navigate.navigate('EditMyProfilePage', {
              pageType: 'addedContact',
              selectedAddedContact: selectedContact,
            });
          }}>
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
            backgroundColor: COLORS.darkModeText,
          },
        ]}>
        <Image
          source={
            selectedContact.profileImage
              ? {uri: selectedContact.profileImage}
              : ICONS.userIcon
          }
          style={
            selectedContact.profileImage
              ? {width: '100%', height: undefined, aspectRatio: 1}
              : {width: '80%', height: '80%'}
          }
        />
      </View>
      <ThemeText
        styles={{...styles.profileName}}
        content={selectedContact.name || selectedContact.uniqueName}
      />

      <View style={styles.buttonGlobalContainer}>
        <CustomButton
          buttonStyles={{
            marginRight: 10,
          }}
          textStyles={{textTransform: 'uppercase'}}
          actionFunction={() =>
            navigate.navigate('SendAndRequestPage', {
              selectedContact: selectedContact,
              paymentType: 'send',
            })
          }
          textContent={'Send'}
        />
        <CustomButton
          textStyles={{textTransform: 'uppercase'}}
          actionFunction={() =>
            navigate.navigate('SendAndRequestPage', {
              selectedContact: selectedContact,
              paymentType: 'request',
            })
          }
          textContent={'Request'}
        />
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
              width: '100%',
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
          <ThemeText content={'No Transactions'} />
        </View>
      )}
    </GlobalThemeView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
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
