import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import {useGlobalContextProvider} from '../../../context-store/context';
import {COLORS, FONT, SIZES} from '../../constants';

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
        <ActivityIndicator
          style={{paddingVertical: 8, paddingHorizontal: 15}}
          size="small"
          color={COLORS.lightModeText}
        />
      ) : (
        <Text
          style={{
            ...styles.text,

            color: theme
              ? darkModeType
                ? COLORS.lightsOutBackground
                : COLORS.darkModeBackground
              : COLORS.lightModeText,
            ...textStyles,
          }}>
          {textContent}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonLocalStyles: {
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  text: {
    includeFontPadding: false,
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
});
