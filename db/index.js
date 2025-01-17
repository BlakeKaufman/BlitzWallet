import * as nostr from 'nostr-tools';

import {getLocalStorageItem, retrieveData} from '../app/functions';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {nip06} from 'nostr-tools';
import {removeLocalStorageItem} from '../app/functions/localStorage';
import {Buffer} from 'buffer';
import {db} from './initializeFirebase';
import {
  getCachedMessages,
  queueSetCashedMessages,
} from '../app/functions/messaging/cachedMessages';

export async function addDataToCollection(dataObject, collection) {
  try {
    const uuid = await getUserAuth();

    if (!uuid) throw Error('Not authenticated');
    const docRef = db.collection(collection).doc(uuid);
    // await docRef.set(dataObject, {merge: true});

    console.log('New document information', dataObject);

    let docData = dataObject;

    docData['uuid'] = uuid;

    await docRef.set(dataObject, {merge: true});

    console.log('Document written with ID: ', docData);

    return true;
  } catch (e) {
    console.error('Error adding document: ', e);
    return false;
  }
}

export async function getDataFromCollection(collectionName) {
  try {
    const uuid = await getUserAuth();
    if (!uuid) throw Error('Not authenticated');

    const docRef = db.collection(collectionName).doc(uuid);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      return docSnap.data();
    }
  } catch (err) {
    console.log(err);
    return new Promise(resolve => {
      resolve(null);
    });
  }
}

export async function deleteDataFromCollection(collectionName) {
  try {
    return false;
    // const uuid = await getUserAuth();
    // if (!uuid) throw Error('Not authenticated');

    // const docRef = doc(db, `${collectionName}/${uuid}`);
    // const respones = await deleteDoc(docRef);

    // console.log('TESTING DID RUN');
    // return new Promise(resolve => {
    //   resolve(true);
    // });
    // let data = await getDataFromCollection('blitzWalletUsers');

    // Object.keys(data).forEach(key => {
    //   if (key != 'uuid') data[key] = null;
    // });

    // addDataToCollection(data, 'blitzWalletUsers');

    // return new Promise(resolve => {
    //   resolve(true);
    // });
  } catch (err) {
    console.log(err);
    return new Promise(resolve => {
      resolve(false);
    });
  }
}

export async function handleDataStorageSwitch(
  direction,
  toggleMasterInfoObject,
) {
  try {
    if (direction) {
      let object = {};
      const keys = await AsyncStorage.getAllKeys();
      console.log(keys);

      if (keys.length === 1) {
        object =
          JSON.parse(await getLocalStorageItem('blitzWalletLocalStorage')) ||
          {};
      } else {
        const result = await AsyncStorage.multiGet(keys);
        const blitzWalletStoreage = JSON.parse(
          await getLocalStorageItem('blitzWalletLocalStorage'),
        );

        let values = result
          .map(([key, value]) => {
            if (
              key === 'blitzWalletLocalStorage' ||
              key === 'breezInfo' ||
              key === 'faucet' ||
              key === 'lnInvoice' ||
              key === 'colorScheme' ||
              key === 'homepageTxPreferance' ||
              key == 'userBalanceDenomination' ||
              key === 'userFaceIDPereferance' ||
              key === 'boltzClaimTxs' ||
              key === 'savedLiquidSwaps' ||
              key === 'cachedContactsList' ||
              key === 'enabledSlidingCamera' ||
              key === 'fiatCurrenciesList' ||
              key === 'fiatCurrency' ||
              key === 'failedTransactions' ||
              key.toLowerCase().includes('firebase')
            ) {
              return;
            }
            try {
              const parsedValue = JSON.parse(value);
              return {[key]: parsedValue};
            } catch (err) {
              return {[key]: value};
            }
          })
          .filter(item => item);

        object = Object.assign({}, ...values);

        if (blitzWalletStoreage?.blitzWalletLocalStorage)
          object = {
            ...object,
            ...blitzWalletStoreage.blitzWalletLocalStorage,
          };
      }

      object['usesLocalStorage'] = false;

      const didSave = await addDataToCollection(object, 'blitzWalletUsers');

      if (didSave) {
        keys.forEach(key => {
          if (
            key === 'colorScheme' ||
            key === 'homepageTxPreferance' ||
            key === 'userBalanceDenomination' ||
            key === 'userFaceIDPereferance' ||
            key === 'boltzClaimTxs' ||
            key === 'savedLiquidSwaps' ||
            key === 'cachedContactsList' ||
            key === 'enabledSlidingCamera' ||
            key === 'fiatCurrenciesList' ||
            key === 'fiatCurrency' ||
            key === 'failedTransactions' ||
            key.toLowerCase().includes('firebase')
          )
            return;

          removeLocalStorageItem(key);
        });
        // AsyncStorage.clear();
        toggleMasterInfoObject({usesLocalStorage: false}, false);

        return new Promise(resolve => {
          resolve(true);
        });
      } else throw new Error('did not save');
    } else {
      try {
        const data = await getDataFromCollection('blitzWalletUsers');
        data['usesLocalStorage'] = true;

        //   Object.keys(data).forEach(key => {
        //     setLocalStorageItem(key, JSON.stringify(data[key]));
        //   });

        toggleMasterInfoObject(data, true);

        deleteDataFromCollection('blitzWalletUsers');

        return new Promise(resolve => {
          resolve(true);
        });
      } catch (err) {
        console.log(err);
      }
    }
  } catch (e) {
    return new Promise(resolve => {
      resolve(false);
    });
    // read key error
  }
}

