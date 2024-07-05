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
import {useState} from 'react';
import {GlobalThemeView} from '../../../../functions/CustomElements';
import {WINDOWWIDTH} from '../../../../constants/theme';

export default function EditReceivePaymentInformation(props) {
  const navigate = useNavigation();
  const {theme, nodeInformation, masterInfoObject} = useGlobalContextProvider();
  const [amountValue, setAmountValue] = useState(null);
  const [descriptionValue, setDescriptionValue] = useState('');
  const updatePaymentAmount = props.route.params.setSendingAmount;
  const updatePaymentDescription = props.route.params.setPaymentDescription;
  return (
    <GlobalThemeView>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}>
        <KeyboardAvoidingView
          style={{flex: 1, alignItems: 'center'}}
          behavior={Platform.OS === 'ios' ? 'padding' : null}>
          <View
            style={{
              flex: 1,
              width: WINDOWWIDTH,
            }}>
            <TouchableOpacity
              onPress={() => {
                navigate.goBack();
              }}>
              <Image
                source={ICONS.smallArrowLeft}
                style={{width: 30, height: 30, marginRight: 'auto'}}
              />
            </TouchableOpacity>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{flex: 1, justifyContent: 'center'}}>
              <View style={{marginBottom: 5}}>
                <Text
                  style={[
                    styles.headerText,
                    {
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                      marginTop: 'auto',
                    },
                  ]}>
                  Amount
                </Text>
              </View>
              <View
                style={[
                  styles.textInputContainer,
                  {
                    backgroundColor: theme
                      ? COLORS.darkModeBackgroundOffset
                      : COLORS.lightModeBackgroundOffset,

                    padding: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    marginBottom: 50,
                  },
                ]}>
                <TextInput
                  placeholder="0"
                  placeholderTextColor={
                    theme ? COLORS.darkModeText : COLORS.lightModeText
                  }
                  keyboardType="decimal-pad"
                  value={
                    amountValue === null || amountValue === 0 ? '' : amountValue
                  }
                  onChangeText={e => {
                    if (isNaN(e)) return;
                    setAmountValue(e);
                  }}
                  style={[
                    styles.memoInput,
                    {
                      width: 'auto',
                      maxWidth: '70%',
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                      includeFontPadding: false,
                      padding: 0,
                      margin: 0,
                    },
                  ]}
                />
                <Text
                  style={[
                    {
                      fontFamily: FONT.Descriptoin_Regular,
                      fontSize: SIZES.xLarge,
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                      marginLeft: 5,
                      includeFontPadding: false,
                    },
                  ]}>
                  {masterInfoObject.userBalanceDenomination === 'sats' ||
                  masterInfoObject.userBalanceDenomination === 'hidden'
                    ? 'sats'
                    : nodeInformation.fiatStats.coin}
                </Text>
              </View>

              <View>
                <Text
                  style={[
                    styles.headerText,
                    {
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    },
                  ]}>
                  Memo
                </Text>
              </View>

              <View
                style={[
                  styles.textInputContainer,
                  {
                    backgroundColor: theme
                      ? COLORS.darkModeBackgroundOffset
                      : COLORS.lightModeBackgroundOffset,
                    height: 145,
                    padding: 10,
                    borderRadius: 8,
                  },
                ]}>
                <TextInput
                  placeholder="Description"
                  placeholderTextColor={
                    theme ? COLORS.darkModeText : COLORS.lightModeText
                  }
                  onChangeText={value => setDescriptionValue(value)}
                  editable
                  multiline
                  textAlignVertical="top"
                  numberOfLines={4}
                  maxLength={150}
                  lineBreakStrategyIOS="standard"
                  value={descriptionValue}
                  style={[
                    styles.memoInput,
                    {
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                      fontSize: SIZES.medium,
                      height: 'auto',
                      width: 'auto',
                    },
                  ]}
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={handleSubmit}
              style={[
                styles.button,
                {
                  backgroundColor: theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                },
              ]}>
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: theme ? COLORS.lightModeText : COLORS.darkModeText,
                  },
                ]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </GlobalThemeView>
  );

  function handleSubmit() {
    if (Number(amountValue)) updatePaymentAmount(Number(amountValue));
    else
      updatePaymentAmount(
        masterInfoObject.userBalanceDenomination === 'sats' ||
          masterInfoObject.userBalanceDenomination === 'hidden'
          ? 1
          : (nodeInformation.fiatStats.value / SATSPERBITCOIN) * 1,
      );
    if (descriptionValue) updatePaymentDescription(descriptionValue);
    else updatePaymentDescription('');

    navigate.goBack();
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },

  headerText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.xLarge,
    textAlign: 'center',
  },
  amountDenomination: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
    textAlign: 'center',
  },

  textInputContainer: {
    width: '95%',
    margin: 0,
    ...CENTER,
  },
  memoInput: {
    width: '100%',
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.xLarge,
  },

  button: {
    width: 120,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    ...SHADOWS.small,
    ...CENTER,
    marginBottom: 0,
    marginTop: 'auto',
  },
  buttonText: {
    fontFamily: FONT.Other_Regular,
    fontSize: SIZES.large,
  },
});
