import React, {createContext, useRef, useState} from 'react';
import WebView from 'react-native-webview';
import {Platform} from 'react-native';
import handleWebviewClaimMessage from '../app/functions/boltz/handle-webview-claim-message';

// Create a context for the WebView ref
const WebViewContext = createContext(null);

export const WebViewProvider = ({children}) => {
  const webViewRef = useRef(null);
  const [webViewArgs, setWebViewArgs] = useState({
    navigate: null,
    page: null,
    function: null,
  });

  console.log(webViewArgs);

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
    </WebViewContext.Provider>
  );
};

export const useWebView = () => {
  return React.useContext(WebViewContext);
};
