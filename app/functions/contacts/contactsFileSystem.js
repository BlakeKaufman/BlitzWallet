import * as FileSystem from 'expo-file-system';

async function getContactsImage() {
  const dir = FileSystem.documentDirectory;
  const filePath = `${dir}blitzWalletContactPhotos.csv`;
  try {
    const savedData = (await FileSystem.readAsStringAsync(filePath)).split(
      '\n',
    );
    return new Promise(resolve => resolve(savedData));
  } catch (err) {
    console.log(err);
    return new Promise(resolve => resolve(false));
  }
}

async function saveNewContactsImage(savedData) {
  const dir = FileSystem.documentDirectory;
  const filePath = `${dir}blitzWalletContactPhotos.csv`;
  try {
    await FileSystem.writeAsStringAsync(filePath, savedData, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    return new Promise(resolve => resolve(true));
  } catch (err) {
    return new Promise(resolve => resolve(false));
  }
}

async function saveToCacheDirectory(imgURL, profileUUID) {
  const dir = FileSystem.cacheDirectory;
  const filePath = `${dir}${profileUUID}.jpg`;
  try {
    await FileSystem.copyAsync({from: imgURL, to: filePath});

    return new Promise(resolve => resolve(true));
  } catch (err) {
    console.log(err);
    return new Promise(resolve => resolve(false));
  }
}

async function getProfileImageFromCache(profileUUID) {
  const dir = FileSystem.cacheDirectory;
  const filePath = `${dir}${profileUUID}.jpg`;
  try {
    // THIS DOES NOT WORK YET
    return new Promise(resolve => resolve(filePath));
  } catch (err) {
    console.log(err);
    return new Promise(resolve => resolve(false));
  }
}

export {
  getContactsImage,
  saveNewContactsImage,
  saveToCacheDirectory,
  getProfileImageFromCache,
};
