import {Text, View} from 'react-native';
import {useGlobalContextProvider} from '../../../context-store/context';
import {COLORS, FONT, SIZES} from '../../constants';

export default function ThemeText({content, styles, reversed}) {
  const {theme} = useGlobalContextProvider();
  return (
    <Text
      style={{
        color: theme
          ? reversed
            ? COLORS.lightModeText
            : COLORS.darkModeText
          : reversed
          ? COLORS.darkModeText
          : COLORS.lightModeText,
        fontFamily: FONT.Title_Regular,
        fontSize: SIZES.medium,
        ...styles,
      }}>
      {content}
    </Text>
  );
}
