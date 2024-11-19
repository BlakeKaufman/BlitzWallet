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
            <Text style={[styles.headerText, {color: textColor}]}>
              {didCopy
                ? customText || 'Text Copied to Clipboard'
                : 'Error With Copy'}
            </Text>
            <View
              style={{
                ...styles.border,
                backgroundColor:
                  theme && darkModeType ? COLORS.darkModeText : COLORS.primary,
              }}
            />
            <TouchableOpacity onPress={() => navigate.goBack()}>
              <Text style={[styles.cancelButton, {color: textColor}]}>OK</Text>
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
    backgroundColor: COLORS.opaicityGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: 230,
    backgroundColor: COLORS.lightModeBackground,

    // paddingVertical: 10,
    borderRadius: 8,
  },
  headerText: {
    width: '100%',
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
    paddingVertical: 15,
    textAlign: 'center',
  },
  border: {
    height: 1,
    width: 230,
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
    color: COLORS.primary,
    textAlign: 'center',
    paddingVertical: 5,
  },
});
