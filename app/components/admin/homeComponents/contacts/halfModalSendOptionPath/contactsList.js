import {useNavigation} from '@react-navigation/native';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../../constants';
import {useEffect, useMemo, useState} from 'react';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {backArrow} from '../../../../../constants/styles';
import {
  GlobalThemeView,
  ThemeText,
} from '../../../../../functions/CustomElements';
import handleBackPress from '../../../../../hooks/handleBackPress';
import {useGlobalContacts} from '../../../../../../context-store/globalContacts';

export default function ChooseContactHalfModal() {
  const {theme} = useGlobalContextProvider();
  const {decodedAddedContacts} = useGlobalContacts();
  const navigate = useNavigation();
  const [inputText, setInputText] = useState('');

  function handleBackPressFunction() {
    console.log('RUNNIN IN CONTACTS BACK BUTTON');
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

  const contactElements = useMemo(() => {
    return decodedAddedContacts
      .filter(contact => {
        return (
          contact.name.toLowerCase().startsWith(inputText.toLowerCase()) ||
          contact.uniqueName.toLowerCase().startsWith(inputText.toLowerCase())
        );
      })
      .map((contact, id) => {
        return <ContactElement key={contact.uuid} contact={contact} />;
      });
  }, [decodedAddedContacts, inputText]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      style={[styles.globalContainer]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <GlobalThemeView useStandardWidth={true} styles={{paddingBottom: 0}}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={{position: 'absolute'}}
              onPress={() => {
                navigate.goBack();
              }}>
              <Image style={[backArrow]} source={ICONS.smallArrowLeft} />
            </TouchableOpacity>
            <ThemeText
              styles={{marginRight: 'auto', marginLeft: 'auto'}}
              content={'Select recipient'}
            />
          </View>

          <View
            style={{
              flex: 1,
              width: '90%',
              ...CENTER,
              marginTop: 30,
            }}>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Search username..."
                placeholderTextColor={
                  theme ? COLORS.darkModeText : COLORS.lightModeText
                }
                value={inputText}
                onChangeText={setInputText}
                style={[
                  styles.searchInput,
                  {
                    backgroundColor: theme
                      ? COLORS.darkModeBackgroundOffset
                      : COLORS.lightModeBackgroundOffset,
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    marginBottom: 10,
                  },
                ]}
              />
            </View>
            <View style={{flex: 1}}>
              <ThemeText content={'All Contacts'} />
              <ScrollView style={{flex: 1, overflow: 'hidden'}}>
                {contactElements}
              </ScrollView>
            </View>
          </View>
        </GlobalThemeView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

  function navigateToExpandedContact(contact) {
    navigate.navigate('SendAndRequestPage', {
      selectedContact: contact,
      paymentType: 'send',
      fromPage: 'halfModal',
    });
  }

  function ContactElement(props) {
    const {nodeInformation} = useGlobalContextProvider();
    const contact = props.contact;

    return (
      <TouchableOpacity
        onLongPress={() => {
          if (!nodeInformation.didConnectToNode) {
            navigate.navigate('ErrorScreen', {
              errorMessage:
                'Please reconnect to the internet to use this feature',
            });
            return;
          }
        }}
        key={contact.uuid}
        onPress={() => navigateToExpandedContact(contact)}>
        <View style={{marginTop: 10}}>
          <View style={styles.contactRowContainer}>
            <View
              style={[
                styles.contactImageContainer,
                {
                  backgroundColor: theme
                    ? COLORS.darkModeBackgroundOffset
                    : COLORS.lightModeBackgroundOffset,
                  position: 'relative',
                },
              ]}>
              <Image
                source={
                  contact.profileImage
                    ? {uri: contact.profileImage}
                    : ICONS.userIcon
                }
                style={
                  contact.profileImage
                    ? {width: '100%', height: undefined, aspectRatio: 1}
                    : {width: '80%', height: '80%'}
                }
              />
            </View>

            <View>
              <ThemeText
                styles={{
                  marginRight: contact.unlookedTransactions != 0 ? 5 : 'auto',
                }}
                content={
                  contact.name
                    ? contact.name.length > 25
                      ? `${contact.name.slice(0, 25)}...`
                      : contact.name
                    : contact.uniqueName.length > 25
                    ? `${contact.uniqueName.slice(0, 25)}...`
                    : contact.uniqueName
                }
              />
              <ThemeText
                styles={{
                  fontSize: SIZES.small,
                }}
                content={contact.uniqueName}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },

  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    // paddingHorizontal: 5,
    marginBottom: 5,
    // backgroundColor: 'black',
    ...CENTER,
  },
  backButton: {
    width: 20,
    height: 20,
  },
  hasNotification: {
    // position: 'absolute',
    // bottom: -5,
    // right: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  headerText: {fontFamily: FONT.Title_Bold, fontSize: SIZES.large},

  inputContainer: {
    width: '100%',
    ...CENTER,
    marginTop: 10,
  },

  searchInput: {
    width: '100%',
    padding: 10,
    borderRadius: 8,

    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Regular,

    ...CENTER,
  },

  noContactsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noContactsText: {
    fontSize: SIZES.large,
    textAlign: 'center',
    width: '90%',
  },

  pinnedContact: {
    width: 110,
    height: 'auto',
    margin: 5,
    alignItems: 'center',
  },
  pinnedContactsContainer: {
    width: '100%',
    ...CENTER,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  pinnedContactImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    overflow: 'hidden',
  },
  pinnedContactImage: {
    width: 70,
    height: 70,
  },
  contactRowContainer: {
    width: '100%',

    // overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    ...CENTER,
    // marginVertical: 5,
  },

  contactImageContainer: {
    width: 35,
    height: 35,
    backgroundColor: COLORS.opaicityGray,
    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 30,
    marginRight: 10,
    overflow: 'hidden',
  },
  contactImage: {
    width: 25,
    height: 30,
  },
});
