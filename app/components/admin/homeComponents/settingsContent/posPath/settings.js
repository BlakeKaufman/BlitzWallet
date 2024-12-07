import {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {useNavigation} from '@react-navigation/native';
import {CENTER, COLORS, VALID_USERNAME_REGEX} from '../../../../../constants';
import {FONT, SIZES, WINDOWWIDTH} from '../../../../../constants/theme';
import {ThemeText} from '../../../../../functions/CustomElements';
import CustomButton from '../../../../../functions/CustomElements/button';
import {canUsePOSName} from '../../../../../../db';
import openWebBrowser from '../../../../../functions/openWebBrowser';

export default function PosSettingsPage() {
  const isInitialRender = useRef(true);
  const {
    theme,
    toggleNodeInformation,
    masterInfoObject,
    toggleMasterInfoObject,
    darkModeType,
  } = useGlobalContextProvider();
  const [currencies, setCurrencies] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [listData, setListData] = useState([]);
  const [storeNameInput, setStoreNameInput] = useState(
    masterInfoObject?.posSettings?.storeName,
  );
  const [isStoreNameFocused, setIsStoreNameFocused] = useState(false);
  const currentCurrency = masterInfoObject?.posSettings?.storeCurrency;

  const navigate = useNavigation();

  useEffect(() => {
    if (isInitialRender.current) {
      const savedCurrencies = masterInfoObject.fiatCurrenciesList || [];

      setCurrencies(savedCurrencies);
      setListData(savedCurrencies);

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
            .startsWith(textInput.toLocaleLowerCase()) ||
          currency.id.toLowerCase().startsWith(textInput.toLocaleLowerCase())
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
        style={[
          styles.currencyContainer,

          {
            marginBottom: id === currencies.length - 1 ? 30 : 0,
            marginTop: id === 0 ? 10 : 0,
          },
        ]}
        onPress={() => {
          setTextInput('');
          savePOSSettings({storeCurrency: currency.id}, 'currency');
          Keyboard.dismiss();
        }}>
        <ThemeText
          styles={{
            color: theme
              ? currency.id?.toLowerCase() === currentCurrency?.toLowerCase()
                ? darkModeType
                  ? COLORS.lightsOutBackgroundOffset
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      style={styles.container}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={{flex: 1, width: '90%', ...CENTER}}>
          <ThemeText styles={{marginTop: 20}} content={'Store name'} />
          <TextInput
            // onKeyPress={handleKeyPress}
            onFocus={() => {
              setIsStoreNameFocused(true);
            }}
            onChangeText={e => {
              setIsStoreNameFocused(true);
              console.log(e);
              setStoreNameInput(e);
            }}
            onBlur={() => {
              setIsStoreNameFocused(false);
            }}
            style={[
              styles.input,
              {
                backgroundColor: COLORS.darkModeText,
                color: COLORS.lightModeText,
              },
            ]}
            placeholderTextColor={COLORS.lightModeText}
            placeholder="Enter store name"
            value={storeNameInput}
          />
          <ThemeText styles={{marginTop: 20}} content={'Display currency'} />
          <TextInput
            // onKeyPress={handleKeyPress}
            value={textInput}
            onChangeText={setTextInput}
            style={[
              styles.input,
              {
                backgroundColor: COLORS.darkModeText,
                color: COLORS.lightModeText,
              },
            ]}
            placeholderTextColor={COLORS.lightModeText}
            placeholder={currentCurrency}
          />

          <FlatList
            style={{
              flex: 1,
              width: '100%',
            }}
            data={listData}
            renderItem={({item, index}) => (
              <CurrencyElements id={index} currency={item} />
            )}
            keyExtractor={currency => currency.id}
            showsVerticalScrollIndicator={false}
          />

          <CustomButton
            buttonStyles={{width: '100%', marginTop: 'auto'}}
            actionFunction={() => {
              navigate.navigate('POSInstructionsPath');
            }}
            textContent={'See employee instructions'}
          />
          <CustomButton
            buttonStyles={{
              width: '65%',
              marginTop: 20,
              ...CENTER,
              backgroundColor:
                theme && darkModeType ? COLORS.darkModeText : COLORS.primary,
            }}
            textStyles={{
              color:
                theme && darkModeType
                  ? COLORS.lightModeText
                  : COLORS.darkModeText,
            }}
            actionFunction={() => {
              if (
                isStoreNameFocused &&
                masterInfoObject.posSettings.storeName != storeNameInput
              ) {
                savePOSSettings(
                  {
                    storeName: storeNameInput.trim(),
                    storeNameLower: storeNameInput.trim().toLowerCase(),
                  },
                  'storeName',
                );
                return;
              } else {
                openWebBrowser({
                  navigate,
                  link: `https://pay.blitz-wallet.com/${masterInfoObject.posSettings.storeName}`,
                });
              }
            }}
            textContent={
              isStoreNameFocused &&
              masterInfoObject.posSettings.storeName != storeNameInput
                ? 'Save'
                : 'Open POS'
            }
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

  async function savePOSSettings(newData, type) {
    if (type === 'storeName') {
      if (
        newData.storeNameLower === masterInfoObject.posSettings.storeNameLower
      ) {
        navigate.navigate('ErrorScreen', {errorMessage: 'Name already in use'});
        return;
      }
      if (!VALID_USERNAME_REGEX.test(newData.storeNameLower)) {
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Name can only include letters and numbers. ',
        });
        return;
      }

      const isValidPosName = await canUsePOSName(
        'blitzWalletUsers',
        newData.storeNameLower,
      );
      if (!isValidPosName) {
        navigate.navigate('ErrorScreen', {errorMessage: 'Name already taken'});
        setStoreNameInput(masterInfoObject.posSettings.storeName);
        return;
      }
      setIsStoreNameFocused(false);
    }
    toggleMasterInfoObject({
      posSettings: {
        ...masterInfoObject.posSettings,
        ...newData,
      },
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  input: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 5,

    ...CENTER,
  },

  currencyContainer: {
    width: '100%',

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
