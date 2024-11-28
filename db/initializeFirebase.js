import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const db = firestore();

let userAuth;

export async function initializeFirebase() {
  try {
    // Sign in anonymously
    const userCredential = await auth().signInAnonymously();

    console.log('Signed in anonymously:', userCredential.user.uid);

    // Log Firestore initialization
    console.log('Firestore initialized:', db);
    userAuth = userCredential;

    // return {db, auth};
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    // throw error; // Re-throw to handle in calling code
  }
}

export {db, userAuth};
