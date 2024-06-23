import {useEffect, useRef, useState} from 'react';
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {retrieveData, storeData, terminateAccount} from '../../../functions';
import {CENTER, COLORS, FONT, SIZES} from '../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useGlobalContextProvider} from '../../../../context-store/context';
import {GlobalThemeView, ThemeText} from '../../../functions/CustomElements';

export default function PinPage(props) {
  const [pin, setPin] = useState([null, null, null, null]);
  const [confirmPin, setConfirmPin] = useState([]);
  const [pinNotMatched, setPinNotMatched] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [pinEnterCount, setPinEnterCount] = useState(0);
  const navigate = useNavigation();
  const {selectedLanguage, theme} = useGlobalContextProvider();
  const {t} = useTranslation();
  // const fromGiftPath = props.route.params?.from === 'giftPath';
  const isInitialLoad = props.route.params?.isInitialLoad;

  useEffect(() => {
    const filteredPin = pin.filter(pin => {
      if (typeof pin === 'number') return true;
    });
    if (filteredPin.length != 4) return;
    if (confirmPin.length === 0) {
      setConfirmPin(pin);
      setPin([null, null, null, null]);
      setIsConfirming(true);
      return;
    }
    (async () => {
      if (pin.toString() === confirmPin.toString()) {
        storeData('pin', JSON.stringify(confirmPin));
        clearSettings();
        navigate.navigate('ConnectingToNodeLoadingScreen', {
          // fromGiftPath: fromGiftPath,
          isInitialLoad: isInitialLoad,
        });
        return;
      } else {
        if (pinEnterCount === 8) {
          setTimeout(async () => {
            const deleted = await terminateAccount();

            if (deleted) {
              clearSettings();
              navigate.reset('Home');
            } else console.log('ERRROR');
          }, 2000);
        } else {
          setPinNotMatched(true);
          setPinEnterCount(prev => (prev += 1));
          setTimeout(() => {
            setPinNotMatched(false);
            setPin([null, null, null, null]);
          }, 500);
        }
      }
    })();
  }, [pin]);

  return (
    <GlobalThemeView>
      <View style={styles.contentContainer}>
        <ThemeText
          styles={{...styles.header}}
          content={
            isConfirming
              ? pinNotMatched
                ? t('createAccount.pinPage.wrongPinError')
                : t('createAccount.pinPage.confirmPin')
              : t('createAccount.pinPage.enterPinMessage')
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
          {/* <View
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
          ]}></View> */}
        </View>
        <View style={styles.keyboardContainer}>
          <View style={styles.keyboard_row}>
            <TouchableOpacity onPress={() => addPin(1)} style={styles.key}>
              <ThemeText styles={{...styles.keyText}} content={'1'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => addPin(2)} style={styles.key}>
              <ThemeText styles={{...styles.keyText}} content={'2'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => addPin(3)} style={styles.key}>
              <ThemeText styles={{...styles.keyText}} content={'3'} />
            </TouchableOpacity>
          </View>
          <View style={styles.keyboard_row}>
            <TouchableOpacity onPress={() => addPin(4)} style={styles.key}>
              <ThemeText styles={{...styles.keyText}} content={'4'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => addPin(5)} style={styles.key}>
              <ThemeText styles={{...styles.keyText}} content={'5'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => addPin(6)} style={styles.key}>
              <ThemeText styles={{...styles.keyText}} content={'6'} />
            </TouchableOpacity>
          </View>
          <View style={styles.keyboard_row}>
            <TouchableOpacity onPress={() => addPin(7)} style={styles.key}>
              <ThemeText styles={{...styles.keyText}} content={'7'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => addPin(8)} style={styles.key}>
              <ThemeText styles={{...styles.keyText}} content={'8'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => addPin(9)} style={styles.key}>
              <ThemeText styles={{...styles.keyText}} content={'9'} />
            </TouchableOpacity>
          </View>
          <View style={styles.keyboard_row}>
            <TouchableOpacity onPress={() => addPin('c')} style={styles.key}>
              <ThemeText styles={{...styles.keyText}} content={'C'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => addPin(0)} style={styles.key}>
              <ThemeText styles={{...styles.keyText}} content={'0'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => addPin(null)} style={styles.key}>
              <ThemeText styles={{...styles.keyText}} content={'<--'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </GlobalThemeView>
  );
  function formatSpanish(data) {
    let array = data.split(8);
    const newValue = 8 - pinEnterCount;

    for (let i = array.length - 1; i >= 1; i--) {
      array[i + 1] = array[i];
    }

    array[1] = newValue;

    return array;
  }

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
    setConfirmPin([]);
    setIsConfirming(false);
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
