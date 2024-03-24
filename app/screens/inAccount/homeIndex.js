import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {COLORS} from '../../constants';
import {useRef, useState} from 'react';
import {registerWebhook} from '@breeztech/react-native-breez-sdk';
import NavBar from '../../components/admin/homeComponents/navBar';
import HomeLightning from '../../components/admin/homeComponents/homeLightning';
import {useGlobalContextProvider} from '../../../context-store/context';
import {ConfigurePushNotifications} from '../../hooks/setNotifications';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import SlideBaracodeScanner from '../../components/admin/homeComponents/homeLightning/slideBarcodeScanner';
import {MyTabs} from '../../../App';

export default function AdminHomeIndex() {
  //   const expoPushToken = ConfigurePushNotifications();
  const {theme} = useGlobalContextProvider();
  //   const didLogWebhook = useRef(false);
  //   const insets = useSafeAreaInsets();
  const [pagePosition, setPagePosition] = useState(1);

  //   expoPushToken &&
  //     !didLogWebhook.current &&
  //     (async () => {
  //       try {
  //         console.log(
  //           `https://blitz-wallet.com/.netlify/functions/notify?platform=${Platform.OS}&token=${expoPushToken.data} `,
  //         );
  //         await registerWebhook(
  //           `https://blitz-wallet.com/.netlify/functions/notify?platform=${Platform.OS}&token=${expoPushToken.data}`,
  //         );
  //         didLogWebhook.current = true;
  //       } catch (err) {
  //         console.log(err);
  //       }
  //     })();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
        },
      ]}>
      <PagerView
        onPageScroll={event => {
          const {offset, position} = event.nativeEvent;
          if (offset >= 0.5) {
            const pageIndex = position + 1; // Next page index
            setPagePosition(pageIndex);
          } else {
            const pageIndex = position; // Current page index
            setPagePosition(pageIndex);
          }
        }}
        onPageSelected={e => {
          console.log(e.nativeEvent.position);
          setPagePosition(e.nativeEvent.position);
        }}
        // onPageScrollStateChanged={e => {
        //   if (e.nativeEvent.pageScrollState != 'dragging') return;
        //   if (pagePosition === 1) setPagePosition(0);
        //   else setPagePosition(1);
        //   console.log(e.nativeEvent.pageScrollState);
        // }}
        style={styles.container}
        initialPage={1}>
        <SlideBaracodeScanner pageViewPage={pagePosition} key="0" />
        <View
          key="1"
          style={[
            // styles.container,
            {
              width: '100%',
              height: '100%',
              // backgroundColor: theme
              //   ? COLORS.darkModeBackground
              //   : COLORS.lightModeBackground,
            },
          ]}>
          <MyTabs />
        </View>
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
