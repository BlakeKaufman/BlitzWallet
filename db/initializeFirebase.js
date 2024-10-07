import {initializeApp, getApps, getApp} from 'firebase/app';
import {getFirestore} from 'firebase/firestore';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  signInAnonymously,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: 'blitz-wallet-82b39.firebaseapp.com',
  projectId: 'blitz-wallet-82b39',
  storageBucket: 'blitz-wallet-82b39.appspot.com',
  messagingSenderId: '129198472150',
  appId: '1:129198472150:web:86511e5250364ee1764277',
};

// Initialization variables
let db, auth;

export async function initializeFirebase() {
  // Check if any Firebase apps have been initialized
  if (!getApps().length) {
    // Initialize Firebase app
    const app = initializeApp(firebaseConfig);

    // Initialize Firestore and Auth
    db = getFirestore(app);
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });

    console.log('Firebase initialized');

    // You can optionally sign in anonymously here, or handle this elsewhere
    await signInAnonymously(auth).catch(error => {
      console.error('Error signing in anonymously', error);
    });
  } else {
    // If already initialized, use the existing app
    const app = getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    console.log('Using existing Firebase app');
  }

  return {db, auth};
}

// Export Firestore and Auth instances
export {db, auth};
