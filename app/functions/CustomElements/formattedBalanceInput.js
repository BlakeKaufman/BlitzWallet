import {
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {BITCOIN_SATS_ICON, CENTER, SIZES} from '../../constants';
import GetThemeColors from '../../hooks/themeColors';
import {useGlobalContextProvider} from '../../../context-store/context';
import formatBalanceAmount from '../formatNumber';
import ThemeText from './textTheme';
import {formatCurrency} from '../formatCurrency';
import {useMemo, useState} from 'react';
import {useNodeContext} from '../../../context-store/nodeContext';

export default function FormattedBalanceInput({
  amountValue = 0,
  containerFunction,
  inputDenomination,
  customTextInputContainerStyles,
  customTextInputStyles,
  activeOpacity = 0.2,
}) {
  const {masterInfoObject} = useGlobalContextProvider();
  const {nodeInformation, liquidNodeInformation} = useNodeContext();
  const currencyText = nodeInformation?.fiatStats.coin || 'USD';
  const showSymbol = masterInfoObject.satDisplay != 'word';

  const currencyInfo = useMemo(
    () =>
      formatCurrency({
        amount: 0,
        code: currencyText,
      }),
    [currencyText],
  );

  const isSymbolInFront = currencyInfo[3];
  const currencySymbol = currencyInfo[2];
  console.log(currencyInfo);
  const {textColor} = GetThemeColors();

  const showSats =
    inputDenomination === 'sats' || inputDenomination === 'hidden';
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
      {isSymbolInFront && !showSats && showSymbol && (
        <ThemeText styles={styles.satText} content={currencySymbol} />
      )}
      {showSats && showSymbol && (
        <ThemeText styles={styles.satText} content={BITCOIN_SATS_ICON} />
      )}
      {/* TextInput stays perfectly centered */}
      <TextInput
        style={{
          color: textColor,
          ...styles.textInput,
          ...customTextInputStyles,
        }}
        value={formatBalanceAmount(amountValue)}
        readOnly={true}
      />
      {!isSymbolInFront && !showSats && showSymbol && (
        <ThemeText styles={styles.satText} content={currencySymbol} />
      )}
      {!showSymbol && !showSats && (
        <ThemeText styles={styles.satText} content={currencyText} />
      )}

      {/* Sats label if needed */}
      {!showSymbol && showSats && (
        <ThemeText content={`${'sats'}`} styles={styles.satText} />
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
    paddingVertical: 0,
    marginRight: 5,
  },

  labelContainer: {
    position: 'absolute',
    top: 5,
  },

  satText: {
    fontSize: 50,
    includeFontPadding: false,
  },
});
