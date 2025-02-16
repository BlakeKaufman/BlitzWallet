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
    <View style={[styles.container]}>
      <View
        style={[
          styles.innerContainer,
          {
            backgroundColor: backgroundColor,
          },
        ]}>
        <ThemeText
          styles={styles.headerText}
          content={'Do you want to save your chat?'}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => {
              navigate.goBack();
              props.route.params.wantsToSave();
            }}
            style={[styles.button]}>
            <ThemeText styles={styles.buttonText} content={'Yes'} />
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
            style={styles.button}>
            <ThemeText styles={styles.buttonText} content={'No'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.halfModalBackgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContainer: {
    width: '90%',
    maxWidth: 320,
    padding: 8,
    borderRadius: 8,
  },

  headerText: {
    textAlign: 'center',
    marginBottom: 15,
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
