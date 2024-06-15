import React from 'react';

import {Animated, FlatListProps, View} from 'react-native';
import {useCustomFlatListHook} from './useCustomFlatListHooks';

function CustomFlatList({style, ...props}) {
  const [
    scrollY,
    styles,
    onLayoutHeaderElement,
    onLayoutTopListElement,
    onLayoutStickyElement,
  ] = useCustomFlatListHook();

  return (
    <View style={style}>
      <Animated.View // <-- Sticky Component
        style={styles.stickyElement}
        onLayout={onLayoutStickyElement}>
        {props.StickyElementComponent}
      </Animated.View>

      <Animated.View // <-- Top of List Component
        style={styles.topElement}
        onLayout={onLayoutTopListElement}>
        {props.TopListElementComponent}
      </Animated.View>

      <Animated.FlatList
        showsVerticalScrollIndicator={false}
        {...props}
        ListHeaderComponent={
          // <-- Header Component
          <Animated.View onLayout={onLayoutHeaderElement}>
            {props.HeaderComponent}
          </Animated.View>
        }
        ListHeaderComponentStyle={[
          props.ListHeaderComponentStyle,
          styles.header,
        ]}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {
            useNativeDriver: true,
          },
        )}
      />
    </View>
  );
}

export default CustomFlatList;
