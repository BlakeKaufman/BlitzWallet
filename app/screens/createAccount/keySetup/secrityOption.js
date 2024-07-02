import {Platform, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {Back_BTN, Continue_BTN} from '../../../components/login';
import {Background, COLORS, FONT, SIZES} from '../../../constants';
import {useTranslation} from 'react-i18next';
import {GlobalThemeView} from '../../../functions/CustomElements';

export default function SecuityOption({navigation: {navigate}}) {
  const {t} = useTranslation();
  return (
    <GlobalThemeView>
      <Back_BTN navigation={navigate} destination="DisclaimerPage" />
      <View style={styles.container}>
        <Text style={styles.header}>
          {t('createAccount.securityOptionPage.header')}
        </Text>
        <Text style={styles.subHeader}>
          {t('createAccount.securityOptionPage.subHeader')}
        </Text>
        <Continue_BTN
          navigation={navigate}
          text={t('createAccount.securityOptionPage.continueBTN')}
          destination="GenerateKey"
        />
      </View>
    </GlobalThemeView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    flex: 1,
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 20,
    justifyContent: 'center',
  },

  header: {
    maxWidth: 330,
    fontSize: SIZES.xLarge,
    fontFamily: FONT.Title_Bold,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.lightModeText,
  },
  subHeader: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Descriptoin_Regular,
    textAlign: 'center',

    color: COLORS.lightModeText,
  },
});
