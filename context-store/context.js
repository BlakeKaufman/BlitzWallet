import {createContext, useState, useContext, useEffect} from 'react';
import {getLocalStorageItem, setLocalStorageItem} from '../app/functions';
import * as Network from '@react-native-community/netinfo';
import {setStatusBarStyle} from 'expo-status-bar';
import {useTranslation} from 'react-i18next';
import {
  removeLocalStorageItem,
  usesLocalStorage,
} from '../app/functions/localStorage';
import {addDataToCollection} from '../db';
import {getBoltzSwapPairInformation} from '../app/functions/boltz/boltzSwapInfo';

// Initiate context
const GlobalContextManger = createContext();

const GlobalContextProvider = ({children}) => {
  // Manage theme state
  const [theme, setTheme] = useState(null);

  const [nodeInformation, setNodeInformation] = useState({
    didConnectToNode: null,
    transactions: [],
    userBalance: 0,
    inboundLiquidityMsat: 0,
    blockHeight: 0,
    onChainBalance: 0,
    fiatStats: {},
    lsp: [],
  });
  const [liquidNodeInformation, setLiquidNodeInformation] = useState({
    transactions: [],
    userBalance: 0,
  });
  const [breezContextEvent, setBreezContextEvent] = useState({});
  const [contactsPrivateKey, setContactsPrivateKey] = useState('');
  const [contactsImages, setContactsImages] = useState('');
  const [deepLinkContent, setDeepLinkContent] = useState({
    type: '',
    data: '',
  });

  const [minMaxLiquidSwapAmounts, setMinMaxLiquidSwapAmounts] = useState({
    min: 1000,
    max: 25000000,
  });
  const [JWT, setJWT] = useState('');

  const [masterInfoObject, setMasterInfoObject] = useState({});
  const {i18n} = useTranslation();

  async function toggleTheme(peram) {
    const mode = peram ? 'light' : 'dark';
    setStatusBarStyle(mode);

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

      if (
        Object.keys(newData).includes('homepageTxPreferance') ||
        Object.keys(newData).includes('userBalanceDenomination') ||
        Object.keys(newData).includes('userFaceIDPereferance') ||
        Object.keys(newData).includes('boltzClaimTxs') ||
        Object.keys(newData).includes('savedLiquidSwaps') ||
        Object.keys(newData).includes('enabledSlidingCamera') ||
        Object.keys(newData).includes('fiatCurrenciesList') ||
        Object.keys(newData).includes('fiatCurrency') ||
        Object.keys(newData).includes('failedTransactions') ||
        Object.keys(newData).includes('satDisplay') ||
        (Object.keys(newData).includes('cachedContactsList') &&
          !globalDataStorageSwitch)
      ) {
        setLocalStorageItem(
          Object.keys(newData)[0],
          JSON.stringify(newData[Object.keys(newData)[0]]),
        );
      } else if (isUsingLocalStorage)
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
      Network.addEventListener(state => {
        {
          toggleNodeInformation({didConnectToNode: state.isConnected});
          console.log(state);
        }
      });
      const storedTheme = await getLocalStorageItem('colorScheme');

      if (storedTheme === 'dark' || storedTheme === null) {
        toggleTheme(false);
        // tempObject['colorScheme'] = 'dark';
        // setStatusBarStyle('dark');
      } else {
        toggleTheme(true);
        // tempObject['colorScheme'] = 'light';
        // setStatusBarStyle('light');
      }

      const reverseSwapStats = await getBoltzSwapPairInformation('ln-liquid');
      const submarineSwapStats = await getBoltzSwapPairInformation('liquid-ln');
      if (reverseSwapStats) {
        setMinMaxLiquidSwapAmounts({
          min: reverseSwapStats.limits.minimal,
          max: reverseSwapStats.limits.maximal,
          reverseSwapStats,
          submarineSwapStats,
        });
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
        deepLinkContent,
        setDeepLinkContent,
        minMaxLiquidSwapAmounts,
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
