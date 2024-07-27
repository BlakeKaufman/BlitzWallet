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
import {BTN, CENTER} from '../../../constants/styles';
import Back_BTN from '../back_BTN';
import {useNavigation} from '@react-navigation/native';
import {COLORS, FONT, ICONS, SIZES} from '../../../constants';
import {useGlobalContextProvider} from '../../../../context-store/context';
import {useState} from 'react';
import {xorEncodeDecode} from '../../admin/homeComponents/fundGift/encodeDecode';
import {gdk} from '../../../functions/liquidWallet';
import {storeData} from '../../../functions';
import {GlobalThemeView, ThemeText} from '../../../functions/CustomElements';
import {WINDOWWIDTH} from '../../../constants/theme';
import CustomButton from '../../../functions/CustomElements/button';

export default function RedeemGiftScreen() {
  const {theme} = useGlobalContextProvider();
  const navigate = useNavigation();
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  const [giftContent, setGiftContent] = useState('');
  const [giftCode, setGiftCode] = useState('');

  return (
    <GlobalThemeView>
      <TouchableWithoutFeedback
        onPress={() => {
          setIsKeyboardActive(false);
          Keyboard.dismiss();
        }}>
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : null}>
          <View style={{flex: 1, width: WINDOWWIDTH, ...CENTER}}>
            <Back_BTN navigation={navigate.navigate} destination={'Home'} />
            <View style={styles.contentContainer}>
              <View>
                <ThemeText
                  styles={{...styles.headerText}}
                  content={'Redeem your gift!'}
                />
                <ThemeText
                  styles={{...styles.subHeaderText}}
                  content={`Do not claim a gift from a person you do not 100% trust. By using this feature you acknowledge the risks of your seedphrase being leaked.`}
                />
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
                  <Image
                    style={styles.QRcodeIcon}
                    source={ICONS.scanQrCodeDark}
                  />
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

            {!isKeyboardActive && (
              <CustomButton
                buttonStyles={{
                  width: 200,
                  ...CENTER,
                  backgroundColor: COLORS.primary,
                  marginBottom: 20,
                  opacity:
                    giftCode.trim().length === 0 ||
                    giftContent.trim().length === 0
                      ? 0.2
                      : 1,
                }}
                textStyles={{
                  fontSize: SIZES.large,
                  color: COLORS.darkModeText,
                }}
                actionFunction={() => {
                  if (
                    giftCode.trim().length === 0 ||
                    giftContent.trim().length === 0
                  )
                    return;
                  // if (isKeyboardActive) {
                  //   Keyboard.dismiss();
                  //   setIsKeyboardActive(false);
                  //   return;
                  // }

                  claimGift();
                }}
                textContent={'Claim'}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </GlobalThemeView>
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
    alignItems: 'center',
  },

  QRcodeContainer: {
    position: 'absolute',
    top: '50%',
    right: 10,
    transform: [{translateY: -12.5}],
  },

  QRcodeIcon: {
    height: 25,
    width: 25,
  },
});
