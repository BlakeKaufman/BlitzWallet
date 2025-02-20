import {Animated, StyleSheet, View} from 'react-native';
import {useEffect, useMemo, useRef} from 'react';
import GetThemeColors from '../../hooks/themeColors';
import {COLORS} from '../../constants';
import {useGlobalThemeContext} from '../../../context-store/theme';

export default function PinDot({dotNum, pin}) {
  const {theme} = useGlobalThemeContext();
  const isInitialLoad = useRef(true);

  const {textColor, backgroundOffset} = GetThemeColors();
  const dotScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
    }
    if (typeof pin[dotNum] === 'number') {
      Animated.sequence([
        Animated.timing(dotScale, {
          toValue: 1.1,
          duration: 100, // Adjust the duration as needed
          useNativeDriver: true,
        }),
        Animated.timing(dotScale, {
          toValue: 1,
          duration: 100, // Adjust the duration as needed
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [pin[dotNum], dotScale]);

  const memorizedStyles = useMemo(() => {
    if (typeof pin[dotNum] === 'number') {
      return {
        backgroundColor: theme ? textColor : COLORS.primary,
      };
    } else {
      return {
        backgroundColor: backgroundOffset,
      };
    }
  }, [pin, dotNum, theme]);
  return (
    <Animated.View
      style={{
        ...memorizedStyles,
        ...styles.dot,
        transform: [{scale: dotScale}],
      }}></Animated.View>
  );
}

const styles = StyleSheet.create({
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
});
