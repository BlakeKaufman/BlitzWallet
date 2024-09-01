import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import {useEffect, useRef, useState} from 'react';
import {COLORS, FONT, SATSPERBITCOIN, SIZES} from '../../../../../../constants';
import {useGlobalContextProvider} from '../../../../../../../context-store/context';
import {ThemeText} from '../../../../../../functions/CustomElements';
import {WINDOWWIDTH} from '../../../../../../constants/theme';
import {
  formatBalanceAmount,
  numberConverter,
} from '../../../../../../functions';
import FormattedSatText from '../../../../../../functions/CustomElements/satTextDisplay';

export default function VPNDurationSlider({
  setSelectedDuration,
  selectedDuration,
}) {
  const {theme, nodeInformation, masterInfoObject} = useGlobalContextProvider();
  const sliderAnim = useRef(new Animated.Value(3)).current;
  const windowDimensions = useWindowDimensions();

  const satValues = {
    week: {
      value: Math.round(
        (SATSPERBITCOIN / (nodeInformation.fiatStats.value || 60000)) * 1.5,
      ),
      code: 1,
    },
    month: {
      value: Math.round(
        (SATSPERBITCOIN / (nodeInformation.fiatStats.value || 60000)) * 4,
      ),
      code: 4,
    },
    quarter: {
      value: Math.round(
        (SATSPERBITCOIN / (nodeInformation.fiatStats.value || 60000)) * 9,
      ),
      code: 9,
    },
  };

  const sliderWidth = (windowDimensions.width * 0.95 * 0.95) / 3.333 + 12;

  return (
    <View style={{marginBottom: 20, marginTop: 20, alignItems: 'center'}}>
      <ThemeText styles={{...styles.infoHeaders}} content={'Duration'} />
      <View
        style={[
          styles.contentContainer,
          {
            backgroundColor: theme
              ? COLORS.darkModeBackgroundOffset
              : COLORS.lightModeBackgroundOffset,
            alignItems: 'center',
          },
        ]}>
        <View style={[styles.colorSchemeContainer]}>
          <TouchableOpacity
            style={styles.colorSchemeItemContainer}
            activeOpacity={1}
            onPress={() => {
              setSelectedDuration('week');
              handleSlide('week');
            }}>
            <ThemeText
              styles={{...styles.colorSchemeText}}
              content={'1 Week'}
              reversed={selectedDuration === 'week' && !theme}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.colorSchemeItemContainer}
            activeOpacity={1}
            onPress={() => {
              setSelectedDuration('month');
              handleSlide('month');
            }}>
            <ThemeText
              styles={{...styles.colorSchemeText}}
              content={'1 Month'}
              reversed={selectedDuration === 'month' && !theme}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.colorSchemeItemContainer}
            activeOpacity={1}
            onPress={() => {
              setSelectedDuration('quarter');
              handleSlide('quarter');
            }}>
            <ThemeText
              styles={{...styles.colorSchemeText}}
              content={'1 Quarter'}
              reversed={selectedDuration === 'quarter' && !theme}
            />
          </TouchableOpacity>
          <Animated.View
            style={[
              styles.activeSchemeStyle,
              {transform: [{translateX: sliderAnim}, {translateY: 3}]},
            ]}></Animated.View>
        </View>
      </View>
      <FormattedSatText
        neverHideBalance={true}
        iconHeight={15}
        iconWidth={15}
        containerStyles={{marginTop: 10}}
        styles={{
          fontSize: SIZES.large,
          textAlign: 'center',
        }}
        frontText={'Price: '}
        formattedBalance={formatBalanceAmount(
          numberConverter(
            satValues[selectedDuration].value,
            masterInfoObject.userBalanceDenomination,
            nodeInformation,
            masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
          ),
        )}
      />
    </View>
  );

  function handleSlide(type) {
    Animated.timing(sliderAnim, {
      toValue:
        type === 'week'
          ? 3
          : type === 'quarter'
          ? sliderWidth * 2
          : sliderWidth,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }
}

const styles = StyleSheet.create({
  infoHeaders: {
    width: '100%',
    marginBottom: 5,
  },
  contentContainer: {
    width: '100%',
    paddingVertical: 5,
    borderRadius: 8,
  },
  colorSchemeContainer: {
    width: '95%',
    height: 'auto',
    flexDirection: 'row',
    position: 'relative',
    padding: 3,
    borderRadius: 3,
  },
  colorSchemeItemContainer: {
    width: '33.333%',
    paddingVertical: 8,
    alignItems: 'center',
  },
  colorSchemeText: {
    includeFontPadding: false,
  },
  activeSchemeStyle: {
    backgroundColor: COLORS.primary,
    position: 'absolute',
    height: '100%',
    width: '33.333%',
    top: 0,
    left: 0,
    borderRadius: 3,
    zIndex: -1,
  },
});
