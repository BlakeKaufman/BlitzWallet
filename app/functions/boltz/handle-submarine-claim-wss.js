import {getLocalStorageItem, setLocalStorageItem} from '../localStorage';
import {encriptMessage} from '../messaging/encodingAndDecodingMessages';
import {getBoltzApiUrl} from './boltzEndpoitns';

export default async function handleSubmarineClaimWSS({
  ref, //reqiured
  webSocket, //reqiured
  invoiceAddress, //reqiured
  swapInfo, //reqiured
  privateKey, //reqiured
  toggleMasterInfoObject, //reqiured
  masterInfoObject, //reqiured
  contactsPrivateKey, //reqiured
  refundJSON, //reqiured
  sendPaymentObj,
  isReceivingSwapFunc,
  handleFunction,
  navigate,
  page,
}) {
  console.log('RUNNING IN SUBMARINE CLAIM FUNCTION');
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
        const savedSwaps =
          JSON.parse(await getLocalStorageItem('savedLiquidSwaps')) || [];

        console.log(savedSwaps, 'SAVED SWAPS');

        setLocalStorageItem(
          'savedLiquidSwaps',
          JSON.stringify([...savedSwaps, refundJSON]),
        );
        // const encripted = encriptMessage(
        //   contactsPrivateKey,
        //   masterInfoObject.contacts.myProfile.uuid,
        //   JSON.stringify(refundJSON),
        // );

        // toggleMasterInfoObject({
        //   liquidSwaps: [...masterInfoObject.liquidSwaps].concat([encripted]),
        // });
      } else if (msg.args[0].status === 'invoice.failedToPay') {
        webSocket.close();
        if (page === 'loadingScreen') return;
        navigate.navigate('HomeAdmin');
        navigate.navigate('ConfirmTxPage', {
          for: 'paymentFailed',
          information: {},
        });
      } else if (msg.args[0].status === 'transaction.claim.pending') {
        getClaimSubmarineSwapJS({
          webViewRef: ref,
          invoiceAddress,
          swapInfo,
          privateKey,
        });
      } else if (msg.args[0].status === 'transaction.claimed') {
        let newLiquidTransactions = JSON.parse(
          await getLocalStorageItem('savedLiquidSwaps'),
        );
        console.log(newLiquidTransactions, 'newLiquidTransactions');
        newLiquidTransactions.pop();
        console.log(newLiquidTransactions, 'newLiquidTransactions');

        setLocalStorageItem(
          'savedLiquidSwaps',
          JSON.stringify(newLiquidTransactions),
        );
        // toggleMasterInfoObject({
        //   liquidSwaps: newLiquidTransactions,
        // });

        webSocket.close();
        if (page === 'sms4sats') return;
        if (page === 'VPN') {
          handleFunction();
          return;
        }

        if (page === 'loadingScreen') {
          navigate.navigate('HomeAdmin');
        } else {
          navigate.navigate('HomeAdmin');
          navigate.navigate('ConfirmTxPage', {
            for: 'paymentSucceed',
            information: {},
          });
        }
      }
    };
  });
}

function getClaimSubmarineSwapJS({
  webViewRef,
  invoiceAddress,
  swapInfo,
  privateKey,
}) {
  const args = JSON.stringify({
    apiUrl: getBoltzApiUrl(process.env.BOLTZ_ENVIRONMENT),
    network: process.env.BOLTZ_ENVIRONMENT === 'testnet' ? 'testnet' : 'liquid',
    invoice: invoiceAddress,
    swapInfo,
    privateKey,
  });

  console.log(args, 'WEBVIEW ARGS');

  webViewRef.current.injectJavaScript(
    `window.claimSubmarineSwap(${args}); void(0);`,
  );
}
