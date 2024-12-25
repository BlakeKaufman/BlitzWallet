import {getPublicKey} from 'nostr-tools';
import {
  decryptMessage,
  encriptMessage,
} from '../../../../../../functions/messaging/encodingAndDecodingMessages';
import customUUID from '../../../../../../functions/customUUID';

export default function saveChatGPTChat({
  contactsPrivateKey,
  globalAppDataInformation,
  chatHistory,
  newChats,
  toggleGlobalAppDataInformation,
  navigation,
  navigate,
}) {
  try {
    const publicKey = getPublicKey(contactsPrivateKey);

    let savedHistory =
      typeof globalAppDataInformation.chatGPT.conversation === 'string'
        ? [
            ...JSON.parse(
              decryptMessage(
                contactsPrivateKey,
                publicKey,
                globalAppDataInformation.chatGPT.conversation,
              ),
            ),
          ]
        : [];

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
      newChatHistoryObject['uuid'] = customUUID();
      savedHistory.push(newChatHistoryObject);
    }

    const newHisotry = filteredHistory
      ? savedHistory.map(item => {
          if (item.uuid === newChatHistoryObject.uuid)
            return newChatHistoryObject;
          else return item;
        })
      : savedHistory;

    toggleGlobalAppDataInformation(
      {
        chatGPT: {
          conversation: encriptMessage(
            contactsPrivateKey,
            publicKey,
            JSON.stringify(newHisotry),
          ),
          credits: globalAppDataInformation.chatGPT.credits,
        },
      },
      true,
    );

    navigation.navigate('App Store');
  } catch (err) {
    console.log(err);
    navigate.navigate('ErrorScreen', {
      errorMessage: 'Sorry we cannot save your conversation.',
    });
  }
}
