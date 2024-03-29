import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {Back_BTN, KeyContainer} from '../../../components/login';
import {Background, COLORS, FONT, SHADOWS, SIZES} from '../../../constants';
import {useState} from 'react';
import {storeData, retrieveData} from '../../../functions/secureStore';
import generateMnemnoic from '../../../functions/seed';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';

export default function GenerateKey({navigation: {navigate}}) {
  const [generateTries, setGenerateTries] = useState(0);
  const [mnemonic, setMnemonic] = useState([]);
  const [fetchError, setFetchError] = useState(false);
  const insets = useSafeAreaInsets();
  const {t} = useTranslation();

  useState(async () => {
    if (await retrieveData('mnemonic')) {
      const keys = await retrieveData('mnemonic');
      setMnemonic(keys.split(' '));

      return;
    }
    getMnemnoic();
  }, []);

  async function getMnemnoic() {
    try {
      const mnemonic = await generateMnemnoic();

      if (findDuplicates(mnemonic)) {
        if (generateTries === 5)
          throw new Error('unable to generate unique mneomic');

        setGenerateTries(prev => (prev = prev + 1));
        generateMnemnoic();
        return;
      }

      setMnemonic(mnemonic.split(' '));
      storeData('mnemonic', mnemonic);
    } catch (err) {
      setFetchError(true);
    }
  }

  function findDuplicates(wordArr) {
    let duplicateWords = {};
    let hasDuplicates = false;

    wordArr.split(' ').forEach(word => {
      const lowerCaseWord = word.toLowerCase();
      if (duplicateWords[lowerCaseWord]) duplicateWords[lowerCaseWord]++;
      else duplicateWords[lowerCaseWord] = 1;
    });

    Object.keys(duplicateWords).forEach(word => {
      if (duplicateWords[word] != 1) hasDuplicates = true;
    });

    return hasDuplicates;
  }

  return (
    <View style={Background}>
      <SafeAreaView style={[styles.global_container]}>
        <Back_BTN navigation={navigate} destination="StartKeyGeneration" />
        <View style={styles.container}>
          <Text style={styles.header}>
            {t('createAccount.generateKeyPage.header')}
          </Text>
          <Text style={styles.subHeader}>
            {t('createAccount.generateKeyPage.subHeader')}
          </Text>
          {!fetchError && (
            <View style={{flex: 1, paddingBottom: 10}}>
              <ScrollView>
                <KeyContainer keys={mnemonic} />
              </ScrollView>
            </View>
          )}
          {fetchError && (
            <View>
              <Text>{t('createAccount.generateKeyPage.errorText')}</Text>
            </View>
          )}
          <View
            style={{
              width: '90%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: Platform.OS === 'android' ? insets.bottom + 5 : 0,
            }}>
            <TouchableOpacity
              onPress={() => {
                navigate('PinSetup');
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
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  global_container: {
    flex: 1,
  },
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
