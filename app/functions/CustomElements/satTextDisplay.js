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
  neverHideBalance,
  globalBalanceDenomination,
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
            color={theme ? COLORS.darkModeText : COLORS.lightModeText}
            width={iconWidth || 18}
            height={iconHeight || 18}
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
            ? ` ${nodeInformation.fiatStats.coin}`
            : localBalanceDenomination === 'hidden' && !neverHideBalance
            ? '* * * * *'
            : ' sats'
        }`}
        styles={{...styles, includeFontPadding: false}}
      />
    </View>
  );
}
