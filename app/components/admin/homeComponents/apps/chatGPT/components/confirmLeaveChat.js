import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {
  CENTER,
  COLORS,
  FONT,
  SHADOWS,
  SIZES,
} from '../../../../../../constants';
import GetThemeColors from '../../../../../../hooks/themeColors';
import {ThemeText} from '../../../../../../functions/CustomElements';

export default function ConfirmLeaveChatGPT(props) {
  const navigate = useNavigation();
  const {textColor, backgroundColor} = GetThemeColors();

  console.log(props);

  return (
    <View style={[confirmPopup.container]}>
      <View
        style={[
          confirmPopup.innerContainer,
          {
            backgroundColor: backgroundColor,
          },
        ]}>
        <ThemeText
          styles={confirmPopup.headerText}
          content={'Do you want to save your chat?'}
        />

        <View style={confirmPopup.buttonContainer}>
          <TouchableOpacity
            onPress={() => {
              navigate.goBack();
              props.route.params.wantsToSave();
            }}
            style={[confirmPopup.button]}>
            <ThemeText styles={confirmPopup.buttonText} content={'Yes'} />
          </TouchableOpacity>
          <View
            style={{
              height: '100%',
              width: 2,
              backgroundColor: textColor,
            }}
          />
          <TouchableOpacity
            onPress={() => {
              navigate.goBack();
              props.route.params.doesNotWantToSave();
            }}
            style={confirmPopup.button}>
            <ThemeText styles={confirmPopup.buttonText} content={'No'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
const confirmPopup = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.opaicityGray,

    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContainer: {
    width: '90%',
    maxWidth: 320,
    padding: 8,
    borderRadius: 8,
    ...SHADOWS.medium,
  },

  headerText: {
    textAlign: 'center',
    marginBottom: 15,
  },
  descriptionText: {
    maxWidth: '90%',
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
    textAlign: 'center',
    color: COLORS.background,
    marginBottom: 25,
    ...CENTER,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
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
