import {useEffect} from 'react';
import PinPage from '../../components/admin/loginComponents/pinPage';
import {GlobalThemeView} from '../../functions/CustomElements';
import connectToLightningNode from '../../functions/connectToLightning';
import connectToLiquidNode from '../../functions/connectToLiquid';
import {useLiquidEvent} from '../../../context-store/liquidEventContext';
import {useLightningEvent} from '../../../context-store/lightningEventContext';
import {useGlobalThemeContext} from '../../../context-store/theme';

export default function AdminLogin({navigation, route}) {
  const fromBackground = route.params?.fromBackground;
  const {theme, darkModeType} = useGlobalThemeContext();
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
