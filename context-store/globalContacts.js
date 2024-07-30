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

// Create a context for the WebView ref
const GlobalContacts = createContext(null);

export const GlobalContactsList = ({children}) => {
  const {contactsPrivateKey, masterInfoObject} = useGlobalContextProvider();
  const [globalContactsList, setGlobalContactsList] = useState([]);

  const publicKey = useMemo(
    () => contactsPrivateKey && getPublicKey(contactsPrivateKey),
    [contactsPrivateKey],
  );

  const decodedAddedContacts = useMemo(() => {
    if (!publicKey || !masterInfoObject.contacts?.addedContacts) return [];
    return typeof masterInfoObject.contacts.addedContacts === 'string'
      ? [
          ...JSON.parse(
            decryptMessage(
              contactsPrivateKey,
              publicKey,
              masterInfoObject.contacts.addedContacts,
            ),
          ),
        ]
      : [];
  }, [masterInfoObject.contacts?.addedContacts]);

  useEffect(() => {
    async function updateGlobalContactsList() {
      let users = await queryContacts('blitzWalletUsers');
      if (users?.length === 0) return;
      users = users.map(doc => {
        const {
          contacts: {myProfile},
        } = doc.data();
        const returnObject = {
          name: myProfile.name,
          uuid: myProfile.uuid,
          uniqueName: myProfile.uniqueName,
          receiveAddress: myProfile.receiveAddress,
        };
        return returnObject;
      });
      setGlobalContactsList(users);
    }
    setTimeout(() => {
      updateGlobalContactsList();
    }, 1000 * 60 * 5);
    updateGlobalContactsList();
  }, []);

  return (
    <GlobalContacts.Provider value={{globalContactsList, decodedAddedContacts}}>
      {children}
    </GlobalContacts.Provider>
  );
};

export const useGlobalContacts = () => {
  return React.useContext(GlobalContacts);
};
