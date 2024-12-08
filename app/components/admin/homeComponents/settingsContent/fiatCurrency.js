import {
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../constants';
import {fetchFiatRates} from '@breeztech/react-native-breez-sdk';
import {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import {WINDOWWIDTH} from '../../../../constants/theme';
import ThemeImage from '../../../../functions/CustomElements/themeImage';
import GetThemeColors from '../../../../hooks/themeColors';
import CustomSearchInput from '../../../../functions/CustomElements/searchInput';

export default function FiatCurrencyPage() {
  const {
    theme,
    toggleNodeInformation,
    masterInfoObject,
    toggleMasterInfoObject,
    darkModeType,
  } = useGlobalContextProvider();
  const currencies = masterInfoObject.fiatCurrenciesList || [];
  const [textInput, setTextInput] = useState('');
  const currentCurrency = masterInfoObject?.fiatCurrency;

  const navigate = useNavigation();

  const [isLoading, setIsLoading] = useState(false);

  const filteredList = currencies.filter(currency => {
    if (
      currency.info.name
        .toLowerCase()
        .startsWith(textInput.toLocaleLowerCase()) ||
      currency.id.toLowerCase().startsWith(textInput.toLocaleLowerCase())
    )
      return currency;
    else return false;
  });

  const CurrencyElements = ({currency, id}) => {
    return (
      <TouchableOpacity
        style={[
          styles.currencyContainer,

          {
            marginBottom: id === currencies.length - 1 ? 30 : 0,
            marginTop: id === 0 ? 10 : 0,
          },
        ]}
        onPress={() => {
          saveCurrencySettings(currency.id);
        }}>
        <ThemeText
          styles={{
            color: theme
              ? currency.id?.toLowerCase() === currentCurrency?.toLowerCase()
                ? darkModeType
                  ? COLORS.opaicityGray
                  : COLORS.primary
                : COLORS.darkModeText
              : currency.id?.toLowerCase() === currentCurrency?.toLowerCase()
              ? COLORS.primary
              : COLORS.lightModeText,
          }}
          content={`${currency.id} - ${currency.info.name}`}
        />
      </TouchableOpacity>
    );
  };

  return (
    <GlobalThemeView styles={{paddingBottom: 0}}>
      <View style={styles.outerContainer}>
        <View style={styles.topbar}>
          <TouchableOpacity
            style={{position: 'absolute', top: 0, left: 0, zIndex: 1}}
            onPress={() => {
              Keyboard.dismiss();
              navigate.goBack();
            }}>
            <ThemeImage
              lightsOutIcon={ICONS.arrow_small_left_white}
              darkModeIcon={ICONS.smallArrowLeft}
              lightModeIcon={ICONS.smallArrowLeft}
            />
          </TouchableOpacity>
          <ThemeText
            content={'Display Currency'}
            styles={{...styles.topBarText}}
          />
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          style={styles.container}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <>
              <CustomSearchInput
                setInputText={setTextInput}
                inputText={textInput}
                placeholderText={'Search currency'}
                containerStyles={{width: '90%', marginTop: 20}}
              />
              {/* <TextInput
                // onKeyPress={handleKeyPress}
                onChangeText={setTextInput}
                style={[
                  styles.input,
                  {
                    backgroundColor: textInputBackground,
                    color: textInputColor,
                  },
                ]}
                placeholderTextColor={COLORS.opaicityGray}
                placeholder="Search currency"
              /> */}

              {isLoading ? (
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <ActivityIndicator
                    size="large"
                    color={theme ? COLORS.darkModeText : COLORS.lightModeText}
                  />
                </View>
              ) : (
                <FlatList
                  style={{flex: 1, width: '100%'}}
                  data={filteredList}
                  renderItem={({item, index}) => (
                    <CurrencyElements id={index} currency={item} />
                  )}
                  keyExtractor={currency => currency.id}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </GlobalThemeView>
  );

  async function saveCurrencySettings(selectedCurrency) {
    setIsLoading(true);
    toggleMasterInfoObject({fiatCurrency: selectedCurrency});
    const fiat = await fetchFiatRates();
    const [fiatRate] = fiat.filter(rate => {
      return rate.coin.toLowerCase() === selectedCurrency.toLowerCase();
    });
    toggleNodeInformation({fiatStats: fiatRate});

    if (fiatRate) {
      navigate.goBack();
    } else {
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Sorry, we were not able to save the selected currency.',
      });
    }
  }
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    width: WINDOWWIDTH,
    ...CENTER,
  },

  container: {
    flex: 1,
  },

  currencyContainer: {
    // height: 40,
    width: '85%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 'auto',
    marginLeft: 'auto',
    marginTop: 10,

    paddingVertical: 10,
  },

  errorText: {
    color: 'black',
    fontFamily: FONT.Title_Bold,
    fontSize: SIZES.large,
    marginTop: 'auto',
    marginBottom: 'auto',
  },

  currencyTitle: {
    width: '100%',
    flex: 1,
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Bold,
  },
  currencyID: {
    fontSize: SIZES.small,
    fontFamily: FONT.Descriptoin_Regular,
    marginLeft: 10,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBarText: {
    fontSize: SIZES.xLarge,
    width: '100%',
    textAlign: 'center',
    fontFamily: FONT.Title_Regular,
  },
});
