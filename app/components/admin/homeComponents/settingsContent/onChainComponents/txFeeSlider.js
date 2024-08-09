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

import {formatBalanceAmount, numberConverter} from '../../../../../functions';
import {ThemeText} from '../../../../../functions/CustomElements';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {COLORS, FONT, SATSPERBITCOIN, SIZES} from '../../../../../constants';
import FormattedSatText from '../../../../../functions/CustomElements/satTextDisplay';

export default function SendOnChainBitcoinFeeSlider({
  changeSelectedFee,
  feeInfo,
  bitcoinAddress,
  txFeeSat,
}) {
  const {theme, nodeInformation, masterInfoObject} = useGlobalContextProvider();
  const sliderAnim = useRef(new Animated.Value(3)).current;
  const windowDimensions = useWindowDimensions();
  console.log(feeInfo);

  const sliderWidth = (windowDimensions.width * 0.95) / 3.333;

  return (
    <View
      style={{
        marginBottom: 20,
        marginTop: 20,
        alignItems: 'center',
      }}>
      <ThemeText
        styles={{...styles.infoHeaders}}
        content={'Transaction confirmation speed'}
      />
      <View
        style={[
          styles.contentContainer,
          {
            backgroundColor: theme
              ? COLORS.darkModeBackgroundOffset
              : COLORS.lightModeBackgroundOffset,
            alignItems: 'center',
            opacity: !bitcoinAddress ? 0.5 : 1,
          },
        ]}>
        <View style={[styles.colorSchemeContainer]}>
          <TouchableOpacity
            style={styles.colorSchemeItemContainer}
            activeOpacity={1}
            onPress={() => {
              changeSelectedFee(feeInfo[0].feeType, () =>
                handleSlide(feeInfo[0].feeType),
              );
              // handleSlide(feeInfo[0].feeType);
            }}>
            <ThemeText
              styles={{...styles.colorSchemeText}}
              content={'Fastest'}
              reversed={feeInfo[0].isSelected && !theme}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.colorSchemeItemContainer}
            activeOpacity={1}
            onPress={() => {
              changeSelectedFee(feeInfo[1].feeType, () =>
                handleSlide(feeInfo[1].feeType),
              );
              // if (!bitcoinAddress) {
              //   navigate.navigate('ErrorScreen', {
              //     errorMessage: 'Please enter a bitcoin address',
              //   });
              //   return;
              // }
              // changeSelectedFee(feeInfo[1].feeType);
              // handleSlide(feeInfo[1].feeType);
            }}>
            <ThemeText
              styles={{...styles.colorSchemeText}}
              content={'Half hour'}
              reversed={feeInfo[1].isSelected && !theme}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.colorSchemeItemContainer}
            activeOpacity={1}
            onPress={() => {
              changeSelectedFee(feeInfo[2].feeType, () =>
                handleSlide(feeInfo[2].feeType),
              );
            }}>
            <ThemeText
              styles={{...styles.colorSchemeText}}
              content={'Hour+'}
              reversed={feeInfo[2].isSelected && !theme}
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
        containerStyles={{marginTop: 10, opacity: !bitcoinAddress ? 0.5 : 1}}
        styles={{
          textAlign: 'center',
        }}
        frontText={'Transaction fee: '}
        formattedBalance={formatBalanceAmount(
          numberConverter(
            txFeeSat,
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
        type === 'fastest'
          ? 3
          : type === 'hour'
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
