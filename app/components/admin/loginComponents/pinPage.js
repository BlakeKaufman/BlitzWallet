import {useEffect, useState} from 'react';
import {
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
import {COLORS, FONT, SIZES} from '../../../constants';
import {useTranslation} from 'react-i18next';
import {useGlobalContextProvider} from '../../../../context-store/context';

export default function PinPage(props) {
  const [pin, setPin] = useState([null, null, null, null]);
  const [error, setError] = useState(false);
  const [pinEnterCount, setPinEnterCount] = useState(0);
  const {selectedLanguage} = useGlobalContextProvider();
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
        if (pinEnterCount === 8) {
          setTimeout(async () => {
            const deleted = await terminateAccount();

            if (deleted) {
              clearSettings();
              props.navigation.replace('Home');
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
      <Text
        style={[
          styles.header,
          {
            color: props.theme ? COLORS.darkModeText : COLORS.lightModeText,
          },
        ]}>
        {error
          ? t('adminLogin.pinPage.wrongPinError')
          : t('adminLogin.pinPage.enterPinMessage')}
      </Text>
      <Text
        style={[
          styles.enterText,
          {
            color: props.theme ? COLORS.darkModeText : COLORS.lightModeText,
          },
        ]}>
        {selectedLanguage === 'sp'
          ? formatSpanish(t('adminLogin.pinPage.attemptsText'))
          : 8 - pinEnterCount + ' ' + t('adminLogin.pinPage.attemptsText')}
      </Text>
      <View style={styles.dotContainer}>
        <View
          style={[
            typeof pin[0] === 'number'
              ? {
                  ...styles.dot_active,
                }
              : styles.dot,
            {
              borderColor: props.theme
                ? COLORS.darkModeText
                : COLORS.lightModeText,
            },
          ]}></View>
        <View
          style={[
            typeof pin[1] === 'number'
              ? {
                  ...styles.dot_active,
                }
              : styles.dot,
            {
              borderColor: props.theme
                ? COLORS.darkModeText
                : COLORS.lightModeText,
            },
          ]}></View>
        <View
          style={[
            typeof pin[2] === 'number'
              ? {
                  ...styles.dot_active,
                }
              : styles.dot,
            {
              borderColor: props.theme
                ? COLORS.darkModeText
                : COLORS.lightModeText,
            },
          ]}></View>
        <View
          style={[
            typeof pin[3] === 'number'
              ? {
                  ...styles.dot_active,
                }
              : styles.dot,
            {
              borderColor: props.theme
                ? COLORS.darkModeText
                : COLORS.lightModeText,
            },
          ]}></View>
      </View>
      <View style={styles.keyboardContainer}>
        <View style={styles.keyboard_row}>
          <TouchableOpacity onPress={() => addPin(1)} style={styles.key}>
            <Text
              style={[
                styles.keyText,
                {
                  color: props.theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                },
              ]}>
              1
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => addPin(2)} style={styles.key}>
            <Text
              style={[
                styles.keyText,
                {
                  color: props.theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                },
              ]}>
              2
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => addPin(3)} style={styles.key}>
            <Text
              style={[
                styles.keyText,
                {
                  color: props.theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                },
              ]}>
              3
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.keyboard_row}>
          <TouchableOpacity onPress={() => addPin(4)} style={styles.key}>
            <Text
              style={[
                styles.keyText,
                {
                  color: props.theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                },
              ]}>
              4
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => addPin(5)} style={styles.key}>
            <Text
              style={[
                styles.keyText,
                {
                  color: props.theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                },
              ]}>
              5
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => addPin(6)} style={styles.key}>
            <Text
              style={[
                styles.keyText,
                {
                  color: props.theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                },
              ]}>
              6
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.keyboard_row}>
          <TouchableOpacity onPress={() => addPin(7)} style={styles.key}>
            <Text
              style={[
                styles.keyText,
                {
                  color: props.theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                },
              ]}>
              7
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => addPin(8)} style={styles.key}>
            <Text
              style={[
                styles.keyText,
                {
                  color: props.theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                },
              ]}>
              8
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => addPin(9)} style={styles.key}>
            <Text
              style={[
                styles.keyText,
                {
                  color: props.theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                },
              ]}>
              9
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.keyboard_row}>
          <TouchableOpacity onPress={() => addPin(0)} style={styles.key}>
            <Text
              style={[
                styles.keyText,
                {
                  color: props.theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                },
              ]}>
              0
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => addPin(null)} style={styles.key}>
            <Text
              style={[
                styles.keyText,
                {
                  color: props.theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                },
              ]}>
              {'<--'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  function addPin(id) {
    if (typeof id != 'number') {
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
    width: '95%',
    textAlign: 'center',
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginTop: 50,
    marginBottom: 10,
    fontFamily: FONT.Title_Bold,
  },
  enterText: {
    fontSize: SIZES.small,
    fontWeight: 'bold',
    marginBottom: 30,
    fontFamily: FONT.Descriptoin_Bold,
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
    borderWidth: 1,
  },
  dot_active: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    backgroundColor: COLORS.primary,
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
    fontFamily: FONT.Other_Regular,
  },
});
