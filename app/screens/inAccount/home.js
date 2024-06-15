import {Platform, StyleSheet, View} from 'react-native';
import {useRef} from 'react';
import {registerWebhook} from '@breeztech/react-native-breez-sdk';
import NavBar from '../../components/admin/homeComponents/navBar';
import HomeLightning from '../../components/admin/homeComponents/homeLightning';
import {ConfigurePushNotifications} from '../../hooks/setNotifications';
import {listenForMessages} from '../../hooks/listenForMessages';
import {GlobalThemeView, ThemeText} from '../../functions/CustomElements';
import CustomFlatList from '../../components/admin/homeComponents/homeLightning/cusomFlatlist/CustomFlatList';
import {useGlobalContextProvider} from '../../../context-store/context';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  LiquidityIndicator,
  SendRecieveBTNs,
  UserSatAmount,
} from '../../components/admin';
import {CENTER, COLORS} from '../../constants';
import getFormattedHomepageTxs, {
  UserTransaction,
  dateBanner,
} from '../../functions/combinedTransactions';
import {useNavigation} from '@react-navigation/native';

export default function AdminHome() {
  console.log('admin home');
  const expoPushToken = ConfigurePushNotifications();
  const insets = useSafeAreaInsets();
  const {nodeInformation, masterInfoObject, liquidNodeInformation, theme} =
    useGlobalContextProvider();
  const navigate = useNavigation();
  listenForMessages();
  const showAmount = masterInfoObject.userBalanceDenomination != 'hidden';

  const didLogWebhook = useRef(false);

  expoPushToken &&
    !didLogWebhook.current &&
    (async () => {
      try {
        await registerWebhook(
          `https://blitz-wallet.com/.netlify/functions/notify?platform=${Platform.OS}&token=${expoPushToken.data}`,
        );
        didLogWebhook.current = true;
      } catch (err) {
        console.log(err);
      }
    })();

  return (
    <GlobalThemeView styles={{paddingBottom: 0, paddingTop: 0}}>
      <CustomFlatList
        data={getFormattedHomepageTxs({
          nodeInformation,
          liquidNodeInformation,
          masterInfoObject,
          theme,
          navigate,
          showAmount,
        })}
        renderItem={({item}) => item}
        HeaderComponent={<NavBar />}
        StickyElementComponent={
          <View
            style={{
              alignItems: 'center',
              backgroundColor: theme
                ? COLORS.darkModeBackground
                : COLORS.lightModeBackground,
              paddingVertical: 10,
            }}>
            <ThemeText
              content={'Total Balance'}
              styles={{
                textTransform: 'uppercase',
                // marginTop: 30,
              }}
            />
            <UserSatAmount />
            <LiquidityIndicator />
          </View>
        }
        TopListElementComponent={
          <View
            style={{
              alignItems: 'center',
            }}>
            <SendRecieveBTNs />
            <ThemeText
              content={'Transactions'}
              styles={{
                paddingBottom: 5,
              }}
            />
          </View>
        }
      />
      {/* <NavBar /> */}
      {/* <HomeLightning /> */}
    </GlobalThemeView>
  );
}

const styles = StyleSheet.create({
  item: {
    borderColor: 'green',
    borderWidth: 5,
    height: 100,
    marginBottom: 6,
    width: '100%',
  },
});
