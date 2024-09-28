import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Text,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator,
  Share,
  KeyboardAvoidingView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import {
  BTN,
  CENTER,
  COLORS,
  FONT,
  hasSpace,
  ICONS,
  SIZES,
} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useNavigation} from '@react-navigation/native';
import {useEffect, useState, useRef} from 'react';
import {getPublicKey} from 'nostr-tools';
import {
  decryptMessage,
  encriptMessage,
} from '../../../../functions/messaging/encodingAndDecodingMessages';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import {
  getContactsImage,
  getProfileImageFromCache,
  saveNewContactsImage,
  saveToCacheDirectory,
} from '../../../../functions/contacts/contactsFileSystem';
import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import getKeyboardHeight from '../../../../hooks/getKeyboardHeight';
import {isValidUniqueName} from '../../../../../db';
import handleBackPress from '../../../../hooks/handleBackPress';
import {WINDOWWIDTH} from '../../../../constants/theme';
import {backArrow} from '../../../../constants/styles';
import CustomButton from '../../../../functions/CustomElements/button';
import {useGlobalContacts} from '../../../../../context-store/globalContacts';
import GetThemeColors from '../../../../hooks/themeColors';
import ThemeImage from '../../../../functions/CustomElements/themeImage';

export default function MyContactProfilePage(props) {
  const navigate = useNavigation();
  const {decodedAddedContacts} = useGlobalContacts();

  const pageType = props?.pageType || props.route.params?.pageType;
  const fromSettings = props.fromSettings;

  const isEditingMyProfile = pageType.toLowerCase() === 'myprofile';
  const providedContact =
    !isEditingMyProfile && props.route.params?.selectedAddedContact;

  const selectedAddedContact = decodedAddedContacts.find(
    contact => contact.uuid === providedContact.uuid,
  );
  console.log(selectedAddedContact, 'TEST');

  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

  return (
    <TouchableWithoutFeedback
      style={{flex: 1}}
      onPress={() => {
        Keyboard.dismiss();
      }}>
      {/* <KeyboardAvoidingView style={{flex: 1}}> */}
      {fromSettings ? (
        <InnerContent
          isEditingMyProfile={isEditingMyProfile}
          selectedAddedContact={selectedAddedContact}
        />
      ) : (
        <GlobalThemeView useStandardWidth={true}>
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => {
                navigate.goBack();
              }}>
              <ThemeImage
                darkModeIcon={ICONS.smallArrowLeft}
                lightModeIcon={ICONS.smallArrowLeft}
                lightsOutIcon={ICONS.arrow_small_left_white}
              />
            </TouchableOpacity>
            <ThemeText
              styles={{fontSize: SIZES.large}}
              content={'Edit Profile'}
            />
          </View>
          <InnerContent
            isEditingMyProfile={isEditingMyProfile}
            selectedAddedContact={selectedAddedContact}
          />
        </GlobalThemeView>
      )}

      {/* </KeyboardAvoidingView> */}
    </TouchableWithoutFeedback>
  );
}

