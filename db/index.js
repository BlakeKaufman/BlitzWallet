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
} from 'firebase/firestore';
import {
  getAuth,
  initializeAuth,
  signInAnonymously,
  getReactNativePersistence,
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

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBKn2evN91MVTfrAQgL23y1v8gHcVO6oU8',
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
    console.log(uuid);

    const docRef = doc(db, `${collection}/${uuid}`);

    let docData = dataObject;

    docData['uuid'] = uuid;

    setDoc(docRef, docData, {merge: true});

    console.log('Document written with ID: ', docRef.id);

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
    const docRef = doc(db, `${collectionName}`, `${uuid}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      return new Promise(resolve => {
        resolve(data);
      });
    } else throw new Error('error');
  } catch (err) {
    return new Promise(resolve => {
      resolve(false);
    });
    console.log(err);
  }
}

export async function deleteDataFromCollection(collectionName) {
  try {
    const uuid = await getUserAuth();

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
  try {
    try {
      auth.currentUser || (await signInAnonymously(auth));
      const inputString = 'blitz wallet storage key';

      const privateKey = Buffer.from(
        nip06.privateKeyFromSeedWords(await retrieveData('mnemonic')),
        'hex',
      ).buffer.slice(0, 16);

      // console.log(hash);
      const uuid = crypto
        .createHash('sha512')
        .update(privateKey)
        .update(inputString)
        .digest('hex');

      // const uuid = savedUUID || randomUUID();
      //
      // savedUUID || storeData('dbUUID', uuid);

      return new Promise(resolve => {
        resolve(
          [
            uuid.slice(0, 8),
            '-',
            uuid.slice(8, 12),
            '-',
            '4',
            uuid.slice(13, 16),
            '-',
            ((parseInt(uuid.slice(16, 17), 16) & 3) | 8).toString(16),
            uuid.slice(17, 20),
            '-',
            uuid.slice(20, 32),
          ].join(''),
        );
      });
    } catch (error) {
      console.log(error);
    }
  } catch (err) {
    console.log(err, 'FIREBSE AUTH ERROR');
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
        AsyncStorage.clear();
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

export async function queryContacts(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName));

  return new Promise(resolve => {
    resolve(snapshot['docs']);
  });
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
