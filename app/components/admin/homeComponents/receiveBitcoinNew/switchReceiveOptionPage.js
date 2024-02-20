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
          style={{marginRight: 'auto'}}
          onPress={() => {
            navigate.goBack();
          }}>
          <Image
            source={ICONS.leftCheveronIcon}
            style={{width: 30, height: 30}}
          />
        </TouchableOpacity>

        <View
          style={[
            styles.optionContainer,
            {
              backgroundColor: theme
                ? COLORS.darkModeBackgroundOffset
                : COLORS.lightModeBackgroundOffset,
            },
          ]}>
          <TouchableOpacity
            onPress={() => {
              handleClick('Lightning');
            }}>
            <View
              style={[
                styles.optionItemContainer,
                {
                  backgroundColor: theme
                    ? COLORS.darkModeBackground
                    : COLORS.lightModeBackground,
                },
              ]}>
              <Image
                style={{width: 40, height: 60, marginRight: 10}}
                source={
                  theme ? ICONS.lightningBoltLight : ICONS.lightningBoltDark
                }
              />
              <Text
                style={[
                  styles.optionItemText,
                  {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                ]}>
                Lightning payments are better for small payments
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              handleClick('Bitcoin');
            }}>
            <View
              style={[
                styles.optionItemContainer,
                {
                  backgroundColor: theme
                    ? COLORS.darkModeBackground
                    : COLORS.lightModeBackground,
                },
              ]}>
              <Image
                style={{width: 40, height: 40, marginRight: 10}}
                source={theme ? ICONS.chainLight : ICONS.chainDark}
              />
              <Text
                style={[
                  styles.optionItemText,
                  {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                ]}>
                On-chain payments are better for larger payments
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              handleClick('Liquid');
            }}>
            <View
              style={[
                styles.optionItemContainer,
                {
                  backgroundColor: theme
                    ? COLORS.darkModeBackground
                    : COLORS.lightModeBackground,
                },
              ]}>
              <Image
                style={{width: 40, height: 40, marginRight: 10}}
                source={theme ? ICONS.LiquidLight : ICONS.LiquidDark}
              />
              <Text
                style={[
                  styles.optionItemText,
                  {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                ]}>
                Liquid Network
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              handleClick('Unified QR');
            }}>
            <View
              style={[
                styles.optionItemContainer,
                {
                  backgroundColor: theme
                    ? COLORS.darkModeBackground
                    : COLORS.lightModeBackground,
                  marginBottom: 0,
                },
              ]}>
              <Image
                style={{width: 40, height: 40, marginRight: 10}}
                source={theme ? ICONS.qrCodeLight : ICONS.qrCodeDark}
              />

              <Text
                style={[
                  styles.optionItemText,
                  {
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  },
                ]}>
                Unified QR code | Bitcoin and Lightning address combined
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );

  function handleClick(selectedOption) {
    setSelectedRecieveOption(selectedOption);
    navigate.goBack();
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },

  optionContainer: {
    height: 'auto',
    width: '95%',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 8,
    ...CENTER,
    marginTop: 20,
  },
  icon: {width: 40, height: 40},
  optionItemContainer: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 90,
  },
  optionItemText: {
    width: '80%',
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
  },
});
