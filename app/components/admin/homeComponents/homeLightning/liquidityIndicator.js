import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {
  CENTER,
  COLORS,
  FONT,
  SATSPERBITCOIN,
  SIZES,
} from '../../../../constants';
import {useEffect, useState} from 'react';
import {useGlobalContextProvider} from '../../../../../context-store/context';

export default function LiquidityIndicator() {
  const {nodeInformation, theme, userBalanceDenomination} =
    useGlobalContextProvider();
  const [sendWitdh, setsendWitdh] = useState(0);
  const [showLiquidyAmount, setShowLiquidyAmount] = useState(false);

  useEffect(() => {
    if (
      isNaN(nodeInformation.userBalance) ||
      isNaN(nodeInformation.inboundLiquidityMsat)
    )
      return;
    const calculatedWidth = (
      (nodeInformation.userBalance /
        (nodeInformation.inboundLiquidityMsat / 1000)) *
      150
    ).toFixed(0);
    setsendWitdh(Number(calculatedWidth));
  }, [nodeInformation]);

  return (
    <TouchableOpacity
      onPress={() => {
        setShowLiquidyAmount(prev => !prev);
      }}>
      <View style={styles.container}>
        <Text style={[styles.typeText, {color: COLORS.primary}]}>
          {showLiquidyAmount
            ? userBalanceDenomination != 'hidden'
              ? Math.round(
                  userBalanceDenomination === 'sats'
                    ? nodeInformation.userBalance
                    : nodeInformation.userBalance *
                        (nodeInformation.fiatStats.value / SATSPERBITCOIN),
                ).toLocaleString()
              : '*****'
            : 'Send'}
        </Text>
        <View
          style={[
            styles.sliderBar,
            {
              backgroundColor: theme
                ? COLORS.darkModeText
                : COLORS.lightModeText,
            },
          ]}>
          <View
            style={[
              styles.sendIndicator,
              {
                width: isNaN(sendWitdh) ? 0 : sendWitdh,
              },
            ]}></View>
        </View>
        <Text
          style={[
            styles.typeText,
            {
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
            },
          ]}>
          {showLiquidyAmount
            ? userBalanceDenomination != 'hidden'
              ? Math.round(
                  userBalanceDenomination === 'sats'
                    ? nodeInformation.inboundLiquidityMsat / 1000
                    : (nodeInformation.inboundLiquidityMsat / 1000) *
                        (nodeInformation.fiatStats.value / SATSPERBITCOIN),
                ).toLocaleString()
              : '*****'
            : 'Receive'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '95%',

    flexDirection: 'row',
    alignItems: 'center',
  },

  typeText: {
    width: 'auto',
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
    textAlign: 'center',
  },

  sliderBar: {
    height: 8,
    width: 150,

    position: 'relative',
    backgroundColor: 'black',

    marginHorizontal: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },

  sendIndicator: {
    height: '100%',
    maxWidth: 110,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
});
