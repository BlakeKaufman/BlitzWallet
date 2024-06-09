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
import {formatBalanceAmount, numberConverter} from '../../../../functions';
import ThemeText from '../../../../functions/CustomElements/textTheme';

export default function LiquidityIndicator() {
  const {nodeInformation, theme, masterInfoObject} = useGlobalContextProvider();
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
        (nodeInformation.inboundLiquidityMsat / 1000 +
          nodeInformation.userBalance)) *
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
        <ThemeText
          content={
            showLiquidyAmount
              ? masterInfoObject.userBalanceDenomination != 'hidden'
                ? formatBalanceAmount(
                    numberConverter(
                      nodeInformation.userBalance,
                      masterInfoObject.userBalanceDenomination,
                      nodeInformation,
                    ),
                  )
                : '*****'
              : 'Send'
          }
          styles={{...styles.typeText, color: COLORS.primary}}
        />

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

        <ThemeText
          content={
            showLiquidyAmount
              ? masterInfoObject.userBalanceDenomination != 'hidden'
                ? formatBalanceAmount(
                    numberConverter(
                      nodeInformation.inboundLiquidityMsat / 1000,
                      masterInfoObject.userBalanceDenomination,
                      nodeInformation,
                    ),
                  )
                : '*****'
              : 'Receive'
          }
          styles={{...styles.typeText}}
        />
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
