import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Icon from '../../../../../functions/CustomElements/Icon';
import {
  CENTER,
  COLORS,
  EMAIL_REGEX,
  ICONS,
  SIZES,
} from '../../../../../constants';
import {
  GlobalThemeView,
  ThemeText,
} from '../../../../../functions/CustomElements';
import GetThemeColors from '../../../../../hooks/themeColors';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import CustomButton from '../../../../../functions/CustomElements/button';
import {useCallback, useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import FullLoadingScreen from '../../../../../functions/CustomElements/loadingScreen';
import {useGlobalAppData} from '../../../../../../context-store/appData';
import {encriptMessage} from '../../../../../functions/messaging/encodingAndDecodingMessages';
import {getPublicKey} from 'nostr-tools';
import {FONT, WINDOWWIDTH} from '../../../../../constants/theme';
import ThemeImage from '../../../../../functions/CustomElements/themeImage';
import * as WebBrowser from 'expo-web-browser';
import handleBackPress from '../../../../../hooks/handleBackPress';
import CustomSearchInput from '../../../../../functions/CustomElements/searchInput';

export default function CreateGiftCardAccount(props) {
  const {contactsPrivateKey, theme, darkModeType} = useGlobalContextProvider();
  const publicKey = getPublicKey(contactsPrivateKey);
  const {toggleGlobalAppDataInformation, decodedGiftCards} = useGlobalAppData();
  const {textColor, textInputBackground, textInputColor} = GetThemeColors();
  const [email, setEmail] = useState('');

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [hasError, setHasError] = useState('');
  const navigate = useNavigation();

  const handleBackPressFunction = useCallback(() => {
    navigate.goBack();
    return true;
  }, [navigate]);

  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, [handleBackPressFunction]);

  return (
    <GlobalThemeView useStandardWidth={true}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          style={{flex: 1}}>
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => {
                navigate.goBack();
              }}
              style={{marginRight: 'auto'}}>
              <ThemeImage
                lightModeIcon={ICONS.smallArrowLeft}
                darkModeIcon={ICONS.smallArrowLeft}
                lightsOutIcon={ICONS.arrow_small_left_white}
              />
            </TouchableOpacity>
          </View>

          <View style={{flex: 1, paddingTop: 20, alignItems: 'center'}}>
            {isSigningIn ? (
              <>
                <FullLoadingScreen
                  textStyles={{textAlign: 'center'}}
                  showLoadingIcon={hasError ? false : true}
                  text={hasError ? hasError : 'Saving email'}
                />
                {hasError && (
                  <CustomButton
                    buttonStyles={{
                      width: 'auto',
                      ...CENTER,
                      marginBottom: 10,
                    }}
                    textStyles={{
                      paddingVertical: 10,
                    }}
                    textContent={'Try again'}
                    actionFunction={() => {
                      setIsSigningIn(false);
                      setHasError('');
                    }}
                  />
                )}
              </>
            ) : (
              <>
                <ThemeText
                  styles={{
                    color:
                      theme && darkModeType
                        ? COLORS.darkModeText
                        : COLORS.primary,
                    fontSize: SIZES.xLarge,
                    fontWeight: 500,
                    marginBottom: 20,
                  }}
                  content={'Powered by'}
                />
                <View style={{marginBottom: 20}}>
                  <Icon
                    width={250}
                    height={70}
                    color={
                      theme && darkModeType
                        ? COLORS.darkModeText
                        : COLORS.primary
                    }
                    name={'theBitcoinCompany'}
                  />
                </View>

                <ThemeText
                  styles={{textAlign: 'center'}}
                  content={
                    'You do not have an email saved. Speed up the checkout process by saving an email.'
                  }
                />
                <CustomSearchInput
                  inputText={email}
                  setInputText={setEmail}
                  placeholderText={'email@address.com'}
                  placeholderTextColor={COLORS.opaicityGray}
                  textInputStyles={{
                    ...styles.textInput,
                    marginTop: 50,
                  }}
                />

                <CustomButton
                  buttonStyles={styles.button}
                  textStyles={{
                    paddingVertical: 10,
                  }}
                  textContent={'Continue'}
                  actionFunction={() => {
                    createAGiftCardAccount();
                  }}
                />
                <View style={styles.warningContainer}>
                  <Text
                    style={{
                      ...styles.warningText,
                      color: textColor,
                    }}>
                    By continuing you agree to The Bitcoin Company's{' '}
                    <Text
                      onPress={() => {
                        (async () => {
                          try {
                            await WebBrowser.openBrowserAsync(
                              'https://thebitcoincompany.com/terms',
                            );
                          } catch (err) {
                            console.log(err, 'OPENING LINK ERROR');
                          }
                        })();
                      }}
                      style={{
                        color:
                          theme && darkModeType
                            ? COLORS.darkModeText
                            : COLORS.primary,
                      }}>
                      Terms of Service
                    </Text>{' '}
                    and{' '}
                    <Text
                      onPress={() => {
                        (async () => {
                          try {
                            await WebBrowser.openBrowserAsync(
                              'https://thebitcoincompany.com/privacy',
                            );
                          } catch (err) {
                            console.log(err, 'OPENING LINK ERROR');
                          }
                        })();
                      }}
                      style={{
                        color:
                          theme && darkModeType
                            ? COLORS.darkModeText
                            : COLORS.primary,
                      }}>
                      Privacy policy
                    </Text>
                  </Text>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </GlobalThemeView>
  );

  async function createAGiftCardAccount() {
    try {
      if (EMAIL_REGEX.test(email)) {
        setIsSigningIn(true);
        Keyboard.dismiss();
        setTimeout(() => {
          const em = encriptMessage(
            contactsPrivateKey,
            publicKey,
            JSON.stringify({
              ...decodedGiftCards,
              profile: {
                ...decodedGiftCards.profile,
                email: email,
              },
            }),
          );
          toggleGlobalAppDataInformation({giftCards: em}, true);

          props.navigation.reset({
            index: 0, // The index of the route to focus on
            routes: [
              {name: 'HomeAdmin', params: {fromStore: false}},
              {name: 'HomeAdmin', params: {fromStore: true}},
              {name: 'GiftCardsPage'},
            ], // Array of routes to set in the stack
          });
        }, 1000);
      } else {
        props.navigation.reset({
          index: 0, // The index of the route to focus on
          routes: [
            {name: 'HomeAdmin', params: {fromStore: false}},
            {name: 'HomeAdmin', params: {fromStore: true}},
            {name: 'GiftCardsPage'},
          ], // Array of routes to set in the stack
        });
      }
    } catch (err) {
      setHasError(
        'Not able to save account. Please make sure you are connected to the internet.',
      );
      console.log('sign user in error', err);
    }
  }
}

const styles = StyleSheet.create({
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    ...CENTER,
  },

  homepage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    width: '95%',
    paddingVertical: Platform.OS === 'ios' ? 15 : null,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 30,
  },
  button: {
    width: 'auto',
    ...CENTER,
    marginBottom: 10,
    marginTop: 'auto',
  },

  warningText: {
    fontSize: SIZES.small,
    fontFamily: FONT.Descriptoin_Regular,
    textAlign: 'center',
  },
});
