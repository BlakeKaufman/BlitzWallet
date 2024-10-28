import {View} from 'react-native';
import {ChatGPTDrawer} from '../../../navigation/drawers';
import {PointOfSaleTabs} from '../../../navigation/tabs/pointOfSale';
import {ResturantHomepage} from '../../components/admin/homeComponents/apps';
import SMSMessagingHome from '../../components/admin/homeComponents/apps/sms4sats/home';
import {GlobalThemeView} from '../../functions/CustomElements';
import {useNavigation} from '@react-navigation/native';
import handleBackPress from '../../hooks/handleBackPress';
import {useEffect} from 'react';
import VPNHome from '../../components/admin/homeComponents/apps/VPN/home';
import ShopBitcoinHome from '../../components/admin/homeComponents/apps/giftCards/home';

export default function AppStorePageIndex(props) {
  const targetPage = props.route.params.page;
  const navigate = useNavigation();

  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

  return (
    <>
      {targetPage.toLowerCase() === 'ai' ? (
        <View style={{flex: 1}}>
          <ChatGPTDrawer />
        </View>
      ) : (
        // : targetPage.toLowerCase() === 'shopbitcoin' ? (
        //   <ShopBitcoinHome />
        // )
        <GlobalThemeView>
          {targetPage.toLowerCase() === 'pos' && <PointOfSaleTabs />}
          {targetPage.toLowerCase() === 'resturant' && <ResturantHomepage />}
          {targetPage.toLowerCase() === 'sms4sats' && <SMSMessagingHome />}
          {targetPage.toLowerCase() === 'lnvpn' && <VPNHome />}
        </GlobalThemeView>
      )}
    </>
  );
}
