import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import {useGlobalContextProvider} from '../../../context-store/context';
import {COLORS, FONT, SIZES} from '../../constants';

export default function CustomButton({
  buttonStyles,
  textStyles,
  actionFunction,
  textContent,
}) {
  const {theme} = useGlobalContextProvider();
  return (
    <TouchableOpacity
      style={{
        ...styles.buttonLocalStyles,
        backgroundColor: COLORS.darkModeText,
        ...buttonStyles,
      }}
      onPress={() => {
        actionFunction();
      }}>
      <Text
        style={{
          ...styles.text,
          color: theme ? COLORS.darkModeBackground : COLORS.lightModeText,
          ...textStyles,
        }}>
        {textContent}
      </Text>
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
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
});
