import {useState, useEffect, useRef} from 'react';

export function updateLiquidTransactions() {
  const [updateTransaction, setUpdateTransaction] = useState(0);

  useEffect(() => {
    let homepageUpdateInterval = setInterval(() => {
      setUpdateTransaction(prev => (prev = prev + 1));
      console.log('Test');
    }, 60000);

    return () => {
      clearInterval(homepageUpdateInterval);
    };
  }, []);

  return updateTransaction;
}
