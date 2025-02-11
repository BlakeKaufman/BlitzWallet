import {BITCOIN_SATS_ICON} from '../constants';
import {formatCurrency} from './formatCurrency';
import formatBalanceAmount from './formatNumber';
import numberConverter from './numberConverter';

export default function displayCorrectDenomination({
  amount,
  nodeInformation,
  masterInfoObject,
}) {
  const convertedAmount = numberConverter(
    amount,
    masterInfoObject.userBalanceDenomination,
    nodeInformation,
    masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
  );
  const formattedCurrency = formatCurrency({
    amount: convertedAmount,
    code: nodeInformation?.fiatStats?.coin || 'USD',
  });
  const formatedSat = `${formatBalanceAmount(amount)} `;

  return masterInfoObject.userBalanceDenomination === 'fiat'
    ? formattedCurrency[0]
    : masterInfoObject.satDisplay === 'symbol'
    ? BITCOIN_SATS_ICON + formatedSat
    : formatedSat + 'sats';
}
