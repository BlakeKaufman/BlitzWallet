import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {
  CENTER,
  COLORS,
  FONT,
  hasSpace,
  ICONS,
  SIZES,
  VALID_USERNAME_REGEX,
} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useNavigation} from '@react-navigation/native';
import {useEffect, useState, useRef, useCallback} from 'react';
import {getPublicKey} from 'nostr-tools';
import {encriptMessage} from '../../../../functions/messaging/encodingAndDecodingMessages';

import * as ImagePicker from 'expo-image-picker';

import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import getKeyboardHeight from '../../../../hooks/getKeyboardHeight';
import {isValidUniqueName} from '../../../../../db';
import handleBackPress from '../../../../hooks/handleBackPress';

import CustomButton from '../../../../functions/CustomElements/button';
import {useGlobalContacts} from '../../../../../context-store/globalContacts';
import GetThemeColors from '../../../../hooks/themeColors';
import ThemeImage from '../../../../functions/CustomElements/themeImage';
import {
  removeLocalStorageItem,
  setLocalStorageItem,
} from '../../../../functions/localStorage';

export default function EditMyProfilePage(props) {
  const navigate = useNavigation();
  const {
    decodedAddedContacts,
    toggleGlobalContactsInformation,
    globalContactsInformation,
  } = useGlobalContacts();

  const pageType = props?.pageType || props.route.params?.pageType;
  const fromSettings = props.fromSettings || props.route.params?.fromSettings;

  const isEditingMyProfile = pageType.toLowerCase() === 'myprofile';
  const providedContact =
    !isEditingMyProfile && props.route.params?.selectedAddedContact;
  const myContact = globalContactsInformation.myProfile;
  const isFirstTimeEditing = myContact.didEditProfile;

  const selectedAddedContact = decodedAddedContacts.find(
    contact => contact.uuid === providedContact.uuid,
  );
  console.log('TTTTEES', fromSettings);

  const handleBackPressFunction = useCallback(() => {
    navigate.goBack();
    return true;
  }, [navigate]);

  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, [handleBackPressFunction]);

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
                if (!isFirstTimeEditing) {
                  toggleGlobalContactsInformation(
                    {
                      myProfile: {
                        ...globalContactsInformation.myProfile,
                        didEditProfile: true,
                      },
                      addedContacts: globalContactsInformation.addedContacts,
                    },
                    true,
                  );
                }
                navigate.goBack();
              }}>
              <ThemeImage
                darkModeIcon={ICONS.smallArrowLeft}
                lightModeIcon={ICONS.smallArrowLeft}
                lightsOutIcon={ICONS.arrow_small_left_white}
              />
            </TouchableOpacity>
          </View>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            style={{flex: 1}}>
            <InnerContent
              isEditingMyProfile={isEditingMyProfile}
              selectedAddedContact={selectedAddedContact}
            />
          </KeyboardAvoidingView>
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
    setMyProfileImage,
    myProfileImage,
  } = useGlobalContacts();

  const isKeyboardShown = getKeyboardHeight().keyboardHeight != 0;
  const publicKey = getPublicKey(contactsPrivateKey);

  const [isEditingInput, setIsEditingInput] = useState('');

  const nameRef = useRef(null);
  const uniquenameRef = useRef(null);
  const bioRef = useRef(null);
  const myContact = globalContactsInformation.myProfile;

  const myContactName = myContact?.name;
  const myContactBio = myContact?.bio;
  const myContactUniqueName = myContact?.uniqueName;
  const isFirstTimeEditing = myContact.didEditProfile;

  const selectedAddedContactName = selectedAddedContact?.name;
  const selectedAddedContactBio = selectedAddedContact?.bio;
  const selectedAddedContactUniqueName = selectedAddedContact?.uniqueName;

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
      isFirstTimeEditing
        ? isEditingMyProfile
          ? myContactName || ''
          : selectedAddedContactName || ''
        : '',
      'name',
    );
    changeInputText(
      isFirstTimeEditing
        ? isEditingMyProfile
          ? myContactBio || ''
          : selectedAddedContactBio || ''
        : '',
      'bio',
    );
    changeInputText(
      isFirstTimeEditing
        ? isEditingMyProfile
          ? myContactUniqueName || ''
          : selectedAddedContactUniqueName || ''
        : '',
      'uniquename',
    );
  }, [
    isEditingMyProfile,
    myContactName,
    myContactBio,
    myContactUniqueName,
    selectedAddedContactName,
    selectedAddedContactBio,
    selectedAddedContactUniqueName,
  ]);

  console.log(myProfileImage);

  console.log(inputs);

  return (
    <View style={styles.innerContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          alignItems: 'center',
        }}>
        {/* {!isEditingMyProfile && (
          <> */}
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
              (selectedAddedContact?.profileImage && !isEditingMyProfile) ||
              (myProfileImage && isEditingMyProfile)
                ? {
                    uri: isEditingMyProfile
                      ? myProfileImage
                      : selectedAddedContact?.profileImag,
                  }
                : darkModeType && theme
                ? ICONS.userWhite
                : ICONS.userIcon
            }
            style={
              (selectedAddedContact?.profileImage && !isEditingMyProfile) ||
              (myProfileImage && isEditingMyProfile)
                ? {width: '100%', height: undefined, aspectRatio: 1}
                : {width: '50%', height: '50%'}
            }
          />
        </View>

        <TouchableOpacity
          onPress={() => {
            if (
              (!selectedAddedContact?.profileImage && !isEditingMyProfile) ||
              (!myProfileImage && isEditingMyProfile)
            ) {
              addProfilePicture();
              return;
            }
            navigate.navigate('AddOrDeleteContactImage', {
              addPhoto: addProfilePicture,
              deletePhoto: deleteProfilePicture,
              hasImage:
                (selectedAddedContact?.profileImage && !isEditingMyProfile) ||
                (myProfileImage && isEditingMyProfile),
            });
          }}
          style={{marginBottom: 20}}>
          <ThemeText
            styles={{...styles.scanText}}
            content={`${
              (selectedAddedContact?.profileImage && !isEditingMyProfile) ||
              (myProfileImage && isEditingMyProfile)
                ? 'Change'
                : 'Add'
            } Photo`}
          />
        </TouchableOpacity>
        {/* </>
        )} */}

        {/* <ThemeText
          styles={{
            width: '100%',
            marginTop: isEditingMyProfile ? 50 : 0,
            marginBottom: 10,
          }}
          content={`This is how we'll refer to you and how you'll show up in the app.`}
        /> */}

        <TouchableOpacity
          style={styles.textInputContainer}
          activeOpacity={1}
          onPress={() => {
            nameRef.current.focus();
            setIsEditingInput('name');
          }}>
          <ThemeText styles={{marginBottom: 5}} content={'Name'} />
          <TextInput
            placeholder="Set Name"
            placeholderTextColor={textColor}
            ref={nameRef}
            onFocus={() => setIsEditingInput('name')}
            style={[
              styles.textInput,
              {
                color: inputs.name.length < 30 ? textColor : COLORS.cancelRed,
              },
            ]}
            value={inputs.name || ''}
            onChangeText={text => changeInputText(text, 'name')}
          />
          <ThemeText
            styles={{
              textAlign: 'right',
            }}
            content={`${inputs.name.length} / ${30}`}
          />
        </TouchableOpacity>
        {isEditingMyProfile && (
          <TouchableOpacity
            style={styles.textInputContainer}
            activeOpacity={1}
            onPress={() => {
              uniquenameRef.current.focus();
              setIsEditingInput('uniquename');
            }}>
            <ThemeText
              styles={{
                marginBottom: 5,
              }}
              content={'Username'}
            />
            <TextInput
              placeholderTextColor={textColor}
              ref={uniquenameRef}
              onFocus={() => setIsEditingInput('uniquename')}
              style={[
                styles.textInput,
                {
                  color:
                    inputs.uniquename.length < 30
                      ? textColor
                      : COLORS.cancelRed,
                },
              ]}
              value={inputs.uniquename || ''}
              placeholder={myContact.uniqueName}
              onChangeText={text => changeInputText(text, 'uniquename')}
            />

            <ThemeText
              styles={{textAlign: 'right'}}
              content={`${inputs.uniquename.length} / ${30}`}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.textInputContainer}
          activeOpacity={1}
          onPress={() => {
            bioRef.current.focus();
            setIsEditingInput('bio');
          }}>
          <ThemeText styles={{}} content={'Bio'} />
          <TextInput
            placeholder="Set Bio"
            placeholderTextColor={textColor}
            ref={bioRef}
            onFocus={() => setIsEditingInput('bio')}
            editable
            multiline
            textAlignVertical="top"
            style={[
              styles.textInput,
              {
                minHeight: 100,
                maxHeight: 150,
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
              textAlign: 'right',
            }}
            content={`${inputs.bio.length} / ${150}`}
          />
        </TouchableOpacity>
      </ScrollView>

      <CustomButton
        buttonStyles={{
          width: 'auto',
          ...CENTER,
          marginTop: 25,
          // marginVertical: 5,
        }}
        // textStyles={{}}
        actionFunction={saveChanges}
        textContent={'Save'}
      />
    </View>
  );
  async function saveChanges() {
    if (
      inputs.name.length > 30 ||
      inputs.bio.length > 150 ||
      inputs.uniquename.length > 30
    )
      return;

    const uniqueName = !isFirstTimeEditing
      ? inputs.uniquename || myContact.uniqueName
      : inputs.uniquename;

    if (isEditingMyProfile) {
      if (
        myContact?.bio === inputs.bio &&
        myContact?.name === inputs.name &&
        myContact?.uniqueName === inputs.uniquename &&
        isFirstTimeEditing
      ) {
        navigate.goBack();
      } else {
        if (!VALID_USERNAME_REGEX.test(uniqueName)) {
          navigate.navigate('ErrorScreen', {
            errorMessage:
              'You can only have letters, numbers, or underscores in your username, and must contain at least 1 letter.',
          });
          return;
        }
        if (myContact?.uniqueName != uniqueName) {
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
              uniqueName: uniqueName.trim(),
              uniqueNameLower: uniqueName.trim().toLowerCase(),
              didEditProfile: true,
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

    if (isEditingMyProfile) {
      setMyProfileImage(imgURL.uri);
      setLocalStorageItem('myProfileImage', imgURL.uri);
      return;
    }

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
      if (isEditingMyProfile) {
        setMyProfileImage('');
        removeLocalStorageItem('myProfileImage');
        return;
      }
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

  textInput: {
    fontSize: SIZES.medium,
    paddingLeft: 15,
    paddingRight: 10,
    paddingVertical: Platform.OS === 'ios' ? 15 : 10,
    borderRadius: 8,
    backgroundColor: COLORS.darkModeText,
    marginBottom: 10,
  },
  textInputContainer: {width: '100%'},
});
