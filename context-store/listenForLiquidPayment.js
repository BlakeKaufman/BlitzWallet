import React, {createContext, useEffect, useRef, useState} from 'react';

import getLiquidAddressInfo from '../app/functions/liquidWallet/lookForLiquidPayment';

// Create a context for the WebView ref
const ListenForLiquidPaymentContext = createContext(null);

export const ListenForLiquidPaymentProvider = ({children}) => {
  const liquidAddressIntervalRef = useRef(null);
  const [liquidNavigate, setLiquidNavigate] = useState(null);
  const liquidAddressTimeout = useRef(null);

  const [prevTargetedLiquidAddress, setPrevTargetedLiquidAddress] =
    useState('');
  const [targetedLiquidAddress, setTargetedLiquidAddress] = useState('');

  useEffect(() => {
    if (!targetedLiquidAddress) return;
    if (targetedLiquidAddress === prevTargetedLiquidAddress) return;
    clearInterval(liquidAddressIntervalRef.current);
    setPrevTargetedLiquidAddress(targetedLiquidAddress);

    liquidAddressTimeout.current = setTimeout(() => {
      clearInterval(liquidAddressIntervalRef.current);
      setTargetedLiquidAddress('');
    }, 1000 * 60 * 2);

    liquidAddressIntervalRef.current = setInterval(async () => {
      let liquidAddressInfo = await getLiquidAddressInfo({
        address: targetedLiquidAddress,
      });

      if (liquidAddressInfo.chain_stats.tx_count != 0) {
        clearInterval(liquidAddressIntervalRef.current);
        setTargetedLiquidAddress('');
        clearTimeout(liquidAddressTimeout.current);
        liquidNavigate.navigate('HomeAdmin');
        liquidNavigate.navigate('ConfirmTxPage', {
          for: 'paymentSuceed',
          information: {},
        });
      }
    }, 5000);
  }, [targetedLiquidAddress]);

  return (
    <ListenForLiquidPaymentContext.Provider
      value={{
        targetedLiquidAddress,
        setTargetedLiquidAddress,
        setLiquidNavigate,
        liquidAddressIntervalRef,
        liquidAddressTimeout,
      }}>
      {children}
    </ListenForLiquidPaymentContext.Provider>
  );
};

export const useListenForLiquidPayment = () => {
  return React.useContext(ListenForLiquidPaymentContext);
};
