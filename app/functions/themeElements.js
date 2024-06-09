import {Text} from 'react-native';
import {useGlobalContextProvider} from '../../context-store/context';
import {COLORS, FONT, SIZES} from '../constants';

export default function ThemeText({content, styles}) {
  const {theme} = useGlobalContextProvider();

  return (
    <Text
      style={{
        color: theme ? COLORS.darkModeText : COLORS.lightModeText,
        fontFamily: FONT.Title_Regular,
        fontSize: SIZES.medium,
        ...styles,
      }}>
      {content}
    </Text>
  );
}
