import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useEffect, useState} from 'react';

import SwipeButton from 'rn-swipe-button';

import handleBackPress from '../../../../../../hooks/handleBackPress';
import {ThemeText} from '../../../../../../functions/CustomElements';
import {
  formatBalanceAmount,
  numberConverter,
} from '../../../../../../functions';
import {useGlobalContextProvider} from '../../../../../../../context-store/context';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../../../constants';
import FormattedSatText from '../../../../../../functions/CustomElements/satTextDisplay';
import GetThemeColors from '../../../../../../hooks/themeColors';
import {calculateBoltzFee} from '../../../../../../functions/boltz/calculateBoltzFee';
import {calculateBoltzFeeNew} from '../../../../../../functions/boltz/boltzFeeNew';
import {getLiquidTxFee} from '../../../../../../functions/liquidWallet';

export default function ConfirmVPNPage(props) {
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();
  const {theme, nodeInformation, masterInfoObject, minMaxLiquidSwapAmounts} =
    useGlobalContextProvider();
  const {duration, country, createVPN, price} = props;
  const {textColor, backgroundOffset, backgroundColor} = GetThemeColors();

  const [liquidTxFee, setLiquidTxFee] = useState(250);

  useEffect(() => {
    (async () => {
      const txFee = await getLiquidTxFee({
        amountSat: price,
        address:
          process.env.BOLTZ_ENVIRONMENT === 'testnet'
            ? process.env.BLITZ_LIQUID_TESTNET_ADDRESS
            : process.env.BLITZ_LIQUID_ADDRESS,
      });
      setLiquidTxFee(txFee || 250);
    })();
  }, []);

  return (
    <View
      style={{
        height: useWindowDimensions().height * 0.5,
        width: '100%',
        backgroundColor: backgroundColor,

        // borderTopColor: theme ? COLORS.darkModeText : COLORS.lightModeText,
        // borderTopWidth: 10,

        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,

        // borderTopLeftRadius: 10,
        // borderTopRightRadius: 10,

        padding: 10,
        paddingBottom: insets.bottom,
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: backgroundOffset,
          },
        ]}></View>
      <ThemeText
        styles={{fontSize: SIZES.large, textAlign: 'center', marginBottom: 5}}
        content={'Confirm Country'}
      />
      <ThemeText
        styles={{
          fontSize: SIZES.large,
          textAlign: 'center',
        }}
        content={`${country}`}
      />
      <ThemeText
        styles={{fontSize: SIZES.large, marginTop: 10}}
        content={`Duration: 1 ${duration}`}
      />
      <FormattedSatText
        neverHideBalance={true}
        iconHeight={15}
        iconWidth={15}
        containerStyles={{marginTop: 'auto'}}
        styles={{
          fontSize: SIZES.large,
          textAlign: 'center',
        }}
        frontText={'Price: '}
        formattedBalance={formatBalanceAmount(
          numberConverter(
            price,
            masterInfoObject.userBalanceDenomination,
            nodeInformation,
            masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
          ),
        )}
      />
      <FormattedSatText
        neverHideBalance={true}
        iconHeight={15}
        iconWidth={15}
        containerStyles={{marginTop: 10, marginBottom: 'auto'}}
        styles={{
          textAlign: 'center',
        }}
        frontText={'Fee: '}
        formattedBalance={formatBalanceAmount(
          numberConverter(
            liquidTxFee +
              calculateBoltzFeeNew(
                price,
                'liquid-ln',
                minMaxLiquidSwapAmounts.submarineSwapStats,
              ),
            masterInfoObject.userBalanceDenomination,
            nodeInformation,
            masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
          ),
        )}
      />

      <SwipeButton
        containerStyles={{
          width: '90%',
          maxWidth: 350,
          borderColor: textColor,
          ...CENTER,
          marginBottom: 20,
        }}
        titleStyles={{fontWeight: 'bold', fontSize: SIZES.large}}
        swipeSuccessThreshold={100}
        onSwipeSuccess={() => {
          navigate.goBack();
          setTimeout(() => {
            createVPN();
          }, 500);
        }}
        railBackgroundColor={theme ? COLORS.darkModeText : COLORS.primary}
        railBorderColor={theme ? backgroundColor : COLORS.lightModeBackground}
        height={55}
        railStyles={{
          backgroundColor: theme ? backgroundColor : COLORS.darkModeText,
          borderColor: theme ? backgroundColor : COLORS.darkModeText,
        }}
        thumbIconBackgroundColor={theme ? backgroundColor : COLORS.darkModeText}
        thumbIconBorderColor={theme ? backgroundColor : COLORS.darkModeText}
        titleColor={theme ? backgroundColor : COLORS.darkModeText}
        title="Slide to confirm"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    width: 120,
    height: 8,
    marginTop: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  borderTop: {
    width: '100%',
    height: 60,
    position: 'absolute',
    top: -5,
    zIndex: -1,

    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  optionsContainer: {
    width: '100%',
    height: '100%',
  },
});
