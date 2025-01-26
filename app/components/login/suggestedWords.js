import {Wordlists} from '@dreson4/react-native-quick-bip39';
import {COLORS, SIZES} from '../../constants';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {useGlobalContextProvider} from '../../../context-store/context';
import {ThemeText} from '../../functions/CustomElements';

export default function SuggestedWordContainer({
  inputedKey,
  selectedKey,
  setInputedKey,
  keyRefs,
}) {
  const {theme} = useGlobalContextProvider();
  const searchingWord = inputedKey[`key${selectedKey}`] || '';
  const suggestedWordElements = Wordlists.en
    .filter(word => word.toLowerCase().startsWith(searchingWord.toLowerCase()))
    .map(word => {
      return (
        <TouchableOpacity
          style={{
            minHeight: 60,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => {
            setInputedKey(prev => ({...prev, [`key${selectedKey}`]: word}));
            if (selectedKey === 12) {
              keyRefs.current[12].blur();
              return;
            }

            keyRefs.current[selectedKey + 1].focus();
          }}
          key={word}>
          <ThemeText
            CustomNumberOfLines={1}
            styles={{
              textTransform: 'capitalize',
              fontSize: SIZES.large,
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
            }}
            content={word}
          />
        </TouchableOpacity>
      );
    });

  return (
    <View
      style={{
        backgroundColor: theme
          ? COLORS.darkModeBackgroundOffset
          : COLORS.lightModeBackgroundOffset,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
      }}>
      {suggestedWordElements.length >= 3 ? (
        <>
          <View style={{borderRightWidth: 1, ...styles.wordContainer}}>
            {suggestedWordElements[0]}
          </View>
          <View style={{borderRightWidth: 1, ...styles.wordContainer}}>
            {suggestedWordElements[1]}
          </View>
          <View style={styles.wordContainer}>{suggestedWordElements[2]}</View>
        </>
      ) : suggestedWordElements.length === 2 ? (
        <>
          <View style={{borderRightWidth: 1, ...styles.wordContainer}}>
            {suggestedWordElements[0]}
          </View>
          <View style={{...styles.wordContainer}}>
            {suggestedWordElements[1]}
          </View>
        </>
      ) : (
        <View style={{...styles.wordContainer}}>
          {suggestedWordElements[0]}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wordContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
