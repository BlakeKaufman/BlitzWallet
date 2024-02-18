import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {COLORS, FONT, SIZES} from '../../constants';

export function KeyContainer(props) {
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
          <Text style={styles.number}>{keys[0][1]}</Text>
          <ScrollView style={styles.scrollView} horizontal>
            <Text style={styles.text}>{keys[0][0]}</Text>
          </ScrollView>
        </View>
        <View style={styles.key}>
          <Text style={styles.number}>{keys[1][1]}</Text>
          <ScrollView style={styles.scrollView} horizontal>
            <Text style={styles.text}>{keys[1][0]}</Text>
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
    width: '69%',
    height: '100%',
    backgroundColor: COLORS.primary,

    marginLeft: 2,
  },
  text: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    fontFamily: FONT.Descriptoin_Regular,

    lineHeight: 50,
    paddingLeft: 5,
  },
});
