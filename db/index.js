import * as nostr from 'nostr-tools';
// Import the functions you need from the SDKs you need
import {initializeApp} from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use

import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  Firestore,
  getDocFromServer,
  getDocs,
  getDoc,
  deleteDoc,
  query,
  where,
  limit,
} from 'firebase/firestore';
import {
  getAuth,
  initializeAuth,
  signInAnonymously,
  getReactNativePersistence,
  signInWithCustomToken,
} from 'firebase/auth';

import {
  getLocalStorageItem,
  retrieveData,
  setLocalStorageItem,
  storeData,
} from '../app/functions';
import {randomUUID} from 'expo-crypto';
import {deleteItem} from '../app/functions/secureStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  decryptMessage,
  encriptMessage,
} from '../app/functions/messaging/encodingAndDecodingMessages';
import {btoa} from 'react-native-quick-base64';

import crypto from 'react-native-quick-crypto';
import {nip06} from 'nostr-tools';
import {removeLocalStorageItem} from '../app/functions/localStorage';
import {Buffer} from 'buffer';
import {auth, db} from './initializeFirebase';
import getDBBackendPath from './getDBPath';

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: process.env.FIREBASE_API_KEY,
//   authDomain: 'blitz-wallet-82b39.firebaseapp.com',
//   projectId: 'blitz-wallet-82b39',
//   storageBucket: 'blitz-wallet-82b39.appspot.com',
//   messagingSenderId: '129198472150',
//   appId: '1:129198472150:web:86511e5250364ee1764277',
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);
// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage),
// });

export async function addDataToCollection(dataObject, collection) {
  try {
    // const {privateKey, publicKey, JWT} = await getPubPrivKeyForDB();
    // // const em = encriptMessage(
    // //   privateKey,
    // //   process.env.DB_PUBKEY,
    // //   JSON.stringify({
    // //     type: 'adddata',
    // //     collectionName: collection,
    // //     dataObject: dataObject,
    // //   }),
    // // );
    // const response = await fetch(`${getDBBackendPath()}`, {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     type: 'adddata',
    //     collectionName: collection,
    //     dataObject: dataObject,
    //     pubKey: publicKey,
    //     JWT: JWT,
    //   }),
    // });
    // const data = await response.json();

    // return data.status.toLowerCase() === 'success';
    const uuid = await getUserAuth();

    if (!uuid) throw Error('Not authenticated');
    console.log(uuid);

    const docRef = doc(db, `${collection}/${uuid}`);

    let docData = dataObject;

    docData['uuid'] = uuid;

    setDoc(docRef, docData, {merge: true});

    console.log('Document written with ID: ', docData);

    return new Promise(resolve => {
      resolve(true);
    });
  } catch (e) {
    console.error('Error adding document: ', e);
    return new Promise(resolve => {
      resolve(false);
    });
  }
}

