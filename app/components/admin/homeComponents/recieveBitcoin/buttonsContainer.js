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

export default function ButtonsContainer(props) {
  const navigate = useNavigation();
  return (
    <>
      {((props.isSwapCreated && props.selectedRecieveOption === 'liquid') ||
        props.selectedRecieveOption === 'lightning') && (
        <View
          style={[
            styles.buttonsContainer,
            {
              width:
                props.selectedRecieveOption != 'bitcoin' &&
                props.selectedRecieveOption != 'liquid'
                  ? '90%'
                  : '60%',
              marginBottom: Device.osName === 'Android' ? 10 : 0,
            },
          ]}>
          <TouchableOpacity
            onPress={openShareOptions}
            style={[
              styles.buttonsOpacity,
              {opacity: props.generatingInvoiceQRCode ? 0.5 : 1},
            ]}>
            <Text style={styles.buttonText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={copyToClipboard}
            style={[
              styles.buttonsOpacity,
              {opacity: props.generatingInvoiceQRCode ? 0.5 : 1},
            ]}>
            <Text style={styles.buttonText}>Copy</Text>
          </TouchableOpacity>
          {props.selectedRecieveOption != 'bitcoin' &&
            props.selectedRecieveOption != 'liquid' && (
              <TouchableOpacity
                onPress={() => props.setEditPaymentPopup(true)}
                style={[styles.buttonsOpacity]}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
            )}
        </View>
      )}
    </>
  );

  async function copyToClipboard() {
    try {
      if (props.generatingInvoiceQRCode) return;
      const activeAddress = props.generatedAddress[props.selectedRecieveOption];
      // props.selectedRecieveOption === 'lightning'
      //   ? props.generatedAddress.lightning
      //   : props.selectedRecieveOption === 'bitcion'
      //   ? props.generatedAddress.bitcoin
      //   : props.generatedAddress.liquid;
      await Clipboard.setStringAsync(activeAddress);
      navigate.navigate('ClipboardCopyPopup', {didCopy: true});
      return;

      // Alert.alert('Text Copied to Clipboard');
    } catch (err) {
      navigate.navigate('ClipboardCopyPopup', {didCopy: false});
      // Alert.alert('ERROR WITH COPYING');
    }
  }

  async function openShareOptions() {
    try {
      if (props.generatingInvoiceQRCode) return;
      await Share.share({
        message: props.generatedAddress[props.selectedRecieveOption],
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
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    // overflow: "hidden",
    ...SHADOWS.medium,
  },
  buttonText: {
    fontFamily: FONT.Other_Regular,
    fontSize: SIZES.medium,
    color: COLORS.background,
  },
});
