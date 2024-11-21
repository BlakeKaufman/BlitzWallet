import {InputTypeVariant} from '@breeztech/react-native-breez-sdk';

export function formatOnChainTx({time, amount, fee, orderID}) {
  let txObject = {
    time: null,
    amount: null,
    type: InputTypeVariant.BITCOIN_ADDRESS,
    paymentType: 'send',
    orderID: null,
    txHash: null,
    detectedConfs: 0,
    totalConfs: null,
  };
  txObject['time'] = time;
  txObject['amount'] = amount;
  txObject['orderID'] = orderID;

  return txObject;
}
