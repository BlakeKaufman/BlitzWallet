import React, {createContext, useEffect, useRef, useState} from 'react';
import WebView from 'react-native-webview';
import {Platform} from 'react-native';
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
  const savedSwapsRef = useRef(null);

  useEffect(() => {
    if (!didGetToHomepage) return;
    async function handleUnclaimedReverseSwaps() {
      let savedClaimInfo =
        JSON.parse(await getLocalStorageItem('savedReverseSwapInfo')) || [];
      if (savedClaimInfo.lenght === 0) return;

      try {
        savedClaimInfo.forEach(claim => {
          const webViewArgs = JSON.stringify(claim);
          savedSwapsRef.current.injectJavaScript(
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

  return (
    <WebViewContext.Provider value={{webViewRef, webViewArgs, setWebViewArgs}}>
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
      <WebView
        domStorageEnabled
        javaScriptEnabled
        ref={savedSwapsRef}
        containerStyle={{position: 'absolute', top: 1000, left: 1000}}
        source={
          Platform.OS === 'ios'
            ? require('boltz-swap-web-context')
            : {uri: 'file:///android_asset/boltzSwap.html'}
        }
        originWhitelist={['*']}
        onMessage={event =>
          handleWebviewClaimMessage(null, event, 'savedClaimInformation', null)
        }
      />
    </WebViewContext.Provider>
  );
};

export const useWebView = () => {
  return React.useContext(WebViewContext);
};
