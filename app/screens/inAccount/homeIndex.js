import {StyleSheet, View} from 'react-native';
import {useState} from 'react';
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
  // masterInfoObject.enabledSlidingCamera
  return (
    <GlobalThemeView styles={{paddingTop: 0, paddingBottom: 0}}>
      {masterInfoObject.enabledSlidingCamera ? (
        <PagerView
          onPageScroll={event => {
            const {offset, position} = event.nativeEvent;
            if (offset >= 1) {
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
      ) : (
        <View style={{flex: 1}}>
          <MyTabs
            fromStore={props?.route?.params?.fromStore}
            adminHome={AdminHome}
            contactsDrawer={ContactsDrawer}
            appStore={AppStore}
          />
        </View>
      )}
    </GlobalThemeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
