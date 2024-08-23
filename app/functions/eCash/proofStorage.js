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
      item1 =>
        !proofsToRemove.some(
          item2 =>
            item1.C === item2.C &&
            item1.amount === item2.amount &&
            item1.id === item2.id &&
            item1.secret === item2.secret,
        ),
    );
    // const updatedProofs = existingProofs.filter(proof => {
    //   console.log(proofsToRemove, proof, 'TESTING IN REMOVE PROOF');
    //   return proofsToRemove.some(
    //     item =>
    //       !(
    //         item.C === proof.C &&
    //         item.amount === proof.amount &&
    //         item.id === proof.id &&
    //         item.secret === proof.secret
    //       ),
    //   );
    // });
    console.log(updatedProofs);
    await AsyncStorage.setItem(
      PROOF_STORAGE_KEY,
      JSON.stringify(updatedProofs),
    );
  } catch (error) {
    console.error('Failed to remove proofs:', error);
  }
};
