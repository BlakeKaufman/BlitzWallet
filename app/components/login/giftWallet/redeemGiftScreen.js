import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ANDROIDSAFEAREA, BTN, CENTER} from '../../../constants/styles';
import Back_BTN from '../back_BTN';
import {useNavigation} from '@react-navigation/native';
import {COLORS, FONT, ICONS, SIZES} from '../../../constants';
import {useGlobalContextProvider} from '../../../../context-store/context';
import getKeyboardHeight from '../../../hooks/getKeyboardHeight';
import {useEffect, useState} from 'react';
import {xorEncodeDecode} from '../../admin/homeComponents/fundGift/encodeDecode';
import isValidMnemonic from '../../../functions/isValidMnemonic';
import {gdk} from '../../../functions/liquidWallet';
import {storeData} from '../../../functions';

export default function RedeemGiftScreen() {
  const {theme} = useGlobalContextProvider();
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  const [giftContent, setGiftContent] = useState('');
  const [giftCode, setGiftCode] = useState('');

  return (
    <View
      style={{
        backgroundColor: theme
          ? COLORS.darkModeBackground
          : COLORS.lightModeBackground,
        flex: 1,
        paddingTop: insets.top < 20 ? ANDROIDSAFEAREA : insets.top,
        paddingBottom: insets.bottom < 20 ? ANDROIDSAFEAREA : insets.bottom,
      }}>
      <TouchableWithoutFeedback
        onPress={() => {
          setIsKeyboardActive(false);
          Keyboard.dismiss();
        }}>
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : null}>
          <Back_BTN navigation={navigate.navigate} destination={'Home'} />
          <View style={styles.contentContainer}>
            <View>
              <Text
                style={[
                  styles.headerText,
                  {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                ]}>
                Redeem your gift!
              </Text>
              <Text
                style={[
                  styles.subHeaderText,
                  {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                ]}>
                Do not claim a gift from a person you do not 100% trust. By
                using this feature you acknowledge the risks of your seedphrase
                being leaked.
              </Text>
            </View>
            <View style={styles.inputTextContainer}>
              <TextInput
                onFocus={() => {
                  setIsKeyboardActive(true);
                }}
                placeholderTextColor={
                  theme ? COLORS.darkModeText : COLORS.lightModeText
                }
                value={giftContent}
                onChangeText={setGiftContent}
                placeholder="Gift content"
                style={styles.textInputStyle}
              />
              <TouchableOpacity
                onPress={() => {
                  navigate.navigate('CameraModal', {
                    updateBitcoinAdressFunc: setGiftContent,
                  });
                }}
                style={styles.QRcodeContainer}>
                <Image style={styles.QRcodeIcon} source={ICONS.QRcodeIcon} />
              </TouchableOpacity>
            </View>
            <View style={styles.inputTextContainer}>
              <TextInput
                onFocus={() => {
                  setIsKeyboardActive(true);
                }}
                placeholderTextColor={
                  theme ? COLORS.darkModeText : COLORS.lightModeText
                }
                value={giftCode}
                onChangeText={setGiftCode}
                placeholder="Gift code"
                style={styles.textInputStyle}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              if (isKeyboardActive) {
                Keyboard.dismiss();
                setIsKeyboardActive(false);
                return;
              }

              claimGift();
            }}
            activeOpacity={isKeyboardActive ? 0 : 0.2}
            style={[
              BTN,
              {
                backgroundColor: COLORS.primary,
                ...CENTER,
                marginBottom: Platform.OS === 'ios' ? 10 : 0,
                opacity: isKeyboardActive
                  ? 0
                  : giftCode.trim().length === 0 ||
                    giftContent.trim().length === 0
                  ? 0.2
                  : 1,
              },
            ]}>
            <Text
              style={{
                color: COLORS.darkModeText,
                fontFamily: FONT.Title_Regular,
                fontSize: SIZES.medium,
              }}>
              Claim
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );

  async function claimGift() {
    const mnemoinc = xorEncodeDecode(giftContent, giftCode);

    const isValid = gdk.validateMnemonic(mnemoinc);
    console.log(isValid);

    if (isValid) {
      const didStore = await storeData('mnemonic', mnemoinc);
      if (didStore) navigate.navigate('PinSetup');
      else
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Error storing seedphrase',
        });
    } else
      navigate.navigate('ErrorScreen', {
        errorMessage:
          'Not a valid seedphrase. Either your claim code or content is incorrect.',
      });

    // console.log(mnemoinc.split(' '), 'TEST');
  }
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    width: '90%',
    ...CENTER,
    justifyContent: 'center',
  },
  headerText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.xLarge,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subHeaderText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
    marginBottom: 20,
  },

  textInputStyle: {
    width: '100%',
    borderRadius: 5,
    borderWidth: 1,
    paddingVertical: 15,
    marginVertical: 10,
    paddingLeft: 10,
    paddingRight: 40,
  },
  inputTextContainer: {
    position: 'relative',
    width: '100%',
  },

  QRcodeContainer: {
    position: 'absolute',
    height: 25,
    width: 25,
    right: 10,
    top: 22.5,
  },

  QRcodeIcon: {
    width: '100%',
    height: '100%',
  },
});
