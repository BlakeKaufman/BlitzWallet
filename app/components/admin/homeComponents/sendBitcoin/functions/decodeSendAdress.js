import {
  InputTypeVariant,
  LnUrlCallbackStatusVariant,
  lnurlAuth,
  parseInput,
  withdrawLnurl,
} from '@breeztech/react-native-breez-sdk';
import {decodeLiquidAddress} from '../../../../../functions/liquidWallet/decodeLiquidAddress';
import bip39LiquidAddressDecode from './bip39LiquidAddressDecode';
import {getLNAddressForLiquidPayment} from './payments';
import {numberConverter} from '../../../../../functions';
import {SATSPERBITCOIN} from '../../../../../constants';

export default async function decodeSendAddress({
  nodeInformation,
  btcAdress,
  goBackFunction,
  // setIsLightningPayment,
  setSendingAmount,
  setPaymentInfo,
  // setIsLoading,
  liquidNodeInformation,
  masterInfoObject,
  setWebViewArgs,
  webViewRef,
  navigate,
  setHasError,
  maxZeroConf,
}) {
  try {
    let input;
    if (btcAdress.includes('cryptoqr.net')) {
      console.log(btcAdress.split('@')[1]);

      const response = await fetch(
        `https://${btcAdress.split('@')[1]}/.well-known/lnurlp/${
          btcAdress.split('@')[0]
        }`,
      );
      const data = await response.json();
      if (data.status === 'ERROR') {
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Not able to get merchant payment information',
          customNavigator: () => goBackFunction(),
        });
        // Alert.alert('Not able to get merchant payment information', '', [
        //   {text: 'Ok', onPress: () => goBackFunction()},
        // ]);
        return;
      }
      const bolt11 = await getLNAddressForLiquidPayment(
        {data: data, type: InputTypeVariant.LN_URL_PAY},
        data.minSendable / 1000,
      );

      input = await parseInput(bolt11);
      if (input.invoice.amountMsat / 1000 >= maxZeroConf) {
        navigate.navigate('ErrorScreen', {
          errorMessage: `Cannot send more than ${numberConverter(
            maxZeroConf,
            masterInfoObject.userBalanceDenomination,
            nodeInformation,
            masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
          )} ${
            masterInfoObject.userBalanceDenomination === 'fiat'
              ? nodeInformation.fiatStats.coin
              : 'sats'
          } to a merchant`,
          customNavigator: () => goBackFunction(),
        });

        return;
      }
    } else {
      input = await parseInput(btcAdress);
    }

    if (input.type === InputTypeVariant.BOLT11) {
      const currentTime = Math.floor(Date.now() / 1000);
      const expirationTime = input.invoice.timestamp + input.invoice.expiry;
      const isExpired = currentTime > expirationTime;
      if (isExpired) {
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Invoice is expired',
          customNavigator: () => goBackFunction(),
        });
        return;
      }
    }

    setupLNPage({
      input,
      setSendingAmount,
      setPaymentInfo,
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
    console.log(err, 'LIGHTNIG ERROR');
    try {
      const rawLiquidAddress = btcAdress.startsWith(
        process.env.BOLTZ_ENVIRONMENT === 'testnet'
          ? 'liquidtestnet:'
          : 'liquidnetwork:',
      )
        ? btcAdress.split('?')[0].split(':')[1]
        : btcAdress;

      const input = decodeLiquidAddress(rawLiquidAddress);

      if (input)
        setupLiquidPage({
          btcAddress: btcAdress,
          // setIsLightningPayment,
          setSendingAmount,
          setPaymentInfo,
          // setIsLoading,
          goBackFunction,
          liquidNodeInformation,
          nodeInformation,
          navigate,
          masterInfoObject,
        });
      else
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Error getting liquid address',
          customNavigator: () => goBackFunction(),
        });
    } catch (err) {
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Not a valid Address',
        customNavigator: () => goBackFunction(),
      });
    }
  }
}
async function setupLiquidPage({
  btcAddress,
  setSendingAmount,
  setPaymentInfo,
  goBackFunction,
  liquidNodeInformation,
  nodeInformation,
  navigate,
  masterInfoObject,
}) {
  const addressInfo = bip39LiquidAddressDecode(btcAddress);

  const amountSat = addressInfo.amount;
  const fiatValue =
    Number(amountSat) /
    (SATSPERBITCOIN / (nodeInformation.fiatStats?.value || 65000));

  console.log(fiatValue, 'FIAT VALUE');

  setPaymentInfo({
    data: addressInfo,
    type: 'liquid',
    paymentNetwork: 'liquid',
    sendAmount: !addressInfo.amount
      ? ''
      : `${
          masterInfoObject.userBalanceDenomination != 'fiat'
            ? `${amountSat}`
            : fiatValue < 0.01
            ? ''
            : `${fiatValue.toFixed(3)}`
        }`,
    canEditPayment: !addressInfo.isBip21,
  });

  // setSendingAmount(addressInfo.amount);
  // setPaymentInfo({type: 'liquid', addressInfo: addressInfo});

  // setTimeout(() => {
  //   setIsLoading(false);
  // }, 1000);
}

