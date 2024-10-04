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
import {
  GlobalThemeView,
  ThemeText,
} from '../../../../../functions/CustomElements';
import {CENTER, COLORS, ICONS, SIZES} from '../../../../../constants';
import ThemeImage from '../../../../../functions/CustomElements/themeImage';
import {useNavigation} from '@react-navigation/native';
import {useCallback, useEffect, useState} from 'react';
import CustomButton from '../../../../../functions/CustomElements/button';
import getGiftCardAPIEndpoint from './getGiftCardAPIEndpoint';
import FullLoadingScreen from '../../../../../functions/CustomElements/loadingScreen';
import GetThemeColors from '../../../../../hooks/themeColors';
import handleBackPress from '../../../../../hooks/handleBackPress';

export default function ForgotGiftCardPassword() {
  const navigate = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setIsLoading] = useState(false);
  const {textColor, textInputBackground, textInputColor} = GetThemeColors();

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
          {loading ? (
            <FullLoadingScreen text={'Sending reset code'} />
          ) : (
            <View style={styles.contentContainer}>
              <ThemeText
                styles={styles.headerText}
                content={'Forgot your password?'}
              />
              <ThemeText
                styles={styles.descriptionText}
                content={
                  'Enter the email associated with your Bitcoin compnay account and you will then receive a passowrd reset link.'
                }
              />
              <TextInput
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={{
                  ...styles.textInput,
                  marginTop: 'auto',
                  color: textInputColor,
                  backgroundColor: textInputBackground,
                }}
                placeholder="email@address.com"
                placeholderTextColor={COLORS.opaicityGray}
              />
              <CustomButton
                buttonStyles={{
                  width: 'auto',
                  ...CENTER,
                  marginBottom: 10,
                  opacity: !email ? 0.2 : 1,
                }}
                textStyles={{
                  paddingVertical: 10,
                }}
                textContent={'Send reset link'}
                actionFunction={() => {
                  if (!email) {
                    navigate.navigate('ErrorScreen', {
                      errorMessage: 'Must enter an email',
                    });
                    return;
                  }

                  Keyboard.dismiss();
                  setTimeout(() => {
                    reqestResetPasswrod();
                  }, 200);
                }}
              />
            </View>
          )}
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </GlobalThemeView>
  );

  async function reqestResetPasswrod() {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${getGiftCardAPIEndpoint()}.netlify/functions/theBitcoinCompany`,
        {
          method: 'POST',
          body: JSON.stringify({
            type: 'requestResetPassword',
            email: email,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      console.log(response);
      const data = await response.json();

      if (response.status === 400) {
        setIsLoading(false);
        navigate.navigate('ErrorScreen', {
          errorMessage: data.error,
        });
        return;
      }
      setIsLoading(false);
      navigate.navigate('ResetGiftCardProfilePassword', {email: email});
    } catch (err) {
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Error resetting password.',
      });
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

  contentContainer: {},

  headerText: {
    fontWeight: 500,
    fontSize: SIZES.xLarge,
    marginTop: 20,
    marginBottom: 10,
  },
  descriptionText: {
    marginBottom: 30,
  },
  textInput: {
    width: '100%',
    backgroundColor: COLORS.darkModeText,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 40,
  },
});
