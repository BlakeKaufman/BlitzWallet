import {View} from 'react-native';
import {useGlobalContextProvider} from '../../../context-store/context';
import {COLORS} from '../../constants';
import {ANDROIDSAFEAREA} from '../../constants/styles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export default function GlobalThemeView({children, styles}) {
  const {theme} = useGlobalContextProvider();
  const insets = useSafeAreaInsets();
  console.log(insets);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme
          ? COLORS.darkModeBackground
          : COLORS.lightModeBackground,
        paddingTop: insets.top < 20 ? ANDROIDSAFEAREA : insets.top,
        paddingBottom: insets.bottom < 20 ? ANDROIDSAFEAREA : insets.bottom,
        ...styles,
      }}>
      {children}
    </View>
  );
}
