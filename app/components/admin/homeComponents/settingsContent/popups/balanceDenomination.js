import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {CENTER, COLORS, FONT, SIZES} from '../../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import handleBackPress from '../../../../../hooks/handleBackPress';
import {useEffect} from 'react';

export default function UserBalanceDenomination() {
  const navigate = useNavigation();
  const {theme, toggleMasterInfoObject, masterInfoObject} =
    useGlobalContextProvider();

  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);
  const optionElements = ['sats', 'fiat', 'hidden'].map((option, id) => {
    return (
      <TouchableOpacity
        key={id}
        onPress={() => {
          switchPreferance(option);
        }}
        style={[
          styles.optionContainer,
          {
            backgroundColor:
              masterInfoObject.userBalanceDenomination === option
                ? 'green'
                : theme
                ? COLORS.darkModeBackgroundOffset
                : COLORS.lightModeBackgroundOffset,
          },
        ]}>
        <Text
          style={[
            styles.optionText,
            {
              color:
                masterInfoObject.userBalanceDenomination === option
                  ? COLORS.darkModeText
                  : theme
                  ? COLORS.darkModeText
                  : COLORS.lightModeText,
            },
          ]}>
          {option}
        </Text>
      </TouchableOpacity>
    );
  });
  return (
    <TouchableWithoutFeedback onPress={() => navigate.goBack()}>
      <View style={styles.globalContainer}>
        <TouchableWithoutFeedback>
          <View
            style={[
              styles.content,
              {
                backgroundColor: theme
                  ? COLORS.darkModeBackground
                  : COLORS.lightModeBackground,
              },
            ]}>
            {optionElements}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );

  function switchPreferance(type) {
    // toggleUserBalanceDenomination(type);
    toggleMasterInfoObject({userBalanceDenomination: type});
    navigate.goBack();
  }
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
    alignItems: 'center',
    padding: 20,
    borderRadius: 8,
  },

  optionContainer: {
    width: '100%',
    padding: 10,
    marginBottom: 20,
    borderRadius: 8,
  },
  optionText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.large,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
});
