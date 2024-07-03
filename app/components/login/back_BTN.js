import {TouchableOpacity, View, Text, StyleSheet, Image} from 'react-native';
import {SIZES, COLORS, ICONS, FONT, CENTER} from '../../constants';

export default function Back_BTN(props) {
  return (
    <TouchableOpacity
      onPress={() => props.navigation(props.destination)}
      style={styles.container}>
      <Image
        source={ICONS.smallArrowLeft}
        style={{width: 30, height: 30, marginRight: 4}}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '95%',
    backgroundColor: 'transparent',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    ...CENTER,
  },
  text: {
    fontSize: SIZES.large,
    fontFamily: FONT.Other_Medium,
  },
});
