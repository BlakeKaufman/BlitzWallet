import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import {useGlobalContextProvider} from '../../../context-store/context';
import {COLORS, FONT, SIZES} from '../../constants';
import FullLoadingScreen from './loadingScreen';
import ThemeText from './textTheme';

export default function CustomButton({
  buttonStyles,
  textStyles,
  actionFunction,
  textContent,
  useLoading,
}) {
  const {theme, darkModeType} = useGlobalContextProvider();
  return (
    <TouchableOpacity
      style={{
        ...styles.buttonLocalStyles,
        backgroundColor: COLORS.darkModeText,
        ...buttonStyles,
      }}
      onPress={() => {
        if (useLoading) return;
        actionFunction();
      }}>
      {useLoading ? (
        <FullLoadingScreen
          showText={false}
          size="small"
          loadingColor={COLORS.lightModeText}
        />
      ) : (
        <ThemeText
          content={textContent}
          styles={{
            ...styles.text,
            color: theme
              ? darkModeType
                ? COLORS.lightsOutBackground
                : COLORS.darkModeBackground
              : COLORS.lightModeText,
            ...textStyles,
          }}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonLocalStyles: {
    minWidth: 120,
    minHeight: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  text: {
    includeFontPadding: false,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
});
