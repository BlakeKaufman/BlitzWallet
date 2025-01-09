import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {firebase} from '@react-native-firebase/app-check';
import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';

const db = firestore();
let userAuth;

export async function initializeFirebase() {
  try {
    // Initialize App Check first
    await new Promise.resolve(
      setTimeout(async () => {
        await initializeAppCheck();
      }, 1000),
    );

    // Sign in anonymously
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
    await firebase.appCheck().getToken(true);
    console.log('Firebase App Check success');
  } catch (error) {
    console.log('Firebase App Check failed', error);
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
      isTokenAutoRefreshEnabled: true,
    });

    await firebase.appCheck().initializeAppCheck({
      provider,
      isTokenAutoRefreshEnabled: true, // Optional: Set to `true` to automatically refresh the token
    });
    await firebase.appCheck().getToken(true);
    console.log('Custom App Check token obtained:');
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
