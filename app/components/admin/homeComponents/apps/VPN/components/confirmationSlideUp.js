import {StyleSheet, View, useWindowDimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useEffect, useState} from 'react';
import SwipeButton from 'rn-swipe-button';
import {ThemeText} from '../../../../../../functions/CustomElements';
import {
  formatBalanceAmount,
  numberConverter,
} from '../../../../../../functions';
import {useGlobalContextProvider} from '../../../../../../../context-store/context';
import {CENTER, COLORS, SIZES} from '../../../../../../constants';
import FormattedSatText from '../../../../../../functions/CustomElements/satTextDisplay';
import GetThemeColors from '../../../../../../hooks/themeColors';
import {calculateBoltzFeeNew} from '../../../../../../functions/boltz/boltzFeeNew';
import {getLiquidTxFee} from '../../../../../../functions/liquidWallet';
import {ANDROIDSAFEAREA} from '../../../../../../constants/styles';
import {
  LIGHTNINGAMOUNTBUFFER,
  LIQUIDAMOUTBUFFER,
} from '../../../../../../constants/math';
import FullLoadingScreen from '../../../../../../functions/CustomElements/loadingScreen';

export default function ConfirmVPNPage(props) {
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    theme,
    nodeInformation,
    masterInfoObject,
    minMaxLiquidSwapAmounts,
    liquidNodeInformation,
  } = useGlobalContextProvider();
  const {duration, country, createVPN, price, slideHeight} = props;
  const {textColor, backgroundOffset, backgroundColor} = GetThemeColors();

  // const [liquidTxFee, setLiquidTxFee] = useState(null);
  const liquidTxFee = process.env.BOLTZ_ENVIRONMENT === 'testnet' ? 30 : 270;

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const txFee = await getLiquidTxFee({
  //         amountSat: price,
  //       });
  //       setLiquidTxFee(Number(txFee) || 250);
  //     } catch (err) {
  //       console.log(err);
  //       setLiquidTxFee(250);
  //     }
  //   })();
  // }, []);

  const fee =
    nodeInformation.userBalance > price + LIGHTNINGAMOUNTBUFFER
      ? 15
      : liquidTxFee
      ? liquidNodeInformation.userBalance > price + LIQUIDAMOUTBUFFER
        ? liquidTxFee
        : liquidTxFee +
          calculateBoltzFeeNew(
            price,
            'liquid-ln',
            minMaxLiquidSwapAmounts.submarineSwapStats,
          )
      : 0;

  return (
    <View
      style={{
        height: useWindowDimensions().height * slideHeight,
        width: '100%',
        backgroundColor: backgroundColor,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 10,
        paddingBottom: insets.bottom < 20 ? ANDROIDSAFEAREA : insets.bottom,
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

      {!liquidTxFee ? (
        <FullLoadingScreen />
      ) : (
        <>
          <ThemeText
            styles={{
              fontSize: SIZES.large,
              textAlign: 'center',
              marginBottom: 5,
            }}
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
                fee,
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
            railBorderColor={
              theme ? backgroundColor : COLORS.lightModeBackground
            }
            height={55}
            railStyles={{
              backgroundColor: theme ? backgroundColor : COLORS.darkModeText,
              borderColor: theme ? backgroundColor : COLORS.darkModeText,
            }}
            thumbIconBackgroundColor={
              theme ? backgroundColor : COLORS.darkModeText
            }
            thumbIconBorderColor={theme ? backgroundColor : COLORS.darkModeText}
            titleColor={theme ? backgroundColor : COLORS.darkModeText}
            title="Slide to confirm"
          />
        </>
      )}
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
