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
import createLNToLiquidSwap from '../../../../../functions/boltz/LNtoLiquidSwap';
import handleReverseClaimWSS from '../../../../../functions/boltz/handle-reverse-claim-wss';
import {getBoltzWsUrl} from '../../../../../functions/boltz/boltzEndpoitns';
import axios from 'axios';

async function decodeSendAddress({
  nodeInformation,
  btcAdress,
  goBackFunction,
  setIsLightningPayment,
  setSendingAmount,
  setPaymentInfo,
  setIsLoading,
  liquidNodeInformation,
  masterInfoObject,
  setWebViewArgs,
  webViewRef,
  navigate,
  setHasError,
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
        nodeInformation,
        liquidNodeInformation,
        masterInfoObject,
        setWebViewArgs,
        webViewRef,
        navigate,
        setHasError,
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

  const addressInfo = bip39LiquidAddressDecode(btcAddress);
  // const isBip21 = btcAddress.startsWith(
  //   process.env.BOLTZ_ENVIRONMENT === 'testnet'
  //     ? 'liquidtestnet:'
  //     : 'liquidnetwork:',
  // );

  // let addressInfo = {};

  // if (isBip21) {
  //   const [address, paymentInfo] = btcAddress.split('?');

  //   const parsedAddress = address.split(':')[1];

  //   paymentInfo.split('&').forEach(data => {
  //     const [label, information] = data.split('=');
  //     if (label === 'amount') {
  //       console.log(information);
  //       addressInfo[label] = String(
  //         Math.round(
  //           information > 500
  //             ? information * 1000
  //             : information * SATSPERBITCOIN * 1000,
  //         ),
  //       );
  //       return;
  //     } else if (label === 'label') {
  //       addressInfo[label] = decodeURIComponent(information);
  //       return;
  //     }

  //     addressInfo[label] = information;
  //   });

  //   addressInfo['isBip21'] = true;
  //   addressInfo['address'] = parsedAddress;
  // } else {
  //   addressInfo['address'] = btcAddress;
  //   addressInfo['amount'] = '';
  //   addressInfo['label'] = null;
  //   addressInfo['isBip21'] = false;
  //   addressInfo['assetid'] = assetIDS['L-BTC'];
  // }

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
  nodeInformation,
  liquidNodeInformation,
  masterInfoObject,
  setWebViewArgs,
  webViewRef,
  navigate,
  setHasError,
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
      console.log(input.data);
      setSendingAmount(`${amountMsat / 1000}`);
      setPaymentInfo(input);
      setIsLoading(false);

      return;
    } else if (input.type === InputTypeVariant.LN_URL_WITHDRAW) {
      setHasError('Retrieving LNURL amount');

      if (
        nodeInformation.userBalance != 0 &&
        nodeInformation.inboundLiquidityMsat / 1000 >
          input.data.maxWithdrawable / 1000 + 100
      ) {
        try {
          await withdrawLnurl({
            data: input.data,
            amountMsat: input.data.maxWithdrawable,
            description: input.data.defaultDescription,
          });
          setHasError('Retrieving LNURL amount');
        } catch (err) {
          console.log(err);
          setHasError('Error comnpleting withdrawl');
        }
      } else if (
        masterInfoObject.liquidWalletSettings.regulatedChannelOpenSize
      ) {
        Alert.alert('LNURL Withdrawl to bank is coming soon...', '', [
          {text: 'Ok', onPress: () => goBackFunction()},
        ]);

        return;
        const response = await createLNToLiquidSwap(
          input.data.maxWithdrawable / 1000,
          null,
          'lnurlWithdrawl',
        );
        if (response) {
          const [
            data,
            pairSwapInfo,
            publicKey,
            privateKey,
            keys,
            preimage,
            liquidAddress,
          ] = response;
          console.log(data, 'DATA');
          console.log(input);
          setWebViewArgs({navigate: navigate, page: 'lnurlWithdrawl'});

          const webSocket = new WebSocket(
            `${getBoltzWsUrl(process.env.BOLTZ_ENVIRONMENT)}`,
          );
          const didSet = await handleReverseClaimWSS({
            ref: webViewRef,
            webSocket,
            liquidAddress: liquidAddress,
            swapInfo: data,
            preimage: preimage,
            privateKey: keys.privateKey.toString('hex'),
            navigate,
          });
          if (didSet) {
            try {
              const axiosResponse = await axios.get(
                `${input.data.callback}${
                  input.data.callback.includes('?') ? '&' : '?'
                }k1=${input.data.k1}&pr=${data.invoice}`,
              );
              console.log(axiosResponse.data);
              if (axiosResponse.data?.status.toLowerCase() != 'ok') {
                webSocket.close();
                Alert.alert(`${axiosResponse.data.reason}`, '', [
                  {text: 'Ok', onPress: () => goBackFunction()},
                ]);
              }
            } catch (err) {
              console.log(err);
              Alert.alert('Error when sending invoice', '', [
                {text: 'Ok', onPress: () => goBackFunction()},
              ]);
            }
          }
        } else {
          console.log(response, 'NOT WORKING');

          Alert.alert(
            'Withdrawl amount is too low. Must be above 1000 sats',
            '',
            [{text: 'Ok', onPress: () => goBackFunction()}],
          );
        }
      }
      return;
    }
    setSendingAmount(!input.invoice.amountMsat ? '' : input.invoice.amountMsat);
    setPaymentInfo(input);

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

function bip39LiquidAddressDecode(btcAddress) {
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
              : information * SATSPERBITCOIN * 1000,
          ),
        );
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
    addressInfo['amount'] = '';
    addressInfo['label'] = null;
    addressInfo['isBip21'] = false;
    addressInfo['assetid'] = assetIDS['L-BTC'];
  }

  return addressInfo;
}

export {bip39LiquidAddressDecode, decodeSendAddress};
