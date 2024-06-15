import {useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  LayoutChangeEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';

const window = Dimensions.get('window');

export const useCustomFlatListHook = () => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [heights, setHeights] = useState({
    header: 0,
    sticky: 0,
    topList: 0,
  });

  const styles = {
    header: {
      marginBottom: heights.sticky + heights.topList, // <-- In order for the list to be under other elements
    },
    stickyElement: {
      left: 0,
      marginTop: heights.header, // <-- In order for the list to be under Header
      position: 'absolute',
      right: 0,
      transform: [
        {
          translateY: scrollY.interpolate({
            // <-- To move an element according to the scroll position
            extrapolate: 'clamp',
            inputRange: [-window.height, heights.header],
            outputRange: [window.height, -heights.header],
          }),
        },
      ],
      zIndex: 2,
    },
    topElement: {
      left: 0,
      marginTop: heights.header + heights.sticky, // <-- In order for the list to be under other elements
      position: 'absolute',
      right: 0,
      transform: [
        {
          translateY: scrollY.interpolate({
            // <-- To move an element according to the scroll position
            extrapolate: 'clamp',
            inputRange: [
              -window.height,
              heights.header + heights.sticky + heights.topList,
            ],
            outputRange: [
              window.height,
              -(heights.header + heights.sticky + heights.topList),
            ],
          }),
        },
      ],
      zIndex: 1,
    },
  };

  const onLayoutHeaderElement = event => {
    setHeights({...heights, header: event.nativeEvent.layout.height});
  };

  const onLayoutTopListElement = event => {
    setHeights({...heights, topList: event.nativeEvent.layout.height});
  };

  const onLayoutTopStickyElement = event => {
    setHeights({...heights, sticky: event.nativeEvent.layout.height});
  };

  return [
    scrollY,
    styles,
    onLayoutHeaderElement,
    onLayoutTopListElement,
    onLayoutTopStickyElement,
  ];
};
