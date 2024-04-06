import {createContext, useState, useContext, useEffect} from 'react';
import {getLocalStorageItem, setLocalStorageItem} from '../app/functions';

import {setStatusBarStyle} from 'expo-status-bar';
import {useTranslation} from 'react-i18next';
import {usesLocalStorage} from '../app/functions/localStorage';
import {
  addDataToCollection,
  getDataFromCollection,
  handleDataStorageSwitch,
} from '../db';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initiate context
const GlobalContextManger = createContext();

const GlobalContextProvider = ({children}) => {
  // Manage theme state

  const [theme, setTheme] = useState(null);
  // const [userTxPreferance, setUserTxPereferance] = useState(null);
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
  // const [userBalanceDenomination, setUserBalanceDenomination] = useState('');
  // const [selectedLanguage, setSelectedLanguage] = useState('');
  const [nostrSocket, setNostrSocket] = useState(null);
  const [nostrEvents, setNosterEvents] = useState({});
  // const [nostrContacts, setNostrContacts] = useState([]);
  // const [usesBlitzStorage, setUsesBlitzStorage] = useState(null);
  const [masterInfoObject, setMasterInfoObject] = useState({});
  const {i18n} = useTranslation();

  async function toggleTheme(peram) {
    const mode = peram ? 'light' : 'dark';
    setStatusBarStyle(mode);

    toggleMasterInfoObject({colorScheme: mode});

    setTheme(peram);
  } //DONE
  // function toggleUserTxPreferance(num) {
  //   setUserTxPereferance(num);
  // }
  function toggleNodeInformation(newInfo) {
    setNodeInformation(prev => {
      return {...prev, ...newInfo};
    });
  }
  function toggleBreezContextEvent(breezEvent) {
    setBreezContextEvent({...breezEvent});
  }
  // function toggleUserBalanceDenomination(denomination) {
  //   setLocalStorageItem(
  //     'userBalanceDenominatoin',
  //     JSON.stringify(denomination),
  //   );
  //   setUserBalanceDenomination(denomination);
  // }
  // function toggleSelectedLanguage(language) {
  //   setLocalStorageItem('userSelectedLanguage', JSON.stringify(language));
  //   i18n.changeLanguage(language);
  //   setSelectedLanguage(language);
  // }
  function toggleNostrSocket(socket) {
    setNostrSocket(socket);
  }
  function toggleNostrEvents(event) {
    setNosterEvents({...event});
  }
  function toggleNostrContacts(update, undefined, selectedContact) {
    if (selectedContact) {
      const newContacts = masterInfoObject.nostrContacts.map(contact => {
        if (contact.npub === selectedContact.npub) {
          return {...contact, ...update};
        } else {
          return contact;
        }
      });

      // console.log(newContacts.transctions, 'TTTTS');
      // return;
      toggleMasterInfoObject({nostrContacts: newContacts});
    } else {
      toggleMasterInfoObject({nostrContacts: update});
    }
  }

  // async function toggleUsesBlitzStorage() {
  //   const isUsingLocalStorage = await usesLocalStorage();
  //   console.log(isUsingLocalStorage, 'IN TOGGLE FUCNT');
  //   setUsesBlitzStorage(!isUsingLocalStorage.data);
  // }

  async function toggleMasterInfoObject(newData, globalDataStorageSwitch) {
    console.log(newData);
    if (newData.userSelectedLanguage) {
      i18n.changeLanguage(newData.userSelectedLanguage);
    }

    const isUsingLocalStorage =
      globalDataStorageSwitch !== undefined
        ? globalDataStorageSwitch
        : (await usesLocalStorage()).data;

    setMasterInfoObject(prev => {
      const newObject = {...prev, ...newData};

      // console.log(prev, 'PREV');
      console.log(newData, 'NEW DATA');

      if (isUsingLocalStorage)
        setLocalStorageItem(
          'blitzWalletLocalStorage',
          JSON.stringify(newObject),
        );
      else addDataToCollection(newObject, 'blitzWalletUsers');

      return newObject;
    });
  }

  useEffect(() => {
    (async () => {
      const keys = AsyncStorage.getAllKeys();
      let tempObject = {};
      const blitzStoredData =
        (await getDataFromCollection('blitzWalletUsers')) || {};
      const blitzWalletLocalStorage =
        JSON.parse(await getLocalStorageItem('blitzWalletLocalStorage')) || {};

      const storedTheme =
        blitzWalletLocalStorage.colorScheme ||
        blitzStoredData.colorScheme ||
        'dark';
      const storedUserTxPereferance =
        blitzWalletLocalStorage.homepageTxPreferace ||
        blitzStoredData.homepageTxPreferace ||
        15;
      const userBalanceDenomination =
        blitzWalletLocalStorage.userBalanceDenominatoin ||
        blitzStoredData.userBalanceDenominatoin ||
        'sats';
      const selectedLanguage =
        blitzWalletLocalStorage.userSelectedLanguage ||
        blitzStoredData.userSelectedLanguage ||
        'en';
      const savedNostrContacts =
        blitzWalletLocalStorage.nostrContacts ||
        blitzStoredData.nostrContacts ||
        [];

      const currencyList =
        blitzWalletLocalStorage.currenciesList ||
        blitzStoredData.currenciesList ||
        [];

      const currency =
        blitzWalletLocalStorage.currency || blitzStoredData.currency || 'USD';

      const userFaceIDPereferance =
        blitzWalletLocalStorage.userFaceIDPereferance ||
        blitzStoredData.userFaceIDPereferance ||
        false;

      const failedLiquidSwaps =
        blitzWalletLocalStorage.failedLiquidSwaps ||
        blitzStoredData.failedLiquidSwaps ||
        [];

      const failedTransactions =
        blitzWalletLocalStorage.failedTransactions ||
        blitzStoredData.failedTransactions ||
        [];

      const chatGPT = blitzWalletLocalStorage.chatGPT ||
        blitzStoredData.chatGPT || {conversation: [], credits: 0};

      const isUsingLocalStorage = await usesLocalStorage();

      if (storedTheme === 'dark') {
        setTheme(false);
        tempObject['colorScheme'] = 'dark';
        setStatusBarStyle('dark');
      } else {
        setTheme(true);
        tempObject['colorScheme'] = 'light';
        setStatusBarStyle('light');
      }

      // if (storedUserTxPereferance) {
      //   // setUserTxPereferance(storedUserTxPereferance);
      tempObject['homepageTxPreferance'] = storedUserTxPereferance;
      // } else {
      //   tempObject['homepageTxPreferance'] = 15;

      //   // setUserTxPereferance(15);
      // }

      // if (userBalanceDenomination) {
      // setUserBalanceDenomination(userBalanceDenomination);
      tempObject['userBalanceDenomination'] = userBalanceDenomination;
      // } else {
      //   tempObject['userBalanceDenomination'] = 'sats';
      //   // setUserBalanceDenomination('sats');
      // }

      // if (selectedLanguage) {
      // toggleSelectedLanguage(selectedLanguage);
      tempObject['userSelectedLanguage'] = selectedLanguage;
      // } else {
      //   tempObject['userSelectedLanguage'] = 'en';
      //   // toggleSelectedLanguage('en');
      // }

      // if (savedNostrContacts) {
      // setNostrContacts(savedNostrContacts);
      tempObject['nostrContacts'] = savedNostrContacts;
      // } else {
      //   tempObject['contacts'] = [];
      //   // setNostrContacts([]);
      // }

      // setUsesBlitzStorage(!isUsingLocalStorage.data);
      tempObject['usesLocalStorage'] = isUsingLocalStorage.data;

      tempObject['currenciesList'] = currencyList;
      tempObject['currency'] = currency;
      tempObject['userFaceIDPereferance'] = userFaceIDPereferance;
      tempObject['failedLiquidSwaps'] = failedLiquidSwaps;
      tempObject['failedTransactions'] = failedTransactions;

      tempObject['chatGPT'] = chatGPT;

      if (keys.length > 1) {
        handleDataStorageSwitch(true, toggleMasterInfoObject);
      }

      // if no account exists add account to database otherwise just save information in global state
      Object.keys(blitzStoredData).length === 0 &&
      Object.keys(blitzWalletLocalStorage).length === 0
        ? toggleMasterInfoObject(tempObject)
        : setMasterInfoObject(tempObject);
    })();
  }, []);

  if (theme === null || masterInfoObject.homepageTxPreferance === null) return;

  return (
    <GlobalContextManger.Provider
      value={{
        theme,
        toggleTheme,
        // userTxPreferance,
        // toggleUserTxPreferance,
        nodeInformation,
        toggleNodeInformation,
        breezContextEvent,
        toggleBreezContextEvent,
        // userBalanceDenomination,
        // toggleUserBalanceDenomination,
        // selectedLanguage,
        // toggleSelectedLanguage,
        nostrSocket,
        toggleNostrSocket,
        nostrEvents,
        toggleNostrEvents,
        // nostrContacts,
        toggleNostrContacts,
        // usesBlitzStorage,
        // toggleUsesBlitzStorage,
        toggleMasterInfoObject,
        masterInfoObject,
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
