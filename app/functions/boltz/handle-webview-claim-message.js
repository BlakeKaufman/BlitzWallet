import {getBoltzApiUrl} from './boltzEndpoitns';
import {getLocalStorageItem, setLocalStorageItem} from '../localStorage';
import {Buffer} from 'buffer';
import {handleSavedReverseClaims} from './handle-reverse-claim-wss';
import {AUTO_CHANNEL_REBALANCE_STORAGE_KEY} from '../../constants';

export default function handleWebviewClaimMessage(
  navigate,
  event,
  receiveingPage,
  confirmFunction,
  // saveBotlzSwapIdFunction,
) {
  (async () => {
    const data = JSON.parse(event.nativeEvent.data);
    try {
      if (data.error) throw Error(data.error);

      console.log(data, 'WEBVIEW DATA');

      if (typeof data === 'object' && data?.tx) {
        let didPost = false;
        let numberOfTries = 0;
        while (!didPost && numberOfTries < 5) {
          console.log('RUNNING BOLTZ POST');
          numberOfTries += 1;
          try {
            const fetchRequse = await fetch(
              `${getBoltzApiUrl(
                process.env.BOLTZ_ENVIRONMENT,
              )}/v2/chain/L-BTC/transaction`,
              {
                method: 'POST',
                body: JSON.stringify({
                  hex: data.tx,
                }),
              },
            );

            const response = await fetchRequse.json();

            // axios.post(
            //   `${getBoltzApiUrl(
            //     process.env.BOLTZ_ENVIRONMENT,
            //   )}/v2/chain/L-BTC/transaction`,
            //   {
            //     hex: data.tx,
            //   },
            // );
            didPost = true;

            if (response?.id) {
              // if (receiveingPage === 'notifications') {
              //   return;
              // }
              // if (receiveingPage === 'savedClaimInformation') {
              //   const lnurlSwaps =
              //     JSON.parse(await getLocalStorageItem('lnurlSwaps')) || [];
              //   const backgroundPayments =
              //     JSON.parse(
              //       await getLocalStorageItem('savedReverseSwapInfo'),
              //     ) || [];
              //   const newSwaps = lnurlSwaps.filter(claim => {
              //     claim.swapInfo.id !== data.id;
              //   });
              //   const newBackgroundPayments = backgroundPayments.filter(
              //     claim => {
              //       claim.swapInfo.id !== data.id;
              //     },
              //   );
              //   setLocalStorageItem('lnurlSwaps', JSON.stringify(newSwaps));
              //   setLocalStorageItem(
              //     'savedReverseSwapInfo',
              //     JSON.stringify(newBackgroundPayments),
              //   );
              //   return;
              // }
              // if (receiveingPage === 'contactsPage') {
              //   navigate.goBack();
              // }
              // if (receiveingPage === 'sendingPage') {
              //   navigate.reset({
              //     index: 0, // The top-level route index
              //     routes: [
              //       {
              //         name: 'HomeAdmin',
              //         params: {screen: 'Home'},
              //       },
              //       {
              //         name: 'ConfirmTxPage',
              //         params: {
              //           for: 'paymentSucceed',
              //           information: {},
              //         },
              //       },
              //     ],
              //   });
              // }
              // else if (receiveingPage === 'lnurlWithdrawl') {
              //   navigate.reset({
              //     index: 0, // The top-level route index
              //     routes: [
              //       {
              //         name: 'HomeAdmin',
              //         params: {screen: 'Home'},
              //       },
              //       {
              //         name: 'ConfirmTxPage',
              //         params: {
              //           for: 'invoicePaid',
              //           information: {},
              //         },
              //       },
              //     ],
              //   });
              // }
              // else if (receiveingPage === 'loadingScreen') {
              //   // saveBotlzSwapIdFunction(
              //   //   response?.id,
              //   //   'autoChannelRebalance',
              //   // );
              //   // let boltzPayments =
              //   //   JSON.parse(
              //   //     await getLocalStorageItem(
              //   //       AUTO_CHANNEL_REBALANCE_STORAGE_KEY,
              //   //     ),
              //   //   ) ?? [];
              //   // boltzPayments.push(response?.id);
              //   // setLocalStorageItem(
              //   //   AUTO_CHANNEL_REBALANCE_STORAGE_KEY,
              //   //   JSON.stringify(boltzPayments),
              //   // );
              //   navigate.reset({
              //     index: 0, // The top-level route index
              //     routes: [
              //       {
              //         name: 'HomeAdmin',
              //         params: {screen: 'Home'},
              //       },
              //     ],
              //   });
              // }
            } else await new Promise(resolve => setTimeout(resolve, 5000));
          } catch (err) {
            console.log(err);
            if (receiveingPage === 'loadingScreen') {
              confirmFunction(1);
            }
          }
        }

        if (didPost) return;

        let claimTxs =
          JSON.parse(await getLocalStorageItem('boltzClaimTxs')) || [];

        claimTxs.push([data.tx, new Date()]);

        setLocalStorageItem('boltzClaimTxs', JSON.stringify(claimTxs));
      }
      // else {
      //   if (receiveingPage === 'loadingScreen') {
      //     navigate.reset({
      //       index: 0, // The top-level route index
      //       routes: [
      //         {
      //           name: 'HomeAdmin',
      //           params: {screen: 'Home'},
      //         },
      //       ],
      //     });
      //   }
      // }
    } catch (err) {
      console.log(err, 'WEBVIEW ERROR');
      // if (receiveingPage === 'savedClaimInformation') return;
      if (typeof data === 'object' && data?.tx) {
        let claimTxs =
          JSON.parse(await getLocalStorageItem('boltzClaimTxs')) || [];

        claimTxs.push([data.tx, new Date()]);

        setLocalStorageItem('boltzClaimTxs', JSON.stringify(claimTxs));
      }
    }
  })();
}
