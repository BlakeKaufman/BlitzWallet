import {useNavigation} from '@react-navigation/native';
import {
  View,
  SafeAreaView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useState} from 'react';
import {getLocalStorageItem, setLocalStorageItem} from '../../../../functions';
import {removeLocalStorageItem} from '../../../../functions/localStorage';

export default function AddContactPage(props) {
  const navigate = useNavigation();
  const {theme} = useGlobalContextProvider();
  const [newContactInfo, setNewContactInfo] = useState({
    fName: null,
    lName: null,
    company: null,
    npub: null,
    lnurl: null,
    isFavorite: false,
  });
  const setUpdateContactsList = props.route.params.setUpdateContactsList;
  const didFillOutContact = Object.keys(newContactInfo).filter(key => {
    return newContactInfo[key];
  });

  function handleFormInput(text, inputType) {
    setNewContactInfo(prev => {
      return {...prev, [inputType]: text};
    });
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[
        styles.globalContainer,
        {
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
        },
      ]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.globalContainer]}>
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => {
                navigate.goBack();
              }}>
              <Text style={[styles.topBarText, {color: COLORS.primary}]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text
              style={[
                styles.topBarText,
                {
                  fontWeight: 'bold',
                  transform: [{translateX: -5}],
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                },
              ]}>
              New Contact
            </Text>
            <TouchableOpacity
              onPress={() => {
                //    Add contact function
                if (didFillOutContact.length === 0) return;
                addContact();
              }}>
              <Text
                style={[
                  styles.topBarText,
                  {
                    opacity: didFillOutContact.length === 0 ? 0.4 : 1,
                    color:
                      didFillOutContact.length === 0
                        ? theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText
                        : COLORS.primary,
                  },
                ]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            <View style={styles.photoContainer}>
              <View
                style={[
                  styles.photoIconContainer,
                  {
                    backgroundColor: theme
                      ? COLORS.darkModeBackgroundOffset
                      : COLORS.lightModeBackgroundOffset,
                  },
                ]}>
                <Image style={styles.photoTempIcon} source={ICONS.logoIcon} />
              </View>

              <TouchableOpacity
                onPress={() => {
                  Alert.alert('Coming Soon....');
                }}
                style={[
                  styles.addPhotoTextContainer,
                  {
                    backgroundColor: theme
                      ? COLORS.darkModeBackgroundOffset
                      : COLORS.lightModeBackgroundOffset,
                  },
                ]}>
                <Text
                  style={[
                    styles.addPhotoText,
                    {
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    },
                  ]}>
                  Add Photo
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.inputContainer,
                {
                  borderColor: theme
                    ? COLORS.darkModeBackground
                    : COLORS.lightModeBackground,
                  backgroundColor: theme
                    ? COLORS.darkModeBackgroundOffset
                    : COLORS.lightModeBackgroundOffset,
                },
              ]}>
              <TextInput
                onChangeText={text => {
                  handleFormInput(text, 'fName');
                }}
                placeholder="First name"
                placeholderTextColor={
                  theme ? COLORS.darkModeText : COLORS.lightModeText
                }
                style={[
                  styles.textInput,
                  {
                    borderBottomColor: theme
                      ? COLORS.darkModeBackground
                      : COLORS.lightModeBackground,
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  },
                ]}
              />
              <TextInput
                onChangeText={text => {
                  handleFormInput(text, 'lName');
                }}
                placeholder="Last name"
                placeholderTextColor={
                  theme ? COLORS.darkModeText : COLORS.lightModeText
                }
                style={[
                  styles.textInput,
                  {
                    borderBottomColor: theme
                      ? COLORS.darkModeBackground
                      : COLORS.lightModeBackground,
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  },
                ]}
              />
              <TextInput
                onChangeText={text => {
                  handleFormInput(text, 'company');
                }}
                placeholder="Company name"
                placeholderTextColor={
                  theme ? COLORS.darkModeText : COLORS.lightModeText
                }
                style={[
                  styles.textInput,
                  {
                    borderBottomColor: theme
                      ? COLORS.darkModeBackground
                      : COLORS.lightModeBackground,
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  },
                ]}
              />
              <TextInput
                onChangeText={text => {
                  handleFormInput(text, 'npub');
                }}
                placeholder="npub"
                placeholderTextColor={
                  theme ? COLORS.darkModeText : COLORS.lightModeText
                }
                style={[
                  styles.textInput,
                  {
                    borderBottomColor: theme
                      ? COLORS.darkModeBackground
                      : COLORS.lightModeBackground,
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  },
                ]}
              />
              <TextInput
                onChangeText={text => {
                  handleFormInput(text, 'lnurl');
                }}
                placeholder="LNURL"
                placeholderTextColor={
                  theme ? COLORS.darkModeText : COLORS.lightModeText
                }
                style={[
                  styles.textInput,
                  {
                    borderBottomWidth: 0,
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  },
                ]}
              />
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

  async function addContact() {
    const savedContacts = JSON.parse(await getLocalStorageItem('contacts'));

    let newContactsList = savedContacts || [];

    newContactsList.push(newContactInfo);

    setLocalStorageItem('contacts', JSON.stringify(newContactsList));

    Alert.alert('Contact Saved', '', () => {
      setUpdateContactsList(prev => {
        return (prev = prev + 1);
      });
      navigate.goBack();
    });
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },
  topBar: {
    width: '95%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 5,
    ...CENTER,
  },
  topBarText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
  },

  photoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  photoIconContainer: {
    width: 175,
    height: 175,

    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 125,
    ...CENTER,
    marginBottom: 20,
  },
  photoTempIcon: {
    width: '60%',
    height: '60%',
  },

  addPhotoTextContainer: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 15,
  },
  addPhotoText: {
    fontFamily: FONT.Descriptoin_Bold,
    fontSize: SIZES.medium,
  },

  inputContainer: {
    width: '100%',
    flex: 1,
    borderBottomWidth: 1,
    borderTopWidth: 1,
  },

  textInput: {
    width: '95%',
    padding: 10,
    borderBottomWidth: 1,
    ...CENTER,
  },
});
