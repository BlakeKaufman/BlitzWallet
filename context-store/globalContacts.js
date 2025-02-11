import React, {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  addDataToCollection,
  getUnknownContact,
  syncDatabasePayment,
} from '../db';
import {useGlobalContextProvider} from './context';
import {getPublicKey} from 'nostr-tools';
import {
  decryptMessage,
  encriptMessage,
} from '../app/functions/messaging/encodingAndDecodingMessages';
import {getLocalStorageItem} from '../app/functions';
import {
  getCurrentDateFormatted,
  isMoreThan21Days,
} from '../app/functions/rotateAddressDateChecker';
import {removeLocalStorageItem} from '../app/functions/localStorage';
import {
  getCachedMessages,
  queueSetCashedMessages,
} from '../app/functions/messaging/cachedMessages';
import {db} from '../db/initializeFirebase';

// Create a context for the WebView ref
const GlobalContacts = createContext(null);

export const GlobalContactsList = ({children}) => {
  const {contactsPrivateKey} = useGlobalContextProvider();
  const [globalContactsInformation, setGlobalContactsInformation] = useState(
    {},
  );

  const [myProfileImage, setMyProfileImage] = useState('');
  const didTryToUpdate = useRef(false);
  const [contactsMessags, setContactsMessagses] = useState({});
  const lookForNewMessages = useRef(false);
  const loadMessagesListener = useRef(false);
  const loadSendMessagesListener = useRef(false);
  const updateCachedContactsOnAddedContacts = useRef(false);

  const addedContacts = globalContactsInformation.addedContacts;

  const publicKey = useMemo(
    () => contactsPrivateKey && getPublicKey(contactsPrivateKey),
    [contactsPrivateKey],
  );
  const toggleGlobalContactsInformation = (newData, writeToDB) => {
    setGlobalContactsInformation(prev => {
      const newContacts = {...prev, ...newData};

      if (writeToDB) {
        addDataToCollection(
          {contacts: newContacts},
          'blitzWalletUsers',
          publicKey,
        );
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

  useEffect(() => {
    if (!Object.keys(globalContactsInformation).length) return;
    if (loadMessagesListener.current) return;
    loadMessagesListener.current = true;
    const now = new Date().getTime();

    const unsubscribe = db
      .collection('contactMessages')
      .where('toPubKey', '==', globalContactsInformation.myProfile.uuid)
      .orderBy('timestamp')
      .startAfter(now)
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(async change => {
          if (change.type === 'added') {
            const newMessage = change.doc.data();
            console.log(newMessage, 'RECEIVED A NEW MESSAGE');
            queueSetCashedMessages({
              newMessagesList: [newMessage],
              myPubKey: globalContactsInformation.myProfile.uuid,
              updateFunction: updatedCachedMessagesStateFunction,
            });
          }
        });
      });

    return () => unsubscribe();
  }, [globalContactsInformation]);

  useEffect(() => {
    if (!Object.keys(globalContactsInformation).length) return;
    if (loadSendMessagesListener.current) return;
    loadSendMessagesListener.current = true;
    const now = new Date().getTime();

    const unsubscribe = db
      .collection('contactMessages')
      .where('fromPubKey', '==', globalContactsInformation.myProfile.uuid)
      .orderBy('timestamp')
      .startAfter(now)
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(async change => {
          if (change.type === 'added') {
            const newMessage = change.doc.data();
            console.log(newMessage, 'SENT A NEW MESSAGE');

            queueSetCashedMessages({
              newMessagesList: [newMessage],
              myPubKey: globalContactsInformation.myProfile.uuid,
              updateFunction: updatedCachedMessagesStateFunction,
            });
          }
        });
      });

    return () => unsubscribe();
  }, [globalContactsInformation]);

  useEffect(() => {
    if (!Object.keys(globalContactsInformation).length) return;
    if (!updateCachedContactsOnAddedContacts.current) {
      updateCachedContactsOnAddedContacts.current = true;
      return;
    }
    updateCachedContactsOnAddedContacts.current = true;
    // dont run on first load, But anytime after there is a change to global contacts information update the global state of transactions
    updatedCachedMessagesStateFunction();
  }, [globalContactsInformation]);

  useEffect(() => {
    if (!Object.keys(globalContactsInformation).length) return;
    if (lookForNewMessages.current) return;
    lookForNewMessages.current = true;
    async function loadNewMessages() {
      await syncDatabasePayment(
        globalContactsInformation.myProfile.uuid,
        updatedCachedMessagesStateFunction,
      );
    }
    loadNewMessages();
  }, [globalContactsInformation]);

  useEffect(() => {
    //here to remvoe cahcd contacts from legacy apps
    removeLocalStorageItem('savedContactsList');
    (async () => {
      const profileImage = (await getLocalStorageItem('myProfileImage')) || '';
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

  async function updatedCachedMessagesStateFunction() {
    if (!Object.keys(globalContactsInformation).length) return;
    // let tempArray = [];
    let newContats = [];

    console.log('UPDATING PAYMENTS STATE');
    // Fetch cached messages
    const savedMessages = await getCachedMessages();
    // somehow need to cach the receibed messgeas so that I dont alwayshav to reead the entire thign

    // Fetch unknown contacts in parallel
    const unknownContacts = await Promise.all(
      Object.keys(savedMessages)
        .filter(key => key != 'lastMessageTimestamp')
        .filter(
          contact =>
            !decodedAddedContacts.find(
              contactElement => contactElement.uuid === contact,
            ) && contact != globalContactsInformation.myProfile.uuid,
        )
        .map(contact => getUnknownContact(contact, 'blitzWalletUsers')),
    );

    if (unknownContacts.filter(item => item).length > 0) {
      // Process unknown contacts
      unknownContacts.forEach(retrivedContact => {
        console.log(retrivedContact, 'RETREIVED MESSAGE FROM UNKOWN CONTCAT');
        if (retrivedContact.uuid === globalContactsInformation.myProfile.uuid)
          return;

        if (retrivedContact) {
          let newContact = {
            bio: retrivedContact.contacts.myProfile.bio || 'No bio',
            isFavorite: false,
            name: retrivedContact.contacts.myProfile.name,
            receiveAddress: retrivedContact.contacts.myProfile.receiveAddress,
            uniqueName: retrivedContact.contacts.myProfile.uniqueName,
            uuid: retrivedContact.contacts.myProfile.uuid,
            isAdded: false,
            unlookedTransactions: 0,
          };
          newContats.push(newContact);
        }
      });
    }

    setContactsMessagses(savedMessages);

    // Update global contacts if new contacts were found
    if (newContats.length > 0) {
      toggleGlobalContactsInformation(
        {
          myProfile: {...globalContactsInformation.myProfile},
          addedContacts: encriptMessage(
            contactsPrivateKey,
            globalContactsInformation.myProfile.uuid,
            JSON.stringify(decodedAddedContacts.concat(newContats)),
          ),
        },
        true,
      );
    }
  }

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
        contactsMessags,
        updatedCachedMessagesStateFunction,
      }}>
      {children}
    </GlobalContacts.Provider>
  );
};

export const useGlobalContacts = () => {
  return React.useContext(GlobalContacts);
};
