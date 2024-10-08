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
import {
  decryptMessage,
  encriptMessage,
} from '../app/functions/messaging/encodingAndDecodingMessages';
import {useListenForMessages} from '../app/hooks/listenForMessages';
import {getLocalStorageItem, setLocalStorageItem} from '../app/functions';
import {isMoreThan21Days} from '../app/functions/rotateAddressDateChecker';

// Create a context for the WebView ref
const GlobalContacts = createContext(null);

export const GlobalContactsList = ({children}) => {
  const {contactsPrivateKey, didGetToHomepage} = useGlobalContextProvider();
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

  async function updateGlobalContactsList(fromPage) {
    let users = await queryContacts('blitzWalletUsers');

    if (users?.length === 0) return;
    users = users
      .map(doc => {
        try {
          const {
            contacts: {myProfile},
          } = doc;
          const returnObject = {
            name: myProfile.name,
            uuid: myProfile.uuid,
            uniqueName: myProfile.uniqueName,
            receiveAddress: myProfile.receiveAddress,
          };
          return returnObject;
        } catch (err) {
          console.log(err);
          console.log(doc);
          return false;
        }
      })
      .filter(contact => contact);

    if (fromPage === 'loadingScreen') {
      setGlobalContactsList(users);
    } else return users;
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
    if (!didGetToHomepage) return;
    (async () => {
      const savedContactsList = JSON.parse(
        await getLocalStorageItem('savedContactsList'),
      );

      if (
        !savedContactsList ||
        isMoreThan21Days(savedContactsList?.lastUpdated) ||
        savedContactsList?.cachedContacts.length === 0
      ) {
        console.log('DID RUN DB SEARCH');
        const contactsList = await updateGlobalContactsList();

        setLocalStorageItem(
          'savedContactsList',
          JSON.stringify({
            cachedContacts: contactsList,
            lastUpdated: new Date(),
          }),
        );
        setGlobalContactsList(contactsList);
      } else {
        console.log(savedContactsList);
        setGlobalContactsList(savedContactsList.cachedContacts);
      }
    })();
    // setTimeout(() => {
    //   updateGlobalContactsList();
    // }, 1000 * 60 * 5);
    // updateGlobalContactsList();
  }, [didGetToHomepage]);

  useListenForMessages({
    didGetToHomepage,
    contactsPrivateKey,
    decodedAddedContacts,
    toggleGlobalContactsInformation,
    globalContactsInformation,
    publicKey,
  });

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
