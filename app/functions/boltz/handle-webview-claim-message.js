import axios from 'axios';
import {getBoltzApiUrl} from './boltzEndpoitns';

export default function handleWebviewClaimMessage(
  navigate,
  event,
  receiveingPage,
  confirmFunction,
) {
  try {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.error) throw Error(data.error);

    if (typeof data === 'object' && data?.tx) {
      (async () => {
        try {
          const response = await axios.post(
            `${getBoltzApiUrl(
              process.env.BOLTZ_ENVIRONMENT,
            )}/v2/chain/L-BTC/transaction`,
            {
              hex: data.tx,
            },
          );

          if (response.data?.id) {
            if (receiveingPage === 'contactsPage') {
              navigate.goBack();
            } else if (receiveingPage === 'receivePage') {
              setTimeout(() => {
                navigate.navigate('HomeAdmin');
                navigate.navigate('ConfirmTxPage', {
                  for: 'paymentSucceed',
                  information: {},
                });
              }, 5000);
            } else if (receiveingPage === 'sendingPage') {
              setTimeout(() => {
                navigate.navigate('HomeAdmin');
                navigate.navigate('ConfirmTxPage', {
                  for: 'paymentSucceed',
                  information: {},
                });
              }, 5000);
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
      })();
    }
  } catch (err) {
    console.log(err, 'WEBVIEW ERROR');
  }
}
