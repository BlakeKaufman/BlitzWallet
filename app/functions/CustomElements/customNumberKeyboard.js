import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import ThemeText from './textTheme';
import {ICONS, SIZES} from '../../constants';
import {backArrow} from '../../constants/styles';
import {useGlobalContextProvider} from '../../../context-store/context';

export default function CustomNumberKeyboard({setInputValue}) {
  const {theme} = useGlobalContextProvider();
  return (
    <View style={styles.keyboardContainer}>
      <View style={styles.keyboard_row}>
        <TouchableOpacity onPress={() => addPin(1)} style={styles.key}>
          <ThemeText styles={{...styles.keyText}} content={'1'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => addPin(2)} style={styles.key}>
          <ThemeText styles={{...styles.keyText}} content={'2'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => addPin(3)} style={styles.key}>
          <ThemeText styles={{...styles.keyText}} content={'3'} />
        </TouchableOpacity>
      </View>
      <View style={styles.keyboard_row}>
        <TouchableOpacity onPress={() => addPin(4)} style={styles.key}>
          <ThemeText styles={{...styles.keyText}} content={'4'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => addPin(5)} style={styles.key}>
          <ThemeText styles={{...styles.keyText}} content={'5'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => addPin(6)} style={styles.key}>
          <ThemeText styles={{...styles.keyText}} content={'6'} />
        </TouchableOpacity>
      </View>
      <View style={styles.keyboard_row}>
        <TouchableOpacity onPress={() => addPin(7)} style={styles.key}>
          <ThemeText styles={{...styles.keyText}} content={'7'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => addPin(8)} style={styles.key}>
          <ThemeText styles={{...styles.keyText}} content={'8'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => addPin(9)} style={styles.key}>
          <ThemeText styles={{...styles.keyText}} content={'9'} />
        </TouchableOpacity>
      </View>
      <View style={styles.keyboard_row}>
        <TouchableOpacity onPress={() => addPin('c')} style={styles.key}>
          <ThemeText styles={{...styles.keyText}} content={'C'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => addPin(0)} style={styles.key}>
          <ThemeText styles={{...styles.keyText}} content={'0'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => addPin(null)} style={styles.key}>
          <Image
            style={[backArrow]}
            source={theme ? ICONS.leftCheveronLight : ICONS.leftCheveronDark}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
  function addPin(id) {
    if (typeof id != 'number') {
      if (id === null) {
        setInputValue(prev => {
          return Number(String(prev).slice(0, String(prev).length - 1));
        });
      } else setInputValue(0);
    } else {
      setInputValue(prev => {
        return Number(String(prev) + id);
      });
    }
  }
}

const styles = StyleSheet.create({
  keyboardContainer: {
    width: '100%',
    marginTop: 'auto',
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
