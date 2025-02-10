import {StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import {BITCOIN_SATS_ICON, CENTER, SIZES} from '../../constants';
import GetThemeColors from '../../hooks/themeColors';
import {useGlobalContextProvider} from '../../../context-store/context';
import formatBalanceAmount from '../formatNumber';
import ThemeText from './textTheme';
import {formatCurrency} from '../formatCurrency';
import {useState} from 'react';

export default function FormattedBalanceInput({
  amountValue = 0,
  containerFunction,
  inputDenomination,
  customTextInputContainerStyles,
  customTextInputStyles,
  activeOpacity = 0.2,
}) {
  const {masterInfoObject, nodeInformation} = useGlobalContextProvider();
  const currencyInfo = formatCurrency({
    amount: 0,
    code: nodeInformation?.fiatStats.coin || 'USD',
  });
  console.log(currencyInfo[2]);
  const [labelWidth, setLabelWidth] = useState(0);
  const {textColor} = GetThemeColors();

  const showSats =
    inputDenomination === 'sats' || inputDenomination === 'hiddden';
  console.log(showSats);
  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={() => {
        if (!containerFunction) return;
        containerFunction();
        return;
      }}
      style={[
        styles.textInputContainer,
        {
          opacity: !amountValue ? 0.5 : 1,
          ...customTextInputContainerStyles,
        },
      ]}>
      {/* TextInput stays perfectly centered */}
      <TextInput
        onLayout={event => {
          const {width} = event.nativeEvent.layout;
          setLabelWidth(width);
        }}
        style={{
          color: textColor,
          ...styles.textInput,
          ...customTextInputStyles,
        }}
        value={formatBalanceAmount(amountValue)}
        readOnly={true}
      />

      <View style={{...styles.labelContainer, right: labelWidth}}>
        {masterInfoObject.satDisplay === 'symbol' && showSats && (
          <ThemeText styles={styles.satText} content={BITCOIN_SATS_ICON} />
        )}
        {!showSats && (
          <ThemeText styles={styles.satText} content={currencyInfo[2]} />
        )}
      </View>

      {/* Sats label if needed */}
      {showSats && masterInfoObject.satDisplay !== 'symbol' && (
        <ThemeText
          content={`${' sats'}`}
          styles={{fontSize: 50, includeFontPadding: false}}
        />
      )}
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'auto', // Full width to center the number
    position: 'relative',
    ...CENTER,
  },

  textInput: {
    textAlign: 'center', // Ensures text is centered within the input
    fontSize: 50,
    maxWidth: '70%',
    includeFontPadding: false,
    pointerEvents: 'none',
  },

  labelContainer: {
    position: 'absolute',
    top: 5,
  },

  satText: {
    fontSize: SIZES.xLarge,
    includeFontPadding: false,
  },
});
