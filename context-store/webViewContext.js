import React, {createContext, useEffect, useRef, useState} from 'react';
import WebView from 'react-native-webview';
import {AppState, Platform} from 'react-native';
import handleWebviewClaimMessage from '../app/functions/boltz/handle-webview-claim-message';
import {getLocalStorageItem, setLocalStorageItem} from '../app/functions';
import {useGlobalContextProvider} from './context';
import {isMoreThanADayOld} from '../app/functions/rotateAddressDateChecker';

// Create a context for the WebView ref
const WebViewContext = createContext(null);

export const WebViewProvider = ({children}) => {
  const {didGetToHomepage} = useGlobalContextProvider();
  const webViewRef = useRef(null);
  const [webViewArgs, setWebViewArgs] = useState({
    navigate: null,
    page: null,
    function: null,
  });

  useEffect(() => {
    if (!didGetToHomepage) {
      return;
    }
    async function handleUnclaimedReverseSwaps() {
      let savedClaimInfo =
        JSON.parse(await getLocalStorageItem('savedReverseSwapInfo')) || [];
      console.log(savedClaimInfo, 'SAVD CLAIM INFORMATION');
      if (savedClaimInfo.length === 0) return;

      try {
        savedClaimInfo.forEach(claim => {
          const webViewArgs = JSON.stringify(claim);
          webViewRef.current.injectJavaScript(
            `window.claimReverseSubmarineSwap(${webViewArgs}); void(0);`,
          );
        });

        setLocalStorageItem(
          'savedReverseSwapInfo',
          JSON.stringify(
            savedClaimInfo.filter(item => !isMoreThanADayOld(item.createdOn)),
          ),
        );
      } catch (error) {
        console.error('An error occurred:', error);
      }
    }
    handleUnclaimedReverseSwaps();
  }, [didGetToHomepage]);

  // useEffect(() => {
  //   async function handleBackgroundSwaps() {
  //     console.log('RUNNING BACKGROUND CLAIM FUNCTINO');
  //     const existingSwaps =
  //       JSON.parse(await getLocalStorageItem('lnurlSwaps')) || [];
  //     console.log(existingSwaps, 'EXISTING SWAPS');
  //     if (!existingSwaps.length) return;
  //     try {
  //       const newSwaps = existingSwaps.map(claim => {
  //         const webViewArgs = JSON.stringify(claim);
  //         savedSwapsRef.current.injectJavaScript(
  //           `window.claimReverseSubmarineSwap(${webViewArgs}); void(0);`,
  //         );
  //         const currentCount = claim.claimCount || 0;
  //         return {...claim, claimCount: currentCount + 1};
  //       });

  //       setLocalStorageItem(
  //         'lnurlSwaps',
  //         JSON.stringify(
  //           newSwaps.filter(
  //             item => !isMoreThanADayOld(item.createdOn) && item.claimCount < 5,
  //           ),
  //         ),
  //       );
  //     } catch (error) {
  //       console.error('An error occurred:', error);
  //     }
  //   }
  //   const claimBackgroundSwapsInterval = setInterval(
  //     handleBackgroundSwaps,
  //     1000 * 30,
  //   );

  //   if (AppState.currentState !== 'active' || !savedSwapsRef.current) return;

  //   handleBackgroundSwaps();

  //   return () => {
  //     clearInterval(claimBackgroundSwapsInterval);
  //   };
  // }, [savedSwapsRef]);

  // useEffect(() => {
  //   async function loadSavedSwapIds() {
  //     const savedBoltzPayments =
  //       JSON.parse(await getLocalStorageItem('boltzPaymentIds')) ?? [];
  //     const savedAutoChannelRebalnceIds =
  //       JSON.parse(
  //         await getLocalStorageItem(AUTO_CHANNEL_REBALANCE_STORAGE_KEY),
  //       ) ?? [];

  //     setAutoChannelRebalanceIds(savedAutoChannelRebalnceIds);
  //     setBoltzPaymentIds(savedBoltzPayments);
  //   }
  //   loadSavedSwapIds();
  // }, []);

  // async function toggleSavedIds(newId, idType) {
  //   if (idType === 'autoChannelRebalance') {
  //     setAutoChannelRebalanceIds(prev => {
  //       return [...prev, newId];
  //     });
  //   } else {
  //     setBoltzPaymentIds(prev => {
  //       return [...prev, newId];
  //     });
  //   }

  //   let boltzPayments =
  //     JSON.parse(
  //       await getLocalStorageItem(
  //         idType === 'boltzPayment'
  //           ? 'boltzPaymentIds'
  //           : AUTO_CHANNEL_REBALANCE_STORAGE_KEY,
  //       ),
  //     ) ?? [];

  //   if (!boltzPayments.includes(newId)) boltzPayments.push(newId);

  //   setLocalStorageItem(
  //     idType === 'boltzPayment'
  //       ? 'boltzPaymentIds'
  //       : AUTO_CHANNEL_REBALANCE_STORAGE_KEY,
  //     JSON.stringify(boltzPayments),
  //   );
  // }

  return (
    <WebViewContext.Provider
      value={{
        webViewRef,
        webViewArgs,
        setWebViewArgs,
      }}>
      {children}
      <WebView
        domStorageEnabled
        javaScriptEnabled
        ref={webViewRef}
        containerStyle={{position: 'absolute', top: 1000, left: 1000}}
        source={
          Platform.OS === 'ios'
            ? require('boltz-swap-web-context')
            : {uri: 'file:///android_asset/boltzSwap.html'}
        }
        originWhitelist={['*']}
        onMessage={event =>
          handleWebviewClaimMessage(
            webViewArgs.navigate,
            event,
            webViewArgs.page,
            webViewArgs.function,
          )
        }
      />
    </WebViewContext.Provider>
  );
};

export const useWebView = () => {
  return React.useContext(WebViewContext);
};
