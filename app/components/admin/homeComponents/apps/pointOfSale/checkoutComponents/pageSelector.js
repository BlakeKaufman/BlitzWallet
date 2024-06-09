import {StyleSheet, Text, View, TouchableOpacity, Animated} from 'react-native';
import {CENTER} from '../../../../../../constants/styles';
import {useGlobalContextProvider} from '../../../../../../../context-store/context';
import {COLORS, FONT, SIZES} from '../../../../../../constants';

import {useEffect, useRef} from 'react';

export default function CheckoutPageSelector({
  pageTypeAttributes,
  setPageTypeAttributes,
  selectedPageValues,
  selectedPage,
}) {
  const {theme} = useGlobalContextProvider();
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    const page = pageTypeAttributes.keypad.isSelected ? 'keypad' : 'library';
    toggleSelectedPage(page);
  }, [selectedPage]);

  const sliderAnimation = useRef(new Animated.Value(0)).current;
  const widthAnimationValue = useRef(new Animated.Value(60)).current;

  return (
    <View style={styles.selectorContainer}>
      <TouchableOpacity
        onPress={() => {
          toggleSelectedPage('keypad');
        }}>
        <Text
          allowFontScaling={false}
          onLayout={e => {
            e.persist();
            setPageTypeAttributes(prev => {
              return {
                ...prev,
                keypad: {
                  ...prev.keypad,
                  layoutAttributes: e?.nativeEvent?.layout,
                },
              };
            });
          }}
          style={[
            styles.screenType,

            {
              opacity: selectedPage === 'keypad' ? 1 : 0.3,
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
            },
          ]}>
          Keypad
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          toggleSelectedPage('library');
        }}>
        <Text
          allowFontScaling={false}
          onLayout={e => {
            e.persist();
            setPageTypeAttributes(prev => {
              return {
                ...prev,
                library: {
                  ...prev.library,
                  layoutAttributes: e?.nativeEvent?.layout,
                },
              };
            });

            // console.log(e.nativeEvent.layout)
          }}
          style={[
            styles.screenType,
            {
              opacity: selectedPage === 'library' ? 1 : 0.3,
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
            },
          ]}>
          Library
        </Text>
      </TouchableOpacity>

      <View
        style={[
          styles.screenTypeTrack,
          {
            backgroundColor: theme
              ? COLORS.darkModeBackgroundOffset
              : COLORS.lightModeBackgroundOffset,
          },
        ]}>
        <Animated.View
          style={[
            styles.screenTypeSelector,
            {
              width: widthAnimationValue,
              transform: [{translateX: sliderAnimation}],
            },
          ]}></Animated.View>
      </View>
    </View>
  );

  function toggleSelectedPage(page) {
    let newPageTypeAttributes = {};
    Object.entries(pageTypeAttributes).forEach(item => {
      const [pageName, attibutes] = item;
      newPageTypeAttributes[pageName] = {
        isSelected: pageName === page,
        layoutAttributes: attibutes.layoutAttributes,
      };
    });

    setPageTypeAttributes(newPageTypeAttributes);

    slideAnimation(
      page === 'keypad'
        ? 0
        : Math.round(pageTypeAttributes.keypad.layoutAttributes.width) + 15,
    );
    widthAnimation(pageTypeAttributes[page].layoutAttributes.width);
  }

  function slideAnimation(toValue) {
    console.log(toValue, 'TESTING');
    Animated.timing(sliderAnimation, {
      toValue: toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }
  function widthAnimation(newWidth) {
    Animated.timing(widthAnimationValue, {
      toValue: newWidth,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }
}

const styles = StyleSheet.create({
  selectorContainer: {
    width: '90%',
    ...CENTER,
    flexDirection: 'row',
    marginTop: 10,
    position: 'relative',
    paddingBottom: 10,
    marginBottom: 20,
  },
  screenType: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Regular,
    marginRight: 15,
  },
  screenTypeTrack: {
    width: '100%',
    height: 4,
    position: 'absolute',
    bottom: 0,
    borderRadius: 10,
  },
  screenTypeSelector: {
    width: 50,
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
});
