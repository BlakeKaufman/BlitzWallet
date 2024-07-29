import React, {createContext, useEffect, useRef, useState} from 'react';
import {queryContacts} from '../db';

// Create a context for the WebView ref
const GlobalContacts = createContext(null);

export const GlobalContactsList = ({children}) => {
  const [globalContactsList, setGlobalContactsList] = useState([]);

  useEffect(() => {
    async function updateGlobalContactsList() {
      let users = await queryContacts('blitzWalletUsers');
      if (users?.length === 0) return;
      users = users.map(doc => {
        const {
          contacts: {myProfile},
        } = doc.data();
        const returnObject = {
          name: myProfile.name,
          uuid: myProfile.uuid,
          uniqueName: myProfile.uniqueName,
          receiveAddress: myProfile.receiveAddress,
        };
        return returnObject;
      });
      setGlobalContactsList(users);
    }
    setTimeout(() => {
      updateGlobalContactsList();
    }, 1000 * 60 * 5);
    updateGlobalContactsList();
  }, []);

  return (
    <GlobalContacts.Provider value={{globalContactsList}}>
      {children}
    </GlobalContacts.Provider>
  );
};

export const useGlobalContacts = () => {
  return React.useContext(GlobalContacts);
};
