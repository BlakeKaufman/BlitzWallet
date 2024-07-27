import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {Back_BTN, KeyContainer} from '../../../components/login';
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

export default function GenerateKey({navigation: {navigate}}) {
  const {setContactsPrivateKey} = useGlobalContextProvider();
  const [mnemonic, setMnemonic] = useState([]);
  const [fetchError, setFetchError] = useState(false);
  const {t} = useTranslation();

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
        {/* <Back_BTN navigation={navigate} destination="DisclaimerPage" /> */}
        <View style={styles.container}>
          <ThemeText
            styles={{...styles.header, marginTop: 30}}
            content={'This is your password'}></ThemeText>
          <ThemeText
            styles={{...styles.header}}
            content={'to your money, if you lose it you'}></ThemeText>
          <ThemeText
            styles={{...styles.header, marginBottom: 30}}
            content={'lose your money!'}></ThemeText>
          {/* <ThemeText
            styles={{...styles.header}}
            content={t('createAccount.generateKeyPage.header')}></ThemeText> */}

          {!fetchError ? (
            mnemonic.length != 0 ? (
              // <View style={{flex: 1}}>
              <ScrollView
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  justifyContent: 'center',
                  width: '100%',
                }}>
                <KeyContainer keys={mnemonic} />
              </ScrollView>
            ) : (
              // </View>
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
          <ThemeText content={'Write it down with'} />
          <ThemeText content={'pen and paper and keep it safe!'} />
          <ThemeText
            styles={{fontWeight: 'bold'}}
            content={'WE CAN NOT HELP YOU IF YOU LOSE IT'}
          />
          <View
            style={{
              width: '90%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 30,
            }}>
            {/* <CustomButton
              buttonStyles={{width: '40%', flex: 1, marginRight: 20}}
              textStyles={{...styles.buttonText, color: COLORS.lightModeText}}
              textContent={t('createAccount.generateKeyPage.button1')}
              actionFunction={() => navigate('PinSetup', {isInitialLoad: true})}
            /> */}
            <CustomButton
              buttonStyles={{
                width: 175,
                backgroundColor: COLORS.primary,
                marginTop: 'auto',
                marginBottom: 20,
                ...CENTER,
              }}
              textStyles={{
                fontSize: SIZES.large,
                color: COLORS.darkModeText,
                paddingVertical: 5,
              }}
              textContent={t('createAccount.generateKeyPage.button2')}
              actionFunction={() =>
                navigate('RestoreWallet', {
                  fromPath: 'newWallet',
                  goBackName: 'GenerateKey',
                })
              }
            />
            {/* <TouchableOpacity
              onPress={() => {
                navigate('PinSetup', {isInitialLoad: true});
              }}
              style={[
                styles.button,
                {
                  backgroundColor: 'transparent',
                  borderColor: COLORS.primary,
                  borderWidth: 2,
                },
              ]}>
              <Text style={[styles.text, {color: COLORS.lightModeText}]}>
                {t('createAccount.generateKeyPage.button1')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigate('VerifyKey');
              }}
              style={styles.button}>
              <Text style={styles.text}>
                {t('createAccount.generateKeyPage.button2')}
              </Text>
            </TouchableOpacity> */}
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
