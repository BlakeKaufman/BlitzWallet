import {
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {CENTER, COLORS, SIZES} from '../../../../../constants';

import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {ThemeText} from '../../../../../functions/CustomElements';
import {useCallback, useEffect} from 'react';
import handleBackPress from '../../../../../hooks/handleBackPress';

export default function ConfirmAddContact(props) {
  const navigate = useNavigation();
  const {theme} = useGlobalContextProvider();

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
        <TouchableWithoutFeedback style={{flex: 1}}>
          <View
            style={[
              styles.content,
              {
                backgroundColor: theme
                  ? COLORS.darkModeBackground
                  : COLORS.lightModeBackground,
              },
            ]}>
            <ThemeText
              styles={{...styles.headerText}}
              content={'Do you want to add this person as a contact?'}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => {
                  navigate.goBack();
                  props.route.params.addContact(true);
                }}
                style={[styles.button]}>
                <ThemeText styles={{...styles.buttonText}} content={'Yes'} />
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
                }}
                style={styles.button}>
                <ThemeText styles={{...styles.buttonText}} content={'No'} />
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

  content: {
    width: '95%',
    maxWidth: 300,
    borderRadius: 8,
  },
  headerText: {
    width: '90%',
    paddingVertical: 15,
    textAlign: 'center',
    ...CENTER,
  },
  border: {
    height: '100%',
    width: 1,
  },
});
