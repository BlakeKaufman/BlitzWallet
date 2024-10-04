import React, {useRef, useEffect, useState} from 'react';
import {View, Animated, StyleSheet} from 'react-native';
import * as Speech from 'expo-speech';
import {CENTER, COLORS} from '../../../../../../constants';

const AudioBars = ({
  startListening,
  chatGPTResponse,
  isGettingResponse,
  isPlayingResponse,
  setIsUserSpeaking,
  setIsPlayingResponse,
  isUserSpeaking,
}) => {
  const isInitialRender = useRef(true);
  const animatedValues = useRef(
    [...Array(5)].map(() => new Animated.Value(0.2)),
  ).current;
  useEffect(() => {
    console.log(isUserSpeaking, 'IS USER SPEAKING IN VOICE FUNCTION');
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    if (isUserSpeaking) {
      setTimeout(() => {
        startListening();
        Speech.stop();
      }, 500);
    }
  }, [isUserSpeaking, startListening]);

  useEffect(() => {
    if (isPlayingResponse) {
      Speech.speak(chatGPTResponse, {
        onStart: startBarsAnimation,
        onDone: () => {
          setIsUserSpeaking(true);
          setIsPlayingResponse(false);
          stopBarsAnimation();
        },
        onStopped: stopBarsAnimation,
        onError: stopBarsAnimation,
      });
    } else if (isGettingResponse) {
      stopBarsAnimation();
    }
  }, [
    isGettingResponse,
    isPlayingResponse,
    startBarsAnimation,
    setIsUserSpeaking,
    setIsPlayingResponse,
    stopBarsAnimation,
    chatGPTResponse,
  ]);

  const startBarsAnimation = () => {
    animatedValues.forEach(anim => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: Math.random(), // Random height for the bar
            duration: 600,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0.2,
            duration: 600,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: Math.random(),
            duration: 600,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0.2,
            duration: 600,
            useNativeDriver: false,
          }),
        ]),
      ).start();
    });
  };

  const stopBarsAnimation = () => {
    animatedValues.forEach(anim => {
      Animated.timing(anim, {
        toValue: 0.2, // Reset to minimum height
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  };

  if (isUserSpeaking) return <></>;
  return (
    <View style={styles.container}>
      {animatedValues.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              height: anim.interpolate({
                inputRange: [0, 1],
                outputRange: ['20%', '100%'],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,

    alignSelf: 'center',
    ...CENTER,
  },
  bar: {
    width: 15,
    backgroundColor: COLORS.darkModeText,
    marginHorizontal: 10,
    borderRadius: 8,
  },
});

export default AudioBars;
