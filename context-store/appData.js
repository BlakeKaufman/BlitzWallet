import React, {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {addDataToCollection} from '../db';
import {useGlobalContextProvider} from './context';
import {getPublicKey} from 'nostr-tools';
import {decryptMessage} from '../app/functions/messaging/encodingAndDecodingMessages';

// Create a context for the WebView ref
const GlobalAppData = createContext(null);

export const GlobalAppDataProvider = ({children}) => {
  const {contactsPrivateKey} = useGlobalContextProvider();
  const [globalAppDataInformation, setGlobalAppDatasInformation] = useState({});

  const chatGPT = globalAppDataInformation.chatGPT;
  const VPNs = globalAppDataInformation.VPNplans;
  const messagesApp = globalAppDataInformation.messagesApp;
  const giftCards = globalAppDataInformation.giftCards;

  const publicKey = useMemo(
    () => contactsPrivateKey && getPublicKey(contactsPrivateKey),
    [contactsPrivateKey],
  );

  const toggleGlobalAppDataInformation = (newData, writeToDB) => {
    setGlobalAppDatasInformation(prev => {
      const newAppData = {...prev, ...newData};

      if (writeToDB) {
        addDataToCollection(
          {appData: newAppData},
          'blitzWalletUsers',
          publicKey,
        );
        return newAppData;
      } else return newAppData;
    });
  };

  const decodedChatGPT = useMemo(() => {
    if (!publicKey || typeof chatGPT?.conversation != 'string' || !chatGPT)
      return {
        conversation: [],
        credits: chatGPT?.credits || 0,
      };
    return {
      conversation: JSON.parse(
        decryptMessage(contactsPrivateKey, publicKey, chatGPT.conversation),
      ),
      credits: chatGPT.credits,
    };
  }, [chatGPT]);

  const decodedVPNS = useMemo(() => {
    if (!publicKey || typeof globalAppDataInformation.VPNplans != 'string')
      return [];
    return JSON.parse(decryptMessage(contactsPrivateKey, publicKey, VPNs));
  }, [VPNs]);

  const decodedGiftCards = useMemo(() => {
    if (!publicKey || typeof globalAppDataInformation.giftCards != 'string')
      return {};
    return JSON.parse(decryptMessage(contactsPrivateKey, publicKey, giftCards));
  }, [giftCards]);
  const decodedMessages = useMemo(() => {
    if (!publicKey || typeof globalAppDataInformation.messagesApp != 'string')
      return {received: [], sent: []};
    return JSON.parse(
      decryptMessage(contactsPrivateKey, publicKey, messagesApp),
    );
  }, [messagesApp]);

  return (
    <GlobalAppData.Provider
      value={{
        decodedChatGPT,
        decodedMessages,
        decodedVPNS,
        globalAppDataInformation,
        decodedGiftCards,
        toggleGlobalAppDataInformation,
      }}>
      {children}
    </GlobalAppData.Provider>
  );
};

export const useGlobalAppData = () => {
  return React.useContext(GlobalAppData);
};
