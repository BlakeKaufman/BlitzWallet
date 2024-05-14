import {createContext, useState, useContext, useEffect, useRef} from 'react';
import {
  getLocalStorageItem,
  retrieveData,
  setLocalStorageItem,
} from '../app/functions';

import {setStatusBarStyle} from 'expo-status-bar';
import {useTranslation} from 'react-i18next';
import {usesLocalStorage} from '../app/functions/localStorage';
import {
  addDataToCollection,
  getDataFromCollection,
  getUserAuth,
  handleDataStorageSwitch,
} from '../db';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {generateRandomContact} from '../app/functions/contacts';
import {generatePubPrivKeyForMessaging} from '../app/functions/messaging/generateKeys';
import * as Device from 'expo-device';
import axios from 'axios';

import * as nostr from 'nostr-tools';
import {getContactsImage} from '../app/functions/contacts/contactsFileSystem';

// Initiate context
const GlobalContextManger = createContext();

const GlobalContextProvider = ({children}) => {
  // Manage theme state
  // const [renderNumber, setRenderNumber] = useState(0);
  const isInitalRender = useRef(true);
  const [theme, setTheme] = useState(null);

  const [nodeInformation, setNodeInformation] = useState({
    didConnectToNode: null,
    transactions: [],
    userBalance: 0,
    inboundLiquidityMsat: 0,
    blockHeight: 0,
    onChainBalance: 0,
    fiatStats: {},
  });
  const [liquidNodeInformation, setLiquidNodeInformation] = useState({
    transactions: [],
    userBalance: 0,
  });
  const [breezContextEvent, setBreezContextEvent] = useState({});
  const [contactsPrivateKey, setContactsPrivateKey] = useState('');
  const [contactsImages, setContactsImages] = useState('');

  const [JWT, setJWT] = useState('');

  const [masterInfoObject, setMasterInfoObject] = useState({});
  const {i18n} = useTranslation();

  async function toggleTheme(peram) {
    const mode = peram ? 'light' : 'dark';
    setStatusBarStyle(mode);

    setLocalStorageItem('colorScheme', mode);
    // toggleMasterInfoObject({colorScheme: mode});

    setTheme(peram);
  }

  function toggleNodeInformation(newInfo) {
    setNodeInformation(prev => {
      return {...prev, ...newInfo};
    });
  }

  function toggleLiquidNodeInformation(newInfo) {
    setLiquidNodeInformation(prev => {
      return {...prev, ...newInfo};
    });
  }
  function toggleBreezContextEvent(breezEvent) {
    setBreezContextEvent({...breezEvent});
  }

  function toggleContactsImages(newImageArr) {
    setContactsImages(newImageArr);
  }

  async function toggleMasterInfoObject(newData, globalDataStorageSwitch) {
    if (newData.userSelectedLanguage) {
      i18n.changeLanguage(newData.userSelectedLanguage);
    }

    const isUsingLocalStorage =
      globalDataStorageSwitch !== undefined
        ? globalDataStorageSwitch
        : (await usesLocalStorage()).data;

    console.log(newData, 'NEW DOCUMENT DATTA');

    setMasterInfoObject(prev => {
      const newObject = {...prev, ...newData};

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
      const storedTheme = await getLocalStorageItem('colorScheme');
      console.log(storedTheme, 'TES');
      if (storedTheme === 'dark') {
        toggleTheme(false);
        // tempObject['colorScheme'] = 'dark';
        setStatusBarStyle('dark');
      } else {
        toggleTheme(true);
        // tempObject['colorScheme'] = 'light';
        setStatusBarStyle('light');
      }
    })();
  }, []);

  return (
    <GlobalContextManger.Provider
      value={{
        theme,
        toggleTheme,
        nodeInformation,
        toggleNodeInformation,
        breezContextEvent,
        toggleBreezContextEvent,
        toggleMasterInfoObject,
        setMasterInfoObject,
        masterInfoObject,
        contactsPrivateKey,
        setContactsPrivateKey,
        JWT,
        setJWT,
        liquidNodeInformation,
        toggleLiquidNodeInformation,
        contactsImages,
        toggleContactsImages,
        setContactsImages,
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

// Function to check if two objects are equal (shallow equality)
function shallowEqual(obj1, obj2) {
  const keys1 = Object.keys(obj1 || {});
  const keys2 = Object.keys(obj2 || {});

  // Check if the number of keys is the same
  if (keys1.length !== keys2.length) {
    return false;
  }

  // Check if all keys and their values are equal
  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}
function isJSON(item) {
  try {
    return JSON.parse(item);
  } catch (err) {
    return item;
  }
}
// Function to check if two objects are equal (deep equality)
function deepEqual(obj1, obj2) {
  // Check shallow equality first
  if (!shallowEqual(obj1, obj2)) {
    return false;
  }

  // Check deep equality for nested objects and arrays
  for (let key in obj1) {
    if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
      if (!deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }
  }

  return true;
}
