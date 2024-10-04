import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {BTN, CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useState} from 'react';

export default function LnurlPaymentDescription(props) {
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();
  const setPaymentDescriptionOptions =
    props.route.params.setLnurlDescriptionInfo;
  const paymentInfo = props.route.params.paymentInfo;
  const [description, setDescription] = useState('');
  const {theme, nodeInformation} = useGlobalContextProvider();

  //   NOT USING ANYMORE BUT KEEPING CODE IN CASE OF FUTURE USE

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{
        flex: 1,
        backgroundColor: COLORS.opaicityGray,
      }}>
      <TouchableWithoutFeedback
        onPress={() => {
          setPaymentDescriptionOptions({didAsk: true, description: ''});
          navigate.goBack();
        }}>
        <View style={{flex: 1}}>
          <View
            style={{
              height: '70%',
              width: '100%',
              marginTop: 'auto',

              backgroundColor: theme
                ? COLORS.darkModeBackground
                : COLORS.lightModeBackground,

              alignItems: 'center',
              borderTopRightRadius: 30,
              borderTopLeftRadius: 30,
              overflow: 'hidden',
              paddingBottom: 20,
            }}>
            <View
              style={[
                styles.optionalHeader,
                {
                  backgroundColor: theme
                    ? COLORS.darkModeBackgroundOffset
                    : COLORS.lightModeBackgroundOffset,
                },
              ]}>
              <Text
                style={{
                  fontFamily: FONT.Title_Regular,
                  fontSize: SIZES.medium,
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                }}>
                Add optional description
              </Text>
            </View>
            <View style={{width: '100%', alignItems: 'center'}}>
              <Text
                style={{
                  fontFamily: FONT.Title_Regular,
                  marginTop: 10,
                  fontSize: SIZES.medium,
                  width: '95%',
                  maxWidth: 350,
                  textAlign: 'center',
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,

                  ...CENTER,
                }}>
                This message will be attached to your payment.
              </Text>

              <TextInput
                editable
                multiline
                numberOfLines={4}
                maxLength={40}
                style={{
                  width: '95%',
                  height: 100,
                  borderRadius: 8,
                  borderColor: theme
                    ? COLORS.darkModeBackgroundOffset
                    : COLORS.lightModeBackgroundOffset,
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,

                  borderWidth: 2,
                  marginVertical: 20,
                  padding: 10,
                }}
                onChangeText={setDescription}
              />

              <Text
                style={{
                  width: '95%',
                  marginRight: 'auto',
                  fontSize: SIZES.medium,
                  fontFamily: FONT.Descriptoin_Regular,
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  ...CENTER,
                }}>
                {paymentInfo.data.commentAllowed - description.length} remaining
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setPaymentDescriptionOptions({
                    didAsk: true,
                    description: description,
                  });
                  navigate.goBack();
                }}
                style={[BTN, {backgroundColor: COLORS.primary, marginTop: 20}]}>
                <Text
                  style={{
                    fontFamily: FONT.Descriptoin_Regular,
                    fontSize: SIZES.medium,
                    color: COLORS.darkModeText,
                  }}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  optionalHeader: {
    width: '100%',
    textAlign: 'center',

    paddingVertical: 10,

    alignItems: 'center',
  },
});
