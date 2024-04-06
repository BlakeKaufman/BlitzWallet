import {SATSPERBITCOIN} from '../constants';

export default function numberConverter(
  num,
  denomination,
  nodeInformation,
  toFixed,
) {
  console.log(denomination);
  return (
    denomination === 'fiat'
      ? num * (nodeInformation.fiatStats.value / SATSPERBITCOIN)
      : num
  ).toFixed(toFixed || 0);
}
