import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {useGlobalContextProvider} from '../../../context-store/context';
import {COLORS} from '../../constants';
import ThemeText from './textTheme';

export default function FullLoadingScreen({
  text,
  containerStyles,
  reversed,
  textStyles,
  showLoadingIcon = true,
  size = 'large',
  loadingColor,
  showText = true,
}) {
  const {theme} = useGlobalContextProvider();
  return (
    <View style={{...styles.container, ...containerStyles}}>
      {showLoadingIcon && (
        <ActivityIndicator
          color={
            loadingColor
              ? loadingColor
              : theme
              ? reversed
                ? COLORS.lightModeText
                : COLORS.darkModeText
              : reversed
              ? COLORS.darkModeText
              : COLORS.lightModeText
          }
          size={size}
        />
      )}
      {showText && (
        <ThemeText styles={{...styles.text, ...textStyles}} content={text} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 10,
  },
});
