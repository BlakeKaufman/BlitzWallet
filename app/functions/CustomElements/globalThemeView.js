import {StyleSheet, View} from 'react-native';
import {useGlobalContextProvider} from '../../../context-store/context';
import {COLORS} from '../../constants';
import {ANDROIDSAFEAREA, CENTER} from '../../constants/styles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {WINDOWWIDTH} from '../../constants/theme';

export default function GlobalThemeView({children, styles, useStandardWidth}) {
  const {theme} = useGlobalContextProvider();
  const insets = useSafeAreaInsets();
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
      {useStandardWidth ? (
        <View style={referanceStyles.widthContainer}>{children}</View>
      ) : (
        children
      )}
    </View>
  );
}

const referanceStyles = StyleSheet.create({
  widthContainer: {
    width: WINDOWWIDTH,
    flex: 1,
    ...CENTER,
  },
});
