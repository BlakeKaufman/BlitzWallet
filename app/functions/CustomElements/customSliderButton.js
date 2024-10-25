import React from 'react';
import {StyleSheet, View, Text, Dimensions} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useAnimatedGestureHandler,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import {useGlobalContextProvider} from '../../../context-store/context';
import {COLORS, FONT, SIZES} from '../../constants';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const KNOB_SIZE = 50;
const SWIPE_THRESHOLD = 1; // How far user needs to swipe to trigger action

const CustomSwipButton = ({
  onComplete,
  swipeThreshold = SWIPE_THRESHOLD,
  swipeText = 'Slide to confirm',
  buttonSizePercent = 0.9,
  sliderSize = KNOB_SIZE,
}) => {
  const {theme, darkModeType} = useGlobalContextProvider();
  const translateX = useSharedValue(0);
  const completed = useSharedValue(false);
  const hasTriggeredComplete = useSharedValue(false);

  const buttonWidth = SCREEN_WIDTH * buttonSizePercent;

  const handleComplete = async () => {
    // Check if we've already triggered completion
    if (hasTriggeredComplete.value) return;

    try {
      // Mark as triggered before running onComplete
      hasTriggeredComplete.value = true;
      const didWork = await onComplete();

      if (!didWork) throw Error('Function did not work');
      completed.value = true;
    } catch (err) {
      // Even if it fails, we don't reset hasTriggeredComplete
      // This ensures we don't try again
      completed.value = false;
      // Optionally, spring back to start on failure
      translateX.value = withSpring(0);
    }
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      if (completed.value) return;

      let newPosition = context.startX + event.translationX;
      // Clamp position between 0 and max distance
      newPosition = Math.min(
        Math.max(newPosition, 0),
        buttonWidth - sliderSize,
      );
      translateX.value = newPosition;

      // Check if swipe is complete
      if (newPosition >= (buttonWidth - sliderSize) * swipeThreshold) {
        translateX.value = withSpring(buttonWidth - sliderSize);
        runOnJS(handleComplete)();
      }
    },
    onEnd: () => {
      if (!completed.value) {
        // Spring back to start if not completed
        translateX.value = withSpring(0);
      }
    },
  });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: translateX.value + sliderSize,
    opacity: interpolate(
      translateX.value,
      [0, buttonWidth - sliderSize],
      [0, 1],
    ),
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, (buttonWidth - sliderSize) * 0.5],
      [1, 0],
    ),
  }));

  return (
    <GestureHandlerRootView style={{padding: 0}}>
      {/* Background track */}
      <View
        style={[
          styles.track,
          {
            backgroundColor: theme
              ? darkModeType
                ? COLORS.darkModeText
                : COLORS.darkModeBackgroundOffset
              : COLORS.primary,

            width: buttonWidth,
            height: sliderSize,
            borderRadius: sliderSize / 2,
          },
        ]}>
        {/* Swipe text */}
        <Animated.Text
          style={[
            styles.text,
            textStyle,
            {
              color: theme
                ? darkModeType
                  ? COLORS.darkModeText
                  : COLORS.darkModeBackground
                : COLORS.lightModeBackground,
            },
          ]}>
          {swipeText}
        </Animated.Text>

        {/* Progress overlay */}
        <Animated.View
          style={[
            styles.progress,
            progressStyle,
            {
              backgroundColor: theme
                ? darkModeType
                  ? COLORS.darkModeText
                  : COLORS.darkModeBackgroundOffset
                : COLORS.darkModeText,
              borderRadius: sliderSize / 2,
            },
          ]}
        />

        {/* Swipeable knob */}
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View
            style={[
              styles.knob,
              knobStyle,
              {
                backgroundColor: theme
                  ? darkModeType
                    ? COLORS.darkModeText
                    : COLORS.darkModeBackgroundOffset
                  : COLORS.darkModeText,
                width: sliderSize,
                height: sliderSize,
                borderRadius: sliderSize / 2,
              },
            ]}
          />
        </PanGestureHandler>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  track: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  text: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Regular,
    fontWeight: 500,
  },
  progress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  knob: {
    position: 'absolute',
    left: 0,
  },
});

export default CustomSwipButton;
