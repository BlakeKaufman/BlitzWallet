import {View} from 'react-native';
import {ChatGPTDrawer} from '../../../navigation/drawers';
import {PointOfSaleTabs} from '../../../navigation/tabs/pointOfSale';
import {ResturantHomepage} from '../../components/admin/homeComponents/apps';
import SMSMessagingHome from '../../components/admin/homeComponents/apps/sms4sats/home';
import {GlobalThemeView} from '../../functions/CustomElements';

export default function AppStorePageIndex(props) {
  const targetPage = props.route.params.page;

  return (
    <>
      {targetPage.toLowerCase() === 'chatgpt' ? (
        <View style={{flex: 1}}>
          <ChatGPTDrawer />
        </View>
      ) : (
        <GlobalThemeView>
          {targetPage.toLowerCase() === 'pos' && <PointOfSaleTabs />}
          {targetPage.toLowerCase() === 'resturant' && <ResturantHomepage />}
          {targetPage.toLowerCase() === 'sms4sats' && <SMSMessagingHome />}
        </GlobalThemeView>
      )}
    </>
  );
}
