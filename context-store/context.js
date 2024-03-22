import {createContext, useState, useContext, useEffect} from 'react';
import {getLocalStorageItem, setLocalStorageItem} from '../app/functions';
import {useColorScheme} from 'react-native';
import {setStatusBarStyle} from 'expo-status-bar';
import {useTranslation} from 'react-i18next';
import {removeLocalStorageItem} from '../app/functions/localStorage';

// Initiate context
const GlobalContextManger = createContext();

const GlobalContextProvider = ({children}) => {
  // Manage theme state
  const useSystemTheme = useColorScheme() === 'dark';
  const [theme, setTheme] = useState(null);
  const [userTxPreferance, setUserTxPereferance] = useState(null);
  const [nodeInformation, setNodeInformation] = useState({
    didConnectToNode: null,
    transactions: [],
    userBalance: 0,
    inboundLiquidityMsat: 0,
    blockHeight: 0,
    onChainBalance: 0,
    fiatStats: {},
  });
  const [breezContextEvent, setBreezContextEvent] = useState({});
  const [userBalanceDenomination, setUserBalanceDenomination] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [nostrSocket, setNostrSocket] = useState(null);
  const [nostrEvents, setNosterEvents] = useState({});
  const [nostrContacts, setNostrContacts] = useState([]);
  const {i18n} = useTranslation();

  function toggleTheme(peram) {
    const mode = peram ? 'light' : 'dark';
    setStatusBarStyle(mode);
    setLocalStorageItem('colorScheme', JSON.stringify(mode));
    setTheme(peram);
  }
  function toggleUserTxPreferance(num) {
    setUserTxPereferance(num);
  }
  function toggleNodeInformation(newInfo) {
    setNodeInformation(prev => {
      return {...prev, ...newInfo};
    });
  }
  function toggleBreezContextEvent(breezEvent) {
    setBreezContextEvent({...breezEvent});
  }
  function toggleUserBalanceDenomination(denomination) {
    setLocalStorageItem(
      'userBalanceDenominatoin',
      JSON.stringify(denomination),
    );
    setUserBalanceDenomination(denomination);
  }
  function toggleSelectedLanguage(language) {
    setLocalStorageItem('userSelectedLanguage', JSON.stringify(language));
    i18n.changeLanguage(language);
    setSelectedLanguage(language);
  }
  function toggleNostrSocket(socket) {
    setNostrSocket(socket);
  }
  function toggleNostrEvents(event) {
    setNosterEvents({...event});
  }
  function toggleNostrContacts(update, undefined, selectedContact) {
    if (selectedContact)
      setNostrContacts(prev => {
        const newContacts = prev.map(contact => {
          if (contact.npub === selectedContact.npub) {
            return {...contact, ...update};
          } else {
            return contact;
          }
        });
        setLocalStorageItem('contacts', JSON.stringify(newContacts));
        return newContacts;
      });
    else {
      setNostrContacts(update);
      setLocalStorageItem('contacts', JSON.stringify(update));
    }
  }

  useEffect(() => {
    (async () => {
      const storedTheme = JSON.parse(await getLocalStorageItem('colorScheme'));
      const storedUserTxPereferance = await getLocalStorageItem(
        'homepageTxPreferace',
      );
      const userBalanceDenomination = JSON.parse(
        await getLocalStorageItem('userBalanceDenominatoin'),
      );
      const selectedLanguage = JSON.parse(
        await getLocalStorageItem('userSelectedLanguage'),
      );
      const savedNostrContacts = JSON.parse(
        await getLocalStorageItem('contacts'),
      );
      // removeLocalStorageItem('contacts');
      console.log(savedNostrContacts);

      if (!storedTheme) {
        toggleTheme(false);
        setStatusBarStyle('dark');
      } else if (storedTheme === 'dark') {
        setTheme(false);
        setStatusBarStyle('dark');
      } else {
        setTheme(true);
        setStatusBarStyle('light');
      }
      if (storedUserTxPereferance)
        setUserTxPereferance(JSON.parse(storedUserTxPereferance));
      else setUserTxPereferance(15);

      if (userBalanceDenomination)
        setUserBalanceDenomination(userBalanceDenomination);
      else setUserBalanceDenomination('sats');

      if (selectedLanguage) toggleSelectedLanguage(selectedLanguage);
      else toggleSelectedLanguage('en');

      if (savedNostrContacts) setNostrContacts(savedNostrContacts);
      else setNostrContacts([]);
    })();
  }, []);

  if (theme === null || userTxPreferance === null) return;

  return (
    <GlobalContextManger.Provider
      value={{
        theme,
        toggleTheme,
        userTxPreferance,
        toggleUserTxPreferance,
        nodeInformation,
        toggleNodeInformation,
        breezContextEvent,
        toggleBreezContextEvent,
        userBalanceDenomination,
        toggleUserBalanceDenomination,
        selectedLanguage,
        toggleSelectedLanguage,
        nostrSocket,
        toggleNostrSocket,
        nostrEvents,
        toggleNostrEvents,
        nostrContacts,
        toggleNostrContacts,
      }}>
      {children}
    </GlobalContextManger.Provider>
  );
};

function useGlobalContextProvider() {
  const context = useContext(GlobalContextManger);
  if (!context) {
    throw new Error(
      'useGlobalContextProvider must be used within a GlobalContextProvider',
    );
  }
  return context;
}

export {GlobalContextManger, GlobalContextProvider, useGlobalContextProvider};
