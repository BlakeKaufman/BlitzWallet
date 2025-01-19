import {useEffect} from 'react';
import PinPage from '../../components/admin/loginComponents/pinPage';
import {useGlobalContextProvider} from '../../../context-store/context';
import {GlobalThemeView} from '../../functions/CustomElements';
import connectToLightningNode from '../../functions/connectToLightning';
import connectToLiquidNode from '../../functions/connectToLiquid';
import {useLiquidEvent} from '../../../context-store/liquidEventContext';
import {useLightningEvent} from '../../../context-store/lightningEventContext';

export default function AdminLogin({navigation, route}) {
  const fromBackground = route.params?.fromBackground;
  const {theme} = useGlobalContextProvider();
  const {onLightningBreezEvent} = useLightningEvent();
  const {onLiquidBreezEvent} = useLiquidEvent();
  useEffect(() => {
    connectToLightningNode(onLightningBreezEvent);
    connectToLiquidNode(onLiquidBreezEvent);
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
