import {parseInvoice} from '@breeztech/react-native-breez-sdk';
import {createWallet, formatEcashTx, getProofsToUse} from '.';
import {sumProofsValue} from './proofs';
import {removeProofs} from './proofStorage';
export default async function payLnInvoiceFromEcash({
  currentMint,
  proofsToUse,
  invoice,
  feeReserve,
  saveNewEcashInformation,
  eCashPaymentInformation,
  eCashNavigate,
  getStoredEcashTransactions,
  setecashTransactions,
  updateUserBalance,
  paymentQuote,
  sendingAmount,
}) {
  return new Promise(async resolve => {
    const wallet = await createWallet(currentMint.mintURL);
    let proofs = JSON.parse(JSON.stringify(proofsToUse));
    let globalProofTracker = JSON.parse(JSON.stringify(currentMint.proofs));
    let returnChangeGlobal = [];
    const decodedInvoice = await parseInvoice(invoice);
    const amount = decodedInvoice.amountMsat / 1000;
    const amountToPay = (feeReserve || 5) + amount;

    console.log('Proofs before send', proofs);
    console.log(sumProofsValue(proofs), amountToPay);
    try {
      if (sumProofsValue(proofs) >= amountToPay) {
        console.log('[payLnInvoce] use send ', {
          amountToPay,
          amount,
          fee: feeReserve,
          proofs: sumProofsValue(proofs),
        });
        const {send, returnChange} = await wallet.send(
          amountToPay,
          proofs,
          undefined,
        );
        if (returnChange?.length) {
          returnChangeGlobal.push(...returnChange);
        }
        if (send?.length) {
          globalProofTracker = removeProofs(proofs, globalProofTracker);
        }
        proofs = send;
      } else throw Error('Not enough to cover payment');
      console.log('Proofs after send', proofs);
      const payResponse = await wallet.payLnInvoice(
        invoice,
        proofs,
        paymentQuote,
      );
      console.log('PAY RSPONSE', payResponse);
      if (payResponse?.change?.length) {
        returnChangeGlobal.push(...payResponse?.change);
      }
      if (payResponse.isPaid) {
        //   setEcashPaymentInformation({
        //     quote: null,
        //     invoice: null,
        //     proofsToUse: null,
        //   });
        const realFee = feeReserve - sumProofsValue(payResponse.change);
        const formattedEcashTx = formatEcashTx({
          time: Date.now(),
          amount: sendingAmount,
          fee: realFee,
          paymentType: 'sent',
        });
        saveNewEcashInformation({
          transactions: [...currentMint.transactions, formattedEcashTx],
          proofs: [...globalProofTracker, ...returnChangeGlobal],
        });
        // clearTimeout(eCashIntervalRef.current);
        setTimeout(() => {
          updateUserBalance();
          const storedTransactions = getStoredEcashTransactions();
          setecashTransactions(storedTransactions);

          if (eCashPaymentInformation.isAutoChannelRebalance || !eCashNavigate)
            return;
          eCashNavigate.reset({
            index: 0, // The top-level route index
            routes: [
              {
                name: 'HomeAdmin', // Navigate to HomeAdmin
                params: {
                  screen: 'Home',
                },
              },

              {
                name: 'ConfirmTxPage', // Navigate to ExpandedAddContactsPage
                params: {
                  for: 'paymentSucceed',
                  information: {},
                },
              },
            ],
            // Array of routes to set in the stack
          });
          // eCashNavigate.navigate('HomeAdmin');
          // eCashNavigate.navigate('ConfirmTxPage', {
          //   for: 'paymentSucceed',
          //   information: {},
          // });
        }, 2000);
      }
    } catch (err) {
      // setEcashPaymentInformation({
      //   quote: null,
      //   invoice: null,
      //   proofsToUse: null,
      // });
      saveNewEcashInformation({
        transactions: currentMint.transactions,
        proofs: [...globalProofTracker, ...returnChangeGlobal],
      });
      if (eCashPaymentInformation.isAutoChannelRebalance || !eCashNavigate)
        return;
      setTimeout(() => {
        eCashNavigate.reset({
          index: 0, // The top-level route index
          routes: [
            {
              name: 'HomeAdmin', // Navigate to HomeAdmin
              params: {
                screen: 'Home',
              },
            },

            {
              name: 'ConfirmTxPage', // Navigate to ExpandedAddContactsPage
              params: {
                for: 'paymentFailed',
                information: {},
              },
            },
          ],
          // Array of routes to set in the stack
        });
        // eCashNavigate.navigate('HomeAdmin');
        // eCashNavigate.navigate('ConfirmTxPage', {
        //   for: 'paymentFailed',
        //   information: {},
        // });
      }, 2000);

      console.log(`ecash send error`, err);
    }
  });
}