async function setupLNPage({
  input,
  setSendingAmount,
  setPaymentInfo,
  goBackFunction,
  nodeInformation,
  masterInfoObject,
  setWebViewArgs,
  webViewRef,
  navigate,
  setHasError,
}) {
  try {
    if (input.type === InputTypeVariant.LN_URL_AUTH) {
      const result = await lnurlAuth(input.data);
      if (result.type === LnUrlCallbackStatusVariant.OK) {
        navigate.navigate('ErrorScreen', {
          errorMessage: 'LNURL successfully authenticated',
          customNavigator: () => goBackFunction(),
        });
      } else {
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Failed to authenticate LNURL',
          customNavigator: () => goBackFunction(),
        });
      }
      return;
    } else if (input.type === InputTypeVariant.LN_URL_PAY) {
      const amountMsat = input.data.minSendable;
      const fiatValue =
        Number(amountMsat / 1000) /
        (SATSPERBITCOIN / (nodeInformation.fiatStats?.value || 65000));

      console.log(fiatValue, 'FIAT VALUE');
      // setSendingAmount(
      //   `${
      //     masterInfoObject.userBalanceDenomination != 'fiat'
      //       ? amountMsat / 1000
      //       : fiatValue < 0.01
      //       ? ''
      //       : fiatValue.toFixed(2)
      //   }`,
      // );
      setPaymentInfo({
        data: input.data,
        type: InputTypeVariant.LN_URL_PAY,
        paymentNetwork: 'lightning',
        sendAmount: `${
          masterInfoObject.userBalanceDenomination != 'fiat'
            ? `${Math.round(amountMsat / 1000)}`
            : fiatValue < 0.01
            ? ''
            : `${fiatValue.toFixed(2)}`
        }`,
        canEditPayment: true,
      });
      return;
    } else if (input.type === InputTypeVariant.LN_URL_WITHDRAW) {
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
          setHasError('Retrieving LNURL');
        } catch (err) {
          console.log(err);
          navigate.navigate('ErrorScreen', {
            errorMessage: 'Error comnpleting withdrawl',
            customNavigator: () => goBackFunction(),
          });
        }
      } else if (
        masterInfoObject.liquidWalletSettings.regulatedChannelOpenSize
      ) {
        navigate.navigate('ErrorScreen', {
          errorMessage: 'LNURL Withdrawl is coming soon...',
          customNavigator: () => goBackFunction(),
        });
        // Alert.alert('LNURL Withdrawl is coming soon...', '', [
        //   {text: 'Ok', onPress: () => goBackFunction()},
        // ]);

        return;
        // const response = await createLNToLiquidSwap(
        //   input.data.maxWithdrawable / 1000,
        //   null,
        //   'lnurlWithdrawl',
        // );
        // if (response) {
        //   const [
        //     data,
        //     pairSwapInfo,
        //     publicKey,
        //     privateKey,
        //     keys,
        //     preimage,
        //     liquidAddress,
        //   ] = response;
        //   console.log(data, 'DATA');
        //   console.log(input);
        //   setWebViewArgs({navigate: navigate, page: 'lnurlWithdrawl'});

        //   const webSocket = new WebSocket(
        //     `${getBoltzWsUrl(process.env.BOLTZ_ENVIRONMENT)}`,
        //   );
        //   const didSet = await handleReverseClaimWSS({
        //     ref: webViewRef,
        //     webSocket,
        //     liquidAddress: liquidAddress,
        //     swapInfo: data,
        //     preimage: preimage,
        //     privateKey: keys.privateKey.toString('hex'),
        //     navigate,
        //   });
        //   if (didSet) {
        //     try {
        //       const axiosResponse = await axios.get(
        //         `${input.data.callback}${
        //           input.data.callback.includes('?') ? '&' : '?'
        //         }k1=${input.data.k1}&pr=${data.invoice}`,
        //       );
        //       console.log(axiosResponse.data);
        //       if (axiosResponse.data?.status.toLowerCase() != 'ok') {
        //         webSocket.close();
        //         Alert.alert(`${axiosResponse.data.reason}`, '', [
        //           {text: 'Ok', onPress: () => goBackFunction()},
        //         ]);
        //       }
        //     } catch (err) {
        //       console.log(err);
        //       Alert.alert('Error when sending invoice', '', [
        //         {text: 'Ok', onPress: () => goBackFunction()},
        //       ]);
        //     }
        //   }
        // } else {
        //   console.log(response, 'NOT WORKING');

        //   Alert.alert(
        //     'Withdrawl amount is too low. Must be above 1000 sats',
        //     '',
        //     [{text: 'Ok', onPress: () => goBackFunction()}],
        //   );
        // }
      }
      return;
    }
    console.log(input);
    setPaymentInfo({
      data: input,
      type: InputTypeVariant.BOLT11,
      paymentNetwork: 'lightning',
      sendAmount: !input.invoice.amountMsat
        ? ''
        : `${
            masterInfoObject.userBalanceDenomination != 'fiat'
              ? `${Math.round(input.invoice.amountMsat / 1000)}`
              : fiatValue < 0.01
              ? ''
              : `${fiatValue.toFixed(2)}`
          }`,
      canEditPayment: !input.invoice.amountMsat,
    });
    // setSendingAmount(
    //   !input.invoice.amountMsat ? '' : input.invoice.amountMsat / 1000,
    // );
    // setPaymentInfo(input);
  } catch (err) {
    navigate.navigate('ErrorScreen', {
      errorMessage: 'Not a valid Address',
      customNavigator: () => goBackFunction(),
    });

    console.log(err);
  }
}
