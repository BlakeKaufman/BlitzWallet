import {
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import {BTN, COLORS, SIZES} from '../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useState} from 'react';

export default function ManualEnterSendAddress() {
  const navigate = useNavigation();
  const {theme} = useGlobalContextProvider();
  const [inputValue, setInputValue] = useState('');
  return (
    <GlobalThemeView>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          navigate.goBack();
        }}>
        <View style={styles.innerContainer}>
          <ThemeText
            styles={{marginTop: 'auto'}}
            content={'Enter bolt11, LNURL or liquid address'}
          />
          <TextInput
            style={[
              styles.testInputStyle,
              {
                borderColor: theme ? COLORS.darkModeText : COLORS.lightModeText,
                paddingHorizontal: 10,
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}
            multiline
            autoFocus={true}
            onChangeText={setInputValue}
            value={inputValue}
          />
          <TouchableOpacity
            onPress={() => {
              console.log(inputValue);
              Keyboard.dismiss();
              navigate.navigate('HomeAdmin');

              navigate.navigate('ConfirmPaymentScreen', {
                btcAdress: inputValue,
              });
            }}
            style={[
              BTN,
              {
                backgroundColor: theme
                  ? COLORS.darkModeText
                  : COLORS.lightModeText,
                marginTop: 'auto',
              },
            ]}>
            <ThemeText reversed={true} content={'Continue'} />
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </GlobalThemeView>
  );
}

const styles = StyleSheet.create({
  innerContainer: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  testInputStyle: {
    width: '90%',
    borderRadius: 8,
    borderWidth: 1,
    fontSize: SIZES.medium,
    marginTop: 20,
    maxHeight: 90,
  },
});
