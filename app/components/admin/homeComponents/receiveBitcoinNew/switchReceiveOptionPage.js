import {useNavigation} from '@react-navigation/native';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  CENTER,
  COLORS,
  FONT,
  ICONS,
  SATSPERBITCOIN,
  SHADOWS,
  SIZES,
} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';

export default function SwitchReceiveOptionPage(props) {
  const navigate = useNavigation();
  const {theme} = useGlobalContextProvider();
  const setSelectedRecieveOption = props.route.params.setSelectedRecieveOption;

  return (
    <View
      style={[
        styles.globalContainer,
        {
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
          paddingVertical: 10,
          alignItems: 'center',
        },
      ]}>
      <SafeAreaView
        style={{
          flex: 1,
          width: '95%',
        }}>
        <TouchableOpacity
          onPress={() => {
            navigate.goBack();
          }}>
          <Image
            source={ICONS.leftCheveronIcon}
            style={{width: 30, height: 30, marginRight: 'auto'}}
          />
          <View
            style={[
              styles.optionContainer,
              {
                backgroundColor: theme
                  ? COLORS.darkModeBackgroundOffset
                  : COLORS.lightModeBackgroundOffset,
              },
            ]}>
            <View>
              <Image
                style={{width: 40, height: 60}}
                source={
                  theme ? ICONS.lightningBoltLight : ICONS.lightningBoltDark
                }
              />
            </View>
            <View>
              <Image
                style={{width: 40, height: 40}}
                source={theme ? ICONS.chainLight : ICONS.chainDark}
              />
            </View>
            <View>
              <Image
                style={{width: 40, height: 40}}
                source={theme ? ICONS.LiquidLight : ICONS.LiquidDark}
              />
            </View>
            <View>
              <Image
                style={{width: 40, height: 40}}
                source={theme ? ICONS.qrCodeLight : ICONS.qrCodeDark}
              />
            </View>
          </View>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },

  optionContainer: {
    height: 'auto',
    width: '95%',
    padding: 15,
    borderRadius: 8,
    ...CENTER,
    marginTop: 20,
  },
  icon: {width: 40, height: 40},
});
