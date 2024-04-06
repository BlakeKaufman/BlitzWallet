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
  getLocalStorageItem,
  retrieveData,
  setLocalStorageItem,
  storeData,
} from '../app/functions';
import {randomUUID} from 'expo-crypto';
import {deleteItem} from '../app/functions/secureStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {dir} from 'i18next';

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

export async function addDataToCollection(dataObject, collection) {
  try {
    const uuid = await getUserAuth();
    const docRef = doc(db, `${collection}/${uuid}`);

    let docData = dataObject;
    // console.log(docData, 'DOC DATA');
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
    console.log(collectionName);
    let data = await getDataFromCollection('blitzWalletUsers');

    Object.keys(data).forEach(key => {
      if (key != 'uuid') data[key] = null;
    });

    addDataToCollection(data, 'blitzWalletUsers');

    return new Promise(resolve => {
      resolve(true);
    });
  } catch (err) {
    return new Promise(resolve => {
      resolve(false);
    });
    console.log(err);
  }
}

export async function getUserAuth() {
  try {
    const savedUUID = await retrieveData('dbUUID');
    const uuid = savedUUID || randomUUID();

    savedUUID || storeData('dbUUID', uuid);

    return new Promise(resolve => {
      resolve(uuid);
    });
  } catch (error) {
    console.log(error);
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
            if (key === 'blitzWalletLocalStorage') {
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
