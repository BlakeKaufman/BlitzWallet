import {
  FlatList,
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import {ThemeText} from '../../../../functions/CustomElements';
import {CENTER} from '../../../../constants/styles';
import GetThemeColors from '../../../../hooks/themeColors';
import {EMAIL_REGEX, FONT, ICONS, SIZES} from '../../../../constants';
import {useGlobalContacts} from '../../../../../context-store/globalContacts';
import useDebounce from '../../../../hooks/useDebounce';
import {useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {searchUsers} from '../../../../../db';
import ThemeImage from '../../../../functions/CustomElements/themeImage';
import CustomButton from '../../../../functions/CustomElements/button';
import {atob} from 'react-native-quick-base64';
import useUnmountKeyboard from '../../../../hooks/useUnmountKeyboard';
import CustomSearchInput from '../../../../functions/CustomElements/searchInput';
import customUUID from '../../../../functions/customUUID';
import {useKeysContext} from '../../../../../context-store/keys';

export default function AddContactsHalfModal(props) {
  useUnmountKeyboard();
  const {backgroundOffset} = GetThemeColors();
  const {contactsPrivateKey} = useKeysContext();
  const {globalContactsInformation} = useGlobalContacts();
  const [searchInput, setSearchInput] = useState('');
  const [users, setUsers] = useState([]);
  const sliderHight = props.slideHeight;
  const navigate = useNavigation();
  const keyboardRef = useRef(null);

  const debouncedSearch = useDebounce(async term => {
    const results = await searchUsers(term);
    const newUsers = results.map((savedContact, id) => {
      if (!savedContact) {
        return false;
      }
      if (
        savedContact.uniqueName ===
        globalContactsInformation.myProfile.uniqueName
      )
        return false;
      if (!savedContact.receiveAddress) return false;
      return (
        <ContactListItem
          key={savedContact.uniqueName}
          navigation={navigate}
          id={id}
          savedContact={savedContact}
          contactsPrivateKey={contactsPrivateKey}
        />
      );
    });
    setUsers(newUsers);
  }, 500);

  const handleSearch = term => {
    setSearchInput(term);
    if (term.includes('@')) return;
    debouncedSearch(term);
  };

  const parseContact = data => {
    try {
      const decoded = atob(data);
      const parsedData = JSON.parse(decoded);
      if (!parsedData?.receiveAddress) {
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Not able to find contact',
        });
        return;
      }

      const newContact = {
        name: parsedData.name || '',
        bio: parsedData.bio || '',
        uniqueName: parsedData.uniqueName,
        isFavorite: false,
        transactions: [],
        unlookedTransactions: 0,
        uuid: parsedData.uuid,
        receiveAddress: parsedData.receiveAddress,
        isAdded: true,
        profileImage: '',
      };

      navigate.reset({
        index: 0,
        routes: [
          {
            name: 'HomeAdmin',
            params: {screen: 'ContactsPageInit'},
          },
          {
            name: 'ExpandedAddContactsPage',
            params: {
              newContact: newContact,
            },
          },
        ],
      });
    } catch (err) {
      console.log('parse contact half modal error', err);
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Not able to find contact',
      });
    }
  };

  const clearHalfModalForLNURL = () => {
    if (!EMAIL_REGEX.test(searchInput)) return;

    navigate.reset({
      index: 0, // The top-level route index
      routes: [
        {
          name: 'HomeAdmin', // Navigate to HomeAdmin
          params: {screen: 'ContactsPageInit'},
        },
        {
          name: 'ExpandedAddContactsPage', // Navigate to ExpandedAddContactsPage
          params: {
            newContact: {
              name: searchInput.split('@')[0],
              bio: '',
              uniqueName: null,
              isFavorite: false,
              transactions: [],
              unlookedTransactions: 0,
              receiveAddress: searchInput,
              isAdded: true,
              isLNURL: true,
              profileImage: '',
              uuid: customUUID(),
            },
          },
        },
      ],
      // Array of routes to set in the stack
    });
  };

  return (
    <TouchableWithoutFeedback>
      <View
        style={{
          height: useWindowDimensions().height * 0.35,
          width: '100%',
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          paddingBottom: 0,
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
        <View
          style={[
            styles.topBar,
            {
              backgroundColor: backgroundOffset,
            },
          ]}
        />
        <View style={{flex: 1, width: '90%', ...CENTER}}>
          <ThemeText
            styles={{
              fontSize: SIZES.large,
              textAlign: 'left',
              width: '100%',
              marginBottom: 10,
            }}
            content={'Add contact'}
          />
          <CustomSearchInput
            placeholderText={'Search username or LNURL'}
            setInputText={handleSearch}
            inputText={searchInput}
            textInputRef={keyboardRef}
            blurOnSubmit={false}
            containerStyles={{justifyContent: 'center'}}
            onSubmitEditingFunction={() => {
              clearHalfModalForLNURL();
            }}
            buttonComponent={
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  navigate.navigate('CameraModal', {
                    updateBitcoinAdressFunc: parseContact,
                    fromPage: 'addContact',
                  });
                }}
                style={{
                  position: 'absolute',
                  right: 10,
                  zIndex: 1,
                }}>
                <ThemeImage
                  darkModeIcon={ICONS.scanQrCodeBlue}
                  lightModeIcon={ICONS.scanQrCodeBlue}
                  lightsOutIcon={ICONS.scanQrCodeDark}
                />
              </TouchableOpacity>
            }
          />
          <View
            style={{
              flex: 1,
            }}>
            {searchInput.includes('@') ? (
              <ScrollView
                keyboardShouldPersistTaps="always"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  alignItems: 'center',
                  marginTop: 10,
                }}>
                <ThemeText content={'You are about to add'} />
                <ThemeText content={searchInput} />

                <CustomButton
                  buttonStyles={{
                    width: 'auto',
                    ...CENTER,
                    marginTop: 25,
                    // marginVertical: 5,
                  }}
                  // textStyles={{}}
                  actionFunction={() => {
                    clearHalfModalForLNURL();
                  }}
                  textContent={'Continue'}
                />
              </ScrollView>
            ) : (
              <FlatList
                showsVerticalScrollIndicator={false}
                data={users}
                renderItem={({item}) => item}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="none"
              />
            )}
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
function ContactListItem(props) {
  const {textColor, backgroundOffset} = GetThemeColors();
  const navigate = useNavigation();
  const newContact = {
    ...props.savedContact,
    isFavorite: false,
    transactions: [],
    unlookedTransactions: 0,
    isAdded: true,
  };

  return (
    <TouchableOpacity
      key={props.savedContact.uniqueName}
      onPress={() => {
        navigate.reset({
          index: 0, // The top-level route index
          routes: [
            {
              name: 'HomeAdmin',
              params: {screen: 'ContactsPageInit'},
            },
            {
              name: 'ExpandedAddContactsPage',
              params: {
                newContact: newContact,
              },
            },
          ],
        });
      }}>
      <View style={[styles.contactListContainer, {}]}>
        <View
          style={[
            styles.contactListLetterImage,
            {
              borderColor: textColor,
              backgroundColor: backgroundOffset,
            },
          ]}>
          <ThemeText
            styles={{includeFontPadding: false}}
            content={newContact.uniqueName[0].toUpperCase()}
          />
        </View>
        <View>
          <ThemeText
            styles={{includeFontPadding: false}}
            content={newContact.uniqueName}
          />
          <ThemeText
            styles={{includeFontPadding: false, fontSize: SIZES.small}}
            content={newContact.name || 'No name set'}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  topBar: {
    width: 120,
    height: 8,
    marginTop: 10,
    borderRadius: 8,
    marginBottom: 20,
  },

  contactListContainer: {
    width: '100%',
    paddingVertical: 10,

    flexDirection: 'row',
    alignItems: 'center',
  },

  contactListLetterImage: {
    height: 30,
    width: 30,
    borderRadius: 15,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,

    marginRight: 10,
  },

  contactListName: {fontFamily: FONT.Title_Regular, fontSize: SIZES.medium},
  inputContainer: {
    justifyContent: 'center',
  },
});
