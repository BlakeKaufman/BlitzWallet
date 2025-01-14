import React, {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {addDataToCollection, getUnknownContact} from '../db';
import {useGlobalContextProvider} from './context';
import {getPublicKey} from 'nostr-tools';
import {
  decryptMessage,
  encriptMessage,
} from '../app/functions/messaging/encodingAndDecodingMessages';
import {useListenForMessages} from '../app/hooks/listenForMessages';
import {getLocalStorageItem, setLocalStorageItem} from '../app/functions';
import {
  getCurrentDateFormatted,
  getDateXDaysAgo,
  isMoreThan21Days,
  isMoreThan7DaysPast,
} from '../app/functions/rotateAddressDateChecker';
import {removeLocalStorageItem} from '../app/functions/localStorage';

// Create a context for the WebView ref
const GlobalContacts = createContext(null);

export const GlobalContactsList = ({children}) => {
  const {contactsPrivateKey, didGetToHomepage} = useGlobalContextProvider();
  const [globalContactsInformation, setGlobalContactsInformation] = useState(
    {},
  );

  const [myProfileImage, setMyProfileImage] = useState('');
  const didTryToUpdate = useRef(false);

  const addedContacts = globalContactsInformation.addedContacts;
  // const [globalContactsList, setGlobalContactsList] = useState([]);

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

  const allContactsPayments = useMemo(() => {
    if (!decodedAddedContacts || decodedAddedContacts.length == 0) return [];
    let tempArray = [];
    decodedAddedContacts.forEach(contactElement => {
      if (contactElement.transactions.length === 0) return;
      contactElement.transactions.forEach(transaction => {
        tempArray.push({
          transaction: transaction,
          selectedProfileImage: contactElement.profileImage,
          name: contactElement.name || contactElement.uniqueName,
          contactUUID: contactElement.uuid,
        });
      });
    });
    return tempArray;
  }, [addedContacts]);

  useEffect(() => {
    //here to remvoe cahcd contacts from legacy apps
    removeLocalStorageItem('savedContactsList');

    (async () => {
      const profileImage = (await getLocalStorageItem('myProfileImage')) || '';
      console.log(profileImage, 'TEST');
      setMyProfileImage(profileImage);
    })();
  }, []);

  useEffect(() => {
    async function updateContactsAddresses() {
      if (
        !decodedAddedContacts ||
        decodedAddedContacts.length == 0 ||
        !Object.keys(globalContactsInformation).length
      )
        return;
      if (didTryToUpdate.current) return;
      didTryToUpdate.current = true;

      console.log(
        isMoreThan21Days(
          globalContactsInformation.myProfile?.lastRotatedAddedContact,
        ),
        globalContactsInformation.myProfile?.lastRotatedAddedContact,
        'CONTACTS DATE',
      );
      if (
        !isMoreThan21Days(
          globalContactsInformation.myProfile?.lastRotatedAddedContact,
        )
      )
        return;
      let didUpdate = false;
      const updatedContactsAddrfess = await Promise.all(
        decodedAddedContacts.map(async contact => {
          let copiedContact = JSON.parse(JSON.stringify(contact));

          try {
            const dbContact = await getUnknownContact(contact.uuid);
            const dbContactReceiveAddress =
              dbContact.contacts.myProfile?.receiveAddress;
            console.log(
              copiedContact.receiveAddress,
              'CONTACT COMPARE ADDRESS',
              dbContactReceiveAddress,
            );
            if (copiedContact.receiveAddress != dbContactReceiveAddress) {
              copiedContact.receiveAddress = dbContactReceiveAddress;
              didUpdate = true;
            }
            return copiedContact;
          } catch (err) {
            console.log(err);
            return copiedContact;
          }
        }),
      );

      const newContacts = {
        myProfile: {
          ...globalContactsInformation.myProfile,
          lastRotatedAddedContact: getCurrentDateFormatted(),
        },
        addedContacts: encriptMessage(
          contactsPrivateKey,
          publicKey,
          JSON.stringify(updatedContactsAddrfess),
        ),
      };

      toggleGlobalContactsInformation(newContacts, true);

      console.log('UPDATING ADDED CONTACTS ADDRESS');
    }

    updateContactsAddresses();
  }, [globalContactsInformation, decodedAddedContacts]);

  // useEffect(() => {
  //   if (!didGetToHomepage) return;
  //   (async () => {
  //     const savedContactsList = JSON.parse(
  //       await getLocalStorageItem('savedContactsList'),
  //     );

  //     if (
  //       !savedContactsList ||
  //       isMoreThan21Days(savedContactsList?.lastUpdated) ||
  //       savedContactsList?.cachedContacts.length === 0
  //     ) {
  //       console.log('DID RUN DB SEARCH');
  //       const contactsList = await updateGlobalContactsList();

  //       setLocalStorageItem(
  //         'savedContactsList',
  //         JSON.stringify({
  //           cachedContacts: contactsList,
  //           lastUpdated: new Date(),
  //         }),
  //       );
  //       setGlobalContactsList(contactsList);
  //     } else {
  //       console.log(savedContactsList);
  //       setGlobalContactsList(savedContactsList.cachedContacts);
  //     }
  //   })();
  //   // setTimeout(() => {
  //   //   updateGlobalContactsList();
  //   // }, 1000 * 60 * 5);
  //   // updateGlobalContactsList();
  // }, [didGetToHomepage]);

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
        // globalContactsList,
        decodedAddedContacts,
        // updateGlobalContactsList,
        globalContactsInformation,
        toggleGlobalContactsInformation,
        setMyProfileImage,
        myProfileImage,
        allContactsPayments,
      }}>
      {children}
    </GlobalContacts.Provider>
  );
};

export const useGlobalContacts = () => {
  return React.useContext(GlobalContacts);
};
