import {ChatGPTDrawer} from '../../../navigation/drawers';
import {PointOfSaleTabs} from '../../../navigation/tabs/pointOfSale';
import {ResturantHomepage} from '../../components/admin/homeComponents/apps';
import {GlobalThemeView} from '../../functions/CustomElements';

export default function AppStorePageIndex(props) {
  const targetPage = props.route.params.page;

  return (
    <GlobalThemeView>
      {targetPage.toLowerCase() === 'chatgpt' && <ChatGPTDrawer />}
      {targetPage.toLowerCase() === 'pos' && <PointOfSaleTabs />}
      {targetPage.toLowerCase() === 'resturant' && <ResturantHomepage />}
    </GlobalThemeView>
  );
}
