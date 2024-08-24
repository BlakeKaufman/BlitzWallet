import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../../../context-store/context';
import {
  CENTER,
  COLORS,
  FONT,
  SHADOWS,
  SIZES,
} from '../../../../../../constants';

export default function ConfirmLeaveChatGPT(props) {
  const navigate = useNavigation();
  const {theme} = useGlobalContextProvider();

  console.log(props);

  return (
    <View style={[confirmPopup.container]}>
      <View
        style={[
          confirmPopup.innerContainer,
          {
            backgroundColor: theme
              ? COLORS.darkModeBackground
              : COLORS.lightModeBackground,
          },
        ]}>
        <Text
          style={[
            confirmPopup.headerText,
            {
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
            },
          ]}>
          Do you want to save your chat?
        </Text>
        {/* <Text
          style={[
            confirmPopup.descriptionText,
            {
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
            },
          ]}>
          Once you drain your wallet this cannot be undone.
        </Text> */}

        <View style={confirmPopup.buttonContainer}>
          <TouchableOpacity
            onPress={() => {
              navigate.goBack();
              props.route.params.wantsToSave();
            }}
            style={[confirmPopup.button]}>
            <Text
              style={[
                confirmPopup.buttonText,
                {
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                },
              ]}>
              Yes
            </Text>
          </TouchableOpacity>
          <View
            style={{
              height: '100%',
              width: 2,
              backgroundColor: theme
                ? COLORS.darkModeText
                : COLORS.lightModeText,
            }}></View>
          <TouchableOpacity
            onPress={() => {
              navigate.goBack();
              props.route.params.doesNotWantToSave();
            }}
            style={confirmPopup.button}>
            <Text
              style={[
                confirmPopup.buttonText,
                {
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                },
              ]}>
              No
            </Text>
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
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.large,
    textAlign: 'center',
    color: COLORS.background,
    marginBottom: 5,
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
    fontFamily: FONT.Other_Regular,
    fontSize: SIZES.large,
    color: COLORS.background,
  },
});
