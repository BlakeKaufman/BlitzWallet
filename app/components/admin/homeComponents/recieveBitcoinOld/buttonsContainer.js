import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Share,
  Alert,
} from 'react-native';
import {COLORS, CENTER, FONT, SHADOWS, SIZES} from '../../../../constants';
import * as Clipboard from 'expo-clipboard';
import * as Device from 'expo-device';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {copyToClipboard} from '../../../../functions';

export default function ButtonsContainer(props) {
  const navigate = useNavigation();
  const {theme} = useGlobalContextProvider();

  const containerTheme = theme ? COLORS.darkModeText : COLORS.lightModeText;
  const textTheme = theme ? COLORS.lightModeText : COLORS.darkModeText;
  return (
    <View
      style={[
        styles.buttonsContainer,
        {
          width: '90%',
          marginBottom: Device.osName === 'Android' ? 10 : 0,
        },
      ]}>
      <TouchableOpacity
        onPress={openShareOptions}
        style={[
          styles.buttonsOpacity,
          {
            opacity: !props.generatedAddress ? 0.5 : 1,
            backgroundColor: containerTheme,
          },
        ]}>
        <Text style={[styles.buttonText, {color: textTheme}]}>Share</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          if (props.generatedAddress) return;
          const data = props.generatedAddress;

          copyToClipboard(data, navigate);
        }}
        style={[
          styles.buttonsOpacity,
          {
            opacity: !props.generatedAddress ? 0.5 : 1,
            backgroundColor: containerTheme,
          },
        ]}>
        <Text style={[styles.buttonText, {color: textTheme}]}>Copy</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => props.setEditPaymentPopup(true)}
        style={[styles.buttonsOpacity, {backgroundColor: containerTheme}]}>
        <Text style={[styles.buttonText, {color: textTheme}]}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  async function openShareOptions() {
    try {
      if (props.generatingInvoiceQRCode) return;
      await Share.share({
        message: props.generatedAddress,
      });
    } catch {
      window.alert('ERROR with sharing');
    }
  }
}

const styles = StyleSheet.create({
  buttonsContainer: {
    width: '90%',
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...CENTER,
    marginTop: 'auto',
  },
  buttonsOpacity: {
    height: '100%',
    width: 100,
    // backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    // overflow: "hidden",
    ...SHADOWS.medium,
  },
  buttonText: {
    fontFamily: FONT.Other_Regular,
    fontSize: SIZES.medium,
    // color: COLORS.background,
  },
});
