import AsyncStorage from '@react-native-async-storage/async-storage';

const PROOF_STORAGE_KEY = 'CASHU_PROOFS';

export const storeProofs = async proofs => {
  try {
    const existingProofs = await getStoredProofs();
    const updatedProofs = [...existingProofs, ...proofs];
    await AsyncStorage.setItem(
      PROOF_STORAGE_KEY,
      JSON.stringify(updatedProofs),
    );
  } catch (error) {
    console.error('Failed to store proofs:', error);
  }
};

export const getStoredProofs = async () => {
  try {
    const proofs = await AsyncStorage.getItem(PROOF_STORAGE_KEY);
    return proofs ? JSON.parse(proofs) : [];
  } catch (error) {
    console.error('Failed to retrieve proofs:', error);
    return [];
  }
};

export const removeProofs = async proofsToRemove => {
  try {
    const existingProofs = await getStoredProofs();
    const updatedProofs = existingProofs.filter(
      proof => !proofsToRemove.includes(proof),
    );
    await AsyncStorage.setItem(
      PROOF_STORAGE_KEY,
      JSON.stringify(updatedProofs),
    );
  } catch (error) {
    console.error('Failed to remove proofs:', error);
  }
};
