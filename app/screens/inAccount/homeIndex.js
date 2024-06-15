import {StyleSheet, View} from 'react-native';
import {COLORS} from '../../constants';
import {useState} from 'react';

import {useGlobalContextProvider} from '../../../context-store/context';

import PagerView from 'react-native-pager-view';
import SlideBaracodeScanner from '../../components/admin/homeComponents/homeLightning/slideBarcodeScanner';
import {MyTabs} from '../../../navigation/tabs';
import AdminHome from './home';
import {ContactsDrawer} from '../../../navigation/drawers';
import AppStore from './appStore';

export default function AdminHomeIndex() {
  const {theme} = useGlobalContextProvider();
  const [pagePosition, setPagePosition] = useState(1);

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
      {/* <PagerView
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
        style={styles.container}
        initialPage={1}> */}
      {/* <SlideBaracodeScanner pageViewPage={pagePosition} key="0" /> */}
      <View
        key="1"
        style={[
          {
            width: '100%',
            height: '100%',
          },
        ]}>
        <MyTabs
          adminHome={AdminHome}
          contactsDrawer={ContactsDrawer}
          appStore={AppStore}
        />
      </View>
      {/* </PagerView> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
