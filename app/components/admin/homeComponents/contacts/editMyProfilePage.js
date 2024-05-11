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
} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useNavigation} from '@react-navigation/native';
import {useEffect, useState, useRef} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ANDROIDSAFEAREA} from '../../../../constants/styles';
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

export default function MyContactProfilePage(props) {
  const {
    theme,
    masterInfoObject,
    toggleMasterInfoObject,
    contactsPrivateKey,
    contactsImages,
    toggleContactsImages,
  } = useGlobalContextProvider();
  const navigate = useNavigation();
  const publicKey = getPublicKey(contactsPrivateKey);

  const isEditingMyProfile =
    props.route.params?.pageType?.toLowerCase() === 'myprofile';
  const selectedAddedContact =
    !isEditingMyProfile && props.route.params?.selectedAddedContact;
  const insets = useSafeAreaInsets();

  const myContact = masterInfoObject.contacts.myProfile;
  const decodedAddedContacts =
    typeof masterInfoObject.contacts.addedContacts === 'string'
      ? JSON.parse(
          decryptMessage(
            contactsPrivateKey,
            publicKey,
            masterInfoObject.contacts.addedContacts,
          ),
        )
      : [];

  const [profileImage, setProfileImage] = useState(null);

  const nameRef = useRef(null);
  const [inputs, setInputs] = useState({
    name: '',
    bio: '',
  });

  useEffect(() => {
    changeInputText(myContact.name || selectedAddedContact.name || '', 'name');
    changeInputText(myContact.bio || selectedAddedContact.bio || '', 'bio');
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

  const themeBackground = theme
    ? COLORS.darkModeBackground
    : COLORS.lightModeBackground;
  const themeText = theme ? COLORS.darkModeText : COLORS.lightModeText;
  const themeBackgroundOffset = theme
    ? COLORS.darkModeBackgroundOffset
    : COLORS.lightModeBackgroundOffset;
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}>
      <View
        style={[styles.globalContainer, {backgroundColor: themeBackground}]}>
        <View
          style={{
            flex: 1,
            paddingTop: insets.top === 0 ? ANDROIDSAFEAREA : insets.top,
            paddingBottom:
              insets.bottom === 0 ? ANDROIDSAFEAREA : insets.bottom,
          }}>
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => {
                navigate.goBack();
              }}>
              <Image
                style={{
                  width: 30,
                  height: 30,
                  transform: [{translateX: -7}],
                }}
                source={ICONS.smallArrowLeft}
              />
            </TouchableOpacity>
            {/* <TouchableOpacity
              onPress={() => {
                navigate.goBack();
              }}>
              <Image
                style={{
                  width: 20,
                  height: 20,
                }}
                source={ICONS.settingsIcon}
              />
            </TouchableOpacity> */}
          </View>
          <View style={styles.innerContainer}>
            <TouchableOpacity
              style={{marginTop: isEditingMyProfile ? 'auto' : 0}}
              onPress={() => {
                nameRef.current.focus();
              }}>
              <View
                style={[
                  styles.nameContainer,
                  {
                    marginBottom: isEditingMyProfile ? 50 : 20,
                    marginTop: isEditingMyProfile ? 'auto' : 0,
                  },
                ]}>
                <TextInput
                  placeholder="Set Name"
                  placeholderTextColor={themeText}
                  ref={nameRef}
                  style={[
                    styles.nameText,
                    {
                      color:
                        inputs.name.length < 30 ? themeText : COLORS.cancelRed,
                    },
                  ]}
                  value={inputs.name || ''}
                  onChangeText={text => changeInputText(text, 'name')}
                />
                <Image
                  style={styles.editIconStyle}
                  source={theme ? ICONS.editIconLight : ICONS.editIcon}
                />
              </View>
            </TouchableOpacity>
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
                  style={{marginBottom: 'auto'}}>
                  <Text style={[styles.scanText, {color: themeText}]}>
                    Change Photo
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <Text style={[styles.bioHeaderText, {color: themeText}]}>Bio</Text>

            <View style={styles.bioContainer}>
              <TextInput
                placeholder={'Set bio'}
                placeholderTextColor={themeText}
                onChangeText={text => changeInputText(text, 'bio')}
                editable
                multiline
                textAlignVertical="top"
                style={[
                  styles.bioInput,
                  {
                    backgroundColor: themeBackgroundOffset,
                    color:
                      inputs.bio.length < 150 ? themeText : COLORS.cancelRed,
                    textDecorationColor: themeText,
                  },
                ]}
                value={inputs.bio.length === 0 ? '' : inputs.bio}
              />
              <Text style={[{color: themeText}]}>
                {inputs.bio.length} / {150}
              </Text>
            </View>
            <TouchableOpacity
              onPress={async () => {
                if (inputs.name.length > 50 || inputs.bio.length > 150) return;

                if (
                  isEditingMyProfile &&
                  myContact?.bio === inputs.bio &&
                  myContact?.name === inputs.name
                ) {
                  navigate.goBack();
                  return;
                } else if (
                  selectedAddedContact?.bio === inputs.bio &&
                  selectedAddedContact?.name === inputs.name
                ) {
                  navigate.goBack();
                } else {
                  if (isEditingMyProfile) {
                    // ABILITY TO CHANGE NAME
                    toggleMasterInfoObject({
                      contacts: {
                        myProfile: {
                          ...masterInfoObject.contacts.myProfile,
                          name: inputs.name,
                          bio: inputs.bio,
                        },
                        addedContacts: masterInfoObject.contacts.addedContacts,
                        // unaddedContacts:
                        //   masterInfoObject.contacts.unaddedContacts,
                      },
                    });
                  } else {
                    console.log('EDITING ADDED CONTAVT');
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
                  }

                  navigate.goBack();
                }
              }}
              style={[styles.buttonContainer]}>
              <Text style={[styles.buttonText, {color: themeText}]}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );

  async function addProfilePicture() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      allowsMultipleSelection: false,
      quality: 1,
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
  globalContainer: {
    flex: 1,
  },

  topBar: {
    width: '95%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
    // backgroundColor: 'black',
    ...CENTER,
  },
  backButton: {
    width: 20,
    height: 20,
  },
  innerContainer: {
    flex: 1,
    width: '95%',
    alignItems: 'center',
    // justifyContent: 'center',
    // backgroundColor: 'black',
    ...CENTER,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    // marginTop: 'auto',
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
});
