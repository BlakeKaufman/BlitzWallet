import {useContext, useEffect, useRef, useState} from 'react';
import {AppState, SafeAreaView, StyleSheet, View} from 'react-native';

import {CENTER, COLORS, FONT, SIZES} from '../../constants';
import PinPage from '../../components/admin/loginComponents/pinPage';
import HomeLogin from '../../components/admin/loginComponents/home';
import {useGlobalContextProvider} from '../../../context-store/context';
import {GlobalThemeView} from '../../functions/CustomElements';
import {WINDOWWIDTH} from '../../constants/theme';
import {
  connectToNode,
  getLocalStorageItem,
  setLocalStorageItem,
} from '../../functions';
import {useWebView} from '../../../context-store/webViewContext';
import {isMoreThanADayOld} from '../../functions/rotateAddressDateChecker';
import FullLoadingScreen from '../../functions/CustomElements/loadingScreen';
import useGlobalOnBreezEvent from '../../hooks/globalOnBreezEvent';
import {getWolletState} from '../../functions/liquidWallet';

export default function AdminLogin({navigation, route}) {
  const [didUsePin, setDidUsePin] = useState(false);
  const fromBackground = route.params?.fromBackground;
  const {theme} = useGlobalContextProvider();
  // const onBreezEvent = useGlobalOnBreezEvent();
  // useEffect(() => {
  //   connectToNode(onBreezEvent);
  //   getWolletState(true);
  // }, []);

  return (
    <GlobalThemeView>
      <View style={[styles.globalContainer]}>
        {/* {didUsePin && ( */}

        <PinPage
          navigation={navigation}
          theme={theme}
          fromBackground={fromBackground}
        />

        {/* )} */}
        {/* {!didUsePin && (
          <HomeLogin
            navigation={navigation}
            theme={theme}
            setDidUsePin={setDidUsePin}
            fromBackground={fromBackground}
          />
        )} */}
      </View>
    </GlobalThemeView>
  );
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
    width: WINDOWWIDTH,
    ...CENTER,
  },
});
