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
}) {
  const {theme, masterInfoObject, nodeInformation} = useGlobalContextProvider();

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
        (masterInfoObject.userBalanceDenomination === 'sats' ||
          (masterInfoObject.userBalanceDenomination === 'hidden' &&
            neverHideBalance)) && (
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
          masterInfoObject.userBalanceDenomination === 'hidden' &&
          !neverHideBalance
            ? ''
            : formattedBalance
        }${
          masterInfoObject.satDisplay === 'symbol' &&
          (masterInfoObject.userBalanceDenomination === 'sats' ||
            (masterInfoObject.userBalanceDenomination === 'hidden' &&
              neverHideBalance))
            ? ''
            : masterInfoObject.userBalanceDenomination === 'fiat'
            ? ` ${nodeInformation.fiatStats.coin}`
            : masterInfoObject.userBalanceDenomination === 'hidden' &&
              !neverHideBalance
            ? '* * * * *'
            : ' sats'
        }`}
        styles={{...styles, includeFontPadding: false, marginLeft: 5}}
      />
    </View>
  );
}
