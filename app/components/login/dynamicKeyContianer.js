import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import {COLORS, SIZES, FONT} from '../../constants';
import {ThemeText} from '../../functions/CustomElements';
import {Wordlists} from '@dreson4/react-native-quick-bip39';

export function DynamicKeyContainer(props) {
  //   let keyElements = [];
  let groupedKeys = [];
  let tempArr = [];

  props.keys.forEach((element, id) => {
    tempArr.push([element, id + 1]);
    if (tempArr.length == 2) {
      groupedKeys.push(tempArr);
      tempArr = [];
    }
  });

  const keyElements = groupedKeys.map((keys, id) => {
    console.log(keys, id);

    return (
      <View key={id} style={styles.row}>
        <TouchableOpacity
          onPress={() => props.countGuesses(keys[0][0][0])}
          activeOpacity={1}
          style={styles.key}>
          <View
            style={{
              ...styles.numberContainer,
              backgroundColor: keys[0][0][1]
                ? keys[0][0][2]
                  ? COLORS.nostrGreen
                  : COLORS.cancelRed
                : COLORS.primary,
            }}>
            <ThemeText
              styles={{color: COLORS.darkModeText, fontSize: SIZES.large}}
              content={
                keys[0][0][3] || keys[0][0][3] === 0 ? keys[0][0][3] : ' '
              }
            />
          </View>

          <ScrollView
            contentContainerStyle={{alignItems: 'center'}}
            horizontal
            style={styles.scrollView}>
            <ThemeText
              reversed={true}
              styles={{...styles.text}}
              content={keys[0][0][0]}
            />
          </ScrollView>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => props.countGuesses(keys[1][0][0])}
          activeOpacity={1}
          style={styles.key}>
          <View
            style={{
              ...styles.numberContainer,
              backgroundColor: keys[1][0][1]
                ? keys[1][0][2]
                  ? COLORS.nostrGreen
                  : COLORS.cancelRed
                : COLORS.primary,
            }}>
            <ThemeText
              styles={{color: COLORS.darkModeText, fontSize: SIZES.large}}
              content={
                keys[1][0][3] || keys[1][0][3] === 0 ? keys[1][0][3] : ' '
              }
            />
          </View>
          <ScrollView
            contentContainerStyle={{alignItems: 'center'}}
            horizontal
            style={styles.scrollView}>
            <ThemeText
              reversed={true}
              styles={{...styles.text}}
              content={keys[1][0][0]}
            />
          </ScrollView>
        </TouchableOpacity>
      </View>
    );
  });

  return keyElements;
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  key: {
    width: '47%',
    height: 50,
    display: 'flex',
    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'space-between',

    borderRadius: 25,
    overflow: 'hidden',

    marginBottom: 15,
  },
  numberContainer: {
    width: '30%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },

  scrollView: {
    height: '100%',
    width: '69%',
    backgroundColor: COLORS.primary,
    marginLeft: 2,
  },
  text: {
    paddingLeft: 5,
  },
});
