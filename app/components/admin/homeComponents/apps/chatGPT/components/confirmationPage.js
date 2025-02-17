import {Platform, StyleSheet, View, useWindowDimensions} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import SwipeButton from 'rn-swipe-button';
import {ThemeText} from '../../../../../../functions/CustomElements';
import {COLORS, LIQUID_DEFAULT_FEE, SIZES} from '../../../../../../constants';
import FormattedSatText from '../../../../../../functions/CustomElements/satTextDisplay';
import GetThemeColors from '../../../../../../hooks/themeColors';
import {ANDROIDSAFEAREA, CENTER} from '../../../../../../constants/styles';
import {
  LIGHTNINGAMOUNTBUFFER,
  LIQUIDAMOUTBUFFER,
} from '../../../../../../constants/math';
import {useGlobalThemeContext} from '../../../../../../../context-store/theme';
import {useNodeContext} from '../../../../../../../context-store/nodeContext';

export default function ConfirmChatGPTPage(props) {
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();
  const {nodeInformation, liquidNodeInformation} = useNodeContext();
  const {theme, darkModeType} = useGlobalThemeContext();
  const {textColor, backgroundOffset, backgroundColor} = GetThemeColors();

  const liquidTxFee =
    process.env.BOLTZ_ENVIRONMENT === 'testnet' ? 30 : LIQUID_DEFAULT_FEE;

  const fee =
    liquidNodeInformation.userBalance > props.price + LIQUIDAMOUTBUFFER
      ? liquidTxFee
      : nodeInformation.userBalance > props.price + LIGHTNINGAMOUNTBUFFER
      ? Math.round(props.price * 0.005 + 4)
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

        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,

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
        containerStyles={{marginTop: 'auto'}}
        styles={{
          fontSize: SIZES.large,
          textAlign: 'center',
        }}
        frontText={'Price: '}
        balance={props.price}
      />
      <FormattedSatText
        neverHideBalance={true}
        containerStyles={{marginTop: 10, marginBottom: 'auto'}}
        styles={{
          textAlign: 'center',
        }}
        frontText={'Fee: '}
        balance={fee}
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
          navigate.navigate({
            name: 'AppStorePageIndex',
            params: {page: 'ai', purchaseCredits: true},
            merge: true,
          });
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
