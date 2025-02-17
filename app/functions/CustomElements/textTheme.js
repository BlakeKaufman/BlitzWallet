import {Text, View} from 'react-native';
import {COLORS, FONT, SIZES} from '../../constants';
import {useGlobalThemeContext} from '../../../context-store/theme';

export default function ThemeText({
  content,
  styles,
  reversed,
  CustomEllipsizeMode,
  CustomNumberOfLines,
}) {
  const {theme} = useGlobalThemeContext();
  return (
    <Text
      ellipsizeMode={CustomEllipsizeMode || 'tail'}
      numberOfLines={CustomNumberOfLines || null}
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
