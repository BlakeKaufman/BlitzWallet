import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {Back_BTN, DynamicKeyContainer} from '../../../components/login';
import {BTN, Background, COLORS, FONT, SIZES} from '../../../constants';
import {useEffect, useState} from 'react';
import {retrieveData, shuffleArray} from '../../../functions';

export default function VerifyKey({navigation: {navigate}}) {
  const [mnemonic, setMnemonic] = useState([]);
  const [validationMnemonic, setValidationMnemonic] = useState([]);
  const [currentGuess, setCurrentGuess] = useState(['', 0]);
  const [headerText, setHeaderText] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await retrieveData('mnemonic');
      const tempValidation = shuffleArray(data.split(' ')).map(string => [
        string, //name
        false, // is selected
        null, // is correct
        null, // num selected
      ]);

      setMnemonic(data.split(' '));

      setValidationMnemonic(tempValidation);
    })();
  }, []);

  function countGuesses(id) {
    validationMnemonic.forEach(item => {
      if (item[0] === id) {
        if (!item[1]) setCurrentGuess(prev => [id, (prev[1] += 1)]);
        else setCurrentGuess(prev => [id, (prev[1] -= 1)]);
      }
    });
  }
  useEffect(() => {
    setValidationMnemonic(prev => {
      return prev.map(key => {
        const correctPos =
          mnemonic.indexOf(currentGuess[0]) == currentGuess[1] - 1;

        if (key[0] === currentGuess[0]) {
          return [key[0], !key[1], correctPos, key[1] ? null : currentGuess[1]];
        } else return key;
      });
    });
  }, [currentGuess]);

  useEffect(() => {
    let text;
    const newArr = validationMnemonic.filter(key => key[1] && !key[2]);
    if (newArr.length === 0 && currentGuess[1] != 12) {
      text = 'Tap the words in the correct order';
    } else if (newArr.length > 0) {
      text = `Sorry, that's not the correct ${numToStringNum(
        currentGuess[1],
      )} word. Give it another try.`;
    } else {
      text = 'Perfect. Make sure to securely store your recovery phrase.';
    }

    setHeaderText(text);
  }, [validationMnemonic, currentGuess]);

  useEffect(() => {
    setIsValid(
      validationMnemonic.filter(key => key[1] && !key[2]).length === 0 &&
        currentGuess[1] === 12,
    );
  }, [validationMnemonic, currentGuess]);

  return (
    <View style={[Background, {paddingBottom: Platform.OS === 'ios' ? 0 : 15}]}>
      <SafeAreaView style={styles.global_container}>
        <Back_BTN navigation={navigate} destination="GenerateKey" />
        <View style={styles.container}>
          <Text style={styles.header}>{headerText}</Text>
          <DynamicKeyContainer
            countGuesses={countGuesses}
            for="keyVarify"
            keys={validationMnemonic}
          />
          <TouchableOpacity
            onPress={() => navigate('GenerateKey')}
            style={[
              styles.showMe_container,
              BTN,
              {backgroundColor: COLORS.lightModeBackground, marginTop: 'auto'},
            ]}>
            <Text style={[styles.showMeText]}>Show me again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={nextPage}
            style={[
              BTN,
              isValid
                ? styles.container_withClick
                : styles.container_withoutClick,
              {marginTop: 0},
            ]}>
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );

  function numToStringNum(num) {
    switch (num) {
      case 1:
        return 'first';
      case 2:
        return 'second';
      case 3:
        return 'third';
      case 4:
        return 'fourth';
      case 5:
        return 'fifth';
      case 6:
        return 'sixth';
      case 7:
        return 'seventh';
      case 8:
        return 'eighth';
      case 9:
        return 'ninth';
      case 10:
        return 'tenth';
      case 11:
        return 'eleventh';
      case 12:
        return 'twelveth';
      default:
        break;
    }
  }
  function nextPage() {
    if (!isValid) return;
    navigate('PinSetup');
  }
}

const styles = StyleSheet.create({
  global_container: {
    flex: 1,
  },
  container: {
    width: '90%',
    maxWidth: 400,
    flex: 1,
    alignItems: 'center',

    marginRight: 'auto',
    marginLeft: 'auto',
  },
  header: {
    width: '95%',
    maxWidth: 320,
    fontSize: SIZES.xLarge,
    fontFamily: FONT.Title_Bold,
    fontWeight: 'bold',

    textAlign: 'center',

    marginRight: 'auto',
    marginLeft: 'auto',
    marginVertical: 20,
    color: COLORS.lightModeText,
  },
  showMeAgain: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  continueBTN: {
    marginTop: 'unset',
  },

  showMe_container: {
    width: '90%',
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',

    borderWidth: 1,
    marginBottom: 20,
    marginTop: 'auto',
  },
  showMeText: {
    fontSize: SIZES.large,
    fontFamily: FONT.Other_Regular,
    color: COLORS.lightModeText,
  },

  container_withClick: {
    width: '90%',
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,

    opacity: 1,
  },
  container_withoutClick: {
    width: '90%',
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,

    opacity: 0.2,
  },
  continueText: {
    color: COLORS.white,
    fontSize: SIZES.large,
    fontFamily: FONT.Other_Regular,
  },
});
