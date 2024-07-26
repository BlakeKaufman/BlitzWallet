// SplashScreen.js
import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import LottieView from 'lottie-react-native';
import {COLORS} from '../constants';
import {useGlobalContextProvider} from '../../context-store/context';

const SplashScreen = ({onAnimationFinish}) => {
  const opacity = useRef(new Animated.Value(1)).current;
  const {theme} = useGlobalContextProvider();

  useEffect(() => {
    // Start the fade-out animation
    setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500, // Adjust the duration as needed
        useNativeDriver: true,
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
          ? COLORS.darkModeBackground
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
          source={require('../assets/BlitzAnimation.json')}
          autoPlay
          loop={false}
          style={styles.lottie}

          // colorFilters={[
          //   {
          //     keypath: 'Shape Layer 1', // Adjust this to the specific layer you want to change
          //     color: '#0000FF', // The desired blue color
          //   },
          // ]}
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
    width: 159, // adjust as necessary
    height: 159, // adjust as necessary
  },
});

export default SplashScreen;
