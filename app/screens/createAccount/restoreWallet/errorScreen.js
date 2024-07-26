import {
  KeyboardAvoidingView,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {BTN, CENTER, COLORS, FONT, SIZES} from '../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import CustomButton from '../../../functions/CustomElements/button';

export default function RestoreWalletError(props) {
  const {reason, type} = props.route.params;
  const navigate = useNavigation();
  const {t} = useTranslation();

  return (
    <View style={styles.globalContainer}>
      <SafeAreaView style={styles.innerContainer}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorHeader}>{reason}</Text>

          <CustomButton
            buttonStyles={{
              ...CENTER,
              marginTop: 20,
            }}
            textStyles={{
              fontSize: SIZES.large,
            }}
            actionFunction={() => navigate.goBack()}
            textContent={t('createAccount.restoreWallet.errorScreen.backBTN')}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
    backgroundColor: COLORS.opaicityGray,
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    width: '90%',
    height: 'auto',
    backgroundColor: COLORS.lightModeBackground,
    padding: 15,
    borderRadius: 8,
  },
  errorHeader: {
    fontSize: SIZES.large,
    fontFamily: FONT.Title_Bold,
    textAlign: 'center',
    color: COLORS.lightModeText,
  },
  BTNText: {
    fontSize: SIZES.large,
    fontFamily: FONT.Other_Regular,
    color: COLORS.background,
  },
});
