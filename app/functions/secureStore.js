import * as SecureStore from 'expo-secure-store';

async function storeData(key, value) {
  try {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: 2,
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
