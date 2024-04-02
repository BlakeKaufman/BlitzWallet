// Import the functions you need from the SDKs you need
import {initializeApp} from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use

import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
} from 'firebase/firestore';
// import {getAuth, signInAnonymously} from 'firebase/auth';

import {retrieveData, setLocalStorageItem, storeData} from '../app/functions';
import {randomUUID} from 'expo-crypto';
import {deleteItem} from '../app/functions/secureStore';

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
// const auth = getAuth(app);

export async function addDataToCollection(dataObject, collection) {
  try {
    const uuid = await getUserAuth();
    const docRef = doc(db, `${collection}/${uuid}`);

    let docData = dataObject;
    docData['uuid'] = uuid;
    setDoc(docRef, docData, {merge: true});
    console.log('Document written with ID: ', docRef.id);
  } catch (e) {
    console.error('Error adding document: ', e);
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
