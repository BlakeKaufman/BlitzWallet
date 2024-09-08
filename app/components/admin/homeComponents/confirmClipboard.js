import {
  SafeAreaView,
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
import {useEffect} from 'react';
import GetThemeColors from '../../../hooks/themeColors';

export default function ClipboardCopyPopup(props) {
  const didCopy = props.route.params.didCopy;
  const navigate = useNavigation();
  const {theme} = useGlobalContextProvider();
  const {textColor, backgroundOffset, backgroundColor} = GetThemeColors();

  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);
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
              {didCopy ? 'Text Copied to Clipboard' : 'Error With Copy'}
            </Text>
            <View style={styles.border}></View>
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
