import {
  Animated,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  TextInput,
  TouchableWithoutFeedback,
  useColorScheme,
  Keyboard,
  Platform,
} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../constants';

import {useEffect, useRef, useState} from 'react';
import {sign} from '@bitcoinerlab/secp256k1';

export default function EditAmountPopup(props) {
  const [numSats, setNumSats] = useState('');
  const [description, setdescription] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  function fadeIn() {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }
  function fadeOut() {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }

  useEffect(() => {
    if (props.isDisplayed) fadeIn();
    else fadeOut();
  }, [props.isDisplayed]);

  useEffect(() => {
    setNumSats('');
    setdescription('');
  }, [props.type]);

  return (
    <Animated.View
      style={[
        styles.popupContainer,
        {opacity: fadeAnim},
        {zIndex: props.isDisplayed ? 1 : -1},
      ]}>
      {/* <KeyboardAvoidingView
        style={{height: '100%', width: '100%', justifyContent: 'flex-end'}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}> */}
      <TouchableWithoutFeedback
        onPress={() => {
          props.setIsDisplayed(false);
          Keyboard.dismiss();
        }}>
        <View
          style={{height: '100%', width: '100%', justifyContent: 'flex-end'}}>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: props.theme
                  ? COLORS.darkModeBackground
                  : COLORS.lightModeBackground,
              },
            ]}>
            <Text
              style={[
                styles.inputHeader,
                {
                  color: props.theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                },
              ]}>
              Edit Payment Detials
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: props.theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                  color: props.theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                },
              ]}
              placeholder="Amount (sat)"
              placeholderTextColor={
                props.theme ? COLORS.darkModeText : COLORS.lightModeText
              }
              onChangeText={setNumSats}
              keyboardType="numeric"
              value={numSats}
            />
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: props.theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                  color: props.theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                },
              ]}
              placeholder="Description (optional)"
              placeholderTextColor={
                props.theme ? COLORS.darkModeText : COLORS.lightModeText
              }
              keyboardType="ascii-capable"
              onChangeText={setdescription}
              value={description}
            />
            <TouchableOpacity
              onPress={() => {
                saveChanges();
                props.setUpdateQRCode(prev => (prev += 1));
              }}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
      {/* // </KeyboardAvoidingView> */}
    </Animated.View>
  );

  function saveChanges() {
    try {
      // if (isNaN(Number(numSats))) throw Error('Not a number');
      if (numSats) {
        props.setSendingAmount(prev => {
          if (props.type === 'lightning')
            return {...prev, lightning: Number(numSats) * 1000};
          else if (props.type === 'bitcoin')
            return {...prev, bitcoin: Number(numSats) * 1000};
          else return {...prev, liquid: Number(numSats) * 1000};
        });
      } else
        props.setSendingAmount({
          lightning: 1000,
          bitcoin: 1000,
          liquid: 1000,
        });

      if (description) {
        props.setPaymentDescription(prev => {
          if (props.type === 'lightning')
            return {...prev, lightning: description};
          else if (props.type === 'bitcoin')
            return {...prev, bitcoin: description};
          else return {...prev, liquid: description};
        });
      } else
        props.setPaymentDescription({
          lightning: '',
          bitcoin: '',
          liquid: '',
        });

      Keyboard.dismiss();
      props.setIsDisplayed(false);
    } catch (err) {
      console.log(err);
    }
  }
}

const styles = StyleSheet.create({
  popupContainer: {
    width: '100%',
    height: '100%',

    position: 'absolute',
    top: 0,
    left: 0,

    backgroundColor: COLORS.opaicityGray,
  },

  inputContainer: {
    width: '100%',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  inputHeader: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: FONT.Title_Bold,
  },
  input: {
    width: '100%',
    height: 40,
    marginBottom: 20,

    borderWidth: 2,
    padding: 0,
    paddingLeft: 10,

    borderRadius: 10,
    fontSize: SIZES.medium,
    fontFamily: FONT.Descriptoin_Regular,
  },
  saveText: {
    color: COLORS.primary,
    fontSize: SIZES.large,
    fontFamily: FONT.Other_Bold,
    marginLeft: 'auto',
    marginBottom: 20,
  },
});
