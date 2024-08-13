import React, {useState, useRef, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Animated} from 'react-native';
import {COLORS, SIZES} from '../../constants';
import {useGlobalContextProvider} from '../../../context-store/context';

const CustomToggleSwitch = ({page}) => {
  const {masterInfoObject, toggleMasterInfoObject} = useGlobalContextProvider();

  const [isOn, setIsOn] = useState(
    page === 'displayOptions'
      ? masterInfoObject.enabledSlidingCamera
      : page === 'eCash'
      ? !!masterInfoObject.enabledEcash
      : false,
  );
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isOn ? 1 : 0,
      duration: 300, // Duration of the animation
      useNativeDriver: false, // Enable if animating style properties
    }).start();
  }, [isOn]);

  const toggleSwitch = () => {
    setIsOn(prev => {
      setTimeout(() => {
        toggleMasterInfoObject({
          [page === 'displayOptions' ? 'enabledSlidingCamera' : 'enabledEcash']:
            !prev,
        });
      }, 300);

      return !prev;
    });
  };

  const switchColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.darkModeBackground, COLORS.primary], // From inactive to active color
  });

  const circlePosition = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [5, 40], // From left to right position
  });

  return (
    <TouchableOpacity onPress={toggleSwitch} activeOpacity={0.7}>
      <Animated.View style={[styles.switch, {backgroundColor: switchColor}]}>
        <Animated.View style={[styles.circle, {left: circlePosition}]} />
        <Animated.Text
          style={[
            styles.text,
            {
              left: circlePosition,
              transform: [
                {
                  translateX: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, -28], // Adjust text position relative to the circle
                  }),
                },
              ],
            },
          ]}>
          {isOn ? 'ON' : 'OFF'}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  switch: {
    width: 70,
    height: 35,
    borderRadius: 20,
    justifyContent: 'center',
    // paddingHorizontal: 20,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    position: 'absolute',
  },
  text: {
    position: 'absolute',
    fontSize: SIZES.small,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CustomToggleSwitch;
