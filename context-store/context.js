import {createContext, useState, useContext, useEffect} from 'react';
import {getLocalStorageItem, setLocalStorageItem} from '../app/functions';
import {useTranslation} from 'react-i18next';
import {usesLocalStorage} from '../app/functions/localStorage';
import {addDataToCollection} from '../db';
import {getBoltzSwapPairInformation} from '../app/functions/boltz/boltzSwapInfo';

import {QUICK_PAY_STORAGE_KEY} from '../app/constants';
import * as Network from 'expo-network';

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
  // const [breezContextEvent, setBreezContextEvent] = useState({}); // new lighting evene
  const [contactsPrivateKey, setContactsPrivateKey] = useState(''); //for incription
  const [deepLinkContent, setDeepLinkContent] = useState({
    type: '',
    data: '',
  }); //get any deeplinks (contacts / ln payment)

  const [minMaxLiquidSwapAmounts, setMinMaxLiquidSwapAmounts] = useState({
    min: 1000,
    max: 25000000,
  }); //boltz swap amounts
  // const [JWT, setJWT] = useState(''); //json web token for api calls
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
  // function toggleBreezContextEvent(breezEvent) {
  //   setBreezContextEvent(breezEvent);
  // }

  async function toggleMasterInfoObject(
    newData,
    globalDataStorageSwitch,
    fromInitialization,
  ) {
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

      let storedObject = deepCopy(newObject);

      delete storedObject['homepageTxPreferance'];
      delete storedObject['userFaceIDPereferance'];
      delete storedObject['boltzClaimTxs'];
      delete storedObject['savedLiquidSwaps'];
      delete storedObject['enabledSlidingCamera'];
      delete storedObject['fiatCurrenciesList'];
      delete storedObject['failedTransactions'];
      delete storedObject['satDisplay'];
      delete storedObject['cachedContactsList'];
      delete storedObject['enabledEcash'];
      delete storedObject['hideUnknownContacts'];
      delete storedObject['useTrampoline'];
      delete storedObject[QUICK_PAY_STORAGE_KEY];

      if (fromInitialization) {
        addDataToCollection(storedObject, 'blitzWalletUsers');
        return newObject;
      }

      if (
        Object.keys(newData).includes('homepageTxPreferance') ||
        Object.keys(newData).includes('userFaceIDPereferance') ||
        Object.keys(newData).includes('boltzClaimTxs') ||
        Object.keys(newData).includes('savedLiquidSwaps') ||
        Object.keys(newData).includes('enabledSlidingCamera') ||
        Object.keys(newData).includes('fiatCurrenciesList') ||
        Object.keys(newData).includes('failedTransactions') ||
        Object.keys(newData).includes('satDisplay') ||
        Object.keys(newData).includes('enabledEcash') ||
        Object.keys(newData).includes('hideUnknownContacts') ||
        Object.keys(newData).includes('useTrampoline') ||
        Object.keys(newData).includes(QUICK_PAY_STORAGE_KEY) ||
        (Object.keys(newData).includes('cachedContactsList') &&
          !globalDataStorageSwitch)
      ) {
        console.log(
          Object.keys(newData)[0],
          JSON.stringify(newData[Object.keys(newData)[0]]),
          'LOCAL STORAGE DATA',
        );
        setLocalStorageItem(
          Object.keys(newData)[0],
          JSON.stringify(newData[Object.keys(newData)[0]]),
        );
      } else if (isUsingLocalStorage)
        setLocalStorageItem(
          'blitzWalletLocalStorage',
          JSON.stringify(storedObject),
        );
      else addDataToCollection(storedObject, 'blitzWalletUsers');

      return newObject;
    });
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

  console.log('IS CONNECTD TO THE INTERNET', isConnectedToTheInternet);

  return (
    <GlobalContextManger.Provider
      value={{
        theme,
        toggleTheme,
        nodeInformation,
        toggleNodeInformation,
        // breezContextEvent,
        // toggleBreezContextEvent,
        toggleMasterInfoObject,
        setMasterInfoObject,
        masterInfoObject,
        contactsPrivateKey,
        setContactsPrivateKey,
        // JWT,
        // setJWT,
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
