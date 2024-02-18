import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Image,
  useColorScheme,
} from 'react-native';
import {FONT, SIZES, CENTER, ICONS, COLORS} from '../../../../constants';

export default function TopBar(props) {
  return (
    <View style={styles.topbar}>
      <TouchableOpacity activeOpacity={1} onPress={props.clear}>
        <Image
          source={ICONS.leftCheveronIcon}
          style={{width: 30, height: 30}}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <Text
        style={[
          styles.navText,
          {
            color: props.theme ? COLORS.darkModeText : COLORS.lightModeText,
          },
        ]}>
        Receive
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navText: {
    fontFamily: FONT.Title_Bold,
    fontSize: SIZES.medium,
    ...CENTER,
    transform: [{translateX: -15}],
  },
});
