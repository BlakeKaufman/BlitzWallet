import {useEffect} from 'react';
import PinPage from '../../components/admin/loginComponents/pinPage';
import {useGlobalContextProvider} from '../../../context-store/context';
import {GlobalThemeView} from '../../functions/CustomElements';
import {connectToNode} from '../../functions';
import useGlobalOnBreezEvent from '../../hooks/globalOnBreezEvent';
import {getWolletState} from '../../functions/liquidWallet';

export default function AdminLogin({navigation, route}) {
  const fromBackground = route.params?.fromBackground;
  const {theme} = useGlobalContextProvider();
  const onBreezEvent = useGlobalOnBreezEvent();
  useEffect(() => {
    connectToNode(onBreezEvent);
    getWolletState(true);
  }, []);

  return (
    <GlobalThemeView useStandardWidth={true}>
      <PinPage
        navigation={navigation}
        theme={theme}
        fromBackground={fromBackground}
      />
    </GlobalThemeView>
  );
}
