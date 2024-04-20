import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {COLORS, FONT, SIZES} from '../../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../../context-store/context';

export default function ContactsPageLongPressActions({
  route: {
    params: {contact},
  },
}) {
  const navigate = useNavigation();
  const {theme, masterInfoObject, toggleMasterInfoObject} =
    useGlobalContextProvider();

  return (
    <TouchableWithoutFeedback onPress={() => navigate.goBack()}>
      <View style={styles.globalContainer}>
        <TouchableWithoutFeedback>
          <View
            style={[
              styles.content,
              {
                backgroundColor: theme
                  ? COLORS.darkModeBackground
                  : COLORS.lightModeBackground,
              },
            ]}>
            <TouchableOpacity
              onPress={() => {
                toggleContactPin(contact);
                navigate.goBack();
              }}>
              <Text
                style={[
                  styles.cancelButton,
                  {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                ]}>
                {contact.isFavorite ? 'Unpin' : 'Pin'}
              </Text>
            </TouchableOpacity>
            <View style={styles.border}></View>
            <TouchableOpacity
              onPress={() => {
                deleteContact(contact);
                navigate.goBack();
              }}>
              <Text
                style={[
                  styles.cancelButton,
                  {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                ]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );

  function deleteContact(contact) {
    const newAddedContacts = [...masterInfoObject.contacts.addedContacts]
      .map(savedContacts => {
        if (savedContacts.uuid === contact.uuid) {
          return null;
        } else return savedContacts;
      })
      .filter(contact => contact);

    toggleMasterInfoObject({
      contacts: {
        addedContacts: newAddedContacts,
        myProfile: {...masterInfoObject.contacts.myProfile},
        unaddedContacts: [...masterInfoObject.contacts.unaddedContacts],
      },
    });
  }

  function toggleContactPin(contact) {
    const newAddedContacts = [...masterInfoObject.contacts.addedContacts].map(
      savedContacts => {
        if (savedContacts.uuid === contact.uuid) {
          return {...savedContacts, isFavorite: !savedContacts.isFavorite};
        } else return savedContacts;
      },
    );

    toggleMasterInfoObject({
      contacts: {
        addedContacts: newAddedContacts,
        myProfile: {...masterInfoObject.contacts.myProfile},
        unaddedContacts: [...masterInfoObject.contacts.unaddedContacts],
      },
    });
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
