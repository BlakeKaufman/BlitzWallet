import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
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
import {getCurrentDateFormatted} from '../../../../../functions/rotateAddressDateChecker';
import getGiftCardAPIEndpoint from './getGiftCardAPIEndpoint';
import callGiftCardsAPI from './giftCardAPI';

export default function GiftCardLoginPage(props) {
  const {theme, darkModeType, contactsPrivateKey} = useGlobalContextProvider();
  const publicKey = getPublicKey(contactsPrivateKey);
  const {toggleGlobalAppDataInformation, decodedGiftCards} = useGlobalAppData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [hasError, setHasError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigation();
  const {textColor} = GetThemeColors();

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

          <View style={{flex: 1, alignItems: 'center', paddingTop: 20}}>
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
                <TextInput
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  style={{
                    ...styles.textInput,
                    marginTop: 'auto',
                    color: COLORS.lightModeText,
                  }}
                  placeholder="email@address.com"
                  placeholderTextColor={COLORS.opaicityGray}
                />
                <View
                  style={{
                    width: '100%',
                    alignItems: 'center',
                    marginBottom: 'auto',
                    marginTop: 30,
                    ...CENTER,
                  }}>
                  <TouchableOpacity
                    onPress={() => navigate.navigate('ForgotGiftCardPassword')}
                    style={{width: '90%', marginBottom: 10}}>
                    <ThemeText
                      styles={{textAlign: 'right'}}
                      content={'Forget password?'}
                    />
                  </TouchableOpacity>
                  <View style={{...styles.textInput, justifyContent: 'center'}}>
                    <TextInput
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter password"
                      style={{
                        width: '100%',
                        paddingRight: 50,
                        color: COLORS.lightModeText,
                      }}
                      placeholderTextColor={COLORS.opaicityGray}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(prev => !prev)}
                      style={{position: 'absolute', right: 20}}>
                      <ThemeText
                        styles={{color: COLORS.lightModeText}}
                        content={showPassword ? 'Hide' : 'Show'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <CustomButton
                  buttonStyles={{
                    width: 'auto',
                    ...CENTER,
                    marginBottom: 10,
                  }}
                  textStyles={{
                    paddingVertical: 10,
                  }}
                  textContent={'Sign in'}
                  actionFunction={() => {
                    if (password.length <= 8) {
                      navigate.navigate('ErrorScreen', {
                        errorMessage: 'Password must be 8 characters long',
                      });
                      return;
                    }

                    signUserIn();
                  }}
                />
                <TouchableOpacity
                  onPress={() => navigate.navigate('CreateGiftCardAccount')}
                  style={{flexDirection: 'row', marginBottom: 10}}>
                  <ThemeText
                    styles={{marginRight: 5}}
                    content={`Don't have an account?`}
                  />
                  <ThemeText
                    styles={{color: COLORS.primary}}
                    content={`Sign up`}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </GlobalThemeView>
  );

  async function signUserIn() {
    setIsSigningIn(true);
    try {
      const logInResponse = await callGiftCardsAPI({
        apiEndpoint: 'login',
        email: email,
        password: password,
      });

      if (logInResponse.statusCode === 400) {
        setHasError('Email or password is incorrect');
        return;
      }
      const em = encriptMessage(
        contactsPrivateKey,
        publicKey,
        JSON.stringify({
          ...decodedGiftCards,
          profile: {
            ...decodedGiftCards.profile,
            accessToken: logInResponse.body.response.result.accessToken,
            refreshToken: logInResponse.body.response.result.refreshToken,
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
    width: '90%',
    backgroundColor: COLORS.darkModeText,
    paddingVertical: Platform.OS === 'ios' ? 15 : null,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
});
