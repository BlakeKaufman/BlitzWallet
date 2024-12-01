import axios from 'axios';
import {getBoltzApiUrl} from './boltzEndpoitns';
import {getLocalStorageItem, setLocalStorageItem} from '../localStorage';
import {Buffer} from 'buffer';
import {handleSavedReverseClaims} from './handle-reverse-claim-wss';

export default function handleWebviewClaimMessage(
  navigate,
  event,
  receiveingPage,
  confirmFunction,
) {
  (async () => {
    const data = JSON.parse(event.nativeEvent.data);
    try {
      if (data.error) throw Error(data.error);

      if (typeof data === 'object' && data?.refundTx) {
        let didPost = false;
        let numberOfTries = 0;
        while (!didPost && numberOfTries < 5) {
          numberOfTries += 1;
          try {
            const response = await axios.post(
              `${getBoltzApiUrl(
                process.env.BOLTZ_ENVIRONMENT,
              )}/v2/chain/L-BTC/transaction`,
              {
                hex: data.refundTx,
              },
            );
            didPost = true;

            if (response.data.id) {
              const savedFailedSwaps =
                JSON.parse(await getLocalStorageItem('savedLiquidSwaps')) || [];

              const newSwaps = savedFailedSwaps.filter(claim => {
                claim.swapInfo.id !== data.id;
              });

              setLocalStorageItem('savedLiquidSwaps', JSON.stringify(newSwaps));

              // let savedSwaps =
              //   JSON.parse(await getLocalStorageItem('savedLiquidSwaps')) || [];
              // savedSwaps.pop();
              // setLocalStorageItem(
              //   'savedLiquidSwaps',
              //   JSON.stringify(savedSwaps),
              // );
            }
          } catch (err) {
            console.log('POST REFUND SWAP CLAIM ERR', err);
          }
        }
        return;
      }

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

            let boltzPayments =
              JSON.parse(await getLocalStorageItem('boltzPaymentIds')) ?? [];
            boltzPayments.push(response.data?.id);

            setLocalStorageItem(
              'boltzPaymentIds',
              JSON.stringify(boltzPayments),
            );

            console.log(response.data?.id);

            if (response.data?.id) {
              if (receiveingPage === 'notifications') {
                return;
              }

              if (receiveingPage === 'savedClaimInformation') {
                const lnurlSwaps =
                  JSON.parse(await getLocalStorageItem('lnurlSwaps')) || [];
                const backgroundPayments =
                  JSON.parse(
                    await getLocalStorageItem('savedReverseSwapInfo'),
                  ) || [];

                const newSwaps = lnurlSwaps.filter(claim => {
                  claim.swapInfo.id !== data.id;
                });
                const newBackgroundPayments = backgroundPayments.filter(
                  claim => {
                    claim.swapInfo.id !== data.id;
                  },
                );

                setLocalStorageItem('lnurlSwaps', JSON.stringify(newSwaps));
                setLocalStorageItem(
                  'savedReverseSwapInfo',
                  JSON.stringify(newBackgroundPayments),
                );
                return;
              }
              if (receiveingPage === 'contactsPage') {
                navigate.goBack();
              } else if (receiveingPage === 'receivePage') {
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
                        for: 'invoicePaid',
                        information: {},
                      },
                    },
                  ],
                });
              } else if (receiveingPage === 'sendingPage') {
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
              } else if (receiveingPage === 'lnurlWithdrawl') {
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
                        for: 'invoicePaid',
                        information: {},
                      },
                    },
                  ],
                });
              } else if (receiveingPage === 'POS') {
                confirmFunction({
                  invoice: false,
                  claiming: false,
                  claimed: true,
                });
              } else if (receiveingPage === 'loadingScreen') {
                navigate.reset({
                  index: 0, // The top-level route index
                  routes: [
                    {
                      name: 'HomeAdmin',
                      params: {screen: 'Home'},
                    },
                  ],
                });
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
          navigate.reset({
            index: 0, // The top-level route index
            routes: [
              {
                name: 'HomeAdmin',
                params: {screen: 'Home'},
              },
            ],
          });
        }
      }
    } catch (err) {
      console.log(err, 'WEBVIEW ERROR');
      if (receiveingPage === 'savedClaimInformation') return;
      if (typeof data === 'object' && data?.tx) {
        let claimTxs =
          JSON.parse(await getLocalStorageItem('boltzClaimTxs')) || [];

        claimTxs.push([data.tx, new Date()]);

        setLocalStorageItem('boltzClaimTxs', JSON.stringify(claimTxs));
      }
    }
  })();
}
