import {getLocalStorageItem, setLocalStorageItem} from '../localStorage';
import {getBoltzApiUrl} from './boltzEndpoitns';
import getBoltzFeeRates from './getBoltzFeerate,';

export default async function handleReverseClaimWSS({
  ref, //reqiured
  webSocket, //reqiured
  liquidAddress, //reqiured
  swapInfo, //reqiured
  preimage, //reqired
  privateKey, //reqiured
  sendPaymentObj,
  isReceivingSwapFunc,
  navigate, //reqiured
  fromPage,
  contactsFunction,
}) {
  const feeRate = await getBoltzFeeRates();
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
    let didRun = false;

    webSocket.onmessage = async rawMsg => {
      const msg = JSON.parse(rawMsg.data);
      console.log(`Swap Status ${msg.args[0].status}`);

      if (msg.event === 'subscribe') {
        resolve(true);
      }
      if (msg.args[0].status === 'swap.created') {
        const argsObject = {
          apiUrl: getBoltzApiUrl(process.env.BOLTZ_ENVIRONMENT),
          network: process.env.BOLTZ_ENVIRONMENT,
          address: liquidAddress,
          feeRate: process.env.BOLTZ_ENVIRONMENT === 'testnet' ? 0.11 : feeRate,
          swapInfo,
          privateKey,
          preimage,
          createdOn: new Date(),
        };

        handleSavedReverseClaims(argsObject, true);
      }

      if (msg.args[0].status === 'transaction.mempool') {
        if (fromPage === 'POS') {
          isReceivingSwapFunc({
            invoice: false,
            claiming: true,
            claimed: false,
          });
        } else if (fromPage === 'receivePage') {
          isReceivingSwapFunc();
        } else {
          isReceivingSwapFunc && isReceivingSwapFunc(true);
        }
        if (fromPage === 'notifications') return;
        // const feeRate = await getBoltzFeeRates();
        didRun = true;
        getClaimReverseSubmarineSwapJS({
          webViewRef: ref,
          address: liquidAddress,
          swapInfo,
          preimage,
          privateKey,
          feeRate: process.env.BOLTZ_ENVIRONMENT === 'testnet' ? 0.11 : feeRate,
        });
      } else if (msg.args[0].status === 'transaction.confirmed') {
        if (didRun) return;
        // const feeRate = await getBoltzFeeRates();
        getClaimReverseSubmarineSwapJS({
          webViewRef: ref,
          address: liquidAddress,
          swapInfo,
          preimage,
          privateKey,
          feeRate: process.env.BOLTZ_ENVIRONMENT === 'testnet' ? 0.11 : feeRate,
        });
        if (fromPage === 'notifications') {
          setTimeout(() => {
            webSocket.close();
          }, 1000 * 60);
        }
      } else if (msg.args[0].status === 'invoice.settled') {
        handleSavedReverseClaims(null, false);
        if (fromPage === 'contacts') {
          try {
            contactsFunction();
          } catch (err) {
            console.log(err);
          }
        } else if (fromPage === 'peg-out-transfer') {
          contactsFunction();
        }

        webSocket.close();
      }
    };
  });
}

export async function handleSavedReverseClaims(claim, shouldSave) {
  let savedClaimInfo =
    JSON.parse(await getLocalStorageItem('savedReverseSwapInfo')) || [];

  if (shouldSave) savedClaimInfo.push(claim);
  else savedClaimInfo.pop();

  setLocalStorageItem('savedReverseSwapInfo', JSON.stringify(savedClaimInfo));
}

function getClaimReverseSubmarineSwapJS({
  webViewRef,
  address,
  swapInfo,
  preimage,
  privateKey,
  feeRate,
}) {
  const args = JSON.stringify({
    apiUrl: getBoltzApiUrl(process.env.BOLTZ_ENVIRONMENT),
    network: process.env.BOLTZ_ENVIRONMENT,
    address,
    feeRate,
    swapInfo,
    privateKey,
    preimage,
  });

  webViewRef.current.injectJavaScript(
    `window.claimReverseSubmarineSwap(${args}); void(0);`,
  );
}
