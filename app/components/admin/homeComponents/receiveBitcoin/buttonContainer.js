import {Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {CENTER, COLORS, FONT, SHADOWS, SIZES} from '../../../../constants';
import * as Clipboard from 'expo-clipboard';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {copyToClipboard} from '../../../../functions';
import CustomButton from '../../../../functions/CustomElements/button';
import {ThemeText} from '../../../../functions/CustomElements';
import {useTranslation} from 'react-i18next';

export default function ButtonsContainer(props) {
  const navigate = useNavigation();
  const {theme} = useGlobalContextProvider();
  const {t} = useTranslation();
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
          textContent={t('constants.edit')}
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
          textContent={t('constants.copy')}
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
        <ThemeText
          styles={{
            ...styles.secondaryButtonText,
            paddingVertical: Platform.OS === 'ios' ? 5 : 2,
          }}
          content={t('wallet.receivePages.buttonContainer.format')}
        />
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
    paddingHorizontal: 12,
  },
});
