import {SATSPERBITCOIN} from '../constants';

export default function numberConverter(
  num,
  denomination,
  nodeInformation,
  toFixed,
) {
  return (
    (denomination === 'fiat'
      ? num * ((nodeInformation?.fiatStats?.value || 65000) / SATSPERBITCOIN)
      : num
    )?.toFixed(toFixed || 0) || 0
  );
}
