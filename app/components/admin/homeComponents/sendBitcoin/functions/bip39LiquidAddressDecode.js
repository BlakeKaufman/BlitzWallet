import {SATSPERBITCOIN} from '../../../../../constants';
import {assetIDS} from '../../../../../functions/liquidWallet/assetIDS';

export default function bip39LiquidAddressDecode(
  btcAddress,
  liquidNodeInformation,
) {
  const isBip21 = btcAddress.startsWith(
    process.env.BOLTZ_ENVIRONMENT === 'testnet'
      ? 'liquidtestnet:'
      : 'liquidnetwork:',
  );

  let addressInfo = {};

  if (isBip21) {
    const [address, paymentInfo] = btcAddress.split('?');

    const parsedAddress = address.split(':')[1];

    paymentInfo.split('&').forEach(data => {
      const [label, information] = data.split('=');
      if (label === 'amount') {
        addressInfo[label] = String(
          Math.round(
            information > 500
              ? information * 1000
              : information * SATSPERBITCOIN,
          ),
        );
        return;
      } else if (label === 'label') {
        addressInfo[label] = decodeURIComponent(information);
        return;
      }

      addressInfo[label] = information;
    });
    const shouldDrain =
      liquidNodeInformation.userBalance - addressInfo.amount < 10
        ? true
        : false;

    addressInfo['isBip21'] = true;
    addressInfo['address'] = parsedAddress;
    addressInfo['shouldDrain'] = shouldDrain;
  } else {
    addressInfo['address'] = btcAddress;
    addressInfo['amount'] = '';
    addressInfo['label'] = null;
    addressInfo['isBip21'] = false;
    addressInfo['assetid'] = assetIDS['L-BTC'];
  }

  console.log(addressInfo);

  return addressInfo;
}
