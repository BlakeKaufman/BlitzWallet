import {
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {CENTER, COLORS} from '../../../../../constants';

import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {ThemeText} from '../../../../../functions/CustomElements';

export default function ConfirmAddContact(props) {
  const navigate = useNavigation();
  const {theme} = useGlobalContextProvider();
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
              content={'Do you want to add this person as a contact'}
            />

            <View
              style={{
                flexDirection: 'row',
                width: '100%',
              }}>
              <TouchableOpacity
                style={{width: '50%'}}
                onPress={() => {
                  navigate.goBack();
                  props.route.params.addContact();
                }}>
                <ThemeText styles={{...styles.cancelButton}} content={'Yes'} />
              </TouchableOpacity>
              <View style={styles.border}></View>
              <TouchableOpacity
                style={{width: '50%'}}
                onPress={() => navigate.goBack()}>
                <ThemeText styles={{...styles.cancelButton}} content={'No'} />
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
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    textAlign: 'center',
    paddingVertical: 10,
  },
});
