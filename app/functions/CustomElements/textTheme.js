import {StyleSheet, Text, View} from 'react-native';
import {COLORS, FONT, SIZES} from '../../constants';
import {useGlobalThemeContext} from '../../../context-store/theme';
import {useMemo} from 'react';

export default function ThemeText({
  content,
  styles,
  reversed,
  CustomEllipsizeMode,
  CustomNumberOfLines,
}) {
  const {theme} = useGlobalThemeContext();

  const memorizedStyles = useMemo(
    () => ({
      ...textStyles.localTextStyles,
      color: theme
        ? reversed
          ? COLORS.lightModeText
          : COLORS.darkModeText
        : reversed
        ? COLORS.darkModeText
        : COLORS.lightModeText,
    }),
    [theme],
  );
  return (
    <Text
      ellipsizeMode={CustomEllipsizeMode || 'tail'}
      numberOfLines={CustomNumberOfLines || null}
      style={{
        ...memorizedStyles,
        ...styles,
      }}>
      {content}
    </Text>
  );
}

const textStyles = StyleSheet.create({
  localTextStyles: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
  },
});
