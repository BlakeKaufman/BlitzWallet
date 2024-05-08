import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useGlobalContextProvider} from '../../../../../context-store/context';

import {
  CENTER,
  COLORS,
  FONT,
  ICONS,
  SHADOWS,
  SIZES,
} from '../../../../constants';
import {
  Image,
  Text,
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import {useState} from 'react';

const KEYBOARD = [
  'q',
  'w',
  'e',
  'r',
  't',
  'y',
  'u',
  'i',
  'o',
  'p',
  'a',
  's',
  'd',
  'f',
  'g',
  'h',
  'j',
  'k',
  'l',
  'z',
  'x',
  'c',
  'v',
  'b',
  'n',
  'm',
  'C',
  '<--',
  'space',
];

export default function LetterKeyboard({
  route: {
    params: {setDescriptionValue, descriptionValue},
  },
}) {
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();
  //   console.log(props);
  const {theme} = useGlobalContextProvider();
  const dimensions = useWindowDimensions();
  const [tempDescription, setTempDescription] = useState(descriptionValue);
  const [isCapitalized, setIsCapitalized] = useState(false);

  const formattedKeyboardElements = KEYBOARD.map((key, index) => {
    return (
      <TouchableOpacity
        onPress={() => {
          handleClick(key);
        }}
        style={[
          styles.numberContainer,
          {
            backgroundColor: theme
              ? COLORS.darkModeBackgroundOffset
              : COLORS.lightModeBackgroundOffset,
            borderRadius: 9,
            marginHorizontal:
              (dimensions.width / 10 - dimensions.width / 12) / 2,
            marginVertical: 5,
            width:
              key != 'space'
                ? key === 'C' || key === '<--'
                  ? dimensions.width / 10
                  : dimensions.width / 12
                : '50%',

            marginRight: key === 'C' ? 'auto' : null,
            marginLeft: key === '<--' ? 'auto' : null,
          },
        ]}>
        {key === 'C' && (
          <Image
            style={{width: 20, height: 20, transform: [{rotate: '-90deg'}]}}
            source={
              theme
                ? isCapitalized
                  ? ICONS.fillArrowLight
                  : ICONS.noFillArrow
                : isCapitalized
                ? ICONS.fillArrow
                : ICONS.noFillArrow
            }
          />
        )}
        {key === '<--' && (
          <Image
            style={{width: 20, height: 20, transform: [{rotate: '-180deg'}]}}
            source={theme ? ICONS.fillArrowLight : ICONS.fillArrow}
          />
        )}
        {key != 'C' && key != '<--' && (
          <Text
            allowFontScaling={false}
            style={[
              styles.number,

              {
                //   width: index != 26 ? dimensions.width / 11 : null,
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                marginLeft: key === 10 ? 'auto' : 0,
              },
            ]}>
            {isCapitalized && key != 'space' ? key.toUpperCase() : key}
          </Text>
        )}
      </TouchableOpacity>
    );
  });

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        setDescriptionValue(tempDescription);
        setTempDescription('');
        navigate.goBack();
      }}>
      <View
        style={{
          flex: 1,
          //   justifyContent: 'flex-end',
          backgroundColor: COLORS.opaicityGray,
        }}>
        <View
          style={{
            marginBottom: 20,
            marginTop: 'auto',
            width: '90%',
            ...CENTER,
          }}>
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
              //   ref={descriptionRef}
              placeholder="Description"
              placeholderTextColor={
                theme ? COLORS.darkModeText : COLORS.lightModeText
              }
              //   onChangeText={value => setDescriptionValue(value)}
              editable={false}
              selectTextOnFocus={false}
              multiline
              textAlignVertical="top"
              numberOfLines={4}
              maxLength={150}
              lineBreakStrategyIOS="standard"
              value={tempDescription}
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
        </View>
        <View
          style={{
            height: 290,
            width: '100%',
            backgroundColor: theme
              ? COLORS.darkModeBackground
              : COLORS.lightModeBackground,

            borderTopColor: theme
              ? COLORS.darkModeBackgroundOffset
              : COLORS.lightModeBackgroundOffset,
            borderTopWidth: 10,

            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,

            // paddingBottom: insets.bottom,
          }}>
          <View
            style={[
              styles.topBar,
              {
                backgroundColor: theme
                  ? COLORS.darkModeBackgroundOffset
                  : COLORS.lightModeBackgroundOffset,
                ...CENTER,
              },
            ]}></View>
          <TouchableOpacity style={{flex: 1}} activeOpacity={1}>
            <View
              style={{
                flex: 1,
                paddingBottom: insets.bottom === 0 ? 20 : insets.bottom,
                width: '100%',
                justifyContent: 'flex-end',
                //   backgroundColor: 'green',
                //   ...CENTER,
                paddingHorizontal: 2,
              }}>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}>
                {formattedKeyboardElements[0]}
                {formattedKeyboardElements[1]}
                {formattedKeyboardElements[2]}
                {formattedKeyboardElements[3]}
                {formattedKeyboardElements[4]}
                {formattedKeyboardElements[5]}
                {formattedKeyboardElements[6]}
                {formattedKeyboardElements[7]}
                {formattedKeyboardElements[8]}
                {formattedKeyboardElements[9]}
              </View>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  justifyContent: 'center',
                }}>
                {formattedKeyboardElements[10]}
                {formattedKeyboardElements[11]}
                {formattedKeyboardElements[12]}
                {formattedKeyboardElements[13]}
                {formattedKeyboardElements[14]}
                {formattedKeyboardElements[15]}
                {formattedKeyboardElements[16]}
                {formattedKeyboardElements[17]}
                {formattedKeyboardElements[18]}
              </View>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  justifyContent: 'center',
                }}>
                {formattedKeyboardElements[26]}
                {formattedKeyboardElements[19]}
                {formattedKeyboardElements[20]}
                {formattedKeyboardElements[21]}
                {formattedKeyboardElements[22]}
                {formattedKeyboardElements[23]}
                {formattedKeyboardElements[24]}
                {formattedKeyboardElements[25]}
                {formattedKeyboardElements[27]}
              </View>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}>
                {formattedKeyboardElements[28]}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );

  function handleClick(key) {
    console.log(key);
    if (key != 'C' && key != '<--' && key != 'space')
      setTempDescription(prev => {
        let formattedKey = isCapitalized ? key.toUpperCase() : key;

        return prev + formattedKey;
      });
    else if (key === 'space') {
      console.log('SPACE IS RUNNNING');
      setTempDescription(prev => prev + ' ');
    } else if (key === '<--')
      setTempDescription(prev => prev.slice(0, prev.length - 1));
    else setIsCapitalized(prev => !prev);
  }
}

const styles = StyleSheet.create({
  topBar: {
    width: 120,
    height: 8,
    marginTop: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  numberContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.large,
    paddingVertical: 5,
    // paddingHorizontal: 10,
  },
});