export async function getDataFromCollection(collectionName) {
  try {
    // const {privateKey, publicKey, JWT} = await getPubPrivKeyForDB();
    // // const em = encriptMessage(
    // //   privateKey,
    // //   process.env.DB_PUBKEY,
    // //   JSON.stringify({
    // //     type: 'getData',
    // //     collectionName: collectionName,
    // //   }),
    // // );

    // console.log(
    //   JSON.stringify({
    //     type: 'getData',
    //     collectionName: collectionName,
    //     // content: em,
    //     pubKey: publicKey,
    //     JWT: JWT,
    //   }),
    // );

    // const response = await fetch(`${getDBBackendPath()}`, {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     type: 'getData',
    //     collectionName: collectionName,
    //     // content: em,
    //     pubKey: publicKey,
    //     JWT: JWT,
    //   }),
    // });
    // const data = await response.json();

    // // console.log(data.data);

    // // const dm = JSON.parse(
    // //   decryptMessage(privateKey, process.env.DB_PUBKEY, data.data),
    // // );

    // // console.log(dm);

    // return data.data;

    // return dm;
    const uuid = await getUserAuth();
    if (!uuid) throw Error('Not authenticated');
    const docRef = doc(db, `${collectionName}`, `${uuid}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      return new Promise(resolve => {
        resolve(data);
      });
    } else
      return new Promise(resolve => {
        resolve(false);
      });
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
  // const {privateKey, publicKey, JWT} = await getPubPrivKeyForDB();

  // const response = await fetch(`${getDBBackendPath()}`, {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     type: 'validuniquename',
  //     collectionName: collectionName,
  //     wantedName: wantedName,
  //     pubKey: publicKey,
  //     JWT: JWT,
  //   }),
  // });
  // const data = await response.json();

  // return data.status.toLowerCase() === 'success';
  const userProfilesRef = collection(db, collectionName);
  const q = query(
    userProfilesRef,
    where('contacts.myProfile.uniqueNameLower', '==', wantedName.toLowerCase()),
  );
  const querySnapshot = await getDocs(q);
  return new Promise(resolve => resolve(querySnapshot.empty));
}

export async function queryContacts(collectionName) {
  // const {privateKey, publicKey, JWT} = await getPubPrivKeyForDB();

  // const response = await fetch(`${getDBBackendPath()}`, {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     type: 'getallcontacts',
  //     collectionName: collectionName,
  //     pubKey: publicKey,
  //     JWT: JWT,
  //   }),
  // });
  // const data = await response.json();

  // // const dm = JSON.parse(
  // //   decryptMessage(privateKey, process.env.DB_PUBKEY, data.data),
  // // );

  // return data.data;
  const q = query(collection(db, collectionName), limit(40));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => doc.data());
}

export async function getSignleContact(
  wantedName,
  collectionName = 'blitzWalletUsers',
) {
  //   const {privateKey, publicKey, JWT} = await getPubPrivKeyForDB();
  //   const response = await fetch(`${getDBBackendPath()}`, {
  //     method: 'POST',
  //     body: JSON.stringify({
  //       type: 'singlecontact',
  //       collectionName: collectionName,
  //       wantedName: wantedName,
  //       pubKey: publicKey,
  //       JWT: JWT,
  //     }),
  //   });
  //   const data = await response.json();

  //   return data.data;
  const userProfilesRef = collection(db, 'blitzWalletUsers');
  const q = query(
    userProfilesRef,
    where('contacts.myProfile.uniqueNameLower', '==', wantedName.toLowerCase()),
  );
  const querySnapshot = await getDocs(q);
  // Map through querySnapshot and return the data from each document
  const contactData = querySnapshot.docs.map(doc => doc.data());
  return new Promise(resolve => resolve(contactData));
}
export async function canUsePOSName(
  collectionName = 'blitzWalletUsers',
  wantedName,
) {
  // const {privateKey, publicKey, JWT} = await getPubPrivKeyForDB();
  // // const em = encriptMessage(
  // //   privateKey,
  // //   process.env.DB_PUBKEY,
  // //   JSON.stringify({
  // //     type: 'validposname',
  // //     collectionName: collectionName,
  // //     wantedName: wantedName,
  // //   }),
  // // );
  // const response = await fetch(`${getDBBackendPath()}`, {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     type: 'validposname',
  //     collectionName: collectionName,
  //     wantedName: wantedName,
  //     pubKey: publicKey,
  //     JWT: JWT,
  //   }),
  // });
  // const data = await response.json();

  // return data.status.toLowerCase() === 'success';
  const userProfilesRef = collection(db, collectionName);
  const q = query(
    userProfilesRef,
    where('posSettings.storeNameLower', '==', wantedName.toLowerCase()),
  );
  const querySnapshot = await getDocs(q);
  return new Promise(resolve => resolve(querySnapshot.empty));
}

// Function to search users by username
export async function searchUsers(
  searchTerm,
  collectionName = 'blitzWalletUsers',
) {
  console.log(searchTerm, 'in function searchterm');
  if (!searchTerm) return []; // Return an empty array if the search term is empty
  try {
    const usersRef = collection(db, 'blitzWalletUsers');
    const uniqueNameQuery = query(
      usersRef,
      where(
        'contacts.myProfile.uniqueNameLower',
        '>=',
        searchTerm.toLowerCase(),
      ),
      where(
        'contacts.myProfile.uniqueNameLower',
        '<=',
        searchTerm.toLowerCase() + '\uf8ff',
      ),
      limit(25),
    );

    const nameQuery = query(
      usersRef,
      where('contacts.myProfile.nameLower', '>=', searchTerm.toLowerCase()),
      where(
        'contacts.myProfile.nameLower',
        '<=',
        searchTerm.toLowerCase() + '\uf8ff',
      ),
      limit(25),
    );

    const [uniqueNameSnapshot, nameSnapshot] = await Promise.all([
      getDocs(uniqueNameQuery),
      getDocs(nameQuery),
    ]);

    const uniqueUsers = new Map();

    [...uniqueNameSnapshot.docs, ...nameSnapshot.docs].forEach(doc => {
      const profile = doc.data()?.contacts?.myProfile;

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

async function getPubPrivKeyForDB() {
  try {
    const privateKey = Buffer.from(
      nip06.privateKeyFromSeedWords(await retrieveData('mnemonic')),
      'hex',
    ); //.buffer.slice(0, 16);
    const savedJWT = JSON.parse(await getLocalStorageItem('blitzWalletJWT'));
    const publicKey = nostr.getPublicKey(privateKey);
    return {privateKey, publicKey, JWT: savedJWT};
  } catch (err) {
    console.log(err);
    return false;
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

// async function getFirebaseAuthKey() {
//   let firegbaseAuthKey = JSON.parse(await retrieveData('firebaseAuthCode'));

//   firegbaseAuthKey = firegbaseAuthKey && JSON.parse(firegbaseAuthKey);

//   if (firegbaseAuthKey) {
//     return new Promise(resolve => {
//       resolve(firegbaseAuthKey);
//     });
//   }
// }

// async function signIn() {
//   try {
//     await signInAnonymously(auth);
//     return true;
//   } catch (error) {
//     console.error('Error signing in anonymously', error);
//     return false;
//   }
// }
