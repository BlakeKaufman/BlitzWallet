import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import {ICONS, WEBSITE_REGEX} from '../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useCallback, useEffect, useState} from 'react';
import openWebBrowser from '../../../../functions/openWebBrowser';
import handleBackPress from '../../../../hooks/handleBackPress';
import {ANDROIDSAFEAREA, CENTER} from '../../../../constants/styles';
import {SIZES, WINDOWWIDTH} from '../../../../constants/theme';
import CustomButton from '../../../../functions/CustomElements/button';
import ThemeImage from '../../../../functions/CustomElements/themeImage';
import {useTranslation} from 'react-i18next';
import CustomSearchInput from '../../../../functions/CustomElements/searchInput';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import GetThemeColors from '../../../../hooks/themeColors';

export default function ManualEnterSendAddress() {
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();
  const {t} = useTranslation();
  const {backgroundOffset} = GetThemeColors();

  const [inputValue, setInputValue] = useState('');

  return (
    <View
      style={{
        height: 350,
        width: '100%',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingBottom: insets.bottom < 20 ? ANDROIDSAFEAREA : insets.bottom,
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: backgroundOffset,
          },
        ]}
      />
      <View style={styles.innerContainer}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <ThemeText
            styles={{marginRight: 10, fontWeight: 400, fontSize: SIZES.large}}
            content={'Enter in destination'}
          />
          <TouchableOpacity
            onPress={() => {
              navigate.navigate('InformationPopup', {
                textContent:
                  'Blitz wallet can send to mainchain bitcoin addresses, liquid addresses, LNURL and BOLT 11',
                buttonText: 'I understand',
              });
              console.log('WORKS');
            }}>
            <ThemeImage
              styles={{width: 20, height: 20}}
              lightsOutIcon={ICONS.aboutIconWhite}
              lightModeIcon={ICONS.aboutIcon}
              darkModeIcon={ICONS.aboutIcon}
            />
          </TouchableOpacity>
          {/* <ThemeImage lightModeIcon={ICONS}/> */}
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
            opacity: !inputValue ? 0.5 : 1,
            marginTop: 'auto',
            marginBottom: Platform.OS == 'ios' ? 10 : 0,
            ...CENTER,
          }}
          actionFunction={hanldeSubmit}
          textContent={'Continue'}
        />
      </View>
    </View>
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
  topBar: {
    width: 120,
    height: 8,
    marginTop: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  innerContainer: {
    flex: 1,
    width: '90%',
    justifyContent: 'center',
    ...CENTER,
  },
  textInputContianerSyles: {
    width: '100%',
    marginTop: 'auto',
  },
  testInputStyle: {
    height: 150,
  },
});
