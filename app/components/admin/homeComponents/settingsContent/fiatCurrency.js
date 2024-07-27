import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {COLORS, FONT, SIZES} from '../../../../constants';
import {
  fetchFiatRates,
  listFiatCurrencies,
} from '@breeztech/react-native-breez-sdk';
import {useEffect, useRef, useState} from 'react';

import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../context-store/context';

export default function FiatCurrencyPage() {
  const isInitialRender = useRef(true);
  const {
    theme,
    toggleNodeInformation,
    masterInfoObject,
    toggleMasterInfoObject,
  } = useGlobalContextProvider();
  const [currencies, setCurrencies] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [listData, setListData] = useState([]);
  const currentCurrency = masterInfoObject?.fiatCurrency;

  const navigate = useNavigation();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isInitialRender.current) {
      (async () => {
        const savedCurrencies = masterInfoObject.currenciesList;

        if (savedCurrencies.length != 0) {
          setCurrencies(savedCurrencies);
          setListData(savedCurrencies);

          return;
        }
        getCurrencyList();
      })();
      isInitialRender.current = false;
    } else {
      if (!textInput) {
        setListData(currencies);
        return;
      }
      const filteredList = currencies.filter(currency => {
        if (
          currency.info.name
            .toLowerCase()
            .startsWith(textInput.toLocaleLowerCase())
        )
          return currency;
        else return false;
      });
      setListData(filteredList);
    }
  }, [textInput]);

  const CurrencyElements = ({currency, id}) => {
    return (
      <TouchableOpacity
        onPress={() => {
          saveCurrencySettings(currency.id);
        }}>
        <View
          style={[
            styles.currencyContainer,
            {marginBottom: id === currencies.length ? 30 : 0},
          ]}>
          <Text
            style={[
              styles.currencyTitle,
              {
                color: theme
                  ? currency.id?.toLowerCase() ===
                    currentCurrency?.toLowerCase()
                    ? 'green'
                    : COLORS.darkModeText
                  : currency.id?.toLowerCase() ===
                    currentCurrency?.toLowerCase()
                  ? 'green'
                  : COLORS.lightModeText,
              },
            ]}>
            {currency.info.name}
          </Text>
          <Text
            style={[
              styles.currencyID,
              {
                color: theme
                  ? currency.id?.toLowerCase() ===
                    currentCurrency?.toLowerCase()
                    ? 'green'
                    : COLORS.darkModeText
                  : currency.id?.toLowerCase() ===
                    currentCurrency?.toLowerCase()
                  ? 'green'
                  : COLORS.lightModeText,
              },
            ]}>
            {currency.id}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      style={styles.container}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <>
          <TextInput
            // onKeyPress={handleKeyPress}
            onChangeText={setTextInput}
            style={[
              styles.input,
              {
                backgroundColor: theme
                  ? COLORS.darkModeBackgroundOffset
                  : COLORS.lightModeBackgroundOffset,

                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}
            placeholderTextColor={
              theme ? COLORS.darkModeText : COLORS.lightModeText
            }
            placeholder="Search currency"
          />

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
              data={listData}
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
  );

  async function getCurrencyList() {
    try {
      const currenies = await listFiatCurrencies();

      const sourted = currenies.sort((a, b) => a.id.localeCompare(b.id));

      toggleMasterInfoObject({fiatCurrenciesList: sourted});

      setCurrencies(sourted);
      setListData(sourted);
    } catch (err) {
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Sorry, we were not able to get the currencies list.',
      });
    }
  }

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
  container: {
    flex: 1,
    alignItems: 'center',
  },

  input: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 5,

    backgroundColor: COLORS.offsetBackground,
  },

  currencyContainer: {
    height: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 'auto',
    marginLeft: 'auto',
    marginTop: 10,

    borderBottomWidth: 1,
  },

  errorText: {
    color: 'black',
    fontFamily: FONT.Title_Bold,
    fontSize: SIZES.large,
    marginTop: 'auto',
    marginBottom: 'auto',
  },

  currencyTitle: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Bold,
  },
  currencyID: {
    fontSize: SIZES.small,
    fontFamily: FONT.Descriptoin_Regular,
  },
});
