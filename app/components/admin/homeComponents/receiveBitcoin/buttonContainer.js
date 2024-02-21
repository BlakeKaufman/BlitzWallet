import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {CENTER, COLORS, FONT, SHADOWS, SIZES} from '../../../../constants';
import * as Clipboard from 'expo-clipboard';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../context-store/context';

export default function ButtonsContainer(props) {
  const navigate = useNavigation();
  const {theme} = useGlobalContextProvider();
  return (
    <View style={styles.buttonContainer}>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={() => {
            navigate.navigate('EditReceivePaymentInformation', {
              setSendingAmount: props.setSendingAmount,
              setPaymentDescription: props.setPaymentDescription,
            });
          }}
          style={[
            styles.mainButtons,
            {
              backgroundColor: theme
                ? COLORS.darkModeText
                : COLORS.lightModeText,
            },
          ]}>
          <Text
            style={[
              styles.mainButtonsText,
              {color: theme ? COLORS.lightModeText : COLORS.darkModeText},
            ]}>
            Edit
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (props.generatingInvoiceQRCode) return;
            copyToClipboard(props.generatedAddress);
          }}
          style={[
            styles.mainButtons,
            {
              backgroundColor: theme
                ? COLORS.darkModeText
                : COLORS.lightModeText,
              opacity: props.generatingInvoiceQRCode ? 0.5 : 1,
            },
          ]}>
          <Text
            style={[
              styles.mainButtonsText,
              {color: theme ? COLORS.lightModeText : COLORS.darkModeText},
            ]}>
            Copy
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={() => {
          navigate.navigate('SwitchReceiveOptionPage', {
            setSelectedRecieveOption: props.setSelectedRecieveOption,
          });
        }}
        style={[
          styles.secondaryButton,
          {borderColor: theme ? COLORS.darkModeText : COLORS.lightModeText},
        ]}>
        <Text
          style={[
            styles.secondaryButtonText,
            {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
          ]}>
          Change payment option
        </Text>
      </TouchableOpacity>
    </View>
  );

  async function copyToClipboard(address) {
    try {
      await Clipboard.setStringAsync(address);
      navigate.navigate('ClipboardCopyPopup', {didCopy: true});
      return;

      // Alert.alert('Text Copied to Clipboard');
    } catch (err) {
      navigate.navigate('ClipboardCopyPopup', {didCopy: false});
      // Alert.alert('ERROR WITH COPYING');
    }
  }
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: '95%',
    maxWidth: 250,
    // marginTop: 40,
    marginVertical: 30,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  mainButtons: {
    width: 120,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    ...SHADOWS.small,
  },
  mainButtonsText: {
    fontFamily: FONT.Other_Regular,
    fontSize: SIZES.large,
  },

  secondaryButton: {
    width: 'auto',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    ...CENTER,
  },
  secondaryButtonText: {
    fontFamily: FONT.Other_Regular,
    fontSize: SIZES.medium,
  },
});
