import {useIsFocused} from '@react-navigation/native';
import {useState, useEffect, useRef} from 'react';

export function updateHomepageTransactions() {
  const [updateTransaction, setUpdateTransaction] = useState(0);
  const isFocused = useIsFocused();
  let homepageUpdateInterval;

  useEffect(() => {
    if (!isFocused) {
      clearInterval(homepageUpdateInterval);
      return;
    }
    homepageUpdateInterval = setInterval(() => {
      setUpdateTransaction(prev => (prev = prev + 1));
    }, 60000);

    return () => {
      clearInterval(homepageUpdateInterval);
    };
  }, [isFocused]);

  return updateTransaction;
}
