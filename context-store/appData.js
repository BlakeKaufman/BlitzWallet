import React, {createContext, useCallback, useMemo, useState} from 'react';
import {addDataToCollection} from '../db';
import {decryptMessage} from '../app/functions/messaging/encodingAndDecodingMessages';
import {useKeysContext} from './keys';

// Create a context for the WebView ref
const GlobalAppData = createContext(null);

export const GlobalAppDataProvider = ({children}) => {
  const {contactsPrivateKey, publicKey} = useKeysContext();

  const [globalAppDataInformation, setGlobalAppDatasInformation] = useState({});
  const [giftCardsList, setGiftCardsList] = useState([]);

  const toggleGlobalAppDataInformation = (newData, writeToDB) => {
    setGlobalAppDatasInformation(prev => {
      const newAppData = {...prev, ...newData};

      if (writeToDB) {
        addDataToCollection(
          {appData: newAppData},
          'blitzWalletUsers',
          publicKey,
        );
      }
      return newAppData;
    });
  };
  const toggleGiftCardsList = useCallback(giftCards => {
    setGiftCardsList(giftCards);
  }, []);
  const decryptData = (key, defaultValue) => {
    let data;
    if (key === 'chatGPT') {
      data = globalAppDataInformation[key]?.conversation;
    } else {
      data = globalAppDataInformation[key];
    }
    if (!publicKey || typeof data !== 'string') return defaultValue;
    return JSON.parse(decryptMessage(contactsPrivateKey, publicKey, data));
  };
  const decodedChatGPT = useMemo(() => {
    const decryptedConversations = decryptData('chatGPT', []);
    return {
      conversation: decryptedConversations,
      credits: globalAppDataInformation?.chatGPT?.credits || 0,
    };
  }, [globalAppDataInformation.chatGPT, publicKey, contactsPrivateKey]);
  const decodedVPNS = useMemo(
    () => decryptData('VPNplans', []),
    [globalAppDataInformation.VPNplans, publicKey, contactsPrivateKey],
  );
  const decodedGiftCards = useMemo(
    () => decryptData('giftCards', {}),
    [globalAppDataInformation.giftCards, publicKey, contactsPrivateKey],
  );
  const decodedMessages = useMemo(
    () => decryptData('messagesApp', {received: [], sent: []}),
    [globalAppDataInformation.messagesApp, publicKey, contactsPrivateKey],
  );

  return (
    <GlobalAppData.Provider
      value={{
        decodedChatGPT,
        decodedMessages,
        decodedVPNS,
        globalAppDataInformation,
        decodedGiftCards,
        toggleGlobalAppDataInformation,
        giftCardsList,
        toggleGiftCardsList,
      }}>
      {children}
    </GlobalAppData.Provider>
  );
};

export const useGlobalAppData = () => {
  return React.useContext(GlobalAppData);
};
