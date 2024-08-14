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
import {getEcashBalance} from '../app/functions/eCash';

// Create a context for the WebView ref
const GlobaleCash = createContext(null);

export const GlobaleCashVariables = ({children}) => {
  const {contactsPrivateKey, masterInfoObject} = useGlobalContextProvider();
  const [eCashBalance, setEcashBalance] = useState(0);
  const [proofs, setProofs] = useState([]);

  useEffect(() => {
    if (!masterInfoObject.eCashProofs || !contactsPrivateKey) return;
    const publicKey = getPublicKey(contactsPrivateKey);
    const eCashBalance = getEcashBalance({
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
  }, [masterInfoObject.eCashProofs]);

  console.log(proofs);

  return (
    <GlobaleCash.Provider
      value={{
        eCashBalance,
        proofs,
      }}>
      {children}
    </GlobaleCash.Provider>
  );
};

export const useGlobaleCash = () => {
  return React.useContext(GlobaleCash);
};
