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
  getEcashBalance,
  mintEcash,
} from '../app/functions/eCash';
import {storeProofs} from '../app/functions/eCash/proofStorage';

// Create a context for the WebView ref
const GlobaleCash = createContext(null);

export const GlobaleCashVariables = ({children}) => {
  const {contactsPrivateKey, masterInfoObject} = useGlobalContextProvider();
  const [eCashBalance, setEcashBalance] = useState(0);
  const [proofs, setProofs] = useState([]);
  const [eCashPaymentInformation, setEcashPaymentInformation] = useState({
    quote: null,
    invoice: null,
    proofsToUse: null,
  });
  const [eCashNavigate, seteCashNavigate] = useState(null);
  const eCashTimeout = useRef(null);
  const receiveEcashRef = useRef(null);
  const [receiveEcashQuote, setReceiveEcashQuote] = useState('');

  useEffect(() => {
    if (!receiveEcashQuote) return;
    receiveEcashRef.current = setInterval(async () => {
      const response = await checkMintQuote({
        quote: receiveEcashQuote,
      });

      if (response.paid) {
        clearInterval(receiveEcashRef.current);
        setReceiveEcashQuote('');
        const didMint = mintEcash({
          quote: response.quote,
          invoice: response.request,
          mintURL: 'https://mint.lnwallet.app',
        });
        if (didMint) {
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

    eCashTimeout.current = setTimeout(() => {
      setEcashPaymentInformation({
        quote: null,
        invoice: null,
        proofsToUse: null,
      });
    }, 1000 * 60 * 2);

    checkEcashPaymentStatus();

    setTimeout(checkEcashPaymentStatus, 1000 * 60);
  }, [eCashPaymentInformation]);

  useEffect(() => {
    async function initEcash() {
      if (!masterInfoObject.eCashProofs || !contactsPrivateKey) return;
      const publicKey = getPublicKey(contactsPrivateKey);
      const eCashBalance = await getEcashBalance({
        contactsPrivateKey: contactsPrivateKey,
        masterInfoObject: masterInfoObject,
      });
      let savedProofs =
        typeof masterInfoObject.eCashProofs === 'string'
          ? [
              ...JSON.parse(
                decryptMessage(
                  contactsPrivateKey,
                  publicKey,
                  masterInfoObject.eCashProofs,
                ),
              ),
            ]
          : [];
      setProofs(savedProofs);
      setEcashBalance(eCashBalance);
    }
    initEcash();
  }, [masterInfoObject.eCashProofs]);

  return (
    <GlobaleCash.Provider
      value={{
        eCashBalance,
        proofs,
        seteCashNavigate,
        setEcashPaymentInformation,
        setReceiveEcashQuote,
      }}>
      {children}
    </GlobaleCash.Provider>
  );

  async function checkEcashPaymentStatus() {
    const wallet = await createWallet('https://mint.lnwallet.app');

    try {
      const didMelt = await wallet.payLnInvoice(
        eCashPaymentInformation.invoice,
        eCashPaymentInformation.proofsToUse,
      );

      console.log(
        eCashPaymentInformation.quote,
        eCashPaymentInformation.proofsToUse,
        didMelt,
      );

      if (didMelt.isPaid) {
        setEcashPaymentInformation({
          quote: null,
          invoice: null,
          proofsToUse: null,
        });
        cleanEcashWalletState();
        if (didMelt.change.length > 0) storeProofs(didMelt.change);
        clearTimeout(eCashTimeout.current);

        eCashNavigate.navigate('HomeAdmin');
        eCashNavigate.navigate('ConfirmTxPage', {
          for: 'paymentSuceed',
          information: {},
        });
      }
    } catch (err) {
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
