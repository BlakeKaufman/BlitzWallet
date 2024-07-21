import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {useGlobalContextProvider} from '../../../context-store/context';
import {COLORS, ICONS, SIZES} from '../../constants';
import {ThemeText} from '.';
import {useState} from 'react';
import {backArrow} from '../../constants/styles';

export default function KeyForKeyboard({num, addPin, isDot, frompage}) {
  const {theme} = useGlobalContextProvider();
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={() => {
        if (isDot && frompage === 'sendSMSPage') {
          return;
        }
        setIsPressed(true);
      }}
      onPressOut={() => {
        if (isDot && frompage === 'sendSMSPage') {
          return;
        }
        setTimeout(() => {
          setIsPressed(false);
        }, 200);
      }}
      onPress={() => {
        if (isDot) {
          if (frompage === 'sendSMSPage') return;
          addPin('.');

          return;
        }
        addPin(num === 'back' ? null : num);
      }}
      style={{
        ...styles.key,
      }}>
      <View
        style={{
          ...styles.keyDot,
          backgroundColor: isPressed
            ? theme
              ? COLORS.darkModeBackgroundOffset
              : COLORS.lightModeBackgroundOffset
            : 'transparent',
        }}>
        {isDot && frompage != 'sendSMSPage' && (
          <Image
            style={{width: 60, height: 60}}
            source={theme ? ICONS.dotLight : ICONS.dotDark}
          />
        )}

        {!isDot && num === 'back' && (
          <Image
            style={[backArrow]}
            source={theme ? ICONS.leftCheveronLight : ICONS.leftCheveronDark}
          />
        )}
        {!isDot && num != 'back' && (
          <ThemeText
            styles={{
              ...styles.keyText,
              includeFontPadding: false,
            }}
            content={`${num}`}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  key: {
    width: '33.33333333333333%',
    height: 80,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyDot: {
    width: 45,
    height: 45,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: SIZES.xLarge,
  },
});
