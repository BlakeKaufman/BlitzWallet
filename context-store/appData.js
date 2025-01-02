import React, {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {addDataToCollection, queryContacts} from '../db';
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
        addDataToCollection({appData: newAppData}, 'blitzWalletUsers');
        return newAppData;
      } else return newAppData;
    });
  };

  //   console.log(globalAppDataInformation, 'GLOBAL APP DATA');

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
  //   const decodedAppData = useMemo(() => {
  //     if (!publicKey || Object.keys(globalAppDataInformation).length === 0)
  //       return {};
  //     let tempObject = {};

  //     Object.entries(globalAppDataInformation).forEach((value, index) => {
  //       if (value[0] === 'chatGPT') {
  //         tempObject[value[0]] = {
  //           conversation: JSON.parse(
  //             decryptMessage(
  //               contactsPrivateKey,
  //               publicKey,
  //               value[1].conversation,
  //             ),
  //           ),
  //           credits: value[1].credits,
  //         };
  //       } else
  //         tempObject[value[0]] = JSON.parse(
  //           decryptMessage(contactsPrivateKey, publicKey, value[1]),
  //         );
  //     });

  //     return tempObject;
  //   }, [globalAppDataInformation]);

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
