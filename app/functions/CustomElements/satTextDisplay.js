import {Text, View} from 'react-native';
import {useGlobalContextProvider} from '../../../context-store/context';
import {COLORS, FONT, SIZES} from '../../constants';
import Icon from './Icon';
import ThemeText from './textTheme';

export default function FormattedSatText({
  formattedBalance,
  styles,
  reversed,
  iconHeight,
  iconWidth,
  frontText,
  containerStyles,
  isFailedPayment,
  neverHideBalance,
  globalBalanceDenomination,
  backText,
  iconColor,
}) {
  const {theme, masterInfoObject, nodeInformation} = useGlobalContextProvider();

  const localBalanceDenomination =
    globalBalanceDenomination || masterInfoObject.userBalanceDenomination;

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        ...containerStyles,
      }}>
      {frontText && (
        <ThemeText
          styles={{includeFontPadding: false, ...styles}}
          content={`${frontText}`}
        />
      )}
      {masterInfoObject.satDisplay === 'symbol' &&
        (localBalanceDenomination === 'sats' ||
          (localBalanceDenomination === 'hidden' && neverHideBalance)) && (
          <Icon
            color={
              iconColor
                ? iconColor
                : isFailedPayment
                ? COLORS.cancelRed
                : theme
                ? COLORS.darkModeText
                : COLORS.lightModeText
            }
            width={iconWidth || 15}
            height={iconHeight || 15}
            name={'bitcoinB'}
          />
        )}

      <ThemeText
        reversed={reversed}
        content={`${
          localBalanceDenomination === 'hidden' && !neverHideBalance
            ? ''
            : formattedBalance
        }${
          masterInfoObject.satDisplay === 'symbol' &&
          (localBalanceDenomination === 'sats' ||
            (localBalanceDenomination === 'hidden' && neverHideBalance))
            ? ''
            : localBalanceDenomination === 'fiat'
            ? ` ${nodeInformation.fiatStats.coin || 'USD'}`
            : localBalanceDenomination === 'hidden' && !neverHideBalance
            ? '* * * * *'
            : ' sats'
        }`}
        styles={{includeFontPadding: false, ...styles}}
      />
      {backText && (
        <ThemeText
          styles={{includeFontPadding: false, ...styles}}
          content={`${backText}`}
        />
      )}
    </View>
  );
}
