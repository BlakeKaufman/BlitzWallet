import {SATSPERBITCOIN} from '../constants';

export default function numberConverter(num, denomination, nodeInformation) {
  return Math.round(
    denomination === 'fiat'
      ? (num * SATSPERBITCOIN) / nodeInformation.fiatStats.value
      : num,
  );
}
