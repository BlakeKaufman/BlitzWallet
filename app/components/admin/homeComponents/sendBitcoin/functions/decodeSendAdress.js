import {
  InputTypeVariant,
  LnUrlCallbackStatusVariant,
  lnurlAuth,
  parseInput,
} from '@breeztech/react-native-breez-sdk';

import {Alert} from 'react-native';
import {decodeLiquidAddress} from '../../../../../functions/liquidWallet/decodeLiquidAddress';
import {assetIDS} from '../../../../../functions/liquidWallet/assetIDS';
import {SATSPERBITCOIN} from '../../../../../constants';
import {networks} from 'liquidjs-lib';

export default async function decodeSendAddress({
  nodeInformation,
  btcAdress,
  goBackFunction,
  setIsLightningPayment,
  setSendingAmount,
  setPaymentInfo,
  setIsLoading,
}) {
  try {
    try {
      const input = await parseInput(btcAdress);
      setupLNPage({
        input,
        setIsLightningPayment,
        setSendingAmount,
        setPaymentInfo,
        setIsLoading,
        goBackFunction,
      });
    } catch (err) {
      const rawLiquidAddress = btcAdress.startsWith(
        process.env.BOLTZ_ENVIRONMENT === 'testnet'
          ? 'liquidtestnet:'
          : 'liquidnetwork:',
      )
        ? btcAdress.split('?')[0].split(':')[1]
        : btcAdress;

      const input = decodeLiquidAddress(rawLiquidAddress);

      console.log(input);

      if (input)
        setupLiquidPage({
          btcAddress: btcAdress,
          setIsLightningPayment,
          setSendingAmount,
          setPaymentInfo,
          setIsLoading,
          goBackFunction,
        });
      else
        Alert.alert(
          'Not a valid Address',
          'Please try again with a different address',
          [{text: 'Ok', onPress: () => goBackFunction()}],
        );

      // console.log(err);
    }
  } catch (err) {
    Alert.alert('Something went wrong when reading address', '', [
      {text: 'Ok', onPress: () => goBackFunction()},
    ]);
    console.log(err);
  }
}
async function setupLiquidPage({
  btcAddress,
  setIsLightningPayment,
  setSendingAmount,
  setPaymentInfo,
  setIsLoading,
}) {
  setIsLightningPayment(false);
  console.log(btcAddress);
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
        addressInfo[label] = Math.round(information * SATSPERBITCOIN * 1000);

        return;
      } else if (label === 'label') {
        addressInfo[label] = decodeURIComponent(information);
        return;
      }

      addressInfo[label] = information;
    });

    addressInfo['isBip21'] = true;
    addressInfo['address'] = parsedAddress;
  } else {
    addressInfo['address'] = btcAddress;
    addressInfo['amount'] = null;
    addressInfo['label'] = null;
    addressInfo['isBip21'] = false;
    addressInfo['assetid'] = assetIDS['L-BTC'];
  }

  setSendingAmount(addressInfo.amount);
  setPaymentInfo({type: 'liquid', addressInfo: addressInfo});

  setTimeout(() => {
    setIsLoading(false);
  }, 1000);
}

async function setupLNPage({
  input,
  setIsLightningPayment,
  setSendingAmount,
  setPaymentInfo,
  setIsLoading,
  goBackFunction,
}) {
  setIsLightningPayment(true);

  try {
    if (input.type === InputTypeVariant.LN_URL_AUTH) {
      const result = await lnurlAuth(input.data);
      if (result.type === LnUrlCallbackStatusVariant.OK)
        Alert.alert('LNURL successfully authenticated', '', [
          {text: 'Ok', onPress: () => goBackFunction()},
        ]);
      else
        Alert.alert('Failed to authenticate LNURL', '', [
          {text: 'Ok', onPress: () => goBackFunction()},
        ]);
      return;
    } else if (input.type === InputTypeVariant.LN_URL_PAY) {
      const amountMsat = input.data.minSendable;
      setSendingAmount(amountMsat);
      setPaymentInfo(input);
      setIsLoading(false);

      return;
    } else if (input.type === InputTypeVariant.LN_URL_WITHDRAW) {
      Alert.alert('LNURL Withdrawl is coming soon...', '', [
        {text: 'Ok', onPress: () => goBackFunction()},
      ]);

      return;

      try {
        await withdrawLnurl({
          data: input.data,
          amountMsat: input.data.minWithdrawable,
          description: input.data.defaultDescription,
        });
        setHasError('Retrieving LNURL amount');
      } catch (err) {
        console.log(err);
        setHasError('Error comnpleting withdrawl');
      }

      return;
    }
    setSendingAmount(
      !input.invoice.amountMsat ? null : input.invoice.amountMsat,
    );
    setPaymentInfo(input);

    console.log(input);

    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  } catch (err) {
    Alert.alert(
      'Not a valid LN Address',
      'Please try again with a bolt 11 address',
      [{text: 'Ok', onPress: () => goBackFunction()}],
    );
    console.log(err);
  }
}
