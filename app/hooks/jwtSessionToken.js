import {useState, useEffect, useRef} from 'react';
import auth from '@react-native-firebase/auth'; // If using Firebase
import {getLocalStorageItem, setLocalStorageItem} from '../functions';
import {initializeFirebase} from '../../db/initializeFirebase';
import fetchBackend from '../../db/handleBackend';

const useJWTSessionToken = (publicKey, privateKey) => {
  const [JWTToken, setJWTToken] = useState(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!publicKey || !privateKey) return;
    if (!isInitialLoad.current) return;
    isInitialLoad.current = false;
    // Listen for auth state changes

    let interval;
    (async () => {
      try {
        const didSetSession = await initializeFirebase();
        if (!didSetSession) return;
        console.log(didSetSession.uid);
        const token = await fetchBackend(
          'login',
          {userAuth: didSetSession.uid},
          privateKey,
          publicKey,
        );
        if (!token) return;
        console.log('backend response', token);
        setJWTToken(token);
      } catch (err) {
        console.log('fetch jwt error', err);
      }
    })();

    // Check session token periodically
    interval = setInterval(async () => {
      try {
        const token = await fetchBackend(
          'login',
          {userAuth: auth().currentUser.uid},
          privateKey,
          publicKey,
        );
        if (!token) return;
        setJWTToken(token);
      } catch (error) {
        console.error('Error fetching session token:', error);
      }
    }, 1000 * 60 * 50); // 50-minute interval

    return () => {
      clearInterval(interval);
    };
  }, [publicKey, privateKey]);

  return JWTToken;
};

export default useJWTSessionToken;
