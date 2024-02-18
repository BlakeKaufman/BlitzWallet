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

export default function PinPage() {
  const [pin, setPin] = useState([null, null, null, null]);
  const [confirmPin, setConfirmPin] = useState([]);
  const [pinNotMatched, setPinNotMatched] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [pinEnterCount, setPinEnterCount] = useState(0);
  const navigate = useNavigation();

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
        navigate.navigate('ConnectingToNodeLoadingScreen');
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
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.lightModeBackground,
        paddingBottom: Platform.OS === 'ios' ? 0 : 15,
      }}>
      <SafeAreaView style={styles.contentContainer}>
        <Text style={[styles.header]}>
          {isConfirming
            ? pinNotMatched
              ? 'Try again'
              : 'Confirm Pin'
            : 'Enter 4-digit PIN'}
        </Text>
        <Text style={[styles.enterText]}>
          {8 - pinEnterCount} attempts left
        </Text>
        <View style={styles.dotContainer}>
          <View
            style={[
              typeof pin[0] === 'number'
                ? {
                    ...styles.dot_active,
                  }
                : styles.dot,
              {},
            ]}></View>
          <View
            style={[
              typeof pin[1] === 'number'
                ? {
                    ...styles.dot_active,
                  }
                : styles.dot,
              {},
            ]}></View>
          <View
            style={[
              typeof pin[2] === 'number'
                ? {
                    ...styles.dot_active,
                  }
                : styles.dot,
              {},
            ]}></View>
          <View
            style={[
              typeof pin[3] === 'number'
                ? {
                    ...styles.dot_active,
                  }
                : styles.dot,
              {},
            ]}></View>
        </View>
        <View style={styles.keyboardContainer}>
          <View style={styles.keyboard_row}>
            <TouchableOpacity onPress={() => addPin(1)} style={styles.key}>
              <Text style={[styles.keyText, {}]}>1</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => addPin(2)} style={styles.key}>
              <Text style={[styles.keyText, {}]}>2</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => addPin(3)} style={styles.key}>
              <Text style={[styles.keyText, {}]}>3</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.keyboard_row}>
            <TouchableOpacity onPress={() => addPin(4)} style={styles.key}>
              <Text style={[styles.keyText, {}]}>4</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => addPin(5)} style={styles.key}>
              <Text style={[styles.keyText, {}]}>5</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => addPin(6)} style={styles.key}>
              <Text style={[styles.keyText, {}]}>6</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.keyboard_row}>
            <TouchableOpacity onPress={() => addPin(7)} style={styles.key}>
              <Text style={[styles.keyText, {}]}>7</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => addPin(8)} style={styles.key}>
              <Text style={[styles.keyText, {}]}>8</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => addPin(9)} style={styles.key}>
              <Text style={[styles.keyText, {}]}>9</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.keyboard_row}>
            <TouchableOpacity onPress={() => addPin(0)} style={styles.key}>
              <Text style={[styles.keyText, {}]}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => addPin(null)} style={styles.key}>
              <Text style={[styles.keyText, {}]}>{'<--'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
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
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginTop: 50,
    marginBottom: 10,
    fontFamily: FONT.Title_Bold,
    color: COLORS.lightModeText,
  },
  enterText: {
    fontSize: SIZES.small,
    fontWeight: 'bold',
    marginBottom: 30,
    fontFamily: FONT.Descriptoin_Bold,
    color: COLORS.lightModeText,
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
    // backgroundColor: 'black',
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
    color: COLORS.lightModeText,
  },
});
