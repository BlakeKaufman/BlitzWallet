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
import {CENTER, COLORS, ICONS, SIZES} from '../../../../../constants';
import {
  GlobalThemeView,
  ThemeText,
} from '../../../../../functions/CustomElements';
import GetThemeColors from '../../../../../hooks/themeColors';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import CustomButton from '../../../../../functions/CustomElements/button';
import {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import FullLoadingScreen from '../../../../../functions/CustomElements/loadingScreen';
import {useGlobalAppData} from '../../../../../../context-store/appData';
import {encriptMessage} from '../../../../../functions/messaging/encodingAndDecodingMessages';
import {getPublicKey} from 'nostr-tools';
import {WINDOWWIDTH} from '../../../../../constants/theme';
import ThemeImage from '../../../../../functions/CustomElements/themeImage';
import * as WebBrowser from 'expo-web-browser';
import getGiftCardAPIEndpoint from './getGiftCardAPIEndpoint';
import {getCurrentDateFormatted} from '../../../../../functions/rotateAddressDateChecker';
import callGiftCardsAPI from './giftCardAPI';

export default function CreateGiftCardAccount(props) {
  const {contactsPrivateKey} = useGlobalContextProvider();
  const publicKey = getPublicKey(contactsPrivateKey);
  const {toggleGlobalAppDataInformation, decodedGiftCards} = useGlobalAppData();
  const {textColor} = GetThemeColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [hasError, setHasError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigation();

  return (
    <GlobalThemeView>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          style={{flex: 1}}>
          <View
            style={{
              flex: 1,
              width: WINDOWWIDTH,
              ...CENTER,
            }}>
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

            <View style={{flex: 1, paddingTop: 20}}>
              {isSigningIn ? (
                <>
                  <FullLoadingScreen
                    textStyles={{textAlign: 'center'}}
                    showLoadingIcon={hasError ? false : true}
                    text={hasError ? hasError : 'Signing in'}
                  />
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
                </>
              ) : (
                <>
                  <ThemeText
                    styles={{
                      fontSize: SIZES.xLarge,
                      fontWeight: 500,
                      marginBottom: 10,
                    }}
                    content={'Create an account'}
                  />

                  <TextInput
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                    style={{
                      ...styles.textInput,
                      marginTop: 50,
                    }}
                    placeholder="email@address.com"
                  />

                  <View style={{...styles.textInput, justifyContent: 'center'}}>
                    <TextInput
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter password"
                      style={{width: '100%', paddingRight: 50}}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(prev => !prev)}
                      style={{position: 'absolute', right: 20}}>
                      <ThemeText content={showPassword ? 'Hide' : 'Show'} />
                    </TouchableOpacity>
                  </View>

                  <CustomButton
                    buttonStyles={{
                      width: 'auto',
                      ...CENTER,
                      marginBottom: 10,
                      marginTop: 'auto',
                    }}
                    textStyles={{
                      paddingVertical: 10,
                    }}
                    textContent={'Create account'}
                    actionFunction={() => {
                      if (password.length <= 8) {
                        navigate.navigate('ErrorScreen', {
                          errorMessage: 'Password must be 8 characters long',
                        });
                        return;
                      }

                      createAGiftCardAccount();
                    }}
                  />
                  <View>
                    <Text
                      style={{
                        color: textColor,
                        textAlign: 'center',
                        fontSize: SIZES.small,
                        marginBottom: 20,
                      }}>
                      By creating an account you agree to The Bitcoin Company's{' '}
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
                        style={{color: COLORS.primary}}>
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
                        style={{color: COLORS.primary}}>
                        Privacy policy
                      </Text>
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </GlobalThemeView>
  );

  async function createAGiftCardAccount() {
    setIsSigningIn(true);
    try {
      const createAccountResponse = await callGiftCardsAPI({
        apiEndpoint: 'signUp',
        email: email,
        password: password,
      });

      if (createAccountResponse.statusCode === 400) {
        setHasError(createAccountResponse.body.error);
        return;
      }
      const em = encriptMessage(
        contactsPrivateKey,
        publicKey,
        JSON.stringify({
          ...decodedGiftCards,
          profile: {
            ...decodedGiftCards.profile,
            accessToken: createAccountResponse.body.response.result.accessToken,
            refreshToken:
              createAccountResponse.body.response.result.refreshToken,
            lastLoginDate: getCurrentDateFormatted(),
            lastRefreshToken: new Date(),
          },
        }),
      );
      toggleGlobalAppDataInformation({giftCards: em}, true);
      setTimeout(() => {
        props.navigation.reset({
          index: 0, // The index of the route to focus on
          routes: [{name: 'GiftCardsPage'}], // Array of routes to set in the stack
        });
      }, 2000);
    } catch (err) {
      setHasError(
        'Not able to sign in. Please make sure you are connected to the internet.',
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
    backgroundColor: COLORS.darkModeText,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 30,
    ...CENTER,
  },
});
