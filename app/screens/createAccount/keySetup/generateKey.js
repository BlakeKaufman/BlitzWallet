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
import {COLORS, FONT, SIZES} from '../../../constants';
import {useState} from 'react';
import {retrieveData} from '../../../functions/secureStore';
import generateMnemnoic from '../../../functions/seed';
import {useTranslation} from 'react-i18next';
import {useGlobalContextProvider} from '../../../../context-store/context';
import {GlobalThemeView} from '../../../functions/CustomElements';

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
      <Back_BTN navigation={navigate} destination="StartKeyGeneration" />
      <View style={styles.container}>
        <Text style={styles.header}>
          {t('createAccount.generateKeyPage.header')}
        </Text>
        <Text style={styles.subHeader}>
          {t('createAccount.generateKeyPage.subHeader')}
        </Text>
        {!fetchError ? (
          mnemonic.length != 0 ? (
            <View style={{flex: 1, paddingBottom: 10}}>
              <ScrollView>
                <KeyContainer keys={mnemonic} />
              </ScrollView>
            </View>
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
        <View
          style={{
            width: '90%',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <TouchableOpacity
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
          </TouchableOpacity>
        </View>
      </View>
    </GlobalThemeView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '95%',
    flex: 1,
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 20,
    justifyContent: 'center',
  },

  header: {
    fontSize: SIZES.xLarge,
    fontFamily: FONT.Title_Bold,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.lightModeText,
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

  text: {
    color: COLORS.white,
    fontSize: SIZES.large,
    fontFamily: FONT.Other_Regular,
  },
});
