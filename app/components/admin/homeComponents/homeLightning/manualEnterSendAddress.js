import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import {BTN, COLORS, ICONS, SIZES, WEBSITE_REGEX} from '../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useEffect, useState} from 'react';
import openWebBrowser from '../../../../functions/openWebBrowser';
import handleBackPress from '../../../../hooks/handleBackPress';
import {CENTER, backArrow} from '../../../../constants/styles';
import {FONT, WINDOWWIDTH} from '../../../../constants/theme';
import CustomButton from '../../../../functions/CustomElements/button';

export default function ManualEnterSendAddress() {
  const navigate = useNavigation();
  const {theme} = useGlobalContextProvider();
  const [inputValue, setInputValue] = useState('');
  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

  return (
    <GlobalThemeView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={{flex: 1}}>
        <TouchableOpacity
          onPress={() => {
            Keyboard.dismiss();
            setTimeout(() => {
              navigate.goBack();
            }, 200);
          }}
          style={{width: WINDOWWIDTH, ...CENTER}}>
          <Image style={[backArrow]} source={ICONS.smallArrowLeft} />
        </TouchableOpacity>

        <View style={styles.innerContainer}>
          <TextInput
            style={[
              styles.testInputStyle,

              {
                backgroundColor: theme
                  ? COLORS.darkModeBackgroundOffset
                  : COLORS.lightModeBackgroundOffset,
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}
            multiline
            autoFocus={true}
            onChangeText={setInputValue}
            value={inputValue}
            textAlignVertical="top"
            placeholder="Enter or paste a Bitcoin, Liquid, or Lightning address/invoice"
            placeholderTextColor={
              theme ? COLORS.darkModeText : COLORS.lightModeText
            }
          />

          <CustomButton
            buttonStyles={{
              opacity: !inputValue ? 0.5 : 1,
              width: '100%',
              marginTop: 'auto',
              marginBottom: Platform.OS == 'ios' ? 10 : 0,
            }}
            textStyles={{textTransform: 'uppercase'}}
            actionFunction={hanldeSubmit}
            textContent={'Accept'}
          />

          {/* <TouchableOpacity
            onPress={() => {
              if (!inputValue) return;
              if (WEBSITE_REGEX.test(inputValue)) {
                openWebBrowser({navigate, link: inputValue});
                return;
              }
              Keyboard.dismiss();
              navigate.navigate('HomeAdmin');
              navigate.navigate('ConfirmPaymentScreen', {
                btcAdress: inputValue,
              });
            }}
            style={[
              BTN,
              {
                backgroundColor: theme
                  ? COLORS.darkModeText
                  : COLORS.lightModeText,
                marginTop: 'auto',
                width: '100%',
                marginBottom: Platform.OS === 'ios' ? 10 : 0,
              },
            ]}>
            <ThemeText reversed={true} content={'Accept'} />
          </TouchableOpacity> */}
        </View>
      </KeyboardAvoidingView>
    </GlobalThemeView>
  );
  function hanldeSubmit() {
    if (!inputValue) return;
    if (WEBSITE_REGEX.test(inputValue)) {
      openWebBrowser({navigate, link: inputValue});
      return;
    }
    Keyboard.dismiss();
    navigate.navigate('HomeAdmin');
    navigate.navigate('ConfirmPaymentScreen', {
      btcAdress: inputValue,
    });
  }
}

const styles = StyleSheet.create({
  innerContainer: {
    width: WINDOWWIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...CENTER,
  },
  testInputStyle: {
    width: '100%',
    height: 150,

    borderRadius: 8,

    fontSize: SIZES.large,
    fontFamily: FONT.Title_Regular,

    marginTop: 'auto',
    padding: 10,
  },
});
