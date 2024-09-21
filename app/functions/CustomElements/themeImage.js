import {Image, Text, View} from 'react-native';
import {useGlobalContextProvider} from '../../../context-store/context';
import {COLORS, FONT, ICONS, SIZES} from '../../constants';
import Icon from './Icon';

export default function ThemeImage({
  imgName,
  styles,
  isSVG,
  lightModeIcon,
  lightsOutIcon,
  darkModeIcon,
}) {
  const {theme, darkModeType} = useGlobalContextProvider();
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
