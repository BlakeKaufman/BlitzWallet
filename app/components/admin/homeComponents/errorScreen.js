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

export default function ErrorScreen(props) {
  const {textColor, backgroundColor} = GetThemeColors();
  const errorMessage = props.route.params.errorMessage;

  const navigationFunction = props.route.params?.navigationFunction;
  const customNavigator = props.route.params?.customNavigator;

  const navigate = useNavigation();
  const {theme, darkModeType} = useGlobalContextProvider();

  const handleBackPressFunction = useCallback(() => {
    handleNaviagation();
    return true;
  }, [navigate]);

  const handleNaviagation = () => {
    if (navigationFunction) {
      navigationFunction.navigator(navigationFunction.destination);

      navigate.goBack();
    } else if (customNavigator) {
      customNavigator();
    } else navigate.goBack();
  };

  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, [handleBackPressFunction]);

  return (
    <TouchableWithoutFeedback onPress={handleNaviagation}>
      <View style={styles.globalContainer}>
        <TouchableWithoutFeedback>
          <View
            style={[
              styles.content,
              {
                backgroundColor: backgroundColor,
              },
            ]}>
            <ThemeText styles={styles.headerText} content={errorMessage} />
            <View
              style={{
                ...styles.border,
                backgroundColor:
                  theme && darkModeType ? COLORS.darkModeText : COLORS.primary,
              }}
            />
            <TouchableOpacity onPress={handleNaviagation}>
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
    textAlign: 'center',
    paddingHorizontal: 20,
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
