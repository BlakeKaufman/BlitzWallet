import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {firebase} from '@react-native-firebase/app-check';
import {Platform} from 'react-native';
import * as Device from 'expo-device';
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';

const db = firestore();
let userAuth;

export async function initializeFirebase() {
  try {
    // Initialize App Check first
    await initializeAppCheck();
    // Sign in anonymously
    return;
    const userCredential = await auth().signInAnonymously();
    userAuth = userCredential;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
}

export {db, userAuth};

const initializeAppCheck = async () => {
  const isInstalledViaPlaystore = await checkIfInstalledFromPlayStore();

  if (Platform.OS === 'android' && !isInstalledViaPlaystore) {
    try {
      // Fetch custom token from your backend
      // const customToken = await fetchCustomAppCheckToken();
      // console.log(customToken);
      // Use the custom token with Firebase App Check
      await initializeCustomAppCheck();
    } catch (error) {
      console.error('Custom App Check initialization failed', error);
      throw error;
    }
  }

  // Fallback to default Firebase App Check for Play Store installations
  const provider = firebase.appCheck().newReactNativeFirebaseAppCheckProvider();
  provider.configure({
    android: {
      provider: __DEV__ ? 'debug' : 'playIntegrity',
      debugToken: __DEV__ ? process.env.FIREBSE_ANDROID_DEBUG_TOKEN : undefined,
    },
    apple: {
      provider: __DEV__ ? 'debug' : 'appAttestWithDeviceCheckFallback',
      debugToken: __DEV__ ? process.env.FIREBSE_IOS_DEBUG_TOKEN : undefined,
    },
    isTokenAutoRefreshEnabled: !__DEV__,
  });

  try {
    await firebase.appCheck().initializeAppCheck({
      provider,
      isTokenAutoRefreshEnabled: true,
    });

    const {token} = await firebase.appCheck().getToken(true);
    if (token.length > 0) {
      console.log('Firebase App Check success');
    }
  } catch (error) {
    console.log('Firebase App Check failed', error);
  }
};

// Function to fetch custom App Check token from backend
const fetchCustomAppCheckToken = async () => {
  try {
    // Generate device-specific proof
    const proof = await generateAppProof();

    // Make API call to your backend to get App Check token
    const {data} = await axios.post(process.env.FIREBASE_TOKEN, {
      proof,
      checkvalue: process.env.UNIQUE_BLITZ_VALUE,
    });
    // const response = await fetch(process.env.CREATE_JWT_URL, {
    //   method: 'POST',
    //   // body: JSON.stringify({
    //   //   proof,
    //   //   checkvalue: process.env.UNIQUE_BLITZ_VALUE,
    //   // }),
    // });
    // console.log(response);
    // const data = await response.json();

    console.log(data);

    return data;
  } catch (error) {
    console.error('Failed to fetch custom App Check token', error);
    throw error;
  }
};

// Function to initialize App Check with custom token
const initializeCustomAppCheck = async customToken => {
  try {
    // Initialize App Check with the custom token

    const provider = firebase
      .appCheck()
      .newReactNativeFirebaseAppCheckProvider();
    provider.configure({
      android: {
        provider: 'debug',
        debugToken: process.env.FIREBSE_ANDROID_DEBUG_TOKEN,
      },

      isTokenAutoRefreshEnabled: !__DEV__,
    });

    await firebase.appCheck().initializeAppCheck({
      provider,
      isTokenAutoRefreshEnabled: true, // Optional: Set to `true` to automatically refresh the token
    });

    const {token} = await firebase.appCheck().getToken(true);
    console.log('Custom App Check token obtained:', token);
  } catch (error) {
    console.error('Custom App Check initialization failed', error);
    throw error;
  }
};

// Function to generate app proof
const generateAppProof = async () => {
  const packageName = DeviceInfo.getBundleId();
  const version = DeviceInfo.getVersion();

  // Additional device-specific information
  const deviceId = await DeviceInfo.getUniqueId();

  return {
    packageName,
    version,
    deviceId,
    timestamp: Date.now(),
  };
};

const checkIfInstalledFromPlayStore = async () => {
  const installerPackageName = await DeviceInfo.getInstallerPackageName();
  if (installerPackageName === 'com.android.vending') {
    console.log('App was installed through the Play Store.');
    return true;
  } else {
    console.log('App was NOT installed through the Play Store.');
    return false;
  }
};
