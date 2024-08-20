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

export default function MyContactProfilePage(props) {
  const {
    theme,
    masterInfoObject,
    toggleMasterInfoObject,
    contactsPrivateKey,
    contactsImages,
    toggleContactsImages,
  } = useGlobalContextProvider();
  const {decodedAddedContacts} = useGlobalContacts();
  const navigate = useNavigation();
  const publicKey = getPublicKey(contactsPrivateKey);
  const isKeyboardShown = getKeyboardHeight().keyboardHeight != 0;

  const isEditingMyProfile =
    props.route.params?.pageType?.toLowerCase() === 'myprofile';
  const selectedAddedContact =
    !isEditingMyProfile && props.route.params?.selectedAddedContact;

  const myContact = masterInfoObject.contacts.myProfile;

  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

  const [profileImage, setProfileImage] = useState(null);
  const [isEditingInput, setIsEditingInput] = useState('');

  const nameRef = useRef(null);
  const uniquenameRef = useRef(null);
  const bioRef = useRef(null);

  const [inputs, setInputs] = useState({
    name: '',
    bio: '',
    uniquename: '',
  });

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

  useEffect(() => {
    setProfileImage(
      contactsImages.filter((img, index) => {
        if (index != 0) {
          const [uuid, savedImg] = img.split(',');

          return isEditingMyProfile
            ? uuid === myContact.uuid
            : selectedAddedContact.uuid === uuid;
        }
      }),
    );
  }, [contactsImages]);

  function changeInputText(text, type) {
    setInputs(prev => {
      return {...prev, [type]: text};
    });
  }
  useEffect(() => {
    if (isKeyboardShown) return;
    setIsEditingInput('');
  }, [isKeyboardShown]);

  const themeText = theme ? COLORS.darkModeText : COLORS.lightModeText;
  const themeBackgroundOffset = theme
    ? COLORS.darkModeBackgroundOffset
    : COLORS.lightModeBackgroundOffset;
  return (
    <TouchableWithoutFeedback
      style={{flex: 1}}
      onPress={() => {
        Keyboard.dismiss();
      }}>
      {/* <KeyboardAvoidingView style={{flex: 1}}> */}
      <GlobalThemeView useStandardWidth={true}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => {
              navigate.goBack();
            }}>
            <Image style={[backArrow]} source={ICONS.smallArrowLeft} />
          </TouchableOpacity>
          <ThemeText
            styles={{fontSize: SIZES.large}}
            content={'Edit Profile'}
          />
        </View>
        <View style={styles.innerContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              // flex: 1,
              // height: useWindowDimensions().height,
              // justifyContent: 'center',
              alignItems: 'center',
            }}>
            {!isEditingMyProfile && (
              <>
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

                <TouchableOpacity
                  onPress={() => {
                    navigate.navigate('AddOrDeleteContactImage', {
                      addPhoto: addProfilePicture,
                      deletePhoto: deleteProfilePicture,
                      hasImage: profileImage.length != 0,
                    });
                    // addProfilePicture();
                    // Alert.alert('This does not work yet...');
                  }}
                  style={{marginBottom: 20}}>
                  <Text style={[styles.scanText, {color: themeText}]}>
                    Change Photo
                  </Text>
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
                      isEditingInput === 'name' ? COLORS.primary : themeText,
                    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
                  },
                ]}>
                <TextInput
                  placeholder="Set Name"
                  placeholderTextColor={themeText}
                  ref={nameRef}
                  onFocus={() => setIsEditingInput('name')}
                  style={[
                    {
                      fontSize: SIZES.medium,
                      paddingLeft: 15,
                      paddingRight: 10,
                      paddingTop: 10,
                      color:
                        inputs.name.length < 30 ? themeText : COLORS.cancelRed,
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
                    color:
                      isEditingInput === 'name' ? COLORS.primary : themeText,
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
                          : themeText,
                      paddingBottom: Platform.OS === 'ios' ? 10 : 0,
                    },
                  ]}>
                  <TextInput
                    placeholderTextColor={themeText}
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
                            ? themeText
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
                          : themeText,
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
                      isEditingInput === 'bio' ? COLORS.primary : themeText,
                    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
                  },
                ]}>
                <TextInput
                  placeholder="Set Bio"
                  placeholderTextColor={themeText}
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
                      color:
                        inputs.bio.length < 30 ? themeText : COLORS.cancelRed,
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
                    color:
                      isEditingInput === 'bio' ? COLORS.primary : themeText,
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
              width: '100%',
              marginTop: 50,
              // marginVertical: 5,
            }}
            // textStyles={{}}
            actionFunction={saveChanges}
            textContent={'Save'}
          />
        </View>
      </GlobalThemeView>

      {/* </KeyboardAvoidingView> */}
    </TouchableWithoutFeedback>
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
        toggleMasterInfoObject({
          contacts: {
            myProfile: {
              ...masterInfoObject.contacts.myProfile,
              name: inputs.name,
              bio: inputs.bio,
              uniqueName: inputs.uniquename,
            },
            addedContacts: masterInfoObject.contacts.addedContacts,
            // unaddedContacts:
            //   masterInfoObject.contacts.unaddedContacts,
          },
        });
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

        contact['name'] = inputs.name;
        contact['bio'] = inputs.bio;

        toggleMasterInfoObject({
          contacts: {
            myProfile: {
              ...masterInfoObject.contacts.myProfile,
            },
            addedContacts: encriptMessage(
              contactsPrivateKey,
              publicKey,
              JSON.stringify(newAddedContacts),
            ),
            // unaddedContacts:
            //   masterInfoObject.contacts.unaddedContacts,
          },
        });
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

    try {
      let savedData = await getContactsImage();

      const indexOfImage = savedData.findIndex((arr, index) => {
        if (index != 0) {
          const [contactUUID, imageFile] = arr.split(',');

          return isEditingMyProfile
            ? contactUUID === myContact.uuid
            : selectedAddedContact.uuid === contactUUID;
        }
      });

      if (indexOfImage > 0) {
        let newData = savedData[indexOfImage].split(',');

        newData[1] = imgURL.uri;

        savedData[indexOfImage] = newData.join(',');
      } else {
        const newData = [
          isEditingMyProfile ? myContact.uuid : selectedAddedContact.uuid,
          imgURL.uri,
        ];
        savedData.push(newData.join(','));
      }

      if (isEditingMyProfile) {
        //  WHERE I WILL EVENTULAY ADD THE ABILITY TO STORE IMAGE SO OTHERS CAN ACCESS IT
        // const didSaveToCash = await saveToCacheDirectory(
        //   imgURL.uri,
        //   myContact.uuid,
        // );
      }

      const didSave = await saveNewContactsImage(savedData.join('\n'));
      if (!didSave) {
        navigate.navigate('ErrorScreen', {
          errorMessage: 'unable to save image',
        });
        return;
      }

      toggleContactsImages(savedData);
    } catch (err) {
      let formatedData = [];
      const headers = ['contactUUID,fileURI'];
      if (isEditingMyProfile) formatedData = [myContact.uuid, imgURL.uri];
      else formatedData = [selectedAddedContact.uuid, imgURL.uri];

      const didSave = await saveNewContactsImage(
        headers.concat(formatedData.join(',')).join('\n'),
      );
      if (!didSave) {
        navigate.navigate('ErrorScreen', {
          errorMessage: 'unable to save image',
        });
        return;
      }
      toggleContactsImages(headers.concat(formatedData.join(',')));
    }
  }
  async function deleteProfilePicture() {
    try {
      let savedData = (await getContactsImage()).filter((item, index) => {
        if (index != 0) {
          const [uuid, image] = item.split(',');
          return isEditingMyProfile
            ? uuid != myContact.uuid
            : selectedAddedContact.uuid != uuid;
        } else return item;
      });

      const didSave = await saveNewContactsImage(savedData.join('\n'));
      if (!didSave) {
        navigate.navigate('ErrorScreen', {
          errorMessage: 'unable to save image',
        });
        return;
      }

      toggleContactsImages(savedData);
    } catch (err) {
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
    borderWidth: 5,
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
