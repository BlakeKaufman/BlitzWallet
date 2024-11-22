import React, {useState, useEffect, useRef} from 'react';
import {View, Animated, ScrollView, StyleSheet, TextInput} from 'react-native';
import {CENTER, COLORS, FONT, SIZES} from '../../../../../constants';
import GetThemeColors from '../../../../../hooks/themeColors';

const ScrollableSearch = props => {
  const [scrollY] = useState(new Animated.Value(0));
  const scrollRef = useRef(null);
  const {setInputText, inputText, pinnedContacts, contactElements} = props;
  const {textInputColor, textInputBackground} = GetThemeColors();

  const HEADER_MAX_HEIGHT = 50;
  const HEADER_MIN_HEIGHT = 0;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });
  const handleScrollEnd = ({nativeEvent}) => {
    const offsetY = nativeEvent.contentOffset.y - 50;
    console.log(offsetY);

    console.log(
      offsetY,
      HEADER_MIN_HEIGHT - 40,
      offsetY,
      HEADER_MIN_HEIGHT + 60,
      offsetY >= HEADER_MIN_HEIGHT - 40 && offsetY <= HEADER_MIN_HEIGHT + 60,
    );

    if (offsetY >= -50 && offsetY <= HEADER_MIN_HEIGHT + 30) {
      scrollRef.current?.scrollTo({
        y: 50,
        animated: true,
      });
    } // If pulled down enough to reveal search, keep it visible
    else if (offsetY <= HEADER_MAX_HEIGHT) {
      // Ensure the search bar stays fully visible
      scrollRef.current?.scrollTo({
        y: 0,
        animated: true,
      });
    }
  };

  return (
    <View>
      <Animated.View style={{height: headerHeight, overflow: 'hidden'}}>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Search added contacts"
            placeholderTextColor={COLORS.opaicityGray}
            value={inputText}
            onChangeText={setInputText}
            style={[
              styles.searchInput,
              {
                color: textInputColor,
                backgroundColor: textInputBackground,
              },
            ]}
          />
        </View>
      </Animated.View>
      <ScrollView
        ref={scrollRef}
        bounces={true}
        // onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        // contentOffset={{y: 50}}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false},
        )}>
        {pinnedContacts.length != 0 && (
          <View style={styles.pinnedContactsContainer}>{pinnedContacts}</View>
        )}
        {contactElements}
      </ScrollView>
    </View>
  );
};

export default ScrollableSearch;

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },

  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',

    // paddingHorizontal: 5,
    marginBottom: 5,
    // backgroundColor: 'black',
    ...CENTER,
  },
  backButton: {
    width: 20,
    height: 20,
  },
  hasNotification: {
    // position: 'absolute',
    // bottom: -5,
    // right: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  headerText: {fontSize: SIZES.large},

  inputContainer: {
    width: '100%',
    ...CENTER,
  },

  searchInput: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Regular,
    includeFontPadding: false,
    ...CENTER,
  },

  noContactsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noContactsText: {
    textAlign: 'center',
    width: 250,
    marginTop: 10,
    marginBottom: 20,
  },

  pinnedContact: {
    width: 110,
    height: 'auto',
    margin: 5,
    alignItems: 'center',
  },
  pinnedContactsContainer: {
    width: '100%',
    ...CENTER,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  pinnedContactImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    overflow: 'hidden',
  },
  pinnedContactImage: {
    width: 70,
    height: 70,
  },
  contactRowContainer: {
    width: '100%',

    // overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    ...CENTER,
    // marginVertical: 5,
  },

  contactImageContainer: {
    width: 45,
    height: 45,
    backgroundColor: COLORS.opaicityGray,
    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 30,
    marginRight: 10,
    overflow: 'hidden',
  },
  contactImage: {
    width: 25,
    height: 30,
  },
});
