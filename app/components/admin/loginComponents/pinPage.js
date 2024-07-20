import {useEffect, useState} from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

import {
  getLocalStorageItem,
  retrieveData,
  setColorScheme,
  terminateAccount,
} from '../../../functions';
import {COLORS, FONT, ICONS, SHADOWS, SIZES} from '../../../constants';
import {useTranslation} from 'react-i18next';
import {useGlobalContextProvider} from '../../../../context-store/context';
import {ThemeText} from '../../../functions/CustomElements';
import {backArrow} from '../../../constants/styles';
import KeyForKeyboard from '../../../functions/CustomElements/key';
import RNRestart from 'react-native-restart';

export default function PinPage(props) {
  const [pin, setPin] = useState([null, null, null, null]);
  const [error, setError] = useState(false);
  const [pinEnterCount, setPinEnterCount] = useState(0);
  const {selectedLanguage, theme} = useGlobalContextProvider();
  const {t} = useTranslation();

  function formatSpanish(data) {
    let array = data.split(8);
    const newValue = 8 - pinEnterCount;

    for (let i = array.length - 1; i >= 1; i--) {
      array[i + 1] = array[i];
    }

    array[1] = newValue;

    return array;
  }

  useEffect(() => {
    const filteredPin = pin.filter(pin => {
      if (typeof pin === 'number') return true;
    });

    if (filteredPin.length != 4) return;

    (async () => {
      const stored = JSON.parse(await retrieveData('pin'));

      if (JSON.stringify(pin) === JSON.stringify(stored)) {
        clearSettings();

        if (props.fromBackground) {
          if (props.navigation.canGoBack()) props.navigation.goBack();
          else props.navigation.replace('ConnectingToNodeLoadingScreen');
        } else
          props.navigation.replace('ConnectingToNodeLoadingScreen', {
            isInitialLoad: false,
          });
      } else {
        if (pinEnterCount === 7) {
          setTimeout(async () => {
            const deleted = await terminateAccount();
            if (deleted) {
              clearSettings();
              RNRestart.restart();
            } else console.log('ERRROR');
          }, 2000);
        } else {
          if (error) return;
          setError(true);
          setPinEnterCount(prev => (prev += 1));
          setTimeout(() => {
            setError(false);
            setPin([null, null, null, null]);
          }, 500);
        }
      }
    })();
  }, [pin]);

  return (
    <View style={styles.contentContainer}>
      <ThemeText
        styles={{...styles.header}}
        content={
          error
            ? t('adminLogin.pinPage.wrongPinError')
            : t('adminLogin.pinPage.enterPinMessage')
        }
      />
      <ThemeText
        styles={{...styles.enterText}}
        content={
          selectedLanguage === 'sp'
            ? formatSpanish(t('adminLogin.pinPage.attemptsText'))
            : 8 - pinEnterCount + ' ' + t('adminLogin.pinPage.attemptsText')
        }
      />

      <View style={styles.dotContainer}>
        <View
          style={[
            typeof pin[0] === 'number'
              ? {
                  backgroundColor: theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                }
              : {
                  backgroundColor: theme
                    ? COLORS.darkModeBackgroundOffset
                    : COLORS.lightModeBackgroundOffset,
                },
            ,
            styles.dot,
          ]}></View>
        <View
          style={[
            typeof pin[1] === 'number'
              ? {
                  backgroundColor: theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                }
              : {
                  backgroundColor: theme
                    ? COLORS.darkModeBackgroundOffset
                    : COLORS.lightModeBackgroundOffset,
                },
            ,
            styles.dot,
          ]}></View>
        <View
          style={[
            typeof pin[2] === 'number'
              ? {
                  backgroundColor: theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                }
              : {
                  backgroundColor: theme
                    ? COLORS.darkModeBackgroundOffset
                    : COLORS.lightModeBackgroundOffset,
                },
            ,
            styles.dot,
          ]}></View>
        <View
          style={[
            typeof pin[3] === 'number'
              ? {
                  backgroundColor: theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                }
              : {
                  backgroundColor: theme
                    ? COLORS.darkModeBackgroundOffset
                    : COLORS.lightModeBackgroundOffset,
                },
            ,
            styles.dot,
          ]}></View>
      </View>
      <View style={styles.keyboardContainer}>
        <View style={styles.keyboard_row}>
          <KeyForKeyboard num={1} addPin={addPin} />
          <KeyForKeyboard num={2} addPin={addPin} />
          <KeyForKeyboard num={3} addPin={addPin} />
        </View>
        <View style={styles.keyboard_row}>
          <KeyForKeyboard num={4} addPin={addPin} />
          <KeyForKeyboard num={5} addPin={addPin} />
          <KeyForKeyboard num={6} addPin={addPin} />
        </View>
        <View style={styles.keyboard_row}>
          <KeyForKeyboard num={7} addPin={addPin} />
          <KeyForKeyboard num={8} addPin={addPin} />
          <KeyForKeyboard num={9} addPin={addPin} />
        </View>
        <View style={styles.keyboard_row}>
          <KeyForKeyboard num={'C'} addPin={addPin} />
          <KeyForKeyboard num={0} addPin={addPin} />
          <KeyForKeyboard num={'back'} addPin={addPin} />
        </View>
      </View>
    </View>
  );

  function addPin(id) {
    if (typeof id != 'number') {
      if (id === null) {
        setPin(prev => {
          const nullIndex = pin.indexOf(null);

          return prev.map((item, id) => {
            if (id === nullIndex - 1) {
              return null;
            } else if (nullIndex === -1 && id === 3) {
              return null;
            } else return item;
          });
        });
      } else setPin([null, null, null, null]);
    } else {
      setPin(prev => {
        const nullIndex = pin.indexOf(null);

        return prev.map((number, count) => {
          if (count === nullIndex) {
            return id;
          } else return number;
        });
      });
    }
  }
  function clearSettings() {
    setPin([null, null, null, null]);
    setError(false);
    setPinEnterCount(0);
  }
}

const styles = StyleSheet.create({
  contentContainer: {
    width: '90%',
    flex: 1,
    alignItems: 'center',
    marginRight: 'auto',
    marginLeft: 'auto',
  },
  header: {
    fontSize: SIZES.xLarge,
    marginTop: 50,
  },
  enterText: {
    fontSize: SIZES.large,
    marginBottom: 30,
  },

  dotContainer: {
    width: 150,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },

  dot_active: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    // backgroundColor: COLORS.primary,
  },
  keyboardContainer: {
    width: '100%',
    marginTop: 'auto',
  },
  keyboard_row: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  key: {
    width: '33.33333333333333%',
    height: 80,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: SIZES.xLarge,
  },
});
