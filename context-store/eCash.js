import React, {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {queryContacts} from '../db';
import {useGlobalContextProvider} from './context';
import {getPublicKey} from 'nostr-tools';
import {decryptMessage} from '../app/functions/messaging/encodingAndDecodingMessages';
import {
  checkMintQuote,
  cleanEcashWalletState,
  createWallet,
  formatEcashTx,
  getEcashBalance,
  mintEcash,
} from '../app/functions/eCash';
import {storeProofs} from '../app/functions/eCash/proofStorage';
import {
  getStoredEcashTransactions,
  storeEcashTransactions,
} from '../app/functions/eCash/transactions';

// Create a context for the WebView ref
const GlobaleCash = createContext(null);

export const GlobaleCashVariables = ({children}) => {
  const {contactsPrivateKey, masterInfoObject} = useGlobalContextProvider();
  const publicKey = useMemo(
    () => contactsPrivateKey && getPublicKey(contactsPrivateKey),
    [contactsPrivateKey],
  );
  const [eCashBalance, setEcashBalance] = useState(0);

  const [ecashTransactions, setecashTransactions] = useState([]);
  const [eCashPaymentInformation, setEcashPaymentInformation] = useState({
    quote: null,
    invoice: null,
    proofsToUse: null,
  });
  const [eCashNavigate, seteCashNavigate] = useState(null);
  const eCashIntervalRef = useRef(null);
  const receiveEcashRef = useRef(null);
  const [receiveEcashQuote, setReceiveEcashQuote] = useState('');

  const parsedEcashInformation = useMemo(() => {
    if (!publicKey || !masterInfoObject.eCashInformation) return [];
    return typeof masterInfoObject.eCashInformation === 'string'
      ? [
          ...JSON.parse(
            decryptMessage(
              contactsPrivateKey,
              publicKey,
              masterInfoObject.eCashInformation,
            ),
          ),
        ]
      : [];
  }, [masterInfoObject.eCashInformation]);

  const currentMint = useMemo(() => {
    if (parsedEcashInformation.length === 0) return '';
    const [currentMint] = parsedEcashInformation.filter(
      mintInfo => mintInfo.isCurrentMint,
    );
    return currentMint;
  }, [masterInfoObject.eCashInformation]);

  console.log(parsedEcashInformation, 'PARSED ECAH INFORMATION');

  useEffect(() => {
    if (!receiveEcashQuote) return;
    receiveEcashRef.current = setInterval(async () => {
      const response = await checkMintQuote({
        quote: receiveEcashQuote,
      });

      if (response.paid) {
        clearInterval(receiveEcashRef.current);
        setReceiveEcashQuote('');
        const didMint = await mintEcash({
          quote: response.quote,
          invoice: response.request,
          mintURL: 'https://mint.lnwallet.app',
        });

        if (didMint.parsedInvoie) {
          const formattedEcashTx = formatEcashTx({
            time: Date.now(),
            amount: didMint.parsedInvoie.invoice.amountMsat / 1000,
            fee: 0,
            paymentType: 'received',
          });
          storeEcashTransactions(formattedEcashTx);

          setTimeout(async () => {
            updateUserBalance();
            const storedTransactions = await getStoredEcashTransactions();
            setecashTransactions(storedTransactions);
          }, 5000);
          eCashNavigate.navigate('HomeAdmin');
          eCashNavigate.navigate('ConfirmTxPage', {
            for: 'paymentSuceed',
            information: {},
          });
        }
      }
    }, 10000);
  }, [receiveEcashQuote]);

  useEffect(() => {
    if (
      !eCashPaymentInformation.invoice ||
      !eCashPaymentInformation.proofsToUse ||
      !eCashPaymentInformation.quote ||
      !eCashNavigate
    )
      return;
    // async function handlePayment() {
    payLnInvoiceFromEcash();
    // eCashIntervalRef.current = setInterval(checkEcashPaymentStatus, 5000);
    // }
    // handlePayment();
  }, [eCashPaymentInformation]);

  useEffect(() => {
    async function initEcash() {
      // if (!masterInfoObject.eCashProofs || !contactsPrivateKey) return;
      // const publicKey = getPublicKey(contactsPrivateKey);
      // const eCashBalance = await getEcashBalance({
      //   contactsPrivateKey: contactsPrivateKey,
      //   masterInfoObject: masterInfoObject,
      // });
      // let savedProofs =
      //   typeof masterInfoObject.eCashProofs === 'string'
      //     ? [
      //         ...JSON.parse(
      //           decryptMessage(
      //             contactsPrivateKey,
      //             publicKey,
      //             masterInfoObject.eCashProofs,
      //           ),
      //         ),
      //       ]
      //     : [];
      // setProofs(savedProofs);
      // setEcashBalance(eCashBalance);
      updateUserBalance();
      const storedTransactions = await getStoredEcashTransactions();
      setecashTransactions(storedTransactions);
    }
    initEcash();
  }, [masterInfoObject.eCashProofs]);

  return (
    <GlobaleCash.Provider
      value={{
        eCashBalance,
        seteCashNavigate,
        setEcashPaymentInformation,
        setReceiveEcashQuote,
        ecashTransactions,
        parsedEcashInformation,
        currentMint,
      }}>
      {children}
    </GlobaleCash.Provider>
  );

  async function updateUserBalance() {
    const userBalance = await getEcashBalance();
    setEcashBalance(userBalance);
  }

  async function payLnInvoiceFromEcash() {
    const wallet = await createWallet('https://mint.lnwallet.app');

    // console.log(eCashPaymentInformation.quote);

    try {
      const payResponse = await wallet.payLnInvoice(
        eCashPaymentInformation.invoice,
        eCashPaymentInformation.proofsToUse,
        eCashPaymentInformation.quote,
      );

      if (payResponse.isPaid) {
        setEcashPaymentInformation({
          quote: null,
          invoice: null,
          proofsToUse: null,
        });

        cleanEcashWalletState();
        if (payResponse.change.length > 0) storeProofs(payResponse.change);
        const formattedEcashTx = formatEcashTx({
          time: Date.now(),
          amount: eCashPaymentInformation.quote.amount,
          fee: eCashPaymentInformation.quote.fee_reserve,
          paymentType: 'sent',
        });
        storeEcashTransactions(formattedEcashTx);
        clearTimeout(eCashIntervalRef.current);

        setTimeout(async () => {
          updateUserBalance();
          const storedTransactions = await getStoredEcashTransactions();
          setecashTransactions(storedTransactions);
        }, 5000);
        eCashNavigate.navigate('HomeAdmin');
        eCashNavigate.navigate('ConfirmTxPage', {
          for: 'paymentSuceed',
          information: {},
        });
      } else {
        setEcashPaymentInformation({
          quote: null,
          invoice: null,
          proofsToUse: null,
        });
        eCashNavigate.navigate('HomeAdmin');
        eCashNavigate.navigate('ConfirmTxPage', {
          for: 'paymentFailed',
          information: {},
        });
      }
    } catch (err) {
      setEcashPaymentInformation({
        quote: null,
        invoice: null,
        proofsToUse: null,
      });
      eCashNavigate.navigate('HomeAdmin');
      eCashNavigate.navigate('ConfirmTxPage', {
        for: 'paymentFailed',
        information: {},
      });
      console.log(`ecash send error`, err);
    }
  }

  // async function checkEcashPaymentStatus() {
  //   const wallet = await createWallet('https://mint.lnwallet.app');

  //   try {
  //     const quoteStatus = await wallet.checkMeltQuote(
  //       eCashPaymentInformation.quote.quote,
  //     );

  //     console.log('____________________________________________________');
  //     console.log(quoteStatus);
  //     console.log('____________________________________________________');

  //     if (quoteStatus.state === 'PAID') {
  //       setEcashPaymentInformation({
  //         quote: null,
  //         invoice: null,
  //         proofsToUse: null,
  //       });

  //       cleanEcashWalletState();
  //       if (quoteStatus.change.length > 0) storeProofs(quoteStatus.change);
  //       clearTimeout(eCashIntervalRef.current);

  //       eCashNavigate.navigate('HomeAdmin');
  //       eCashNavigate.navigate('ConfirmTxPage', {
  //         for: 'paymentSuceed',
  //         information: {},
  //       });
  //     }
  //   } catch (err) {
  //     console.log(`listen for quote error`, err);
  //   }
  // }
};

export const useGlobaleCash = () => {
  return React.useContext(GlobaleCash);
};
