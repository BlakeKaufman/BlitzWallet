// SplashScreen.js
import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import LottieView from 'lottie-react-native';
import {COLORS} from '../constants';
import {useGlobalContextProvider} from '../../context-store/context';

const SplashScreen = ({onAnimationFinish}) => {
  const opacity = useRef(new Animated.Value(1)).current;
  const {theme, darkModeType} = useGlobalContextProvider();

  useEffect(() => {
    setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }).start(() => {
        if (onAnimationFinish) {
          onAnimationFinish();
        }
      });
    }, 2500);
  }, [opacity]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme
          ? darkModeType
            ? COLORS.lightsOutBackground
            : COLORS.darkModeBackground
          : COLORS.lightModeBackground,
      }}>
      <Animated.View
        style={[
          styles.container,
          {
            opacity,
          },
        ]}>
        <LottieView
          source={
            theme
              ? darkModeType
                ? require('../assets/BlitzAnimationLightsOut.json')
                : require('../assets/BlitzAnimationDM.json')
              : require('../assets/BlitzAnimation.json')
          }
          autoPlay
          speed={0.8}
          loop={false}
          style={styles.lottie}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: 150, // adjust as necessary
    height: 150, // adjust as necessary
  },
});

export default SplashScreen;
