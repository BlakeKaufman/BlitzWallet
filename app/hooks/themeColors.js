import {useGlobalContextProvider} from '../../context-store/context';
import {COLORS} from '../constants';
export default function GetThemeColors() {
  const {darkModeType, theme} = useGlobalContextProvider();
  const themeText = theme ? COLORS.darkModeText : COLORS.lightModeText;
  const backgroundColor = theme
    ? darkModeType
      ? COLORS.lightsOutBackground
      : COLORS.darkModeBackground
    : COLORS.lightModeBackground;
  const themeBackgroundOffset = theme
    ? darkModeType
      ? COLORS.lightsOutBackgroundOffset
      : COLORS.darkModeBackgroundOffset
    : COLORS.lightModeBackgroundOffset;

  const textInputBackground =
    !theme || darkModeType ? COLORS.darkModeText : themeBackgroundOffset;
  const textInputColor =
    !theme || darkModeType ? COLORS.lightModeText : COLORS.darkModeText;
  return {
    textColor: themeText,
    backgroundOffset: themeBackgroundOffset,
    backgroundColor,
    textInputBackground,
    textInputColor,
  };
}
