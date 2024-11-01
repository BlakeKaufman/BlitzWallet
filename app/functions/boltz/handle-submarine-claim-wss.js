import {InteractionManager} from 'react-native';
import {getLocalStorageItem, setLocalStorageItem} from '../localStorage';
import {encriptMessage} from '../messaging/encodingAndDecodingMessages';
import {getBoltzApiUrl} from './boltzEndpoitns';
import {createLiquidReceiveAddress} from '../liquidWallet';

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
  console.log(swapInfo);
  return new Promise(resolve => {
    webSocket.onopen = () => {
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

      console.log(`Swap Status ${msg.args[0].status}`);
      if (msg.event === 'subscribe') {
        resolve(true);
      }
      if (msg.args[0].status === 'transaction.mempool') {
        const savedSwaps =
          JSON.parse(await getLocalStorageItem('savedLiquidSwaps')) || [];
        setLocalStorageItem(
          'savedLiquidSwaps',
          JSON.stringify([...savedSwaps, refundJSON]),
        );
        console.log(refundJSON);
      } else if (msg.args[0].status === 'invoice.failedToPay') {
        // const savedSwaps =
        //   JSON.parse(await getLocalStorageItem('savedLiquidSwaps')) || [];
        const liquidAddres = await createLiquidReceiveAddress();
        getRefundSubmarineSwapJS({
          webViewRef: ref,
          privateKey: privateKey,
          swapInfo: swapInfo,
          address: liquidAddres.address,
        });
        // setLocalStorageItem(
        //   'savedLiquidSwaps',
        //   JSON.stringify([...savedSwaps, refundJSON]),
        // );
        if (page === 'loadingScreen') return;
        navigate.reset({
          index: 0, // The top-level route index
          routes: [
            {
              name: 'HomeAdmin',
              params: {screen: 'Home'},
            },
            {
              name: 'ConfirmTxPage',
              params: {
                for: 'paymentFailed',
                information: {},
              },
            },
          ],
        });
      } else if (msg.args[0].status === 'transaction.refunded') {
        webSocket.close();
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

        newLiquidTransactions.pop();

        setLocalStorageItem(
          'savedLiquidSwaps',
          JSON.stringify(newLiquidTransactions),
        );

        webSocket.close();
        if (page === 'sms4sats') return;
        if (page === 'VPN' || page === 'GiftCards') {
          handleFunction();
          return;
        }
        if (page === 'contacts') {
          InteractionManager.runAfterInteractions(() => {
            handleFunction();
          });
        }

        if (page === 'loadingScreen') {
          navigate.reset({
            index: 0, // The top-level route index
            routes: [
              {
                name: 'HomeAdmin',
                params: {screen: 'Home'},
              },
            ],
          });
        } else {
          navigate.reset({
            index: 0, // The top-level route index
            routes: [
              {
                name: 'HomeAdmin',
                params: {screen: 'Home'},
              },
              {
                name: 'ConfirmTxPage',
                params: {
                  for: 'paymentSucceed',
                  information: {},
                },
              },
            ],
          });
        }
      }
    };
  });
}

function getRefundSubmarineSwapJS({webViewRef, address, swapInfo, privateKey}) {
  const args = JSON.stringify({
    apiUrl: getBoltzApiUrl(process.env.BOLTZ_ENVIRONMENT),
    network: process.env.BOLTZ_ENVIRONMENT === 'testnet' ? 'testnet' : 'liquid',
    address,
    swapInfo,
    privateKey,
  });

  webViewRef.current.injectJavaScript(
    `window.refundSubmarineSwap(${args}); void(0);`,
  );
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

  webViewRef.current.injectJavaScript(
    `window.claimSubmarineSwap(${args}); void(0);`,
  );
}
