import {useEffect} from 'react';
import PinPage from '../../components/admin/loginComponents/pinPage';
import {GlobalThemeView} from '../../functions/CustomElements';
import connectToLiquidNode from '../../functions/connectToLiquid';
import {useLiquidEvent} from '../../../context-store/liquidEventContext';
import {useGlobalThemeContext} from '../../../context-store/theme';

export default function AdminLogin({navigation, route}) {
  const fromBackground = route.params?.fromBackground;
  const {theme, darkModeType} = useGlobalThemeContext();

  const {onLiquidBreezEvent} = useLiquidEvent();
  useEffect(() => {
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
