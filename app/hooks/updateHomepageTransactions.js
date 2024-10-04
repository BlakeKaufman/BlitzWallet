import {useState, useEffect, useRef} from 'react';

export function useUpdateHomepageTransactions() {
  const [updateTransaction, setUpdateTransaction] = useState(0);
  let homepageUpdateInterval;

  useEffect(() => {
    homepageUpdateInterval = setInterval(() => {
      setUpdateTransaction(prev => (prev = prev + 1));
    }, 60000);

    return () => {
      clearInterval(homepageUpdateInterval);
    };
  }, []);

  return updateTransaction;
}
