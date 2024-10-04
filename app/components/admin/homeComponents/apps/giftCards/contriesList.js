import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  GlobalThemeView,
  ThemeText,
} from '../../../../../functions/CustomElements';
import {useNavigation} from '@react-navigation/native';
import ThemeImage from '../../../../../functions/CustomElements/themeImage';
import {CENTER, COLORS, ICONS} from '../../../../../constants';
import {CountryCodeList} from 'react-native-country-picker-modal';
import CountryFlag from 'react-native-country-flag';
import {getCountryInfoAsync} from 'react-native-country-picker-modal/lib/CountryService';
import {useCallback, useEffect, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useGlobalAppData} from '../../../../../../context-store/appData';
import {encriptMessage} from '../../../../../functions/messaging/encodingAndDecodingMessages';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {getPublicKey} from 'nostr-tools';
import GetThemeColors from '../../../../../hooks/themeColors';
import {ANDROIDSAFEAREA} from '../../../../../constants/styles';
import handleBackPress from '../../../../../hooks/handleBackPress';

export default function CountryList() {
  const {contactsPrivateKey} = useGlobalContextProvider();
  const {toggleGlobalAppDataInformation, decodedGiftCards} = useGlobalAppData();
  const {textColor, textInputBackground, textInputColor} = GetThemeColors();
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();
  const [countries, setCountries] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const publicKey = getPublicKey(contactsPrivateKey);
  const ISOCode = decodedGiftCards?.profile?.isoCode;

  const handleBackPressFunction = useCallback(() => {
    navigate.goBack();
    return true;
  }, [navigate]);

  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, [handleBackPressFunction]);

  const saveNewCountrySetting = useCallback(
    async isoCode => {
      const em = encriptMessage(
        contactsPrivateKey,
        publicKey,
        JSON.stringify({
          ...decodedGiftCards,
          profile: {
            ...decodedGiftCards.profile,
            isoCode: isoCode,
          },
        }),
      );

      toggleGlobalAppDataInformation({giftCards: em}, true);

      setTimeout(() => {
        navigate.goBack();
      }, 1000);
    },
    [
      contactsPrivateKey,
      publicKey,
      decodedGiftCards,
      toggleGlobalAppDataInformation,
      navigate,
    ],
  );

  useEffect(() => {
    // Fetch country information asynchronously
    const fetchCountryInfo = async () => {
      const countryInfoList = await Promise.all(
        CountryCodeList.map(async code => {
          const info = await getCountryInfoAsync({countryCode: code});
          if (
            !info.countryName
              .toLocaleLowerCase()
              .startsWith(searchInput.toLocaleLowerCase())
          )
            return false;
          return (
            <TouchableOpacity
              key={code}
              onPress={() => {
                saveNewCountrySetting(code);
              }}
              style={{flexDirection: 'row', marginVertical: 20}}>
              <CountryFlag isoCode={code} size={20} />
              <ThemeText
                styles={{
                  marginLeft: 10,
                  fontWeight: 500,
                  color: ISOCode === code ? COLORS.primary : textColor,
                }}
                content={info.countryName}
              />
            </TouchableOpacity>
          );
        }),
      );

      setCountries(countryInfoList);
    };

    fetchCountryInfo();
  }, [searchInput, ISOCode, saveNewCountrySetting, textColor]);
  return (
    <GlobalThemeView styles={{paddingBottom: 0}} useStandardWidth={true}>
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
        <TextInput
          onChangeText={setSearchInput}
          style={{
            ...styles.textInput,
            backgroundColor: textInputBackground,
            color: textInputColor,
          }}
          placeholder="Search"
          placeholderTextColor={COLORS.opaicityGray}
        />
        <ScrollView contentContainerStyle={{width: '90%', ...CENTER}}>
          {countries}
          <View
            style={{
              height: insets.bottom < 20 ? ANDROIDSAFEAREA : insets.bottom + 20,
            }}></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GlobalThemeView>
  );
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
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 20,
    borderRadius: 8,
    color: COLORS.lightModeText,
    ...CENTER,
  },
});
