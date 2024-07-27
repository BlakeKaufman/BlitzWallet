import {Animated, StyleSheet, View} from 'react-native';
import {useGlobalContextProvider} from '../../../context-store/context';
import {COLORS} from '../../constants';
import {useEffect, useRef} from 'react';

export default function PinDot({dotNum, pin}) {
  const isInitialLoad = useRef(true);
  const {theme} = useGlobalContextProvider();
  const dotScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
    }
    if (typeof pin[dotNum] === 'number') {
      Animated.sequence([
        Animated.timing(dotScale, {
          toValue: 1.05,
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

    console.log('CJANGIN');
  }, [pin[dotNum], dotScale]);
  return (
    <Animated.View
      style={[
        typeof pin[dotNum] === 'number'
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
        {transform: [{scale: dotScale}]},
      ]}></Animated.View>
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
