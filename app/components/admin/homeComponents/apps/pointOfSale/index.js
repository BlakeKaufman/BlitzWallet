import {Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ANDROIDSAFEAREA} from '../../../../../constants/styles';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {COLORS} from '../../../../../constants';

export default function PointOfSaleHome() {
  const {theme} = useGlobalContextProvider();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: theme
          ? COLORS.darkModeBackground
          : COLORS.lightModeBackground,
        paddingTop: insets.top < 20 ? ANDROIDSAFEAREA : insets.top,
        paddingBottom: insets.bottom < 20 ? ANDROIDSAFEAREA : insets.bottom,
      }}>
      <Text>Testing</Text>
    </View>
  );
}
