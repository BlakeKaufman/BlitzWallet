import React, {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {addDataToCollection, queryContacts} from '../db';
import {useGlobalContextProvider} from './context';
import {getPublicKey} from 'nostr-tools';
import {decryptMessage} from '../app/functions/messaging/encodingAndDecodingMessages';

// Create a context for the WebView ref
const GlobalContacts = createContext(null);

export const GlobalContactsList = ({children}) => {
  const {contactsPrivateKey} = useGlobalContextProvider();
  const [globalContactsInformation, setGlobalContactsInformation] = useState(
    {},
  );

  const addedContacts = globalContactsInformation.addedContacts;
  const [globalContactsList, setGlobalContactsList] = useState([]);

  const publicKey = useMemo(
    () => contactsPrivateKey && getPublicKey(contactsPrivateKey),
    [contactsPrivateKey],
  );
  const toggleGlobalContactsInformation = (newData, writeToDB) => {
    setGlobalContactsInformation(prev => {
      const newContacts = {...prev, ...newData};

      if (writeToDB) {
        addDataToCollection({contacts: newContacts}, 'blitzWalletUsers');
        return newContacts;
      } else return newContacts;
    });
  };

  async function updateGlobalContactsList() {
    let users = await queryContacts('blitzWalletUsers');
    if (users?.length === 0) return;
    users = users.slice(0, 40).map(doc => {
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

  const decodedAddedContacts = useMemo(() => {
    if (!publicKey || !addedContacts) return [];
    return typeof addedContacts === 'string'
      ? [
          ...JSON.parse(
            decryptMessage(contactsPrivateKey, publicKey, addedContacts),
          ),
        ]
      : [];
  }, [addedContacts]);

  useEffect(() => {
    setTimeout(() => {
      updateGlobalContactsList();
    }, 1000 * 60 * 5);
    updateGlobalContactsList();
  }, []);

  return (
    <GlobalContacts.Provider
      value={{
        globalContactsList,
        decodedAddedContacts,
        updateGlobalContactsList,
        globalContactsInformation,
        toggleGlobalContactsInformation,
      }}>
      {children}
    </GlobalContacts.Provider>
  );
};

export const useGlobalContacts = () => {
  return React.useContext(GlobalContacts);
};
