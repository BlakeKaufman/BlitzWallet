import AsyncStorage from '@react-native-async-storage/async-storage';

export async function setLocalStorageItem(key, val) {
  try {
    await AsyncStorage.setItem(key, val);
    return new Promise(resolve => {
      resolve(true);
    });
  } catch (error) {
    return new Promise(resolve => {
      resolve(false);
    });
  }
}
export async function getLocalStorageItem(key) {
  try {
    const item = await AsyncStorage.getItem(key);

    if (item !== null) {
      const parsedItem = item;
      return new Promise(resolve => {
        resolve(parsedItem);
      });
    }

    return new Promise(resolve => {
      resolve(item);
    });
  } catch (error) {
    return new Promise(resolve => {
      resolve(null);
    });
  }
}
export async function removeLocalStorageItem(key) {
  try {
    await AsyncStorage.removeItem(key);
    return new Promise(resolve => {
      resolve(true);
    });
  } catch (error) {
    return new Promise(resolve => {
      resolve(false);
    });
  }
}

export async function removeAllLocalData() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (e) {
    console.log(e);
    return false;
    // read key error
  }
}
export async function usesLocalStorage() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log(keys);

    return new Promise(resolve => {
      resolve({data: keys.includes('blitzWalletLocalStorage'), error: false});
    });
  } catch (error) {
    return new Promise(resolve => {
      resolve({data: null, error: true});
    });
  }
}
