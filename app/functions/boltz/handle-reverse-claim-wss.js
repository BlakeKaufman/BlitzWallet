import {getBoltzApiUrl} from './boltzEndpoitns';

export default async function handleReverseClaimWSS({
  ref, //reqiured
  webSocket, //reqiured
  liquidAddress, //reqiured
  swapInfo, //reqiured
  preimage, //reqired
  privateKey, //reqiured
  sendPaymentObj,
  isReceivingSwapFunc,
  navigate,
}) {
  console.log(swapInfo, privateKey, preimage);
  return new Promise(resolve => {
    webSocket.onopen = () => {
      console.log('did un websocket open');
      webSocket.send(
        JSON.stringify({
          op: 'subscribe',
          channel: 'swap.update',
          args: [swapInfo.id],
        }),
      );
    };

    webSocket.onmessage = async rawMsg => {
      const msg = JSON.parse(rawMsg.data);
      console.log(msg);

      if (msg.event === 'subscribe') {
        resolve(true);
      }

      if (msg.args[0].status === 'transaction.mempool') {
        isReceivingSwapFunc && isReceivingSwapFunc(true);
        getClaimReverseSubmarineSwapJS({
          webViewRef: ref,
          address: liquidAddress,
          swapInfo,
          preimage,
          privateKey,
        });
      } else if (msg.args[0].status === 'invoice.settled') {
        webSocket.close();
      } else if (msg.args[0].status === 'transaction.failed') {
        webSocket.close();
        navigate.navigate('HomeAdmin');
        navigate.navigate('ConfirmTxPage', {
          for: 'paymentFailed',
          information: {},
        });
      }
    };
  });
}

function getClaimReverseSubmarineSwapJS({
  webViewRef,
  address,
  swapInfo,
  preimage,
  privateKey,
}) {
  const args = JSON.stringify({
    apiUrl: getBoltzApiUrl(process.env.BOLTZ_ENVIRONMENT),
    network: process.env.BOLTZ_ENVIRONMENT,
    address,
    feeRate: 1,
    swapInfo,
    privateKey,
    preimage,
  });

  console.log('SENDING CLAIM TO WEBVIEW', args);

  webViewRef.current.injectJavaScript(
    `window.claimReverseSubmarineSwap(${args}); void(0);`,
  );
}