function InnerContent({isEditingMyProfile, selectedAddedContact}) {
  const {contactsPrivateKey, theme, darkModeType} = useGlobalContextProvider();
  const {textColor, backgroundOffset} = GetThemeColors();
  const {
    decodedAddedContacts,
    globalContactsInformation,
    toggleGlobalContactsInformation,
  } = useGlobalContacts();

  const isKeyboardShown = getKeyboardHeight().keyboardHeight != 0;
  const publicKey = getPublicKey(contactsPrivateKey);

  const [isEditingInput, setIsEditingInput] = useState('');

  const nameRef = useRef(null);
  const uniquenameRef = useRef(null);
  const bioRef = useRef(null);
  const myContact = globalContactsInformation.myProfile;

  const [inputs, setInputs] = useState({
    name: '',
    bio: '',
    uniquename: '',
  });

  const navigate = useNavigation();

  function changeInputText(text, type) {
    setInputs(prev => {
      return {...prev, [type]: text};
    });
  }
  useEffect(() => {
    if (isKeyboardShown) return;
    setIsEditingInput('');
  }, [isKeyboardShown]);

  useEffect(() => {
    changeInputText(
      isEditingMyProfile
        ? myContact.name || ''
        : selectedAddedContact.name || '',
      'name',
    );
    changeInputText(
      isEditingMyProfile ? myContact.bio || '' : selectedAddedContact.bio || '',
      'bio',
    );
    changeInputText(
      isEditingMyProfile
        ? myContact.uniqueName || ''
        : selectedAddedContact.uniqueName || '',
      'uniquename',
    );
  }, []);

  return (
    <View style={styles.innerContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          alignItems: 'center',
        }}>
        {!isEditingMyProfile && (
          <>
            <View
              style={[
                styles.profileImage,
                {
                  // borderColor: backgroundOffset,
                  backgroundColor: backgroundOffset,
                },
              ]}>
              <Image
                source={
                  selectedAddedContact.profileImage
                    ? {uri: selectedAddedContact.profileImage}
                    : darkModeType && theme
                    ? ICONS.userWhite
                    : ICONS.userIcon
                }
                style={
                  selectedAddedContact.profileImage
                    ? {width: '100%', height: undefined, aspectRatio: 1}
                    : {width: '50%', height: '50%'}
                }
              />
            </View>

            <TouchableOpacity
              onPress={() => {
                if (!selectedAddedContact.profileImage) {
                  addProfilePicture();
                  return;
                }
                navigate.navigate('AddOrDeleteContactImage', {
                  addPhoto: addProfilePicture,
                  deletePhoto: deleteProfilePicture,
                  hasImage: selectedAddedContact.profileImage,
                });
              }}
              style={{marginBottom: 20}}>
              <ThemeText
                styles={{...styles.scanText}}
                content={`${
                  selectedAddedContact.profileImage ? 'Change' : 'Add'
                } Photo`}
              />
            </TouchableOpacity>
          </>
        )}

        <ThemeText
          styles={{
            width: '100%',
            marginTop: isEditingMyProfile ? 50 : 0,
            marginBottom: 10,
          }}
          content={`This is how we'll refer to you and how you'll show up in the app.`}
        />

        <TouchableOpacity
          style={{width: '100%'}}
          onPress={() => {
            nameRef.current.focus();
            setIsEditingInput('name');
          }}>
          <View
            style={[
              styles.inputContainer,
              {
                borderColor:
                  isEditingInput === 'name' ? COLORS.primary : textColor,
                paddingBottom: Platform.OS === 'ios' ? 10 : 0,
              },
            ]}>
            <TextInput
              placeholder="Set Name"
              placeholderTextColor={textColor}
              ref={nameRef}
              onFocus={() => setIsEditingInput('name')}
              style={[
                {
                  fontSize: SIZES.medium,
                  paddingLeft: 15,
                  paddingRight: 10,
                  paddingTop: 10,
                  color: inputs.name.length < 30 ? textColor : COLORS.cancelRed,
                },
              ]}
              value={inputs.name || ''}
              onChangeText={text => changeInputText(text, 'name')}
            />
            <ThemeText
              styles={{
                position: 'absolute',
                top: 10,
                left: 8,
                fontSize: SIZES.small,
                color: isEditingInput === 'name' ? COLORS.primary : textColor,
              }}
              content={'Name'}
            />
            <ThemeText
              styles={{
                position: 'absolute',
                top: 10,
                right: 8,
                fontSize: SIZES.small,
              }}
              content={`${inputs.name.length} / ${30}`}
            />
          </View>
        </TouchableOpacity>
        {isEditingMyProfile && (
          <TouchableOpacity
            style={{width: '100%'}}
            onPress={() => {
              uniquenameRef.current.focus();
              setIsEditingInput('uniquename');
            }}>
            <View
              style={[
                styles.inputContainer,
                {
                  borderColor:
                    isEditingInput === 'uniquename'
                      ? COLORS.primary
                      : textColor,
                  paddingBottom: Platform.OS === 'ios' ? 10 : 0,
                },
              ]}>
              <TextInput
                placeholderTextColor={textColor}
                ref={uniquenameRef}
                onFocus={() => setIsEditingInput('uniquename')}
                style={[
                  {
                    fontSize: SIZES.medium,
                    paddingLeft: 15,
                    paddingRight: 10,
                    paddingTop: 10,
                    color:
                      inputs.uniquename.length < 30
                        ? textColor
                        : COLORS.cancelRed,
                  },
                ]}
                value={inputs.uniquename || ''}
                onChangeText={text => changeInputText(text, 'uniquename')}
              />
              <ThemeText
                styles={{
                  position: 'absolute',
                  top: 10,
                  left: 8,
                  fontSize: SIZES.small,
                  color:
                    isEditingInput === 'uniquename'
                      ? COLORS.primary
                      : textColor,
                }}
                content={'Username'}
              />
              <ThemeText
                styles={{
                  position: 'absolute',
                  top: 10,
                  right: 8,
                  fontSize: SIZES.small,
                }}
                content={`${inputs.uniquename.length} / ${30}`}
              />
              {/* <Image
                    style={styles.editIconStyle}
                    source={theme ? ICONS.editIconLight : ICONS.editIcon}
                  /> */}
            </View>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={{width: '100%'}}
          onPress={() => {
            bioRef.current.focus();
            setIsEditingInput('bio');
          }}>
          <View
            style={[
              styles.inputContainer,
              {
                borderColor:
                  isEditingInput === 'bio' ? COLORS.primary : textColor,
                paddingBottom: Platform.OS === 'ios' ? 10 : 0,
              },
            ]}>
            <TextInput
              placeholder="Set Bio"
              placeholderTextColor={textColor}
              ref={bioRef}
              onFocus={() => setIsEditingInput('bio')}
              editable
              multiline
              textAlignVertical="top"
              style={[
                {
                  maxHeight: 100,
                  fontSize: SIZES.medium,
                  paddingLeft: 15,
                  paddingRight: 10,
                  color: inputs.bio.length < 150 ? textColor : COLORS.cancelRed,
                },
              ]}
              value={inputs.bio || ''}
              onChangeText={text => changeInputText(text, 'bio')}
            />
            <ThemeText
              styles={{
                position: 'absolute',
                top: 10,
                left: 8,
                fontSize: SIZES.small,
                color: isEditingInput === 'bio' ? COLORS.primary : textColor,
              }}
              content={'Bio'}
            />
            <ThemeText
              styles={{
                position: 'absolute',
                top: 10,
                right: 8,
                fontSize: SIZES.small,
              }}
              content={`${inputs.bio.length} / ${150}`}
            />
          </View>
        </TouchableOpacity>
      </ScrollView>

      <CustomButton
        buttonStyles={{
          width: 'auto',
          marginTop: 50,
          ...CENTER,
          // marginVertical: 5,
        }}
        // textStyles={{}}
        actionFunction={saveChanges}
        textContent={'Save'}
      />
    </View>
  );
  async function saveChanges() {
    if (inputs.name.length > 30 || inputs.bio.length > 150) return;

    if (isEditingMyProfile) {
      if (
        myContact?.bio === inputs.bio &&
        myContact?.name === inputs.name &&
        myContact?.uniqueName === inputs.uniquename
      ) {
        navigate.goBack();
      } else {
        if (hasSpace.test(inputs.uniquename)) {
          navigate.navigate('ErrorScreen', {
            errorMessage: 'You cannot have any spaces in your username',
          });
          return;
        }
        if (myContact?.uniqueName != inputs.uniquename) {
          const isFreeUniqueName = await isValidUniqueName(
            'blitzWalletUsers',
            inputs.uniquename.trim(),
          );
          if (!isFreeUniqueName) {
            navigate.navigate('ErrorScreen', {
              errorMessage: 'Username already taken, try again!',
            });
            return;
          }
        }
        toggleGlobalContactsInformation(
          {
            myProfile: {
              ...globalContactsInformation.myProfile,
              name: inputs.name.trim(),
              bio: inputs.bio,
              uniqueName: inputs.uniquename.trim(),
              uniqueNameLower: inputs.uniquename.trim().toLowerCase(),
            },
            addedContacts: globalContactsInformation.addedContacts,
            // unaddedContacts:
            //   globalContactsInformation.unaddedContacts,
          },
          true,
        );
        navigate.goBack();
      }
    } else {
      if (
        selectedAddedContact?.bio === inputs.bio &&
        selectedAddedContact?.name === inputs.name
      )
        navigate.goBack();
      else {
        let newAddedContacts = [...decodedAddedContacts];
        const indexOfContact = decodedAddedContacts.findIndex(
          obj => obj.uuid === selectedAddedContact.uuid,
        );

        let contact = newAddedContacts[indexOfContact];

        contact['name'] = inputs.name.trim();
        contact['bio'] = inputs.bio.trim();

        toggleGlobalContactsInformation(
          {
            myProfile: {
              ...globalContactsInformation.myProfile,
            },
            addedContacts: encriptMessage(
              contactsPrivateKey,
              publicKey,
              JSON.stringify(newAddedContacts),
            ),
            // unaddedContacts:
            //   globalContactsInformation.unaddedContacts,
          },
          true,
        );
        navigate.goBack();
      }
    }
  }

  async function addProfilePicture() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      allowsMultipleSelection: false,
      quality: 0.2,
    });

    if (result.canceled) return;

    const imgURL = result.assets[0];
    let tempSelectedContact = JSON.parse(JSON.stringify(selectedAddedContact));
    tempSelectedContact['profileImage'] = imgURL.uri;

    const newContacts = [
      ...JSON.parse(JSON.stringify(decodedAddedContacts)),
    ].map(contact => {
      if (contact.uuid === selectedAddedContact.uuid) {
        return {...contact, profileImage: imgURL.uri};
      } else return contact;
    });

    const em = encriptMessage(
      contactsPrivateKey,
      publicKey,
      JSON.stringify(newContacts),
    );

    toggleGlobalContactsInformation(
      {
        myProfile: {
          ...globalContactsInformation.myProfile,
        },
        addedContacts: em,
      },
      true,
    );
  }
  async function deleteProfilePicture() {
    try {
      const newContacts = [
        ...JSON.parse(JSON.stringify(decodedAddedContacts)),
      ].map(contact => {
        if (contact.uuid === selectedAddedContact.uuid) {
          return {...contact, profileImage: null};
        } else return contact;
      });

      const em = encriptMessage(
        contactsPrivateKey,
        publicKey,
        JSON.stringify(newContacts),
      );

      toggleGlobalContactsInformation(
        {
          myProfile: {
            ...globalContactsInformation.myProfile,
          },
          addedContacts: em,
        },
        true,
      );
    } catch (err) {
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Unable to delete image',
      });
      console.log(err);
    }
  }
}

const styles = StyleSheet.create({
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  innerContainer: {
    flex: 1,
    width: '100%',
  },
  nameContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    ...CENTER,
  },
  nameText: {
    maxWidth: 250,
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.xxLarge,
    fontWeight: 'bold',
    marginRight: 10,
  },

  editIconStyle: {
    width: 20,
    height: 20,
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
  scanText: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.large,
    textAlign: 'center',
  },
  bioHeaderText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.xxLarge,
    marginBottom: 10,
    marginTop: 50,
  },
  bioContainer: {
    width: '80%',
  },
  bioInput: {
    width: '100%',
    height: 100,
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
    textDecorationLine: 'underline',
    borderRadius: 8,
    padding: 10,
    marginBottom: 5,
  },

  buttonContainer: {
    marginTop: 'auto',
    // marginBottom: 'auto',
    backgroundColor: COLORS.nostrGreen,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },

  inputContainer: {
    position: 'relative',
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingTop: 20,
  },
});
