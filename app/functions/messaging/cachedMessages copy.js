import {getLocalStorageItem, setLocalStorageItem} from '../localStorage';
export const CACHED_MESSAGES_KEY = 'CASHED_CONTACTS_MESSAGES';
export async function getCachedMessages() {
  const caashedMessages = JSON.parse(
    await getLocalStorageItem(CACHED_MESSAGES_KEY),
  );
  if (!caashedMessages) return {};
  return caashedMessages;
}

export async function setCashedMessages({
  newMessage,
  fromPubKey,
  contactsPubKey,
  timestamp,
  fromListener,
}) {
  let cachedMessages = JSON.parse(
    await getLocalStorageItem(CACHED_MESSAGES_KEY),
  );

  const addedProperties =
    fromListener === 'toPubKey'
      ? {wasSeen: false, didSend: false}
      : {wasSeen: true, didSend: true};

  if (!cachedMessages) {
    const newConversation = {
      [contactsPubKey]: {
        messages: [
          {...newMessage, message: {...newMessage.message, ...addedProperties}},
        ],
        lastUpdated: newMessage.timestamp,
      },
    };
    setLocalStorageItem(
      CACHED_MESSAGES_KEY,
      JSON.stringify({
        ...newConversation,
        lastMessageTimestamp: newMessage.timestamp,
      }),
    );
    return;
  }
  let savedConversation = cachedMessages[contactsPubKey];

  console.log(newMessage, 'NEW CACHED MESSAGE');
  console.log(contactsPubKey, 'TOPUBKEY');
  console.log(addedProperties, 'TOPUBKEY');
  console.log(savedConversation, 'SAVED CONVERSATION');
  console.log(savedConversation?.messages);

  if (savedConversation === undefined) {
    const newConversation = {
      [contactsPubKey]: {
        messages: [
          {...newMessage, message: {...newMessage.message, ...addedProperties}},
        ],
        lastUpdated: newMessage.timestamp,
      },
    };
    setLocalStorageItem(
      CACHED_MESSAGES_KEY,
      JSON.stringify({
        ...cachedMessages,
        ...newConversation,
        lastMessageTimestamp: newMessage.timestamp,
      }),
    );
    return;
  } else {
    const alreadySavedMessage = savedConversation.messages.find(message => {
      console.log(message, 'SAVED MESSAGE FORMAT');
      console.log(newMessage, 'NEW MESSAGE FORMAT');
      return message.message.uuid === newMessage.message.uuid;
    });
    if (alreadySavedMessage) {
      const newConversation = savedConversation.messages.map(conversation => {
        if (conversation.message.uuid === newMessage.message.uuid) {
          return {
            ...conversation,
            message: {...conversation.message, ...newMessage.message},
          };
        } else return conversation;
      });
      savedConversation.messages = newConversation;
      savedConversation.messages.sort((a, b) => a.timestamp - b.timestamp);
      savedConversation.lastUpdated = newMessage.timestamp;
      cachedMessages[contactsPubKey] = savedConversation;
    } else {
      savedConversation.messages.push({
        ...newMessage,
        message: {
          ...newMessage.message,
          ...addedProperties,
        },
      });
      savedConversation.messages.sort((a, b) => a.timestamp - b.timestamp);
      savedConversation.lastUpdated = newMessage.timestamp;
      cachedMessages[contactsPubKey] = savedConversation;
    }

    console.log(savedConversation.messages);
    console.log('-----------------------------------------');
    setLocalStorageItem(
      CACHED_MESSAGES_KEY,
      JSON.stringify({
        ...cachedMessages,
        lastMessageTimestamp: newMessage.timestamp,
      }),
    );
  }
}

export async function deleteCachedMessages(keyToDelete) {
  try {
    let cachedMessages = JSON.parse(
      await getLocalStorageItem(CACHED_MESSAGES_KEY),
    );
    delete cachedMessages[keyToDelete];
    setLocalStorageItem(CACHED_MESSAGES_KEY, JSON.stringify(cachedMessages));
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}
