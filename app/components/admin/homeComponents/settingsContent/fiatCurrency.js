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
} from 'react-native';
import {COLORS, FONT, SIZES} from '../../../../constants';
import {
  fetchFiatRates,
  listFiatCurrencies,
} from '@breeztech/react-native-breez-sdk';
import {useEffect, useRef, useState} from 'react';
import {getLocalStorageItem, setLocalStorageItem} from '../../../../functions';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../context-store/context';

export default function FiatCurrencyPage(props) {
  const isInitialRender = useRef(true);
  const [currencies, setCurrencies] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [listData, setListData] = useState([]);
  const [currentCurrency, setCurrentCurrency] = useState('');
  const navigate = useNavigation();
  const {theme, toggleNodeInformation} = useGlobalContextProvider();
  const [isLoading, setIsLoading] = useState(false);

  // const theme = useColorScheme() === 'dark';

  useEffect(() => {
    if (isInitialRender.current) {
      (async () => {
        const savedCurrencies = await getLocalStorageItem('currenciesList');
        if (savedCurrencies) {
          setCurrencies(JSON.parse(savedCurrencies));
          setListData(JSON.parse(savedCurrencies));
          getCurrentSettings();
          return;
        }
        getCurrencyList();
        getCurrentSettings();
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

  const CurrencyElements = currency => {
    return (
      <TouchableOpacity
        onPress={() => {
          saveCurrencySettings(currency.item.id);
        }}>
        <View
          style={[
            styles.currencyContainer,
            {marginBottom: currency.item.id === 'ZAR' ? 30 : 0},
          ]}>
          <Text
            style={[
              styles.currencyTitle,
              {
                color: theme
                  ? currency.item.id?.toLowerCase() ===
                    currentCurrency?.toLowerCase()
                    ? 'green'
                    : COLORS.darkModeText
                  : currency.item.id?.toLowerCase() ===
                    currentCurrency?.toLowerCase()
                  ? 'green'
                  : COLORS.lightModeText,
              },
            ]}>
            {currency.item.info.name}
          </Text>
          <Text
            style={[
              styles.currencyID,
              {
                color: theme
                  ? currency.item.id?.toLowerCase() ===
                    currentCurrency?.toLowerCase()
                    ? 'green'
                    : COLORS.darkModeText
                  : currency.item.id?.toLowerCase() ===
                    currentCurrency?.toLowerCase()
                  ? 'green'
                  : COLORS.lightModeText,
              },
            ]}>
            {currency.item.id}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{flex: 1}}>
      <KeyboardAvoidingView style={styles.container}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={{width: '100%', height: '100%', alignItems: 'center'}}>
            <TextInput
              onKeyPress={handleKeyPress}
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

            {listData.length === 0 || isLoading ? (
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
                style={{flex: 1, width: '90%'}}
                data={listData}
                renderItem={currency => <CurrencyElements {...currency} />}
                keyExtractor={currency => currency.id}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );

  function handleKeyPress(e) {
    setTextInput(prev => {
      if (e.nativeEvent?.key.toLowerCase() != 'backspace') {
        return (prev += e.nativeEvent?.key);
      } else {
        const inputLength = prev.length;
        if (inputLength === 1) {
          return '';
        } else {
          const newString = prev.slice(0, inputLength - 1);
          return newString;
        }
      }
    });
  }

  async function getCurrencyList() {
    try {
      const currenies = await listFiatCurrencies();

      const sourted = currenies.sort((a, b) => a.id.localeCompare(b.id));
      setLocalStorageItem('currenciesList', JSON.stringify(sourted));

      setCurrencies(sourted);
      setListData(sourted);
    } catch (err) {
      console.log(err);
    }
  }

  async function getCurrentSettings() {
    const currentCurrency = await getLocalStorageItem('currency');

    if (currentCurrency) setCurrentCurrency(currentCurrency);
  }

  async function saveCurrencySettings(selectedCurrency) {
    setIsLoading(true);
    const didSave = await setLocalStorageItem('currency', selectedCurrency);
    const fiat = await fetchFiatRates();
    const [fiatRate] = fiat.filter(rate => {
      return rate.coin.toLowerCase() === selectedCurrency.toLowerCase();
    });
    toggleNodeInformation({fiatStats: fiatRate});

    if (didSave) {
      navigate.goBack();
    } else {
      console.log('NOOO');
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },

  input: {
    width: '95%',
    // height: 35,
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
