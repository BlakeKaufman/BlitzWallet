import {Wordlists} from '@dreson4/react-native-quick-bip39';
import {COLORS, FONT, SIZES} from '../../constants';
import {Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useGlobalContextProvider} from '../../../context-store/context';
import {ThemeText} from '../../functions/CustomElements';

export default function SuggestedWordContainer({
  currentWord,
  setCurrentWord,
  setSelectedKey,
  selectedKey,
  setKey,
  NUMKEYS,
}) {
  const {theme} = useGlobalContextProvider();
  const suggestedWordElements = Wordlists.en
    .filter(word => word.toLowerCase().startsWith(currentWord.toLowerCase()))
    .map(word => {
      return (
        <TouchableOpacity
          style={{
            width: '100%',
            // flex: 1,
            // borderColor: COLORS.primary,
            // borderWidth: 3,
            // borderRadius: 8,
            // overflow: 'hidden',
            // backgroundColor: 'red',
            alignItems: 'center',
          }}
          onPress={() => {
            setKey(prev => {
              return {...prev, [`key${selectedKey}`]: word};
            });

            if (selectedKey === 12) {
              // setIsKeyboardShowing(false);
              NUMKEYS[11][0].current.blur();
              setCurrentWord('');
              return;
            }
            NUMKEYS[selectedKey][0].current.focus();
            setCurrentWord('');
            setSelectedKey(selectedKey + 1);
          }}
          key={word}>
          <ThemeText
            styles={{
              textTransform: 'capitalize',
              fontSize: SIZES.large,
              paddingVertical: 5,
              paddingHorizontal: 10,
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
        marginTop: 5,
        paddingVertical: 10,
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
