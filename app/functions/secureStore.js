import * as SecureStore from 'expo-secure-store';
import {removeAllLocalData} from './localStorage';

async function storeData(key, value) {
  try {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });

    return new Promise(resolve => {
      resolve(true);
    });
  } catch (error) {
    console.log(error);
    return new Promise(resolve => {
      resolve(false);
    });
  }
}

async function retrieveData(key) {
  try {
    const value = await SecureStore.getItemAsync(key);
    if (key === 'mnemonic') {
      const breezMnemoinc = await SecureStore.getItemAsync(
        'BREEZ_SDK_SEED_MNEMONIC',
      );
      if (!breezMnemoinc) storeData('BREEZ_SDK_SEED_MNEMONIC', value);
    }
    if (value) {
      return new Promise(resolve => {
        resolve(value);
      });
    } else {
      return new Promise(resolve => {
        resolve(false);
      });
    }
  } catch (error) {
    return new Promise(resolve => {
      resolve(false);
    });
  }
}

async function terminateAccount() {
  try {
    await SecureStore.deleteItemAsync('key');
    await SecureStore.deleteItemAsync('pin');
    await SecureStore.deleteItemAsync('mnemonic');

    const didRemove = await removeAllLocalData();
    if (!didRemove) throw Error('not able to remove local storage data');

    return new Promise(resolve => {
      resolve(true);
    });
  } catch (error) {
    return new Promise(resolve => {
      resolve(false);
    });
  }
}

async function deleteItem(key) {
  try {
    await SecureStore.deleteItemAsync(key);

    return new Promise(Response => {
      Response(true);
    });
  } catch (error) {
    return new Promise(Response => {
      Response(false);
    });
  }
}

export {retrieveData, storeData, terminateAccount, deleteItem};
