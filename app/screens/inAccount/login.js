import {useContext, useEffect, useRef, useState} from 'react';
import {AppState, SafeAreaView, StyleSheet, View} from 'react-native';

import {CENTER, COLORS, FONT, SIZES} from '../../constants';
import PinPage from '../../components/admin/loginComponents/pinPage';
import HomeLogin from '../../components/admin/loginComponents/home';
import {useGlobalContextProvider} from '../../../context-store/context';
import {GlobalThemeView} from '../../functions/CustomElements';
import {WINDOWWIDTH} from '../../constants/theme';
import {getLocalStorageItem, setLocalStorageItem} from '../../functions';
import {useWebView} from '../../../context-store/webViewContext';
import {isMoreThanADayOld} from '../../functions/rotateAddressDateChecker';
import FullLoadingScreen from '../../functions/CustomElements/loadingScreen';

export default function AdminLogin({navigation, route}) {
  const [didUsePin, setDidUsePin] = useState(false);
  const fromBackground = route.params?.fromBackground;
  const {theme} = useGlobalContextProvider();
  const [aState, setAppState] = useState(AppState.currentState);
  const [isClaimingSwaps, setIsClaimingSwaps] = useState(false);
  const {webViewRef, savedSwapsRef} = useWebView();
  const isInitialLoad = useRef(true);

  useEffect(() => {
    async function claimBackgroundSwaps() {
      if (
        aState != 'active' ||
        !isInitialLoad.current ||
        !savedSwapsRef.current
      )
        return;
      isInitialLoad.current = false;
      const existingSwaps =
        JSON.parse(await getLocalStorageItem('lnurlSwaps')) || [];
      if (!existingSwaps.length) return;
      try {
        // console.log(existingSwaps);
        setIsClaimingSwaps(true);
        const newSwaps = existingSwaps.map(claim => {
          const webViewArgs = JSON.stringify(claim);
          savedSwapsRef.current.injectJavaScript(
            `window.claimReverseSubmarineSwap(${webViewArgs}); void(0);`,
          );
          const currentCount = claim.claimCount || 0;
          return {...claim, claimCount: currentCount + 1};
        });

        setLocalStorageItem(
          'lnurlSwaps',
          JSON.stringify(
            newSwaps.filter(
              item => !isMoreThanADayOld(item.createdOn) && item.claimCount < 2,
            ),
          ),
        );
      } catch (error) {
        console.error('An error occurred:', error);
      } finally {
        setTimeout(() => {
          setIsClaimingSwaps(false);
        }, 2000);
      }
    }

    const appStateListener = AppState.addEventListener(
      'change',
      nextAppState => {
        console.log('Next AppState is: ', nextAppState);
        setAppState(nextAppState);
      },
    );
    claimBackgroundSwaps();
    return () => {
      appStateListener?.remove();
    };
  }, [aState, webViewRef]);

  return (
    <GlobalThemeView>
      <View style={[styles.globalContainer]}>
        {/* {didUsePin && ( */}
        {isClaimingSwaps ? (
          <FullLoadingScreen
            textStyles={{textAlign: 'center'}}
            text={'Claiming payments received in the background'}
          />
        ) : (
          <PinPage
            navigation={navigation}
            theme={theme}
            fromBackground={fromBackground}
          />
        )}
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
