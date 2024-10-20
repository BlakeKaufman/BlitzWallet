import {
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import {ThemeText} from '../../../../functions/CustomElements';
import {ANDROIDSAFEAREA, CENTER} from '../../../../constants/styles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import GetThemeColors from '../../../../hooks/themeColors';
import {COLORS, EMAIL_REGEX, FONT, ICONS, SIZES} from '../../../../constants';
import {useGlobalContacts} from '../../../../../context-store/globalContacts';
import useDebounce from '../../../../hooks/useDebounce';
import {useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {searchUsers} from '../../../../../db';
import ThemeImage from '../../../../functions/CustomElements/themeImage';
import CustomButton from '../../../../functions/CustomElements/button';
import {randomUUID} from 'expo-crypto';
import {atob} from 'react-native-quick-base64';

export default function AddContactsHalfModal(props) {
  const insets = useSafeAreaInsets();
  const {
    backgroundOffset,
    backgroundColor,
    textInputBackground,
    textInputColor,
  } = GetThemeColors();
  const {contactsPrivateKey} = useGlobalContextProvider();
  const {decodedAddedContacts, globalContactsInformation} = useGlobalContacts();
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
  }, 300);

  const handleSearch = term => {
    console.log(term, 'TES');
    setSearchInput(term);
    if (term.includes('@')) return;
    debouncedSearch(term);
  };

  const parseContact = data => {
    const decoded = atob(data);
    const parsedData = JSON.parse(decoded);
    Keyboard.dismiss();
    navigate.goBack();

    if (!parsedData.receiveAddress) {
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

    navigate.navigate('ExpandedAddContactsPage', {
      newContact,
    });
  };

  const clearHalfModalForLNURL = () => {
    if (!EMAIL_REGEX.test(searchInput)) return;
    Keyboard.dismiss();
    navigate.goBack();
    navigate.navigate('ExpandedAddContactsPage', {
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
        uuid: randomUUID(),
      },
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
          paddingBottom: EMAIL_REGEX.test(searchInput)
            ? 0
            : insets.bottom < 20
            ? ANDROIDSAFEAREA
            : insets.bottom,
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
              marginBottom: 5,
            }}
            content={'Add contact'}
          />
          <View style={styles.inputContainer}>
            <TextInput
              ref={keyboardRef}
              blurOnSubmit={false}
              onSubmitEditing={() => {
                clearHalfModalForLNURL();

                console.log('TextInput still focused');
              }}
              onChangeText={handleSearch}
              value={searchInput}
              placeholder="Search username or LNURL"
              placeholderTextColor={COLORS.opaicityGray}
              style={[
                styles.textInput,
                {
                  backgroundColor: textInputBackground,
                  color: textInputColor,
                },
              ]}
            />
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
                lightsOutIcon={ICONS.scanQrCodeLight}
              />
            </TouchableOpacity>
          </View>
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
        Keyboard.dismiss();
        navigate.goBack();
        navigate.navigate('ExpandedAddContactsPage', {
          newContact: newContact,
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

  textInput: {
    width: '100%',
    padding: 10,
    paddingRight: 20,
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Regular,
    borderRadius: 8,
    includeFontPadding: false,
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
