import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {COLORS, FONT, SIZES} from '../../../../../constants';

import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import handleBackPress from '../../../../../hooks/handleBackPress';
import {useEffect} from 'react';
import {ThemeText} from '../../../../../functions/CustomElements';
import GetThemeColors from '../../../../../hooks/themeColors';

export default function AddOrDeleteContactImage(props) {
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
        <TouchableWithoutFeedback style={{flex: 1}}>
          <View
            style={[
              styles.content,
              {
                backgroundColor: backgroundColor,
              },
            ]}>
            <Text style={[styles.headerText, {color: textColor}]}>
              Do you want to {props.route.params.hasImage ? 'change' : 'add'}{' '}
              {props.route.params.hasImage ? 'or delete your' : 'a'} photo
            </Text>
            {/* <View style={styles.border}></View> */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => {
                  navigate.goBack();
                  props.route.params.addPhoto();
                }}
                style={[styles.button]}>
                <ThemeText
                  styles={{...styles.buttonText}}
                  content={props.route.params.hasImage ? 'Change' : 'Yes'}
                />
              </TouchableOpacity>
              <View
                style={{
                  height: '100%',
                  width: 2,
                  backgroundColor: textColor,
                }}></View>
              <TouchableOpacity
                onPress={() => {
                  if (props.route.params.hasImage) {
                    props.route.params.deletePhoto();
                  }
                  navigate.goBack();
                }}
                style={styles.button}>
                <ThemeText
                  styles={{...styles.buttonText}}
                  content={props.route.params.hasImage ? 'Delete' : 'No'}
                />
              </TouchableOpacity>
            </View>
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
    width: '95%',
    maxWidth: 300,
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
    paddingHorizontal: 20,
  },
  border: {
    height: 1,
    width: '100%',
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
    color: COLORS.primary,
    textAlign: 'center',
    paddingVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 15,
  },
  button: {
    width: '50%',
    height: 30,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: SIZES.large,
  },
});
