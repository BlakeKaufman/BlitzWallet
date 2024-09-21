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
import {getClipboardText, retrieveData, storeData} from '../../../functions';
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
import {GlobalThemeView, ThemeText} from '../../../functions/CustomElements';
import {WINDOWWIDTH} from '../../../constants/theme';
import SuggestedWordContainer from '../../../components/login/suggestedWords';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ANDROIDSAFEAREA} from '../../../constants/styles';
import CustomButton from '../../../functions/CustomElements/button';
import * as Clipboard from 'expo-clipboard';
// const NUMKEYS = Array.from(new Array(12), (val, index) => index + 1);

export default function RestoreWallet({
  navigation: {navigate},
  route: {params},
}) {
  const {t} = useTranslation();
  const isInitialRender = useRef(true);
  const {setContactsPrivateKey, theme} = useGlobalContextProvider();

  const isKeyboardShowing = getKeyboardHeight().keyboardHeight > 0;
  const insets = useSafeAreaInsets();

  console.log(params);

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

  const [selectedKey, setSelectedKey] = useState('');
  const [currentWord, setCurrentWord] = useState('');

  const [isValidating, setIsValidating] = useState(false);
  const keyElements = createInputKeys();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{flex: 1}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={{flex: 1}}>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: theme
              ? COLORS.darkModeBackground
              : COLORS.lightModeBackground,
          }}>
          {isValidating ? (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <ActivityIndicator
                color={theme ? COLORS.darkModeText : COLORS.lightModeText}
                size="large"
              />
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
              <View
                style={{
                  flex: 1,
                  width: WINDOWWIDTH,
                  ...CENTER,
                  paddingTop: insets.top < 20 ? ANDROIDSAFEAREA : 0,
                  paddingBottom: !isKeyboardShowing
                    ? insets.top < 20
                      ? ANDROIDSAFEAREA
                      : 0
                    : 0,
                }}>
                <Back_BTN
                  navigation={navigate}
                  destination={params ? params.goBackName : 'Home'}
                />

                <ThemeText
                  styles={{...styles.headerText}}
                  content={
                    params
                      ? `Let's confirm your backup!`
                      : t('createAccount.restoreWallet.home.header')
                  }
                />

                <ScrollView style={styles.contentContainer}>
                  {keyElements}
                </ScrollView>
                <CustomButton
                  buttonStyles={{
                    width: 145,
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    marginTop: 20,
                    marginBottom: 20,
                    paddingVertical: Platform.OS == 'ios' ? 5 : 0,
                    ...CENTER,
                  }}
                  textStyles={{
                    paddingVertical: 0,
                  }}
                  textContent={'Paste'}
                  actionFunction={getClipboardText}
                />

                {!isKeyboardShowing && (
                  <>
                    {params ? (
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                          marginVertical: 20,
                        }}>
                        <CustomButton
                          buttonStyles={{
                            width: 145,
                            marginTop: 'auto',

                            marginRight: 20,
                          }}
                          textStyles={{
                            fontSize: SIZES.large,
                            color: COLORS.lightModeText,
                            paddingVertical: 5,
                          }}
                          textContent={'Skip'}
                          actionFunction={() =>
                            navigate('PinSetup', {isInitialLoad: true})
                          }
                        />
                        <CustomButton
                          buttonStyles={{
                            width: 145,
                            backgroundColor: COLORS.primary,
                            marginTop: 'auto',
                          }}
                          textStyles={{
                            fontSize: SIZES.large,
                            color: COLORS.darkModeText,
                            paddingVertical: 5,
                          }}
                          textContent={'Verify'}
                          actionFunction={didEnterCorrectSeed}
                        />
                      </View>
                    ) : (
                      <CustomButton
                        buttonStyles={{
                          width: 'auto',
                          ...CENTER,
                          marginBottom: 20,
                        }}
                        textStyles={{
                          fontSize: SIZES.large,
                        }}
                        actionFunction={keyValidation}
                        textContent={t(
                          'createAccount.restoreWallet.home.continueBTN',
                        )}
                      />
                    )}
                  </>
                )}
              </View>

              {isKeyboardShowing && (
                <SuggestedWordContainer
                  currentWord={currentWord}
                  setCurrentWord={setCurrentWord}
                  setSelectedKey={setSelectedKey}
                  setKey={setKey}
                  selectedKey={selectedKey}
                  NUMKEYS={NUMKEYS}
                />
              )}
            </>
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );

  function handleInputElement(e, keyNumber) {
    setKey(prev => {
      return {...prev, [`key${keyNumber}`]: e};
    });

    setCurrentWord(e);
  }

  async function getClipboardText() {
    const data = await Clipboard.getStringAsync();
    if (!data) return;
    const splitSeed = data.split(' ');

    if (splitSeed.length != 12) return;
    console.log(Object.entries(key));

    const filledOutSeed = Object.entries(key).map((item, index) => {
      console.log(item);
      return [item[0], splitSeed[index].trim()];
    });
    const newKeys = Object.entries(key).reduce((acc, key) => {
      const index = Object.entries(acc).length;
      acc[key[0]] = splitSeed[index];
      return acc;
    }, {});
    // const newKeys = new Map(filledOutSeed);
    setKey(newKeys);
    console.log(newKeys);
  }

  function createInputKeys() {
    let keyRows = [];
    let keyItem = [];
    NUMKEYS.forEach(item => {
      const [ref, number] = item;
      keyItem.push(
        <View
          key={number}
          style={{
            ...styles.seedItem,
            paddingVertical: Platform.OS === 'ios' ? 10 : 0,
            backgroundColor: theme
              ? COLORS.darkModeBackgroundOffset
              : COLORS.darkModeText,
          }}>
          <ThemeText styles={{...styles.numberText}} content={`${number}.`} />
          {/* <Text style={styles.numberText}>{number}.</Text> */}
          <TextInput
            ref={ref}
            autoFocus={number === 0}
            value={key[`key${number}`]}
            onTouchEnd={() => {
              setSelectedKey(number);
              setCurrentWord(key[`key${number}`] || '');
            }}
            onSubmitEditing={({nativeEvent: {text, eventCount, target}}) => {
              setKey(prev => {
                return {...prev, [`key${number}`]: text};
              });

              if (number === 12) {
                // setIsKeyboardShowing(false);
                NUMKEYS[11][0].current.blur();
                setCurrentWord('');
                return;
              }
              NUMKEYS[number][0].current.focus();
              setCurrentWord('');
              setSelectedKey(number + 1);
              console.log('END SUMBIT ENDING', text, eventCount, target);
            }}
            blurOnSubmit={false}
            cursorColor={COLORS.lightModeText}
            onChangeText={e => handleInputElement(e, number)}
            style={{...styles.textInputStyle, color: COLORS.lightModeText}}
          />
        </View>,
      );
      if (number % 2 === 0) {
        keyRows.push(
          <View
            key={`row${number - 1}`}
            style={[styles.seedRow, {marginBottom: number != 12 ? 10 : 0}]}>
            {keyItem}
          </View>,
        );
        keyItem = [];
      }
    });
    return keyRows;
  }

  async function didEnterCorrectSeed() {
    const keys = await retrieveData('mnemonic');
    const didEnterAllKeys =
      Object.keys(key).filter(value => key[value]).length === 12;

    if (!didEnterAllKeys) {
      navigate('ErrorScreen', {
        errorMessage: t('createAccount.restoreWallet.home.error1'),
      });

      return;
    }
    const enteredMnemonic = Object.values(key).map(val =>
      val.trim().toLowerCase(),
    );
    const savedMnemonic = keys.split(' ').filter(item => item);

    if (JSON.stringify(savedMnemonic) === JSON.stringify(enteredMnemonic)) {
      navigate('PinSetup', {didRestoreWallet: true});
    } else {
      navigate('ErrorScreen', {
        errorMessage: 'Your words are not the same as the generated words',
      });
    }
  }

  async function keyValidation() {
    setIsValidating(true);
    const enteredKeys =
      Object.keys(key).filter(value => key[value]).length === 12;

    if (!enteredKeys) {
      setIsValidating(false);
      navigate('ErrorScreen', {
        errorMessage: t('createAccount.restoreWallet.home.error1'),
      });
      return;
    }
    const mnemonic = Object.values(key).map(val => val.trim().toLowerCase());

    const hasAccount = await isValidMnemonic(mnemonic);
    const hasPin = await retrieveData('pin');

    if (!hasAccount) {
      setIsValidating(false);
      navigate('ErrorScreen', {
        errorMessage: t('createAccount.restoreWallet.home.error2'),
      });
      return;
    } else {
      const privateKey = nip06.privateKeyFromSeedWords(mnemonic.join(' '));
      storeData('mnemonic', mnemonic.join(' '));
      setContactsPrivateKey(privateKey);
      if (hasPin)
        navigate('ConnectingToNodeLoadingScreen', {didRestoreWallet: false});
      else navigate('PinSetup', {didRestoreWallet: false});
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
    textAlign: 'center',
    marginBottom: 30,
    ...CENTER,
  },
  contentContainer: {
    flex: 1,
    width: '90%',
    ...CENTER,
    // maxHeight: 200,
  },
  seedRow: {
    width: '100%',

    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  seedItem: {
    width: '48%',

    // borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',

    // paddingBottom: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  numberText: {
    fontSize: SIZES.large,
    marginRight: 10,
  },
  textInputStyle: {
    width: '90%',
    fontSize: SIZES.large,
  },
  continueBTN: {
    fontSize: SIZES.large,
    fontFamily: FONT.Other_Regular,
    color: COLORS.background,
  },
});
