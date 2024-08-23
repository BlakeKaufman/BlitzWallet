import AsyncStorage from '@react-native-async-storage/async-storage';
import {ECASH_TX_STORAGE_KEY} from '../../constants';

export const storeEcashTransactions = async tx => {
  try {
    const existingProofs = await getStoredEcashTransactions();
    const updatedProofs = [...existingProofs, tx];
    await AsyncStorage.setItem(
      ECASH_TX_STORAGE_KEY,
      JSON.stringify(updatedProofs),
    );
  } catch (error) {
    console.error('Failed to store proofs:', error);
  }
};

export const getStoredEcashTransactions = async () => {
  try {
    const txs = await AsyncStorage.getItem(ECASH_TX_STORAGE_KEY);
    return txs ? JSON.parse(txs) : [];
  } catch (error) {
    console.error('Failed to retrieve txs:', error);
    return [];
  }
};
