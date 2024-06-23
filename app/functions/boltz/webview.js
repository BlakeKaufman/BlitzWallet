import WebView from 'react-native-webview';
import handleWebviewClaimMessage from './handle-webview-claim-message';
import {Platform} from 'react-native';

export default function WebviewForBoltzSwaps({navigate, webViewRef, page}) {
  return (
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
      onMessage={event => handleWebviewClaimMessage(navigate, event, page)}
    />
  );
}
