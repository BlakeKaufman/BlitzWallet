import {
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import {ThemeText} from '../../../../functions/CustomElements';
import {ICONS, WEBSITE_REGEX} from '../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useState} from 'react';
import openWebBrowser from '../../../../functions/openWebBrowser';

import {CENTER} from '../../../../constants/styles';
import {SIZES} from '../../../../constants/theme';
import CustomButton from '../../../../functions/CustomElements/button';
import ThemeImage from '../../../../functions/CustomElements/themeImage';
import {useTranslation} from 'react-i18next';
import CustomSearchInput from '../../../../functions/CustomElements/searchInput';
import GetThemeColors from '../../../../hooks/themeColors';

export default function ManualEnterSendAddress() {
  const navigate = useNavigation();
  const {t} = useTranslation();
  const {backgroundOffset} = GetThemeColors();
  const windowDimensions = useWindowDimensions().height;

  const [inputValue, setInputValue] = useState('');

  return (
    <TouchableWithoutFeedback>
      <View
        style={{
          ...styles.popupContainer,
          height: windowDimensions * 0.4 > 320 ? 320 : windowDimensions * 0.4,
        }}>
        <View
          style={[
            styles.topBar,
            {
              backgroundColor: backgroundOffset,
            },
          ]}
        />
        <ScrollView
          keyboardShouldPersistTaps="always"
          contentContainerStyle={styles.innerContainer}
          style={{width: '100%', flex: 1}}>
          <View style={styles.informationContainer}>
            <ThemeText
              styles={styles.textInputLabel}
              content={'Enter in destination'}
            />
            <TouchableOpacity
              onPress={() => {
                navigate.navigate('InformationPopup', {
                  textContent:
                    'Blitz wallet can send to liquid, LNURL and BOLT 11 addresses',
                  buttonText: 'I understand',
                });
              }}>
              <ThemeImage
                styles={{width: 20, height: 20}}
                lightsOutIcon={ICONS.aboutIconWhite}
                lightModeIcon={ICONS.aboutIcon}
                darkModeIcon={ICONS.aboutIcon}
              />
            </TouchableOpacity>
          </View>
          <CustomSearchInput
            textInputMultiline={true}
            inputText={inputValue}
            setInputText={setInputValue}
            textInputStyles={styles.testInputStyle}
            containerStyles={styles.textInputContianerSyles}
            textAlignVertical={'top'}
          />
          <CustomButton
            buttonStyles={{
              ...styles.buttonContainer,
              opacity: !inputValue ? 0.5 : 1,
            }}
            actionFunction={hanldeSubmit}
            textContent={'Continue'}
          />
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
  function hanldeSubmit() {
    if (!inputValue) return;
    Keyboard.dismiss();
    if (WEBSITE_REGEX.test(inputValue)) {
      openWebBrowser({navigate, link: inputValue});
      return;
    }
    navigate.reset({
      index: 0,
      routes: [
        {
          name: 'HomeAdmin', // Navigate to HomeAdmin
          params: {
            screen: 'Home',
          },
        },
        {
          name: 'ConfirmPaymentScreen', // Navigate to HomeAdmin
          params: {
            btcAdress: inputValue,
          },
        },
      ],
    });
  }
}

const styles = StyleSheet.create({
  popupContainer: {
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  informationContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  textInputLabel: {
    marginRight: 10,
    fontWeight: 400,
    fontSize: SIZES.large,
    includeFontPadding: false,
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: Platform.OS == 'ios' ? 10 : 0,
    ...CENTER,
  },
  topBar: {
    width: 120,
    height: 8,
    marginTop: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  innerContainer: {
    width: '90%',
    justifyContent: 'center',
    ...CENTER,
  },
  textInputContianerSyles: {
    width: '100%',
    marginTop: 'auto',
    marginBottom: 10,
  },
  testInputStyle: {
    height: 150,
  },
});
