import {getLocalStorageItem, setLocalStorageItem} from '../localStorage';
import * as SQLite from 'expo-sqlite';
export const CACHED_MESSAGES_KEY = 'CASHED_CONTACTS_MESSAGES';
export const SQL_TABLE_NAME = 'messagesTable';
export const LOCALSTORAGE_LAST_RECEIVED_TIME_KEY =
  'LAST_RECEIVED_CONTACT_MESSAGE';

let sqlLiteDB;
let messageQueue = [];

if (!sqlLiteDB) {
  async function openDBConnection() {
    sqlLiteDB = await SQLite.openDatabaseAsync(`${CACHED_MESSAGES_KEY}.db`);
  }
  openDBConnection();
}
export const initializeDatabase = async () => {
  try {
    await sqlLiteDB.execAsync(`PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS ${SQL_TABLE_NAME} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contactPubKey TEXT NOT NULL,
        message TEXT NOT NULL,
        messageUUID TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      );`);
    console.log('didOPEN');
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
export const getCachedMessages = async () => {
  try {
    const result = await sqlLiteDB.getAllAsync(
      `SELECT * FROM ${SQL_TABLE_NAME} ORDER BY timestamp ASC;`,
    );
    let returnObj = {};
    let newestTimestap = 0;
    for (const doc of result) {
      let savingKey = doc.contactPubKey;
      console.log(doc.timestamp, doc.message?.amountMsat);
      if (doc.timestamp > newestTimestap) {
        newestTimestap = doc.timestamp;
      }
      const hasSavedConvorsation = returnObj[savingKey];
      if (!hasSavedConvorsation) {
        returnObj[savingKey] = {
          messages: [JSON.parse(doc.message)],
          lastUpdated: doc.timestamp,
        };
      } else {
        returnObj[savingKey] = {
          messages: [JSON.parse(doc.message)].concat(
            returnObj[savingKey].messages,
          ),
          lastUpdated: doc.timestamp,
        };
      }
    }

    const retrivedLocalStorageItem = await getLocalStorageItem(
      LOCALSTORAGE_LAST_RECEIVED_TIME_KEY,
    );
    const savedNewestTime =
      (retrivedLocalStorageItem && JSON.parse(retrivedLocalStorageItem)) || 0;

    console.log(
      savedNewestTime,
      retrivedLocalStorageItem,
      'LOCAL STORAGE TIME',
    );

    if (savedNewestTime < newestTimestap) {
      await setLocalStorageItem(
        LOCALSTORAGE_LAST_RECEIVED_TIME_KEY,
        JSON.stringify(newestTimestap),
      );
    } else newestTimestap = savedNewestTime;
    console.log(
      newestTimestap,
      typeof newestTimestap,
      'NEWEST TIME STAMP IN CACHED FUNCTION',
    );
    return {...returnObj, lastMessageTimestamp: newestTimestap};
  } catch (err) {
    console.log(err, 'get cached message SQL error');
    return false;
  }
};

// export async function getCachedMessages() {
//   const caashedMessages = JSON.parse(
//     await getLocalStorageItem(CACHED_MESSAGES_KEY),
//   );
//   if (!caashedMessages) return {};
//   return caashedMessages;
// }

const processQueue = async () => {
  if (messageQueue.length === 0) return; // Nothing to process

  const {newMessagesList, myPubKey, updateFunction} = messageQueue.shift(); // remove the first batch

  try {
    await setCashedMessages({newMessagesList, myPubKey, updateFunction});
  } catch (err) {
    console.error('Error processing batch in queue:', err);
  } finally {
    processQueue(); // Process the next item in the queue
  }
};

const setCashedMessages = async ({
  newMessagesList, // Assume this is now an array of messages
  myPubKey,
  updateFunction,
  // contactsPubKey,
  // fromListener,
}) => {
  try {
    // Start a database transaction for better performance
    await sqlLiteDB.execAsync('BEGIN TRANSACTION;');

    for (const newMessage of newMessagesList) {
      // Check if the message already exists
      const hasSavedMessage = await sqlLiteDB.getFirstAsync(
        `SELECT * FROM ${SQL_TABLE_NAME} WHERE messageUUID = $newMessageUUID;`,
        {$newMessageUUID: newMessage.message.uuid},
      );

      const parsedMessage = !!hasSavedMessage
        ? JSON.parse(hasSavedMessage.message)
        : null;

      const addedProperties =
        newMessage.toPubKey === myPubKey
          ? {wasSeen: false, didSend: false}
          : {wasSeen: true, didSend: true};

      const contactsPubKey =
        newMessage.toPubKey === myPubKey
          ? newMessage.fromPubKey
          : newMessage.toPubKey;

      if (!parsedMessage) {
        // Insert new message if it doesn't exist
        await sqlLiteDB.runAsync(
          `INSERT INTO ${SQL_TABLE_NAME} (contactPubKey, message, messageUUID, timestamp)
          VALUES (?, ?, ?, ?);`,
          [
            contactsPubKey,
            JSON.stringify({
              ...newMessage,
              message: {...newMessage.message, ...addedProperties},
            }),
            newMessage.message.uuid,
            newMessage.timestamp,
          ],
        );
        console.log('Message created');
      } else {
        // Update the existing message if it exists
        const updatedMessage = {
          ...parsedMessage,
          message: {
            ...parsedMessage.message,
            ...newMessage.message,
          },
        };

        await sqlLiteDB.runAsync(
          `UPDATE ${SQL_TABLE_NAME} 
           SET message = ? 
           WHERE messageUUID = ?;`,
          [JSON.stringify(updatedMessage), parsedMessage.message.uuid],
        );
        console.log('Message updated');
      }
    }

    // Commit the transaction after all operations
    await sqlLiteDB.execAsync('COMMIT;');
    console.log('Bulk messages processed successfully');
  } catch (err) {
    // Rollback the transaction in case of an error
    await sqlLiteDB.execAsync('ROLLBACK;');
    console.error(err, 'set cached messages SQL error');
    return false;
  } finally {
    updateFunction();
  }
};
export const queueSetCashedMessages = ({
  newMessagesList,
  myPubKey,
  updateFunction,
}) => {
  messageQueue.push({newMessagesList, myPubKey, updateFunction}); // Enqueue the new batch
  if (messageQueue.length === 1) {
    processQueue(); // Start processing if it's the first item in the queue
  }
};

export const deleteCachedMessages = async contactPubKey => {
  try {
    await sqlLiteDB.runAsync(
      `DELETE FROM ${SQL_TABLE_NAME} WHERE contactPubKey = ?;`,
      [contactPubKey],
    );

    console.log(`Deleted all messages for contactPubKey: ${contactPubKey}`);
    return true;
  } catch (error) {
    console.error('Error deleting messages:', error);
    return false;
  }
};
export const deleteTable = async () => {
  try {
    await sqlLiteDB.runAsync(`DROP TABLE IF EXISTS ${SQL_TABLE_NAME};`);
    console.log(`Table ${SQL_TABLE_NAME} deleted successfully`);
  } catch (error) {
    console.error('Error deleting table:', error);
  }
};
