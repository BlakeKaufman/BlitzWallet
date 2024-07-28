import {addEventListener} from '@react-native-community/netinfo';
import {useEffect} from 'react';

export default function listenForNetworkChange({toggleNodeInformation}) {
  useEffect(() => {
    const unsubscribe = addEventListener(state => {
      toggleNodeInformation({didConnectToNode: state.isConnected});
    });

    // Unsubscribe
    unsubscribe();
  }, []);
}
