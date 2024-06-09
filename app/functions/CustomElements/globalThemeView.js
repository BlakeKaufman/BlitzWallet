import {View} from 'react-native';
import {useGlobalContextProvider} from '../../../context-store/context';
import {COLORS} from '../../constants';
import {ANDROIDSAFEAREA} from '../../constants/styles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export default function GlobalThemeView({children, styles}) {
  const {theme} = useGlobalContextProvider();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme
          ? COLORS.darkModeBackground
          : COLORS.lightModeBackground,
        paddingTop: insets.top < 20 ? ANDROIDSAFEAREA : 0,
        paddingBottom: insets.bottom < 20 ? ANDROIDSAFEAREA : 0,
        ...styles,
      }}>
      {children}
    </View>
  );
}
