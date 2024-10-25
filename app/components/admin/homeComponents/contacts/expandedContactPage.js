import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from 'react-native';
import {CENTER, COLORS, ICONS, SIZES} from '../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../context-store/context';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

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
import GetThemeColors from '../../../../hooks/themeColors';
import ThemeImage from '../../../../functions/CustomElements/themeImage';
import Icon from '../../../../functions/CustomElements/Icon';

export default function ExpandedContactsPage(props) {
  const navigate = useNavigation();
  const {theme, contactsPrivateKey, nodeInformation, darkModeType} =
    useGlobalContextProvider();
  const {
    textColor,
    backgroundOffset,
    backgroundColor,
    textInputColor,
    textInputBackground,
  } = GetThemeColors();
  const {
    decodedAddedContacts,
    globalContactsInformation,
    toggleGlobalContactsInformation,
  } = useGlobalContacts();

  const isInitialRender = useRef(true);
  const selectedUUID = props?.route?.params?.uuid || props?.uuid;
  const myProfile = globalContactsInformation?.myProfile;

  const publicKey = getPublicKey(contactsPrivateKey);

  const [selectedContact] = useMemo(
    () =>
      decodedAddedContacts.filter(contact => contact?.uuid === selectedUUID),
    [decodedAddedContacts, selectedUUID],
  );

  const contactTransactions = selectedContact?.transactions;

  const [isLoading, setIsLoading] = useState(false);

  const handleBackPressFunction = useCallback(() => {
    if (navigate.canGoBack()) navigate.goBack();
    else navigate.replace('HomeAdmin');
    return true;
  }, [navigate]);

  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, [handleBackPressFunction]);

  useEffect(() => {
    //listening for messages when you're on the contact
    console.log(isInitialRender.current, 'UPDATE USE EFFECT');

    if (isInitialRender.current || selectedContact.unlookedTransactions === 0) {
      isInitialRender.current = false;
      return;
    }
    try {
      // setIsLoading(true);

      const newAddedContacts = JSON.parse(
        JSON.stringify(decodedAddedContacts),
      ).map(contact => {
        if (contact.uuid === selectedContact.uuid) {
          return {...contact, unlookedTransactions: 0};
        } else return contact;
      });

      toggleGlobalContactsInformation(
        {
          myProfile: {...myProfile},
          addedContacts: encriptMessage(
            contactsPrivateKey,
            publicKey,
            JSON.stringify(newAddedContacts),
          ),
        },
        true,
      );
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }

    // setIsLoading(false);
  }, [
    contactTransactions,
    contactsPrivateKey,
    decodedAddedContacts,
    myProfile,
  ]);

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
          <ThemeImage
            darkModeIcon={ICONS.smallArrowLeft}
            lightModeIcon={ICONS.smallArrowLeft}
            lightsOutIcon={ICONS.arrow_small_left_white}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={{marginRight: 5}}
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
          <Icon
            width={25}
            height={25}
            name={'didPinContactStar'}
            color={theme && darkModeType ? COLORS.darkModeText : COLORS.primary}
            offsetColor={
              selectedContact.isFavorite
                ? theme && darkModeType
                  ? COLORS.darkModeText
                  : COLORS.primary
                : backgroundColor
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
          <ThemeImage
            darkModeIcon={ICONS.settingsIcon}
            lightModeIcon={ICONS.settingsIcon}
            lightsOutIcon={ICONS.settingsWhite}
          />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.profileImage,
          {
            // borderColor: COLORS.darkModeText,
            backgroundColor: backgroundOffset,
          },
        ]}>
        <Image
          source={
            selectedContact.profileImage
              ? {uri: selectedContact.profileImage}
              : darkModeType && theme
              ? ICONS.userWhite
              : ICONS.userIcon
          }
          style={
            selectedContact.profileImage
              ? {width: '100%', height: undefined, aspectRatio: 1}
              : {width: '50%', height: '50%'}
          }
        />
      </View>
      <ThemeText
        styles={{...styles.profileName}}
        content={selectedContact.name || selectedContact.uniqueName}
      />
      <View
        style={{
          ...styles.buttonGlobalContainer,
          marginBottom: selectedContact?.bio ? 10 : 50,
        }}>
        <CustomButton
          buttonStyles={{
            marginRight: !selectedContact.isLNURL ? 10 : 0,
          }}
          actionFunction={() =>
            navigate.navigate('SendAndRequestPage', {
              selectedContact: selectedContact,
              paymentType: 'send',
            })
          }
          textContent={'Send'}
        />
        {!selectedContact.isLNURL && (
          <CustomButton
            actionFunction={() =>
              navigate.navigate('SendAndRequestPage', {
                selectedContact: selectedContact,
                paymentType: 'request',
              })
            }
            textContent={'Request'}
          />
        )}
      </View>
      {selectedContact?.bio && (
        <View
          style={[
            styles.bioContainer,
            {marginTop: 10, backgroundColor: textInputBackground},
          ]}>
          <ScrollView
            contentContainerStyle={{
              alignItems: selectedContact.bio ? null : 'center',
              flexGrow: selectedContact.bio ? null : 1,
            }}
            showsVerticalScrollIndicator={false}>
            <ThemeText
              styles={{...styles.bioText, color: textInputColor}}
              content={selectedContact?.bio}
            />
          </ScrollView>
        </View>
      )}

      {isLoading || !selectedContact ? (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator size="large" color={textColor} />
        </View>
      ) : selectedContact.transactions.length != 0 ? (
        <View style={{flex: 1, alignItems: 'center'}}>
          <FlatList
            showsVerticalScrollIndicator={false}
            style={{
              width: '100%',
            }}
            contentContainerStyle={{paddingTop: 10}}
            data={selectedContact.transactions.slice(0, 50).sort((a, b) => {
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
    // borderWidth: 5,
    backgroundColor: 'red',
    ...CENTER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  profileName: {
    fontSize: SIZES.large,
    marginBottom: 20,
    ...CENTER,
  },
  buttonGlobalContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',

    marginBottom: 10,
  },

  bioContainer: {
    width: '90%',
    minHeight: 60,
    maxHeight: 80,
    borderRadius: 8,
    padding: 10,
    backgroundColor: COLORS.darkModeText,

    ...CENTER,
  },
  bioText: {
    marginBottom: 'auto',
    marginTop: 'auto',
  },
});
