import {getPublicKey} from 'nostr-tools';
import {
  decryptMessage,
  encriptMessage,
} from '../../../../../../functions/messaging/encodingAndDecodingMessages';
import {randomUUID} from 'expo-crypto';

export default function saveChatGPTChat({
  contactsPrivateKey,
  masterInfoObject,
  chatHistory,
  newChats,
  toggleMasterInfoObject,
  navigation,
  navigate,
}) {
  try {
    const publicKey = getPublicKey(contactsPrivateKey);

    let savedHistory =
      [
        ...JSON.parse(
          decryptMessage(
            contactsPrivateKey,
            publicKey,
            masterInfoObject.chatGPT.conversation,
          ),
        ),
      ] || [];

    if (savedHistory.length === 0) return true;

    const filteredHistory = savedHistory.find(
      item => item.uuid === chatHistory.uuid,
    );

    let newChatHistoryObject = {};

    if (filteredHistory) {
      newChatHistoryObject = {...filteredHistory};
      newChatHistoryObject['conversation'] = [
        ...filteredHistory.conversation,
        ...newChats,
      ];
      newChatHistoryObject['lastUsed'] = new Date();
    } else {
      newChatHistoryObject['conversation'] = [
        ...chatHistory.conversation,
        ...newChats,
      ];
      newChatHistoryObject['firstQuery'] = newChats[0].content;
      newChatHistoryObject['lasdUsed'] = new Date();
      newChatHistoryObject['uuid'] = randomUUID();
      savedHistory.push(newChatHistoryObject);
    }

    const newHisotry = filteredHistory
      ? savedHistory.map(item => {
          if (item.uuid === newChatHistoryObject.uuid)
            return newChatHistoryObject;
          else return item;
        })
      : savedHistory;

    toggleMasterInfoObject({
      chatGPT: {
        conversation: encriptMessage(
          contactsPrivateKey,
          publicKey,
          JSON.stringify(newHisotry),
        ),
        credits: masterInfoObject.chatGPT.credits,
      },
    });

    navigation.navigate('App Store');
  } catch (err) {
    console.log(err);
    navigate.navigate('ErrorScreen', {
      errorMessage: 'Sorry we cannot save your conversation.',
    });
  }
}
