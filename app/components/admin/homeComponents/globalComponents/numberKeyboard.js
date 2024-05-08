import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useGlobalContextProvider} from '../../../../../context-store/context';

import {
  CENTER,
  COLORS,
  FONT,
  ICONS,
  SHADOWS,
  SIZES,
} from '../../../../constants';
import {
  Image,
  Text,
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';

const KEYBOARD = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'c', 0, '<--'];

export default function NumberKeyboard({
  route: {
    params: {setAmountValue},
  },
}) {
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();
  //   console.log(props);
  const {theme} = useGlobalContextProvider();

  const formattedKeyboardElements = KEYBOARD.map(key => {
    return (
      <TouchableOpacity
        onPress={() => {
          handleClick(key);
        }}
        style={styles.numberContainer}>
        <Text
          style={[
            styles.number,
            {
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
            },
          ]}>
          {key}
        </Text>
      </TouchableOpacity>
    );
  });

  return (
    <TouchableWithoutFeedback onPress={() => navigate.goBack()}>
      <View style={{flex: 1, justifyContent: 'flex-end'}}>
        <View
          style={{
            height: 320,
            width: '100%',
            backgroundColor: theme
              ? COLORS.darkModeBackground
              : COLORS.lightModeBackground,

            borderTopColor: theme
              ? COLORS.darkModeBackgroundOffset
              : COLORS.lightModeBackgroundOffset,
            borderTopWidth: 10,

            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,

            borderRadius: 10,

            paddingBottom: insets.bottom,
          }}>
          <View
            style={[
              styles.topBar,
              {
                backgroundColor: theme
                  ? COLORS.darkModeBackgroundOffset
                  : COLORS.lightModeBackgroundOffset,
                ...CENTER,
              },
            ]}></View>
          <View style={{flex: 1, paddingBottom: 20, width: '80%', ...CENTER}}>
            <View style={{width: '100%', flexDirection: 'row'}}>
              {formattedKeyboardElements[0]}
              {formattedKeyboardElements[1]}
              {formattedKeyboardElements[2]}
            </View>
            <View style={{width: '100%', flexDirection: 'row'}}>
              {formattedKeyboardElements[3]}
              {formattedKeyboardElements[4]}
              {formattedKeyboardElements[5]}
            </View>
            <View style={{width: '100%', flexDirection: 'row'}}>
              {formattedKeyboardElements[6]}
              {formattedKeyboardElements[7]}
              {formattedKeyboardElements[8]}
            </View>
            <View style={{width: '100%', flexDirection: 'row'}}>
              {formattedKeyboardElements[9]}
              {formattedKeyboardElements[10]}
              {formattedKeyboardElements[11]}
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );

  function handleClick(key) {
    // console.log(key);
    if (key === '<--') {
      console.log('DELETE');
      setAmountValue(prev => {
        console.log(prev.length, 'RPEV VALUE');
        return prev.slice(0, prev.length - 1);
      });
    } else if (key === 'c') {
      console.log('CLEAR');
      setAmountValue('');
    } else {
      setAmountValue(prev => `${prev + key}`);
      console.log('VALID NUMBER');
    }
  }
}

const styles = StyleSheet.create({
  topBar: {
    width: 120,
    height: 8,
    marginTop: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  numberContainer: {
    width: '33%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.xLarge,
    paddingVertical: 10,
  },
});
