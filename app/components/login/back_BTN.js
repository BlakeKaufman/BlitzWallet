import {TouchableOpacity, View, Text, StyleSheet, Image} from 'react-native';
import {SIZES, COLORS, ICONS, FONT} from '../../constants';

export default function Back_BTN(props) {
  return (
    <TouchableOpacity
      onPress={() => props.navigation(props.destination)}
      style={styles.container}>
      <Image
        source={ICONS.leftCheveronIcon}
        style={{width: 30, height: 30, marginRight: 4}}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    marginLeft: 5,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: SIZES.large,
    fontFamily: FONT.Other_Medium,
  },
});
