import * as SecureStore from 'expo-secure-store';

async function storeData(key, value) {
  try {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: 2,
    });

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function retrieveData(key) {
  try {
    const value = await SecureStore.getItemAsync(key);
    if (value) {
      return value;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

async function terminateAccount() {
  try {
    await SecureStore.deleteItemAsync('key');
    await SecureStore.deleteItemAsync('pin');
    await SecureStore.deleteItemAsync('mnemonic');

    return true;
  } catch (error) {
    return false;
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
