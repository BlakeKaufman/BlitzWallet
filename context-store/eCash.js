import React, {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {useGlobalContextProvider} from './context';
import {getPublicKey} from 'nostr-tools';
import {
  decryptMessage,
  encriptMessage,
} from '../app/functions/messaging/encodingAndDecodingMessages';
import {
  checkMintQuote,
  cleanEcashWalletState,
  createWallet,
  formatEcashTx,
  getProofsToUse,
  mintEcash,
} from '../app/functions/eCash';
import {addDataToCollection} from '../db';

// Create a context for the WebView ref
const GlobaleCash = createContext(null);

export const GlobaleCashVariables = ({children}) => {
  const {contactsPrivateKey} = useGlobalContextProvider();

  const [globalEcashInformation, setGlobalEcashInformation] = useState({});
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

  const toggleGLobalEcashInformation = (newData, writeToDB) => {
    setGlobalEcashInformation(prev => {
      // const newContacts = {...prev, ...newData};

      if (writeToDB) {
        addDataToCollection({eCashInformation: newData}, 'blitzWalletUsers');
        return newData;
      } else return newData;
    });
  };

  const parsedEcashInformation = useMemo(() => {
    if (!publicKey || !globalEcashInformation) return [];
    return typeof globalEcashInformation === 'string'
      ? [
          ...JSON.parse(
            decryptMessage(
              contactsPrivateKey,
              publicKey,
              globalEcashInformation,
            ),
          ),
        ]
      : [];
  }, [globalEcashInformation]);

  const currentMint = useMemo(() => {
    if (parsedEcashInformation.length === 0) return '';
    const [currentMint] = parsedEcashInformation.filter(mintInfo => {
      return mintInfo?.isCurrentMint;
    });
    return currentMint;
  }, [parsedEcashInformation]);

  const getStoredEcashTransactions = () => {
    try {
      const txs = currentMint.transactions;
      return txs ? txs : [];
    } catch (error) {
      console.error('Failed to retrieve txs:', error);
      return [];
    }
  };
  const removeProofs = proofsToRemove => {
    try {
      const existingProofs = currentMint.proofs;
      const updatedProofs = existingProofs.filter(
        item1 =>
          !proofsToRemove.some(
            item2 =>
              item1.C === item2.C &&
              item1.amount === item2.amount &&
              item1.id === item2.id &&
              item1.secret === item2.secret,
          ),
      );

      return updatedProofs;
    } catch (error) {
      console.error('Failed to remove proofs:', error);
    }
  };

  const getEcashBalance = () => {
    const savedProofs = currentMint.proofs;

    const userBalance = savedProofs.reduce((prev, curr) => {
      const proof = curr;
      return (prev += proof.amount);
    }, 0);
    return userBalance;
  };

  const saveNewEcashInformation = storageInfo => {
    const newEcashInformation = [...parsedEcashInformation].map(mint => {
      if (mint.isCurrentMint) {
        Object.entries(storageInfo).forEach(entry => {
          mint[entry[0]] = entry[1];
        });

        return mint;
      } else return mint;
    });

    const em = encriptMessage(
      contactsPrivateKey,
      publicKey,
      JSON.stringify(newEcashInformation),
    );
    toggleGLobalEcashInformation(em, true);
  };

  const sendEcashPayment = async bolt11Invoice => {
    const wallet = await createWallet(currentMint.mintURL);
    const meltQuote = await wallet.createMeltQuote(bolt11Invoice);
    const eCashBalance = getEcashBalance();

    const {proofsToUse} = await getProofsToUse(
      currentMint.proofs,
      meltQuote.amount + meltQuote.fee_reserve,
      'desc',
    );

    if (
      proofsToUse.length === 0 ||
      eCashBalance < meltQuote.amount + meltQuote.fee_reserve
    ) {
      return false;
    } else {
      return {quote: meltQuote, proofsToUse};
    }
  };

  useEffect(() => {
    if (!receiveEcashQuote) return;
    setTimeout(() => {
      clearInterval(receiveEcashRef.current);
    }, 1000 * 70);
    receiveEcashRef.current = setInterval(async () => {
      const response = await checkMintQuote({
        quote: receiveEcashQuote,
        mintURL: currentMint.mintURL,
      });

      if (response.paid) {
        clearInterval(receiveEcashRef.current);
        setReceiveEcashQuote('');
        const didMint = await mintEcash({
          quote: response.quote,
          invoice: response.request,
          mintURL: currentMint.mintURL,
        });

        if (didMint.parsedInvoie) {
          const formattedEcashTx = formatEcashTx({
            time: Date.now(),
            amount: didMint.parsedInvoie.invoice.amountMsat / 1000,
            fee: 0,
            paymentType: 'received',
          });
          saveNewEcashInformation({
            transactions: [...currentMint.transactions, formattedEcashTx],
            proofs: [...currentMint.proofs, ...didMint.proofs],
          });

          setTimeout(() => {
            eCashNavigate.navigate('HomeAdmin');
            eCashNavigate.navigate('ConfirmTxPage', {
              for: 'invoicePaid',
              information: {},
            });

            updateUserBalance();
            const storedTransactions = getStoredEcashTransactions();
            setecashTransactions(storedTransactions);
          }, 5000);
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

    payLnInvoiceFromEcash();
  }, [eCashPaymentInformation]);

  useEffect(() => {
    async function initEcash() {
      updateUserBalance();
      const storedTransactions = getStoredEcashTransactions();
      setecashTransactions(storedTransactions);
    }
    if (!publicKey || parsedEcashInformation.length === 0) return;
    initEcash();
  }, [globalEcashInformation]);

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
        saveNewEcashInformation,
        removeProofs,
        getStoredEcashTransactions,
        sendEcashPayment,
        globalEcashInformation,
        toggleGLobalEcashInformation,
      }}>
      {children}
    </GlobaleCash.Provider>
  );

  async function updateUserBalance() {
    const userBalance = getEcashBalance();
    setEcashBalance(userBalance);
  }

  async function payLnInvoiceFromEcash() {
    const wallet = await createWallet(currentMint.mintURL);

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

        const spendProofs = await cleanEcashWalletState(currentMint);
        let nonSpentProofs = removeProofs(spendProofs);
        if (payResponse.change.length > 0)
          nonSpentProofs.push(...payResponse.change);

        const formattedEcashTx = formatEcashTx({
          time: Date.now(),
          amount: eCashPaymentInformation.quote.amount,
          fee: eCashPaymentInformation.quote.fee_reserve,
          paymentType: 'sent',
        });
        saveNewEcashInformation({
          transactions: [...currentMint.transactions, formattedEcashTx],
          proofs: nonSpentProofs,
        });
        clearTimeout(eCashIntervalRef.current);

        setTimeout(() => {
          eCashNavigate.navigate('HomeAdmin');
          eCashNavigate.navigate('ConfirmTxPage', {
            for: 'paymentSucceed',
            information: {},
          });
          updateUserBalance();
          const storedTransactions = getStoredEcashTransactions();
          setecashTransactions(storedTransactions);
        }, 5000);
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
};

export const useGlobaleCash = () => {
  return React.useContext(GlobaleCash);
};
