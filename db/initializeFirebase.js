import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {firebase} from '@react-native-firebase/app-check';

const db = firestore();

let userAuth;

export async function initializeFirebase() {
  try {
    // Initialize App Check first
    await initializeAppCheck();
    // Sign in anonymously
    const userCredential = await auth().signInAnonymously();

    // console.log('Signed in anonymously:', userCredential.user.uid);

    // Log Firestore initialization
    // console.log('Firestore initialized:', db);
    userAuth = userCredential;

    // return {db, auth};
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    // throw error; // Re-throw to handle in calling code
  }
}

export {db, userAuth};

const initializeAppCheck = async () => {
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

    // Optional: Get initial token to verify setup
    const {token} = await firebase.appCheck().getToken(true);
    console.log('AppCheck initialized successfully');
  } catch (error) {
    console.error('AppCheck initialization failed', error);
  }
};