export async function isValidUniqueName(
  collectionName = 'blitzWalletUsers',
  wantedName,
) {
  const querySnapshot = await db
    .collection(collectionName)
    .where('contacts.myProfile.uniqueNameLower', '==', wantedName.toLowerCase())
    .get();
  console.log(querySnapshot.empty);
  return querySnapshot.empty;
}

// export async function queryContacts(collectionName) {
//   const querySnapshot = await db.collection(collectionName).limit(40).get();
//   return querySnapshot;
// }

export async function getSignleContact(
  wantedName,
  collectionName = 'blitzWalletUsers',
) {
  const querySnapshot = await db
    .collection(collectionName)
    .where('contacts.myProfile.uniqueNameLower', '==', wantedName.toLowerCase())
    .get();
  return querySnapshot.docs.map(doc => doc.data());
}
export async function canUsePOSName(
  collectionName = 'blitzWalletUsers',
  wantedName,
) {
  const querySnapshot = await db
    .collection(collectionName)
    .where('posSettings.storeNameLower', '==', wantedName.toLowerCase())
    .get();
  return querySnapshot.empty;
}

// Function to search users by username
export async function searchUsers(
  searchTerm,
  collectionName = 'blitzWalletUsers',
) {
  let parsedSearchTerm = searchTerm.trim();
  console.log(parsedSearchTerm, 'in function searchterm');
  if (!parsedSearchTerm || !parsedSearchTerm.length) return []; // Return an empty array if the search term is empty
  console.log('running search');
  try {
    const uniqueNameQuery = (
      await db
        .collection(collectionName)
        .where(
          'contacts.myProfile.uniqueNameLower',
          '>=',
          parsedSearchTerm.toLowerCase(),
        )
        .where(
          'contacts.myProfile.uniqueNameLower',
          '<=',
          parsedSearchTerm.toLowerCase() + '\uf8ff',
        )
        .limit(10)
        .get()
    ).docs.map(doc => doc.data());

    const nameQuery = (
      await db
        .collection(collectionName)
        .where(
          'contacts.myProfile.nameLower',
          '>=',
          parsedSearchTerm.toLowerCase(),
        )
        .where(
          'contacts.myProfile.nameLower',
          '<=',
          parsedSearchTerm.toLowerCase() + '\uf8ff',
        )
        .limit(10)
        .get()
    ).docs.map(doc => doc.data());

    const [uniqueNameSnapshot, nameSnapshot] = await Promise.all([
      uniqueNameQuery,
      nameQuery,
    ]);

    const uniqueUsers = new Map();

    [...uniqueNameSnapshot, ...nameSnapshot].forEach(doc => {
      const profile = doc.contacts?.myProfile;

      if (profile) {
        uniqueUsers.set(profile.uuid, profile);
      }
    });
    const users = Array.from(uniqueUsers.values());

    return users;
  } catch (error) {
    console.error('Error searching users: ', error);
    return [];
  }
}

export async function getUnknownContact(
  uuid,
  collectionName = 'blitzWalletUsers',
) {
  try {
    const unkownContact = await db.collection(collectionName).doc(uuid).get();

    if (unkownContact.exists) {
      const data = unkownContact.data();
      return data;
    } else {
      return false;
    }
  } catch (err) {
    return null;
  }
}

export async function getUserAuth() {
  // const isConnected = await signIn();

  const privateKey = Buffer.from(
    nip06.privateKeyFromSeedWords(await retrieveData('mnemonic')),
    'hex',
  ); //.buffer.slice(0, 16);
  const publicKey = nostr.getPublicKey(privateKey);

  return new Promise(resolve => {
    resolve(publicKey);
  });
}

export async function updateMessage({
  newMessage,
  fromPubKey,
  toPubKey,
  onlySaveToLocal,
  updateFunction,
}) {
  try {
    const docSnap = db.collection('contactMessages');

    const timestamp = new Date().getTime();

    const message = {
      fromPubKey: fromPubKey,
      toPubKey: toPubKey,
      message: newMessage,
      timestamp,
    };

    if (onlySaveToLocal) {
      queueSetCashedMessages({
        newMessagesList: [message],
        myPubKey: fromPubKey,
        updateFunction,
      });
      return;
    }

    await docSnap.add(message);
    console.log('New messaged was published started:', message);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

export async function syncDatabasePayment(myPubKey, updateFunction) {
  try {
    const cachedConversations = await getCachedMessages();

    const savedMillis = cachedConversations.lastMessageTimestamp;

    console.log('retriving docs from this timestamp:', savedMillis);

    const receivedMessages = await db
      .collection('contactMessages')
      .where('toPubKey', '==', myPubKey)
      .where('timestamp', '>', savedMillis)
      .get();

    const sentMessages = await db
      .collection('contactMessages')
      .where('fromPubKey', '==', myPubKey)
      .where('timestamp', '>', savedMillis)
      .get();

    if (receivedMessages.empty && sentMessages.empty) {
      updateFunction();
      return;
    }
    console.log(
      receivedMessages.docs.length,
      sentMessages.docs.length,
      'messages received fromm history',
    );

    let messsageList = [];

    for (const doc of receivedMessages.docs.concat(sentMessages.docs)) {
      const data = doc.data();
      messsageList.push(data);
    }

    queueSetCashedMessages({
      newMessagesList: messsageList,
      myPubKey,
      updateFunction,
    });
  } catch (err) {
    console.log('sync database payment err', err);
  }
}
