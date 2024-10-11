import {
  SafeAreaView,
  Text,
  View,
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
import {CENTER, COLORS, FONT, SIZES} from '../../../constants';
import {useRef, useState} from 'react';
import isValidMnemonic from '../../../functions/isValidMnemonic';

import {useTranslation} from 'react-i18next';
import useGetKeyboardHeight from '../../../hooks/getKeyboardHeight';

import {useGlobalContextProvider} from '../../../../context-store/context';
import {nip06} from 'nostr-tools';

import {ThemeText} from '../../../functions/CustomElements';
import {WINDOWWIDTH} from '../../../constants/theme';
import SuggestedWordContainer from '../../../components/login/suggestedWords';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ANDROIDSAFEAREA} from '../../../constants/styles';
import CustomButton from '../../../functions/CustomElements/button';
import * as Clipboard from 'expo-clipboard';

const NUMARRAY = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function RestoreWallet({
  navigation: {navigate},
  route: {params},
}) {
  const {t} = useTranslation();
  const {setContactsPrivateKey, theme} = useGlobalContextProvider();
  const isKeyboardShowing = useGetKeyboardHeight().keyboardHeight > 0;
  const insets = useSafeAreaInsets();

  const [isValidating, setIsValidating] = useState(false);
  const [currentFocused, setCurrentFocused] = useState(1);
  const keyRefs = useRef({});
  const [inputedKey, setInputedKey] = useState({
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

  function handleInputElement(text, keyNumber) {
    setInputedKey(prev => ({...prev, [`key${keyNumber}`]: text}));
  }

  function handleFocus(keyNumber) {
    setCurrentFocused(keyNumber); // Update the current focused key
  }
  function handleSubmit(keyNumber) {
    if (keyNumber < 12) {
      const nextKey = keyNumber + 1;
      keyRefs.current[nextKey]?.focus(); // Focus the next input
    } else {
      keyRefs.current[12]?.blur(); // Blur the last input
    }
  }

  function createInputKeys() {
    let keyRows = [];
    let keyItem = [];
    NUMARRAY.forEach(item => {
      keyItem.push(
        <View
          key={item}
          style={{
            ...styles.seedItem,
            paddingVertical: Platform.OS === 'ios' ? 10 : 0,
            backgroundColor: theme
              ? COLORS.darkModeBackgroundOffset
              : COLORS.darkModeText,
          }}>
          <ThemeText styles={{...styles.numberText}} content={`${item}.`} />
          <TextInput
            ref={ref => (keyRefs.current[item] = ref)} // Store ref for each input
            value={inputedKey[`key${item}`]}
            onFocus={() => handleFocus(item)} // Track the currently focused input
            onSubmitEditing={() => handleSubmit(item)} // Move to next input on submit
            onChangeText={e => handleInputElement(e, item)}
            blurOnSubmit={false}
            cursorColor={COLORS.lightModeText}
            style={{...styles.textInputStyle, color: COLORS.lightModeText}}
          />
        </View>,
      );
      if (item % 2 === 0) {
        keyRows.push(
          <View
            key={`row${item - 1}`}
            style={[styles.seedRow, {marginBottom: item !== 12 ? 10 : 0}]}>
            {keyItem}
          </View>,
        );
        keyItem = [];
      }
    });
    return keyRows;
  }

  // const NUMKEYS = Array.from(new Array(12), (val, index) => [
  //   useRef(null),
  //   index + 1,
  // ]);
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
                    paddingVertical: 5,
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
                          width: '90%',
                          flexDirection: 'row',
                          justifyContent: 'center',
                          marginVertical: 20,
                          ...CENTER,
                        }}>
                        <CustomButton
                          buttonStyles={{
                            width: 145,
                            marginTop: 'auto',

                            marginRight: 10,
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
                  inputedKey={inputedKey}
                  setInputedKey={setInputedKey}
                  selectedKey={currentFocused}
                  keyRefs={keyRefs}
                />
              )}
            </>
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );

  async function getClipboardText() {
    const data = await Clipboard.getStringAsync();
    if (!data) return;
    const splitSeed = data.split(' ');

    if (splitSeed.length != 12) return;
    console.log(Object.entries(inputedKey));

    const newKeys = Object.entries(inputedKey).reduce((acc, key) => {
      const index = Object.entries(acc).length;
      acc[key[0]] = splitSeed[index];
      return acc;
    }, {});

    setInputedKey(newKeys);
  }

  async function didEnterCorrectSeed() {
    const keys = await retrieveData('mnemonic');
    const didEnterAllKeys =
      Object.keys(inputedKey).filter(value => inputedKey[value]).length === 12;

    if (!didEnterAllKeys) {
      navigate('ErrorScreen', {
        errorMessage: t('createAccount.restoreWallet.home.error1'),
      });

      return;
    }
    const enteredMnemonic = Object.values(inputedKey).map(val =>
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
      Object.keys(inputedKey).filter(value => inputedKey[value]).length === 12;

    if (!enteredKeys) {
      setIsValidating(false);
      navigate('ErrorScreen', {
        errorMessage: t('createAccount.restoreWallet.home.error1'),
      });
      return;
    }
    const mnemonic = Object.values(inputedKey).map(val =>
      val.trim().toLowerCase(),
    );

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
