import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {KeyContainer} from '../../../components/login';
import {CENTER, COLORS, FONT, SIZES} from '../../../constants';
import {useState} from 'react';
import {retrieveData} from '../../../functions/secureStore';
import generateMnemnoic from '../../../functions/seed';
import {useTranslation} from 'react-i18next';
import {useGlobalContextProvider} from '../../../../context-store/context';
import {GlobalThemeView, ThemeText} from '../../../functions/CustomElements';
import LoginNavbar from '../../../components/login/navBar';
import {WINDOWWIDTH} from '../../../constants/theme';
import CustomButton from '../../../functions/CustomElements/button';
import {copyToClipboard} from '../../../functions';
import {useNavigation} from '@react-navigation/native';

export default function GenerateKey({navigation: {navigate}}) {
  const {setContactsPrivateKey} = useGlobalContextProvider();
  const [mnemonic, setMnemonic] = useState([]);
  const [fetchError, setFetchError] = useState(false);
  const {t} = useTranslation();
  const hookNavigate = useNavigation();

  useState(async () => {
    if (await retrieveData('mnemonic')) {
      const keys = await retrieveData('mnemonic');
      setMnemonic(keys.split(' '));

      return;
    }

    const mnemonic = generateMnemnoic(setContactsPrivateKey);

    if (mnemonic) setMnemonic(mnemonic.split(' '));
    else setFetchError(true);
  }, []);

  return (
    <GlobalThemeView>
      <View style={styles.contentContainer}>
        <LoginNavbar destination={'DisclaimerPage'} />

        <View style={styles.container}>
          <ThemeText
            styles={{...styles.header, marginTop: 30, marginBottom: 30}}
            content={t('createAccount.generateKeyPage.header')}
          />

          {!fetchError ? (
            mnemonic.length != 0 ? (
              <ScrollView
                showsHorizontalScrollIndicator={false}
                style={{
                  flex: 1,
                  width: '90%',
                  marginBottom: 20,
                  ...CENTER,
                }}>
                <KeyContainer keys={mnemonic} />
              </ScrollView>
            ) : (
              <ActivityIndicator
                size="large"
                style={{marginTop: 'auto', marginBottom: 'auto'}}
              />
            )
          ) : (
            <View
              style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <Text style={[styles.text, {color: COLORS.lightModeText}]}>
                {t('createAccount.generateKeyPage.errorText')}
              </Text>
            </View>
          )}
          <ThemeText
            styles={{width: '80%', textAlign: 'center'}}
            content={t('createAccount.generateKeyPage.subHeader')}
          />
          <ThemeText
            styles={{fontWeight: 'bold'}}
            content={t('createAccount.generateKeyPage.disclaimer')}
          />
          <View
            style={{
              width: '90%',
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 30,
            }}>
            <CustomButton
              buttonStyles={{
                width: 145,
                marginRight: 10,
                opacity: mnemonic.length === 0 ? 0.5 : 1,
              }}
              textStyles={{
                fontSize: SIZES.large,
                paddingVertical: 5,
              }}
              textContent={t('constants.copy')}
              actionFunction={() => {
                if (mnemonic.length === 0) return;
                copyToClipboard(mnemonic.join(' '), hookNavigate);
              }}
            />
            <CustomButton
              buttonStyles={{
                width: 145,
                backgroundColor: COLORS.primary,
              }}
              textStyles={{
                fontSize: SIZES.large,
                color: COLORS.darkModeText,
                paddingVertical: 5,
              }}
              textContent={t('constants.next')}
              actionFunction={() =>
                navigate('RestoreWallet', {
                  fromPath: 'newWallet',
                  goBackName: 'GenerateKey',
                })
              }
            />
          </View>
        </View>
      </View>
    </GlobalThemeView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    width: WINDOWWIDTH,
    ...CENTER,
  },
  container: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 20,
    justifyContent: 'center',
  },

  header: {
    width: '80%',
    textAlign: 'center',
    // marginBottom: 15,
    // marginTop: 30,
  },
  subHeader: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Descriptoin_Regular,
    textAlign: 'center',
    marginBottom: 20,
    color: COLORS.lightModeText,
  },

  button: {
    width: '45%',
    height: 45,

    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,

    borderRadius: 5,
  },

  buttonText: {
    fontSize: SIZES.large,
    paddingVertical: 5,
  },
});
