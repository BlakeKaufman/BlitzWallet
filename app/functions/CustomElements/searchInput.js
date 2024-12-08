import {StyleSheet, TextInput, View} from 'react-native';
import {CENTER, COLORS, FONT, SIZES} from '../../constants';
import GetThemeColors from '../../hooks/themeColors';
import {useGlobalContextProvider} from '../../../context-store/context';

export default function CustomSearchInput({
  inputText,
  setInputText,
  placeholderText,
  containerStyles,
  textInputStyles,
  buttonComponent,
  keyboardType,
  textInputRef,
  blurOnSubmit,
  onSubmitEditingFunction,
  onFocusFunction,
  onBlurFunction,
  textInputMultiline,
  textAlignVertical,
  maxLength,
  placeholderTextColor,
}) {
  const {theme, darkModeType} = useGlobalContextProvider();
  const {textInputColor, textInputBackground} = GetThemeColors();
  return (
    <>
      <View style={{...styles.inputContainer, ...containerStyles}}>
        <TextInput
          placeholder={placeholderText || ''}
          placeholderTextColor={
            placeholderTextColor != undefined
              ? placeholderTextColor
              : theme && !darkModeType
              ? COLORS.blueDarkmodeTextInputPlaceholder
              : COLORS.opaicityGray
          }
          value={inputText}
          ref={textInputRef}
          onChangeText={setInputText}
          blurOnSubmit={blurOnSubmit != undefined ? blurOnSubmit : true}
          keyboardType={keyboardType || 'default'}
          onSubmitEditing={() => {
            onSubmitEditingFunction && onSubmitEditingFunction();
          }}
          onFocus={() => {
            onFocusFunction && onFocusFunction();
          }}
          onBlur={() => {
            onBlurFunction && onBlurFunction();
          }}
          multiline={
            textInputMultiline != undefined ? textInputMultiline : false
          }
          textAlignVertical={
            textAlignVertical != undefined ? textAlignVertical : 'center'
          }
          maxLength={maxLength != undefined ? maxLength : null}
          style={[
            styles.searchInput,
            {
              color: textInputColor,
              backgroundColor: textInputBackground,
              ...textInputStyles,
            },
          ]}
        />
        {buttonComponent && buttonComponent}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    width: '100%',
    ...CENTER,
  },

  searchInput: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Regular,
    includeFontPadding: false,
    ...CENTER,
  },
});
