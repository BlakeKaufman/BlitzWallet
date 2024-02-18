import React, {useRef, useState} from 'react';
import {Animated, Easing, Image} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

function RotatingAnimation(props) {
  const [rotation, setRotation] = useState(0);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const startAnimation = () => {
    if (props.setManualRefresh) {
      props.setManualRefresh(prev => (prev += 1));
    }

    // Update the rotation value by adding 365 degrees
    const newRotation = rotation + 365;

    Animated.timing(rotateAnim, {
      toValue: newRotation,
      duration: 1000, // Animation duration in milliseconds
      easing: Easing.linear, // You can adjust the easing function
      useNativeDriver: true, // Use the native driver for performance
    }).start();

    // Update the rotation state
    setRotation(newRotation);
  };

  const rotateStyle = {
    transform: [
      {
        rotate: rotateAnim.interpolate({
          inputRange: [0, 365],
          outputRange: ['0deg', '365deg'],
        }),
      },
    ],
  };

  return (
    <TouchableWithoutFeedback style={props.style} onPress={startAnimation}>
      <Animated.View style={rotateStyle}>
        <Image
          source={props.img}
          style={{
            width: '100%',
            height: '100%',
          }}
          resizeMode="contain"
        />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

export default RotatingAnimation;
