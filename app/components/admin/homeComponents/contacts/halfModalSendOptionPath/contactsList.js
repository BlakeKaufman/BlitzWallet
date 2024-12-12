import {useNavigation} from '@react-navigation/native';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../../constants';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {
  GlobalThemeView,
  ThemeText,
} from '../../../../../functions/CustomElements';
import handleBackPress from '../../../../../hooks/handleBackPress';
import {useGlobalContacts} from '../../../../../../context-store/globalContacts';
import GetThemeColors from '../../../../../hooks/themeColors';
import ThemeImage from '../../../../../functions/CustomElements/themeImage';
import {useTranslation} from 'react-i18next';
import useUnmountKeyboard from '../../../../../hooks/useUnmountKeyboard';
import CustomSearchInput from '../../../../../functions/CustomElements/searchInput';

export default function ChooseContactHalfModal() {
  const {theme, darkModeType} = useGlobalContextProvider();
  useUnmountKeyboard();
  const {decodedAddedContacts} = useGlobalContacts();
  const navigate = useNavigation();
  const [inputText, setInputText] = useState('');
  const {t} = useTranslation();

  const handleBackPressFunction = useCallback(() => {
    navigate.goBack();
    return true;
  }, [navigate]);

  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, [handleBackPressFunction]);

  const contactElements = useMemo(() => {
    return decodedAddedContacts
      .filter(contact => {
        return (
          contact.name.toLowerCase().startsWith(inputText.toLowerCase()) ||
          (!contact.isLNURL &&
            contact.uniqueName
              .toLowerCase()
              .startsWith(inputText.toLowerCase()))
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
              <ThemeImage
                darkModeIcon={ICONS.smallArrowLeft}
                lightModeIcon={ICONS.smallArrowLeft}
                lightsOutIcon={ICONS.arrow_small_left_white}
              />
            </TouchableOpacity>
            <ThemeText
              styles={{
                marginRight: 'auto',
                marginLeft: 'auto',
                fontSize: SIZES.large,
              }}
              content={t('wallet.contactsPage.header')}
            />
          </View>

          <View
            style={{
              flex: 1,
              width: '90%',
              ...CENTER,
              marginTop: 30,
            }}>
            <CustomSearchInput
              inputText={inputText}
              setInputText={setInputText}
              placeholderText={t('wallet.contactsPage.inputTextPlaceholder')}
              containerStyles={{marginBottom: 10}}
            />
            <View style={{flex: 1}}>
              <ThemeText content={t('wallet.contactsPage.subHeader')} />
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
                style={{flex: 1, overflow: 'hidden'}}>
                {contactElements}
              </ScrollView>
            </View>
          </View>
        </GlobalThemeView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

  function navigateToExpandedContact(contact) {
    Keyboard.dismiss();
    navigate.navigate('SendAndRequestPage', {
      selectedContact: contact,
      paymentType: 'send',
      fromPage: 'halfModal',
    });
  }

  function ContactElement(props) {
    const {nodeInformation} = useGlobalContextProvider();
    const {t} = useTranslation();
    const {backgroundOffset} = GetThemeColors();
    const contact = props.contact;

    return (
      <TouchableOpacity
        onLongPress={() => {
          if (!nodeInformation.didConnectToNode) {
            navigate.navigate('ErrorScreen', {
              errorMessage: t('constants.internetError'),
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
                  backgroundColor: backgroundOffset,
                  position: 'relative',
                },
              ]}>
              <Image
                source={
                  contact.profileImage
                    ? {uri: contact.profileImage}
                    : darkModeType && theme
                    ? ICONS.userWhite
                    : ICONS.userIcon
                }
                style={
                  contact.profileImage
                    ? {width: '100%', height: undefined, aspectRatio: 1}
                    : {width: '50%', height: '50%'}
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

  inputContainer: {
    width: '100%',
    ...CENTER,
    marginTop: 10,
  },

  contactRowContainer: {
    width: '100%',

    flexDirection: 'row',
    alignItems: 'center',
    ...CENTER,
  },

  contactImageContainer: {
    width: 45,
    height: 45,
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
