import {SATSPERBITCOIN} from '../constants';

export default function numberConverter(num, denomination, nodeInformation) {
  return denomination === 'fiat'
    ? (num * SATSPERBITCOIN) / nodeInformation.fiatStats.value
    : num;
  console.log(num, denomination);
}
