import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {COLORS, FONT, SIZES} from '../../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {getPublicKey} from 'nostr-tools';
import {encriptMessage} from '../../../../../functions/messaging/encodingAndDecodingMessages';
import handleBackPress from '../../../../../hooks/handleBackPress';
import {useCallback, useEffect} from 'react';
import {useGlobalContacts} from '../../../../../../context-store/globalContacts';
import GetThemeColors from '../../../../../hooks/themeColors';
import {deleteCachedMessages} from '../../../../../functions/messaging/cachedMessages';

export default function ContactsPageLongPressActions({
  route: {
    params: {contact},
  },
}) {
  const navigate = useNavigation();
  const {theme, contactsPrivateKey, darkModeType} = useGlobalContextProvider();
  const {textColor, backgroundColor} = GetThemeColors();
  const {
    decodedAddedContacts,
    globalContactsInformation,
    toggleGlobalContactsInformation,
  } = useGlobalContacts();
  const publicKey = getPublicKey(contactsPrivateKey);

  const handleBackPressFunction = useCallback(() => {
    navigate.goBack();
    return true;
  }, [navigate]);

  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, [handleBackPressFunction]);

  return (
    <TouchableWithoutFeedback onPress={() => navigate.goBack()}>
      <View style={styles.globalContainer}>
        <TouchableWithoutFeedback>
          <View
            style={[
              styles.content,
              {
                backgroundColor: backgroundColor,
              },
            ]}>
            <TouchableOpacity
              onPress={() => {
                toggleContactPin(contact);
                navigate.goBack();
              }}>
              <Text style={[styles.cancelButton, {color: textColor}]}>
                {contact.isFavorite ? 'Unpin' : 'Pin'}
              </Text>
            </TouchableOpacity>
            <View
              style={{
                ...styles.border,
                backgroundColor:
                  theme && darkModeType ? COLORS.darkModeText : COLORS.primary,
              }}></View>
            <TouchableOpacity
              onPress={() => {
                deleteContact(contact);
                navigate.goBack();
              }}>
              <Text style={[styles.cancelButton, {color: textColor}]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );

  async function deleteContact(contact) {
    const newAddedContacts = decodedAddedContacts
      .map(savedContacts => {
        if (savedContacts.uuid === contact.uuid) {
          return null;
        } else return savedContacts;
      })
      .filter(contact => contact);

    await deleteCachedMessages(contact.uuid);
    toggleGlobalContactsInformation(
      {
        addedContacts: encriptMessage(
          contactsPrivateKey,
          publicKey,
          JSON.stringify(newAddedContacts),
        ),
        myProfile: {...globalContactsInformation.myProfile},
        // unaddedContacts:
        //   typeof globalContactsInformation.unaddedContacts === 'string'
        //     ? globalContactsInformation.unaddedContacts
        //     : [],
      },
      true,
    );
  }

  function toggleContactPin(contact) {
    const newAddedContacts = decodedAddedContacts.map(savedContacts => {
      if (savedContacts.uuid === contact.uuid) {
        return {...savedContacts, isFavorite: !savedContacts.isFavorite};
      } else return savedContacts;
    });

    toggleGlobalContactsInformation(
      {
        addedContacts: encriptMessage(
          contactsPrivateKey,
          publicKey,
          JSON.stringify(newAddedContacts),
        ),
        myProfile: {...globalContactsInformation.myProfile},
        // unaddedContacts:
        //   typeof globalContactsInformation.unaddedContacts === 'string'
        //     ? globalContactsInformation.unaddedContacts
        //     : [],
      },
      true,
    );
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
    backgroundColor: COLORS.opaicityGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '95%',
    maxWidth: 300,
    backgroundColor: COLORS.lightModeBackground,

    // paddingVertical: 10,
    borderRadius: 8,
  },
  headerText: {
    width: '100%',
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
    paddingVertical: 15,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  border: {
    height: 1,
    width: '100%',
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
    color: COLORS.primary,
    textAlign: 'center',
    paddingVertical: 10,
  },
});
