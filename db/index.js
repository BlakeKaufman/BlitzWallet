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
import {encriptMessage} from '../app/functions/messaging/encodingAndDecodingMessages';
import {btoa} from 'react-native-quick-base64';

import crypto from 'react-native-quick-crypto';
import {nip06} from 'nostr-tools';
import {removeLocalStorageItem} from '../app/functions/localStorage';

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: 'blitz-wallet-82b39.firebaseapp.com',
  projectId: 'blitz-wallet-82b39',
  storageBucket: 'blitz-wallet-82b39.appspot.com',
  messagingSenderId: '129198472150',
  appId: '1:129198472150:web:86511e5250364ee1764277',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export async function addDataToCollection(dataObject, collection) {
  try {
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
    return new Promise(resolve => {
      resolve(null);
    });
    console.log(err);
  }
}

export async function deleteDataFromCollection(collectionName) {
  try {
    const uuid = await getUserAuth();
    if (!uuid) throw Error('Not authenticated');

    const docRef = doc(db, `${collectionName}/${uuid}`);
    const respones = await deleteDoc(docRef);

    console.log('TESTING DID RUN');
    return new Promise(resolve => {
      resolve(true);
    });
    let data = await getDataFromCollection('blitzWalletUsers');

    Object.keys(data).forEach(key => {
      if (key != 'uuid') data[key] = null;
    });

    addDataToCollection(data, 'blitzWalletUsers');

    return new Promise(resolve => {
      resolve(true);
    });
  } catch (err) {
    console.log(err);
    return new Promise(resolve => {
      resolve(false);
    });
  }
}

export async function getUserAuth() {
  const isConnected = await signIn();

  const privateKey = Buffer.from(
    nip06.privateKeyFromSeedWords(await retrieveData('mnemonic')),
    'hex',
  ); //.buffer.slice(0, 16);
  const publicKey = nostr.getPublicKey(privateKey);

  return new Promise(resolve => {
    resolve(isConnected ? publicKey : false);
  });
}
async function signIn() {
  try {
    await signInAnonymously(auth);
    return true;
  } catch (error) {
    console.error('Error signing in anonymously', error);
    return false;
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

export async function isValidUniqueName(collectionName, wantedName) {
  const userProfilesRef = collection(db, collectionName);
  const q = query(
    userProfilesRef,
    where('contacts.myProfile.uniqueNameLower', '==', wantedName.toLowerCase()),
  );
  const querySnapshot = await getDocs(q);
  return new Promise(resolve => resolve(querySnapshot.empty));
}

export async function queryContacts(collectionName) {
  const q = query(collection(db, collectionName), limit(50));
  const snapshot = await getDocs(q);

  return new Promise(resolve => {
    resolve(snapshot['docs']);
  });
}

export async function getSignleContact(wantedName) {
  const userProfilesRef = collection(db, 'blitzWalletUsers');
  const q = query(
    userProfilesRef,
    where('contacts.myProfile.uniqueName', '==', wantedName),
  );
  const querySnapshot = await getDocs(q);
  return new Promise(resolve => resolve(querySnapshot.docs));
}
export async function canUsePOSName(
  collectionName = 'blitzWalletUsers',
  wantedName,
) {
  const userProfilesRef = collection(db, collectionName);
  const q = query(
    userProfilesRef,
    where('posSettings.storeNameLower', '==', wantedName.toLowerCase()),
  );
  const querySnapshot = await getDocs(q);
  return new Promise(resolve => resolve(querySnapshot.empty));
}

// Function to search users by username
export async function searchUsers(searchTerm) {
  console.log(searchTerm, 'in function searchterm');
  if (!searchTerm) return []; // Return an empty array if the search term is empty

  try {
    const usersRef = collection(db, 'blitzWalletUsers');
    const q = query(
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
      limit(50),
    );
    const querySnapshot = await getDocs(q);

    const users = querySnapshot.docs.map(doc => {
      console.log(doc.data());

      return doc.data()?.contacts?.myProfile;
    });
    console.log(users);
    return users;
  } catch (error) {
    console.error('Error searching users: ', error);
    return [];
  }
}

export async function getUnknownContact(uuid) {
  try {
    const docRef = doc(db, `${'blitzWalletUsers'}`, `${uuid}`);
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
    return new Promise(resolve => {
      resolve(null);
    });
    console.log(err);
  }
}

async function getFirebaseAuthKey() {
  let firegbaseAuthKey = JSON.parse(await retrieveData('firebaseAuthCode'));

  firegbaseAuthKey = firegbaseAuthKey && JSON.parse(firegbaseAuthKey);

  if (firegbaseAuthKey) {
    return new Promise(resolve => {
      resolve(firegbaseAuthKey);
    });
  }
}
