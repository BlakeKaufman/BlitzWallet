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
import GetThemeColors from '../../../../hooks/themeColors';

export default function ManualEnterSendAddress() {
  const navigate = useNavigation();
  const {theme} = useGlobalContextProvider();
  const [inputValue, setInputValue] = useState('');
  const {textColor, backgroundOffset, backgroundColor} = GetThemeColors();
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
                backgroundColor: backgroundOffset,
                color: textColor,
              },
            ]}
            multiline
            onChangeText={setInputValue}
            value={inputValue}
            textAlignVertical="top"
            placeholder="Enter or paste a Liquid, or Lightning address/invoice"
            placeholderTextColor={textColor}
          />

          <CustomButton
            buttonStyles={{
              opacity: !inputValue ? 0.5 : 1,
              width: 'auto',
              marginTop: 'auto',
              marginBottom: Platform.OS == 'ios' ? 10 : 0,
            }}
            actionFunction={hanldeSubmit}
            textContent={'Accept'}
          />
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
