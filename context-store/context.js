import {createContext, useState, useContext, useEffect} from 'react';
import {getLocalStorageItem, setLocalStorageItem} from '../app/functions';
import {useColorScheme} from 'react-native';
import {setStatusBarStyle} from 'expo-status-bar';
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
    setUserBalanceDenomination(language);
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

      if (selectedLanguage) setSelectedLanguage(selectedLanguage);
      else setSelectedLanguage('en');
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
