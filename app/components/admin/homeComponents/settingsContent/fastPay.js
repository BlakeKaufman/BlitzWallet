import {
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {ThemeText} from '../../../../functions/CustomElements';
import CustomToggleSwitch from '../../../../functions/CustomElements/switch';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import GetThemeColors from '../../../../hooks/themeColors';
import {CENTER, COLORS} from '../../../../constants';
import {useState} from 'react';
import {useNavigation} from '@react-navigation/native';

export default function FastPay() {
  const {theme, masterInfoObject, nodeInformation, toggleMasterInfoObject} =
    useGlobalContextProvider();
  const {backgroundOffset, backgroundColor, textColor} = GetThemeColors();
  const navigate = useNavigation();
  const [inputText, setInputText] = useState(
    String(masterInfoObject.fastPaySettings.fastPayThresholdSats || 5000),
  );
  const fastPayThreshold =
    masterInfoObject.fastPaySettings.fastPayThresholdSats || 5000;

  const [isOn, setIsOn] = useState(
    masterInfoObject.fastPaySettings.isFastPayEnabled,
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{flex: 1, width: '95%', ...CENTER}}>
        <View
          style={[
            styles.contentContainer,
            {
              backgroundColor: theme ? backgroundOffset : COLORS.darkModeText,
              marginVertical: 20,
            },
          ]}>
          <View
            style={{
              ...styles.sliderContianer,
              borderBottomWidth: 1,
              borderBottomColor: backgroundColor,
            }}>
            <ThemeText content={`Enable Fast Pay`} />
            <CustomToggleSwitch
              toggleSwitchFunction={handleToggleSwitch}
              stateValue={isOn}
            />
          </View>
          <View
            style={{
              ...styles.sliderContianer,
            }}>
            <ThemeText content={'Fast pay threashold (Sats)'} />
            <TextInput
              value={inputText}
              defaultValue={String(fastPayThreshold)}
              onChangeText={setInputText}
              keyboardType="number-pad"
              onEndEditing={() => {
                if (
                  inputText ==
                  masterInfoObject.fastPaySettings.fastPayThresholdSats
                )
                  return;
                if (!inputText) {
                  navigate.navigate('ErrorScreen', {
                    errorMessage: 'Amount cannot be 0',
                  });
                  setInputText(
                    String(
                      masterInfoObject.fastPaySettings.fastPayThresholdSats,
                    ),
                  );
                  return;
                }
                toggleMasterInfoObject({
                  fastPaySettings: {
                    ...masterInfoObject.fastPaySettings,
                    fastPayThresholdSats: Number(inputText),
                  },
                });
              }}
              style={{
                padding: 10,
                borderRadius: 8,

                backgroundColor: backgroundColor,
                color: textColor,
              }}
            />
          </View>
          <View style={styles.textContainer}>
            <ThemeText
              content={
                'Fast pay allows you to instantly pay invoices bellow a specified threshold without needing to swipe for confirmation.'
              }
            />
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
  function handleToggleSwitch() {
    setIsOn(prev => {
      toggleMasterInfoObject({
        fastPaySettings: {
          ...masterInfoObject.fastPaySettings,
          isFastPayEnabled: !prev,
        },
      });
      return !prev;
    });
  }
}
const styles = StyleSheet.create({
  contentContainer: {
    minHeight: 60,
    width: '100%',
    borderRadius: 8,
    paddingVertical: 10,
  },
  sliderContianer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingRight: 10,
    paddingBottom: 10,
    marginBottom: 10,
    marginLeft: 20,
  },
  textContainer: {
    paddingRight: 10,
    marginLeft: 20,
  },

  container: {
    width: '100%',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 5,
  },

  slider: {
    width: '100%',
    height: 40,
    marginTop: 20,
  },
});
