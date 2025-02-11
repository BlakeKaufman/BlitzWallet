import {View} from 'react-native';
import {useGlobalContextProvider} from '../../../context-store/context';
import {BITCOIN_SATS_ICON} from '../../constants';
import ThemeText from './textTheme';
import {formatCurrency} from '../formatCurrency';

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

  const currencyOptions = formatCurrency({
    amount: formattedBalance,
    code: nodeInformation.fiatStats.coin || 'USD',
  });

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
          <ThemeText
            styles={{includeFontPadding: false, ...styles}}
            content={BITCOIN_SATS_ICON}
          />
        )}

      <ThemeText
        reversed={reversed}
        content={`${
          localBalanceDenomination === 'hidden' && !neverHideBalance
            ? ''
            : localBalanceDenomination === 'fiat'
            ? `${currencyOptions[0]}`
            : formattedBalance
        }${
          masterInfoObject.satDisplay === 'symbol' &&
          (localBalanceDenomination === 'sats' ||
            (localBalanceDenomination === 'hidden' && neverHideBalance))
            ? ''
            : localBalanceDenomination === 'fiat'
            ? ``
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
