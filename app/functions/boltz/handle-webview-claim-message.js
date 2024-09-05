import axios from 'axios';
import {getBoltzApiUrl} from './boltzEndpoitns';
import {getLocalStorageItem, setLocalStorageItem} from '../localStorage';

export default function handleWebviewClaimMessage(
  navigate,
  event,
  receiveingPage,
  confirmFunction,
) {
  (async () => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.error) throw Error(data.error);

      if (typeof data === 'object' && data?.tx) {
        let didPost = false;
        let numberOfTries = 0;
        while (!didPost && numberOfTries < 5) {
          console.log('RUNNING BOLTZ POST');
          numberOfTries += 1;
          try {
            const response = await axios.post(
              `${getBoltzApiUrl(
                process.env.BOLTZ_ENVIRONMENT,
              )}/v2/chain/L-BTC/transaction`,
              {
                hex: data.tx,
              },
            );
            didPost = true;

            if (response.data?.id) {
              if (receiveingPage === 'notifications') return;
              if (receiveingPage === 'contactsPage') {
                navigate.goBack();
              } else if (receiveingPage === 'receivePage') {
                navigate.navigate('HomeAdmin');
                navigate.navigate('ConfirmTxPage', {
                  for: 'invoicePaid',
                  information: {},
                });
              } else if (receiveingPage === 'sendingPage') {
                navigate.navigate('HomeAdmin');
                navigate.navigate('ConfirmTxPage', {
                  for: 'paymentSucceed',
                  information: {},
                });
              } else if (receiveingPage === 'lnurlWithdrawl') {
                navigate.navigate('HomeAdmin');
                navigate.navigate('ConfirmTxPage', {
                  for: 'invoicePaid',
                  information: {},
                });
              } else if (receiveingPage === 'POS') {
                confirmFunction({
                  invoice: false,
                  claiming: false,
                  claimed: true,
                });
              } else if (receiveingPage === 'loadingScreen') {
                navigate.replace('HomeAdmin');
              }
            }
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
      } else {
        if (receiveingPage === 'loadingScreen') {
          navigate.replace('HomeAdmin');
        }
      }
    } catch (err) {
      console.log(err, 'WEBVIEW ERROR');
      if (typeof data === 'object' && data?.tx) {
        let claimTxs =
          JSON.parse(await getLocalStorageItem('boltzClaimTxs')) || [];

        claimTxs.push([data.tx, new Date()]);

        setLocalStorageItem('boltzClaimTxs', JSON.stringify(claimTxs));
      }
    }
  })();
}
