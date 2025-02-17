import {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import {getBoltzSwapPairInformation} from '../app/functions/boltz/boltzSwapInfo';
import * as Network from 'expo-network';
// Initiate context
const AppStatusManager = createContext(null);

const AppStatusProvider = ({children}) => {
  const [minMaxLiquidSwapAmounts, setMinMaxLiquidSwapAmounts] = useState({
    min: 1000,
    max: 25000000,
  });

  const [isConnectedToTheInternet, setIsConnectedToTheInternet] =
    useState(null);

  const [didGetToHomepage, setDidGetToHomePage] = useState(false);

  const toggleDidGetToHomepage = useCallback(newInfo => {
    setDidGetToHomePage(newInfo);
  }, []);
  const toggleMinMaxLiquidSwapAmounts = useCallback(newInfo => {
    setMinMaxLiquidSwapAmounts(prev => ({...prev, ...newInfo}));
  }, []);

  useEffect(() => {
    (async () => {
      const [reverseSwapStats, submarineSwapStats] = await Promise.all([
        getBoltzSwapPairInformation('ln-liquid'),
        getBoltzSwapPairInformation('liquid-ln'),
      ]);

      if (reverseSwapStats) {
        toggleMinMaxLiquidSwapAmounts({reverseSwapStats, submarineSwapStats});
      }
    })();
  }, []);
  useEffect(() => {
    const checkNetworkState = async () => {
      const networkState = await Network.getNetworkStateAsync();
      if (isConnectedToTheInternet !== networkState.isConnected) {
        setIsConnectedToTheInternet(networkState.isConnected);
      }
    };

    checkNetworkState();
    const interval = setInterval(checkNetworkState, 10000);

    return () => clearInterval(interval);
  }, [isConnectedToTheInternet]);

  const contextValue = useMemo(
    () => ({
      minMaxLiquidSwapAmounts,
      toggleMinMaxLiquidSwapAmounts,
      isConnectedToTheInternet,
      didGetToHomepage,
      toggleDidGetToHomepage,
    }),
    [
      minMaxLiquidSwapAmounts,
      toggleMinMaxLiquidSwapAmounts,
      isConnectedToTheInternet,
      didGetToHomepage,
      toggleDidGetToHomepage,
    ],
  );

  return (
    <AppStatusManager.Provider value={contextValue}>
      {children}
    </AppStatusManager.Provider>
  );
};

function useAppStatus() {
  const context = useContext(AppStatusManager);
  if (!context) {
    throw new Error('useAppStatus must be used within a AppStatusProvider');
  }
  return context;
}

export {AppStatusManager, AppStatusProvider, useAppStatus};
