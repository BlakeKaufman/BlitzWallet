import {
  Image,
  Platform,
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
import {ThemeText} from '../../../../../../functions/CustomElements';
import {
  formatBalanceAmount,
  numberConverter,
} from '../../../../../../functions';
import {useGlobalContextProvider} from '../../../../../../../context-store/context';
import {COLORS, LIQUID_DEFAULT_FEE, SIZES} from '../../../../../../constants';
import FormattedSatText from '../../../../../../functions/CustomElements/satTextDisplay';
import GetThemeColors from '../../../../../../hooks/themeColors';
import {ANDROIDSAFEAREA, CENTER} from '../../../../../../constants/styles';
import FullLoadingScreen from '../../../../../../functions/CustomElements/loadingScreen';
import {
  LIGHTNINGAMOUNTBUFFER,
  LIQUIDAMOUTBUFFER,
} from '../../../../../../constants/math';
// import CustomSwipButton from '../../../../../../functions/CustomElements/customSliderButton';

export default function ConfirmChatGPTPage(props) {
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    theme,
    nodeInformation,
    masterInfoObject,
    minMaxLiquidSwapAmounts,
    liquidNodeInformation,
  } = useGlobalContextProvider();
  const {textColor, backgroundOffset, backgroundColor} = GetThemeColors();

  const liquidTxFee =
    process.env.BOLTZ_ENVIRONMENT === 'testnet' ? 30 : LIQUID_DEFAULT_FEE;

  const fee =
    liquidNodeInformation.userBalance > props.price + LIQUIDAMOUTBUFFER
      ? liquidTxFee
      : nodeInformation.userBalance > props.price + LIGHTNINGAMOUNTBUFFER
      ? 15
      : 0;

  const bottomPadding = Platform.select({
    ios: insets.bottom,
    android: ANDROIDSAFEAREA,
  });

  return (
    <View
      style={{
        height: useWindowDimensions().height * props.slideHeight,
        width: '100%',
        backgroundColor: backgroundColor,

        // borderTopColor: theme ? COLORS.darkModeText : COLORS.lightModeText,
        // borderTopWidth: 10,

        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,

        // borderTopLeftRadius: 10,
        // borderTopRightRadius: 10,

        padding: 10,
        paddingBottom: bottomPadding,
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
            content={'Confirm Purchase'}
          />

          <ThemeText
            styles={{fontSize: SIZES.large, marginTop: 10}}
            content={`Plan: ${props.plan}`}
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
                props.price,
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

          {/* <CustomSwipButton
            sliderSize={55}
            onComplete={() => {
              navigate.goBack();
              setTimeout(() => {
                props.payForPlan();
              }, 500);
            }}
          /> */}

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
                props.payForPlan();
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
