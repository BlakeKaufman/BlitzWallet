import {createContext, useState, useContext, useEffect, useMemo} from 'react';
import {getLocalStorageItem, setLocalStorageItem} from '../app/functions';
import {useTranslation} from 'react-i18next';

import {getBoltzSwapPairInformation} from '../app/functions/boltz/boltzSwapInfo';

import * as Network from 'expo-network';
import {getPublicKey} from 'nostr-tools';
import {sendDataToDB} from '../db/interactionManager';
import useJWTSessionToken from '../app/hooks/jwtSessionToken';

// Initiate context
const GlobalContextManger = createContext();

const GlobalContextProvider = ({children}) => {
  const [theme, setTheme] = useState(null); //internal theme
  const [darkModeType, setDarkModeType] = useState(null); // dark mode type

  const [nodeInformation, setNodeInformation] = useState({
    didConnectToNode: null,
    transactions: [],
    userBalance: 0,
    inboundLiquidityMsat: 0,
    blockHeight: 0,
    onChainBalance: 0,
    fiatStats: {},
    lsp: [],
  }); // lightning node information
  const [liquidNodeInformation, setLiquidNodeInformation] = useState({
    transactions: [],
    userBalance: 0,
  }); // liquid node informiaotn

  const [contactsPrivateKey, setContactsPrivateKey] = useState(''); //for incription
  const publicKey = useMemo(
    () => contactsPrivateKey && getPublicKey(contactsPrivateKey),
    [contactsPrivateKey],
  );
  console.log('public key', publicKey);
  const [deepLinkContent, setDeepLinkContent] = useState({
    type: '',
    data: '',
  }); //get any deeplinks (contacts / ln payment)

  const [minMaxLiquidSwapAmounts, setMinMaxLiquidSwapAmounts] = useState({
    min: 1000,
    max: 25000000,
  }); //boltz swap amounts

  const [isConnectedToTheInternet, setIsConnectedToTheInternet] =
    useState(null);

  const [masterInfoObject, setMasterInfoObject] = useState({}); //all databse information
  const [didGetToHomepage, setDidGetToHomePage] = useState(false);
  const {i18n} = useTranslation(); //language

  const toggleDarkModeType = peram => {
    const mode = peram ? 'dim' : 'lights-out';

    setLocalStorageItem('darkModeType', mode);

    setDarkModeType(peram);
  };

  async function toggleTheme(peram) {
    const mode = peram ? 'light' : 'dark';

    setLocalStorageItem('colorScheme', mode);

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

  async function toggleMasterInfoObject(newData) {
    if (newData.userSelectedLanguage) {
      i18n.changeLanguage(newData.userSelectedLanguage);
    }

    setMasterInfoObject(prev => {
      const newObject = {...prev, ...newData};
      return newObject;
    });
    await sendDataToDB(newData, publicKey);
  }

  useEffect(() => {
    (async () => {
      const storedTheme = await getLocalStorageItem('colorScheme');
      const savedDarkMode = await getLocalStorageItem('darkModeType');
      const darkModeType =
        savedDarkMode === null ? true : savedDarkMode == 'dim';

      console.log(darkModeType, 'DARK MODE TYPE');

      if (storedTheme === 'dark' || storedTheme === null) {
        toggleTheme(false);
      } else {
        toggleTheme(true);
      }

      toggleDarkModeType(darkModeType);

      const reverseSwapStats = await getBoltzSwapPairInformation('ln-liquid');
      const submarineSwapStats = await getBoltzSwapPairInformation('liquid-ln');
      if (reverseSwapStats) {
        setMinMaxLiquidSwapAmounts({
          reverseSwapStats,
          submarineSwapStats,
        });
      }
    })();
  }, []);
  useEffect(() => {
    let interval;

    const checkNetworkState = async () => {
      const networkState = await Network.getNetworkStateAsync();
      console.log('RUNNING IN POLLING');
      if (isConnectedToTheInternet === networkState.isConnected) return;
      setIsConnectedToTheInternet(networkState.isConnected);
    };

    checkNetworkState();

    interval = setInterval(() => {
      checkNetworkState();
    }, 10000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);
  useJWTSessionToken(publicKey, contactsPrivateKey, didGetToHomepage);

  return (
    <GlobalContextManger.Provider
      value={{
        theme,
        toggleTheme,
        nodeInformation,
        toggleNodeInformation,
        toggleMasterInfoObject,
        setMasterInfoObject,
        masterInfoObject,
        contactsPrivateKey,
        publicKey,
        setContactsPrivateKey,
        liquidNodeInformation,
        toggleLiquidNodeInformation,
        deepLinkContent,
        setDeepLinkContent,
        setMinMaxLiquidSwapAmounts,
        minMaxLiquidSwapAmounts,
        didGetToHomepage,
        setDidGetToHomePage,
        darkModeType,
        toggleDarkModeType,
        isConnectedToTheInternet,
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

export function deepCopy(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Create an array or object to hold the values
  const copy = Array.isArray(obj) ? [] : {};

  for (let key in obj) {
    // Recursively (deep) copy for nested objects, including arrays
    copy[key] = deepCopy(obj[key]);
  }

  return copy;
}
export {GlobalContextManger, GlobalContextProvider, useGlobalContextProvider};
