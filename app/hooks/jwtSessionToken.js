import {useEffect, useRef} from 'react';
import auth from '@react-native-firebase/auth'; // If using Firebase
import {setLocalStorageItem} from '../functions';
import fetchBackend from '../../db/handleBackend';

const useJWTSessionToken = (publicKey, privateKey, didGetToHomepage) => {
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!publicKey || !privateKey || !didGetToHomepage) return;
    if (!isInitialLoad.current) return;
    isInitialLoad.current = false;
    // Listen for auth state changes

    let interval;
    (async () => {
      try {
        const token = await fetchBackend(
          'login',
          {userAuth: auth().currentUser.uid},
          privateKey,
          publicKey,
        );
        if (!token) return;
        console.log('backend response', token);
        await setLocalStorageItem('session-token', JSON.stringify(token));
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
        await setLocalStorageItem('session-token', JSON.stringify(token));
      } catch (error) {
        console.error('Error fetching session token:', error);
      }
    }, 1000 * 60 * 50); // 50-minute interval

    return () => {
      clearInterval(interval);
    };
  }, [publicKey, privateKey, didGetToHomepage]);
};

export default useJWTSessionToken;
