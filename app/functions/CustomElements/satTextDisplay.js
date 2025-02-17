import {View} from 'react-native';
import {useGlobalContextProvider} from '../../../context-store/context';
import {BITCOIN_SATS_ICON} from '../../constants';
import ThemeText from './textTheme';
import {formatCurrency} from '../formatCurrency';
import {useNodeContext} from '../../../context-store/nodeContext';
import formatBalanceAmount from '../formatNumber';
import numberConverter from '../numberConverter';

export default function FormattedSatText({
  balance = 0,
  styles,
  reversed,
  frontText,
  containerStyles,
  isFailedPayment,
  neverHideBalance,
  globalBalanceDenomination,
  backText,
  useBalance,
}) {
  const {masterInfoObject} = useGlobalContextProvider();
  const {nodeInformation} = useNodeContext();
  const localBalanceDenomination =
    globalBalanceDenomination || masterInfoObject.userBalanceDenomination;
  const formattedBalance = useBalance
    ? balance
    : formatBalanceAmount(
        numberConverter(
          balance,
          localBalanceDenomination,
          nodeInformation,
          localBalanceDenomination === 'fiat' ? 2 : 0,
        ),
      );
  const currencyOptions = formatCurrency({
    amount: formattedBalance,
    code: nodeInformation.fiatStats.coin || 'USD',
  });

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
