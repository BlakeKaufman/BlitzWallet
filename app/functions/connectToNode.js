import {getLocalStorageItem, setLocalStorageItem} from './localStorage';
import * as FileSystem from 'expo-file-system';
import {Platform} from 'react-native';
import customUUID from './customUUID';

export async function getOrCreateDirectory(uuidKey, workingDir) {
  try {
    let savedUUID = await getLocalStorageItem(uuidKey);
    if (!savedUUID) {
      savedUUID = customUUID();
      await setLocalStorageItem(uuidKey, savedUUID);
    }

    const directoryPath = `${workingDir}/${savedUUID}`;
    // On Android, we need the file:// prefix for the getInfoAsync check
    const checkPath =
      Platform.OS === 'android' ? `file://${directoryPath}` : directoryPath;

    const dirInfo = await FileSystem.getInfoAsync(checkPath);
    console.log('Directory Info:', dirInfo);

    if (!dirInfo.exists) {
      const createPath =
        Platform.OS === 'android' ? `file://${directoryPath}` : directoryPath;
      await FileSystem.makeDirectoryAsync(createPath, {intermediates: true});
      console.log(`Directory created: ${createPath}`);
    } else {
      console.log(`Directory already exists: ${checkPath}`);
    }

    await new Promise(resolve => setTimeout(resolve, 2000)); //adds two second buffer
    return directoryPath;
  } catch (err) {
    console.error('Error ensuring directory:', err);
    throw err;
  }
}

export function unit8ArrayConverter(unitArray) {
  return Array.from(
    unitArray.filter(num => Number.isInteger(num) && num >= 0 && num <= 255),
  );
}
