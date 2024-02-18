import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {COLORS, SIZES, FONT} from '../../constants';

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
    return (
      <View style={styles.row} key={id}>
        <View style={styles.key}>
          <Text
            style={
              keys[0][0][1]
                ? keys[0][0][2]
                  ? styles.number_correct
                  : styles.number_wrong
                : styles.number
            }>
            {keys[0][0][3] ? keys[0][0][3] : ' '}
          </Text>
          <ScrollView horizontal style={styles.scrollView}>
            <TouchableOpacity
              onPress={() => props.countGuesses(keys[0][0][0])}
              activeOpacity={1}
              style={styles.opacityContainer}>
              <Text style={styles.text}>{keys[0][0][0]}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        <View style={styles.key}>
          <Text
            style={
              keys[1][0][1]
                ? keys[1][0][2]
                  ? styles.number_correct
                  : styles.number_wrong
                : styles.number
            }>
            {keys[1][0][3] || keys[1][0][3] === 0 ? keys[1][0][3] : ' '}
          </Text>
          <ScrollView horizontal style={styles.scrollView}>
            <TouchableOpacity
              onPress={() => props.countGuesses(keys[1][0][0])}
              activeOpacity={1}
              style={styles.opacityContainer}>
              <Text style={styles.text}>{keys[1][0][0]}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    );
  });

  return <View style={styles.container}>{keyElements}</View>;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxHeight: 500,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
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

  number: {
    width: '30%',
    height: '100%',
    fontSize: SIZES.large,
    color: COLORS.white,
    backgroundColor: COLORS.primary,
    textAlign: 'center',
    lineHeight: 50,
    fontFamily: FONT.Other_Regular,
  },
  scrollView: {
    height: '100%',
    width: '69%',
    backgroundColor: COLORS.primary,
    marginLeft: 2,
  },
  text: {
    height: '100%',
    fontSize: SIZES.large,
    color: COLORS.white,
    textAlign: 'center',
    fontFamily: FONT.Descriptoin_Regular,
  },
  number_correct: {
    width: '30%',
    fontSize: SIZES.large,
    color: COLORS.white,
    backgroundColor: COLORS.gray,
    padding: 13,
    textAlign: 'center',
    backgroundColor: 'green',
  },
  number_wrong: {
    width: '30%',
    fontSize: SIZES.large,
    color: COLORS.white,
    backgroundColor: COLORS.gray,
    padding: 13,
    textAlign: 'center',
    backgroundColor: 'red',
  },
  opacityContainer: {
    width: '100%',
  },
  text: {
    width: '100%',
    fontSize: SIZES.large,
    color: COLORS.white,
    backgroundColor: COLORS.primary,
    padding: 13,
    textAlign: 'center',
  },
});
