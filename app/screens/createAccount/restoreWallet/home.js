import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {Back_BTN} from '../../../components/login';
import {retrieveData, storeData} from '../../../functions';
import {BTN, CENTER, COLORS, FONT, SIZES} from '../../../constants';
import {useEffect, useRef, useState} from 'react';
import isValidMnemonic from '../../../functions/isValidMnemonic';

import * as Device from 'expo-device';
import {useTranslation} from 'react-i18next';
import getKeyboardHeight from '../../../hooks/getKeyboardHeight';
import {Wordlists} from '@dreson4/react-native-quick-bip39';
import {useGlobalContextProvider} from '../../../../context-store/context';
import {nip06} from 'nostr-tools';
import {KeyboardState} from 'react-native-reanimated';
import {GlobalThemeView} from '../../../functions/CustomElements';
// const NUMKEYS = Array.from(new Array(12), (val, index) => index + 1);

export default function RestoreWallet({navigation: {navigate}}) {
  const {t} = useTranslation();
  const {setContactsPrivateKey, theme} = useGlobalContextProvider();
  const isKeyboardShowing = getKeyboardHeight().keyboardHeight > 0;

  console.log(isKeyboardShowing);
  const [key, setKey] = useState({
    key1: null,
    key2: null,
    key3: null,
    key4: null,
    key5: null,
    key6: null,
    key7: null,
    key8: null,
    key9: null,
    key10: null,
    key11: null,
    key12: null,
  });

  const NUMKEYS = Array.from(new Array(12), (val, index) => [
    useRef(null),
    index + 1,
  ]);

  useEffect(() => {
    // function onKeyboardWillHide() {
    //   setIsKeyboardShowing(false);
    // }
    // function onKeyboardWillShow() {
    //   setIsKeyboardShowing(true);
    // }

    // const isGoingToHide = Keyboard.addListener(
    //   'keyboardWillHide',
    //   onKeyboardWillHide,
    // );
    // const isGoingToShow = Keyboard.addListener(
    //   'keyboardWillShow',
    //   onKeyboardWillShow,
    // );

    NUMKEYS[0][0].current.focus();
    setSelectedKey(1);
    // return () => {
    //   isGoingToHide.remove();
    //   isGoingToShow.remove();
    // };
  }, []);

  const [selectedKey, setSelectedKey] = useState('');
  const [currentWord, setCurrentWord] = useState('');

  console.log(selectedKey);

  const [isValidating, setIsValidating] = useState(false);
  const keyElements = createInputKeys();

  const suggestedWordElements = Wordlists.en
    .filter(word => word.toLowerCase().startsWith(currentWord.toLowerCase()))
    .map(word => {
      return (
        <TouchableOpacity
          style={{
            borderColor: COLORS.primary,
            borderWidth: 3,
            borderRadius: 8,
            overflow: 'hidden',
          }}
          onPress={() => {
            setKey(prev => {
              return {...prev, [`key${selectedKey}`]: word};
            });

            if (selectedKey === 12) {
              // setIsKeyboardShowing(false);
              NUMKEYS[11][0].current.blur();
              setCurrentWord('');
              return;
            }
            NUMKEYS[selectedKey][0].current.focus();
            setCurrentWord('');
            setSelectedKey(selectedKey + 1);
          }}
          key={word}>
          <Text
            allowFontScaling={false}
            style={{
              fontSize: SIZES.medium,
              fontFamily: FONT.Title_Regular,
              paddingVertical: 5,
              paddingHorizontal: 10,
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
            }}>
            {word}
          </Text>
        </TouchableOpacity>
      );
    });

  return (
    <GlobalThemeView>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{flex: 1}}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          style={{flex: 1}}>
          {isValidating ? (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <ActivityIndicator size="large" />
              <Text
                style={{
                  fontFamily: FONT.Title_Regular,
                  fontSize: SIZES.large,
                  marginTop: 10,
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                }}>
                Validating seed phrase
              </Text>
            </View>
          ) : (
            <>
              <Back_BTN navigation={navigate} destination="Home" />
              <Text style={styles.headerText}>
                {t('createAccount.restoreWallet.home.header')}
              </Text>

              <ScrollView style={styles.contentContainer}>
                {keyElements}
              </ScrollView>
              {isKeyboardShowing && (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    marginTop: 20,
                  }}>
                  {suggestedWordElements.splice(0, 3)}
                </View>
              )}
              {!isKeyboardShowing && (
                <TouchableOpacity
                  onPress={keyValidation}
                  style={[
                    BTN,
                    {
                      backgroundColor: COLORS.primary,
                    },
                    CENTER,
                  ]}>
                  <Text style={styles.continueBTN}>
                    {t('createAccount.restoreWallet.home.continueBTN')}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </GlobalThemeView>
  );

  function handleInputElement(e, keyNumber) {
    setKey(prev => {
      return {...prev, [`key${keyNumber}`]: e};
    });

    setCurrentWord(e);
  }

  function createInputKeys() {
    let keyRows = [];
    let keyItem = [];
    NUMKEYS.forEach(item => {
      const [ref, number] = item;
      keyItem.push(
        <View key={number} style={styles.seedItem}>
          <Text style={styles.numberText}>{number}.</Text>
          <TextInput
            ref={ref}
            value={key[`key${number}`]}
            onTouchEnd={() => {
              setSelectedKey(number);
              setCurrentWord(key[`key${number}`] || '');
            }}
            cursorColor={COLORS.lightModeText}
            onChangeText={e => handleInputElement(e, number)}
            style={styles.textInputStyle}
          />
        </View>,
      );
      if (number % 2 === 0) {
        keyRows.push(
          <View
            key={`row${number - 1}`}
            style={[styles.seedRow, {marginBottom: number != 12 ? 40 : 0}]}>
            {keyItem}
          </View>,
        );
        keyItem = [];
      }
    });
    return keyRows;
  }

  async function keyValidation() {
    setIsValidating(true);
    const enteredKeys =
      Object.keys(key).filter(value => key[value]).length === 12;

    console.log(key);

    if (!enteredKeys) {
      setIsValidating(false);
      navigate('RestoreWalletError', {
        reason: t('createAccount.restoreWallet.home.error1'),
        type: 'inputKeys',
      });
      return;
    }
    const mnemonic = Object.values(key).map(val => val.trim().toLowerCase());

    const hasAccount = await isValidMnemonic(mnemonic);
    const hasPin = await retrieveData('pin');

    if (!hasAccount) {
      setIsValidating(false);
      navigate('RestoreWalletError', {
        reason: t('createAccount.restoreWallet.home.error2'),
        type: 'mnemoicError',
      });
      return;
    } else {
      const privateKey = nip06.privateKeyFromSeedWords(mnemonic.join(' '));
      storeData('mnemonic', mnemonic.join(' '));
      setContactsPrivateKey(privateKey);
      if (hasPin)
        navigate('ConnectingToNodeLoadingScreen', {isInitialLoad: false});
      else navigate('PinSetup', {isInitialLoad: false});
    }
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
    backgroundColor: COLORS.lightModeBackground,
  },

  headerText: {
    width: '95%',
    fontSize: SIZES.xLarge,
    fontFamily: FONT.Title_Bold,
    textAlign: 'center',
    marginBottom: 10,
    color: COLORS.lightModeText,
    ...CENTER,
  },
  contentContainer: {
    flex: 1,
    width: '90%',
    ...CENTER,
  },
  seedRow: {
    width: '100%',

    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  seedItem: {
    width: '48%',

    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 5,
  },
  numberText: {
    width: 'auto',
    fontSize: SIZES.large,
    fontFamily: FONT.Title_Regular,
    paddingRight: 10,
    color: COLORS.primary,
  },
  textInputStyle: {
    width: '75%',

    fontSize: SIZES.large,
    color: COLORS.lightModeText,
  },
  continueBTN: {
    fontSize: SIZES.large,
    fontFamily: FONT.Other_Regular,
    color: COLORS.background,
  },
});
