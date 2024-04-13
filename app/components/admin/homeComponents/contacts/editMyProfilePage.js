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
} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useNavigation} from '@react-navigation/native';
import {useEffect, useState, useRef} from 'react';

export default function MyContactProfilePage(props) {
  const {theme, masterInfoObject, toggleMasterInfoObject} =
    useGlobalContextProvider();
  const navigate = useNavigation();
  // const [myNostrProfile, setMyNosterProfile] = useState({});
  // const setUpatePage = props.route.params.setUpatePage;
  //   //   const useFocus = () => {
  //   //     const htmlElRef = useRef();
  //   //     const setFocus = () => {
  //   //       htmlElRef.current && htmlElRef.current.focus();
  //   //     };
  //   //     return [htmlElRef, setFocus];
  //   //   };

  const myContact = masterInfoObject.contacts.myProfile;
  const nameRef = useRef(null);
  const [inputs, setInputs] = useState({
    name: '',
    bio: '',
  });

  useEffect(() => {
    // (async () => {
    // const savedProfile = JSON.parse(await retrieveData('myNostrProfile'));
    // console.log(savedProfile);
    // setMyNosterProfile(savedProfile);

    changeInputText(myContact.name, 'name');
    changeInputText(myContact.bio || '', 'bio');
    // })();
  }, []);

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
        <SafeAreaView style={{flex: 1}}>
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
              onPress={() => {
                nameRef.current.focus();
              }}>
              <View style={styles.nameContainer}>
                <TextInput
                  // editable={false}
                  ref={nameRef}
                  style={[
                    styles.nameText,
                    {
                      color:
                        inputs.name.length < 30 ? themeText : COLORS.cancelRed,
                    },
                  ]}
                  value={inputs.name}
                  onChangeText={text => changeInputText(text, 'name')}
                />
                <Image
                  style={styles.editIconStyle}
                  source={theme ? ICONS.editIconLight : ICONS.editIcon}
                />
              </View>
            </TouchableOpacity>
            <View
              style={[
                styles.profileImage,
                {
                  borderColor: themeBackgroundOffset,
                  backgroundColor: themeText,
                },
              ]}>
              <Image
                source={ICONS.userIcon}
                style={{width: '80%', height: '80%'}}
              />
            </View>
            <TouchableOpacity
              onPress={() => {
                Alert.alert('This does not work yet...');
              }}
              style={{marginBottom: 'auto'}}>
              <Text style={[styles.scanText, {color: themeText}]}>
                Change Photo
              </Text>
            </TouchableOpacity>

            <Text style={[styles.bioHeaderText, {color: themeText}]}>Bio</Text>

            <View style={styles.bioContainer}>
              <TextInput
                placeholder={'No bio set'}
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
                  myContact?.bio === inputs.bio &&
                  myContact?.name === inputs.name
                )
                  navigate.goBack();
                else {
                  // ABILITY TO CHANGE NAME
                  toggleMasterInfoObject({
                    contacts: {
                      myProfile: {
                        ...masterInfoObject.contacts.myProfile,
                        name: inputs.name,
                        bio: inputs.bio,
                      },
                      addedContacts: masterInfoObject.contacts.addedContacts,
                    },
                  });

                  // if (didStore) {
                  //   setUpatePage(prev => (prev += 1));
                  navigate.goBack();
                  // }
                }
              }}
              style={[styles.buttonContainer]}>
              <Text style={[styles.buttonText, {color: themeText}]}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
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
    ...CENTER,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
    marginBottom: 'auto',
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
