import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {CENTER, COLORS, FONT, SHADOWS, SIZES} from '../../../../constants';
import * as Clipboard from 'expo-clipboard';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {copyToClipboard} from '../../../../functions';
import CustomButton from '../../../../functions/CustomElements/button';

export default function ButtonsContainer(props) {
  const navigate = useNavigation();
  const {theme} = useGlobalContextProvider();
  return (
    <View style={styles.buttonContainer}>
      <View style={styles.buttonRow}>
        <CustomButton
          buttonStyles={{...styles.mainButtons, marginRight: 10}}
          textStyles={{...styles.mainButtonsText}}
          actionFunction={() =>
            navigate.navigate('EditReceivePaymentInformation', {
              // setSendingAmount: props.setSendingAmount,
              // setPaymentDescription: props.setPaymentDescription,
              from: 'receivePage',
            })
          }
          textContent={'Edit'}
        />
        <CustomButton
          buttonStyles={{
            ...styles.mainButtons,
            opacity: props.generatingInvoiceQRCode ? 0.5 : 1,
          }}
          textStyles={{...styles.mainButtonsText}}
          actionFunction={() => {
            if (props.generatingInvoiceQRCode) return;
            copyToClipboard(props.generatedAddress, navigate);
          }}
          textContent={'Copy'}
        />
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
          Choose format
        </Text>
      </TouchableOpacity>
    </View>
  );

  function EditButtoinFunc() {}
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',

    marginVertical: 30,
    overflow: 'hidden',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  mainButtons: {
    width: 125,
    maxWidth: '45%',
  },
  mainButtonsText: {
    fontSize: SIZES.large,
  },

  secondaryButton: {
    width: 'auto',
    borderRadius: 8,
    borderWidth: 1,
    ...CENTER,
  },
  secondaryButtonText: {
    fontFamily: FONT.Other_Regular,
    fontSize: SIZES.medium,
    paddingVertical: 2,
    paddingHorizontal: 12,
  },
});
