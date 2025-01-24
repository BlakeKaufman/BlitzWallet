import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {COLORS, FONT, SIZES} from '../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../context-store/context';
import handleBackPress from '../../../hooks/handleBackPress';
import {useCallback, useEffect} from 'react';
import GetThemeColors from '../../../hooks/themeColors';
import {ThemeText} from '../../../functions/CustomElements';

export default function ClipboardCopyPopup(props) {
  const didCopy = props.route.params.didCopy;
  const customText = props.route.params.customText;
  const navigate = useNavigation();
  const {theme, darkModeType} = useGlobalContextProvider();
  const {textColor, backgroundColor} = GetThemeColors();

  const handleBackPressFunction = useCallback(() => {
    navigate.goBack();
    return true;
  }, [navigate]);

  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, [handleBackPressFunction]);
  return (
    <TouchableWithoutFeedback onPress={() => navigate.goBack()}>
      <View style={styles.globalContainer}>
        <TouchableWithoutFeedback>
          <View
            style={[
              styles.content,
              {
                backgroundColor: backgroundColor,
              },
            ]}>
            <ThemeText
              styles={styles.headerText}
              content={
                didCopy
                  ? customText || 'Text Copied to Clipboard'
                  : 'Error With Copy'
              }
            />
            <View
              style={{
                ...styles.border,
                backgroundColor:
                  theme && darkModeType ? COLORS.darkModeText : COLORS.primary,
              }}
            />
            <TouchableOpacity onPress={() => navigate.goBack()}>
              <ThemeText styles={styles.cancelButton} content={'OK'} />
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
    backgroundColor: COLORS.halfModalBackgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '95%',
    maxWidth: 300,
    borderRadius: 8,
  },
  headerText: {
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  border: {
    height: 1,
    width: '100%',
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    textAlign: 'center',
    paddingVertical: 10,
  },
});
