import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import ThemeText from './textTheme';
import {COLORS, ICONS, SIZES} from '../../constants';
import {backArrow} from '../../constants/styles';
import {useGlobalContextProvider} from '../../../context-store/context';
import {Back_BTN} from '../../components/login';
import KeyForKeyboard from './key';

export default function CustomNumberKeyboard({
  setInputValue,
  frompage,
  showDot,
}) {
  return (
    <View
      style={[
        styles.keyboardContainer,
        {
          marginTop:
            frompage === 'sendContactsPage' ||
            frompage === 'contactsAutomatedPayments' ||
            frompage === 'sendSMSPage'
              ? 0
              : 'auto',
        },
      ]}>
      <View style={styles.keyboard_row}>
        <KeyForKeyboard num={1} addPin={addPin} />
        <KeyForKeyboard num={2} addPin={addPin} />
        <KeyForKeyboard num={3} addPin={addPin} />
      </View>
      <View style={styles.keyboard_row}>
        <KeyForKeyboard num={4} addPin={addPin} />
        <KeyForKeyboard num={5} addPin={addPin} />
        <KeyForKeyboard num={6} addPin={addPin} />
      </View>
      <View style={styles.keyboard_row}>
        <KeyForKeyboard num={7} addPin={addPin} />
        <KeyForKeyboard num={8} addPin={addPin} />
        <KeyForKeyboard num={9} addPin={addPin} />
      </View>
      <View style={styles.keyboard_row}>
        {(showDot || showDot === undefined) && (
          <KeyForKeyboard
            frompage={frompage}
            isDot={true}
            num={'.'}
            addPin={addPin}
          />
        )}
        {!showDot && <KeyForKeyboard num={'C'} addPin={addPin} />}
        <KeyForKeyboard num={0} addPin={addPin} />
        <KeyForKeyboard num={'back'} addPin={addPin} />
      </View>
    </View>
  );
  function addPin(id) {
    console.log(id);
    if (id === null) {
      // if (id === null) {
      setInputValue(prev => {
        return frompage === 'sendingPage'
          ? String(prev / 1000).slice(0, String(prev / 1000).length - 1) * 1000
          : String(prev).slice(0, String(prev).length - 1);
      });
      // } else setInputValue(0);
    } else if (id === 'C') {
      setInputValue('');
    } else {
      setInputValue(prev => {
        console.log(prev);

        if (frompage === 'sendingPage') {
          return (String(prev / 1000) + id) * 1000;
        }

        if (prev?.includes('.') && id === '.') return prev; //making sure only one decimal is in number

        if (prev?.includes('.') && prev.split('.')[1].length > 1) {
          //controling length to max 2 digits after decimal
          return prev;
        }

        return String(prev) + id;
      });
    }
  }
}

const styles = StyleSheet.create({
  keyboardContainer: {
    width: '100%',
    // marginTop: 'auto',
  },
  keyboard_row: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  key: {
    width: '33.33333333333333%',
    height: 80,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: SIZES.xLarge,
  },
});
