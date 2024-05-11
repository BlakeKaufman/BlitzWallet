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

export default function AddOrDeleteContactImage(props) {
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
            <Text
              style={[
                styles.headerText,
                {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
              ]}>
              Do you want to {props.route.params.hasImage ? 'change' : 'add'}{' '}
              {props.route.params.hasImage ? 'or delete your' : 'a'} photo
            </Text>
            {/* <View style={styles.border}></View> */}

            <TouchableOpacity
              onPress={() => {
                navigate.goBack();
                props.route.params.addPhoto();
              }}>
              <Text
                style={[
                  styles.cancelButton,
                  {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                ]}>
                {props.route.params.hasImage ? 'change' : 'yes'}
              </Text>
            </TouchableOpacity>

            <View style={styles.border}></View>
            <TouchableOpacity
              onPress={() => {
                if (props.route.params.hasImage) {
                  props.route.params.deletePhoto();
                }
                navigate.goBack();
              }}>
              <Text
                style={[
                  styles.cancelButton,
                  {
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  },
                ]}>
                {props.route.params.hasImage ? 'delete' : 'no'}
              </Text>
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
});
