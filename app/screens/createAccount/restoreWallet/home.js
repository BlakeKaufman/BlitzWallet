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
} from 'react-native';
import {Back_BTN} from '../../../components/login';
import {retrieveData, storeData} from '../../../functions';
import {BTN, CENTER, COLORS, FONT, SIZES} from '../../../constants';
import {useState} from 'react';
import isValidMnemonic from '../../../functions/isValidMnemonic';

import * as Device from 'expo-device';
const NUMKEYS = Array.from(new Array(12), (val, index) => index + 1);

export default function RestoreWallet({navigation: {navigate}}) {
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

  const keyElements = createInputKeys();

  return (
    <View style={styles.globalContainer}>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
        style={{flex: 1}}>
        <KeyboardAvoidingView
          behavior={Device.osName === 'ios' ? 'padding' : 'height'}
          style={{flex: 1}}>
          <SafeAreaView style={{flex: 1}}>
            <Back_BTN navigation={navigate} destination="Home" />
            <Text style={styles.headerText}>Enter your seed phrase</Text>
            <ScrollView style={styles.contentContainer}>
              <View style={styles.seedContainer}>{keyElements}</View>
            </ScrollView>
            <TouchableOpacity
              onPress={keyValidation}
              style={[
                BTN,
                {
                  backgroundColor: COLORS.primary,
                  marginBottom: Device.osName === 'ios' ? 0 : 30,
                },
                CENTER,
              ]}>
              <Text style={styles.continueBTN}>Restore wallet</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );

  function handleInputElement(e, keyNumber) {
    setKey(prev => {
      return {...prev, [`key${keyNumber}`]: e};
    });
  }

  function createInputKeys() {
    let keyRows = [];
    let keyItem = [];
    NUMKEYS.forEach(number => {
      keyItem.push(
        <View key={number} style={styles.seedItem}>
          <Text style={styles.numberText}>{number}.</Text>
          <TextInput
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
    const enteredKeys =
      Object.keys(key).filter(value => key[value]).length === 12;

    if (!enteredKeys) {
      navigate('RestoreWalletError', {
        reason: 'Please enter all of your keys',
        type: 'inputKeys',
      });
      return;
    }
    const mnemonic = Object.values(key).map(val => val.toLowerCase());

    const hasAccount = await isValidMnemonic(mnemonic);
    const hasPin = await retrieveData('pin');

    if (!hasAccount) {
      navigate('RestoreWalletError', {
        reason: 'This is not a valid mnemoinc.',
        type: 'mnemoicError',
      });
      return;
    } else {
      storeData('mnemonic', mnemonic.join(' '));
      if (hasPin) navigate('ConnectingToNodeLoadingScreen');
      else navigate('PinSetup');
    }
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
    backgroundColor: COLORS.lightModeBackground,
  },

  headerText: {
    fontSize: SIZES.xLarge,
    fontFamily: FONT.Title_Bold,
    textAlign: 'center',
    marginBottom: 10,
    color: COLORS.lightModeText,
  },
  contentContainer: {
    flex: 1,
  },
  seedContainer: {
    width: '80%',
    height: 'auto',
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
