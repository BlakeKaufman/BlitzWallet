import {Image, Text, View} from 'react-native';
import Icon from './Icon';
import {useGlobalThemeContext} from '../../../context-store/theme';

export default function ThemeImage({
  imgName,
  styles,
  isSVG,
  lightModeIcon,
  lightsOutIcon,
  darkModeIcon,
}) {
  const {theme, darkModeType} = useGlobalThemeContext();
  return (
    <>
      {isSVG ? (
        <Icon />
      ) : (
        <Image
          style={{
            width: 30,
            height: 30,
            ...styles,
          }}
          source={
            theme
              ? darkModeType
                ? lightsOutIcon
                : darkModeIcon
              : lightModeIcon
          }
        />
      )}
    </>
  );
}
