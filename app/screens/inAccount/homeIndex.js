import {StyleSheet, View} from 'react-native';
import {useCallback, useMemo, useState} from 'react';
import {useGlobalContextProvider} from '../../../context-store/context';
import PagerView from 'react-native-pager-view';
import {MyTabs} from '../../../navigation/tabs';
import AdminHome from './home';
import {ContactsDrawer} from '../../../navigation/drawers';
import AppStore from './appStore';
import {GlobalThemeView} from '../../functions/CustomElements';
import SendPaymentHome from './sendBtcPage';

export default function AdminHomeIndex(props) {
  const {masterInfoObject} = useGlobalContextProvider();
  const [pagePosition, setPagePosition] = useState(1);

  const handlePageScroll = useCallback(event => {
    const {offset, position} = event.nativeEvent;
    const pageIndex = offset >= 1 ? position + 1 : position;
    setPagePosition(pageIndex);
  }, []);

  const handlePageSelected = useCallback(e => {
    setPagePosition(e.nativeEvent.position);
  }, []);
  const pagerContent = useMemo(
    () => (
      <PagerView
        onPageScroll={handlePageScroll}
        onPageSelected={handlePageSelected}
        style={styles.container}
        initialPage={1}>
        <SendPaymentHome from="home" pageViewPage={pagePosition} key="0" />
        <View key="1" style={styles.container}>
          <MyTabs
            fromStore={props?.route?.params?.fromStore}
            adminHome={AdminHome}
            contactsDrawer={ContactsDrawer}
            appStore={AppStore}
          />
        </View>
      </PagerView>
    ),
    [
      pagePosition,
      props?.route?.params?.fromStore,
      handlePageScroll,
      handlePageSelected,
    ],
  );

  const nonCameraContent = useMemo(
    () => (
      <View style={styles.container}>
        <MyTabs
          fromStore={props?.route?.params?.fromStore}
          adminHome={AdminHome}
          contactsDrawer={ContactsDrawer}
          appStore={AppStore}
        />
      </View>
    ),
    [props?.route?.params?.fromStore],
  );
  return (
    <GlobalThemeView styles={{paddingTop: 0, paddingBottom: 0}}>
      {masterInfoObject.enabledSlidingCamera ? pagerContent : nonCameraContent}
    </GlobalThemeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
