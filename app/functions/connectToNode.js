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

    const dirInfo = await FileSystem.getInfoAsync(directoryPath);
    console.log(dirInfo);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(
        `${Platform.OS === 'ios' ? '' : 'file:/'}${directoryPath}`,
        {intermediates: true},
      );
      console.log(
        `Directory created: ${
          Platform.OS === 'ios' ? '' : 'file:/'
        }${directoryPath}`,
      );
    } else {
      console.log(dirInfo);
      console.log(
        `Directory already exists: ${
          Platform.OS === 'ios' ? '' : 'file:/'
        }${directoryPath}`,
      );
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
