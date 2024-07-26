import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TextInput,
} from 'react-native';
import {CENTER, COLORS, FONT, SIZES} from '../../constants';
import {useGlobalContextProvider} from '../../../context-store/context';
import {ThemeText} from '../../functions/CustomElements';

export function KeyContainer(props) {
  const {theme} = useGlobalContextProvider();
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
        <View
          key={keys[0][0]}
          style={{
            ...styles.seedItem,
            paddingVertical: Platform.OS === 'ios' ? 10 : 0,
            backgroundColor: theme
              ? COLORS.darkModeBackgroundOffset
              : COLORS.darkModeText,
          }}>
          <ThemeText
            styles={{...styles.numberText}}
            content={`${keys[0][1]}.`}
          />

          <TextInput
            readOnly={true}
            value={keys[0][0]}
            cursorColor={COLORS.lightModeText}
            style={{...styles.textInputStyle, color: COLORS.lightModeText}}
          />
        </View>
        <View
          key={keys[1][0]}
          style={{
            ...styles.seedItem,
            paddingVertical: Platform.OS === 'ios' ? 10 : 0,
            backgroundColor: theme
              ? COLORS.darkModeBackgroundOffset
              : COLORS.darkModeText,
          }}>
          <ThemeText
            styles={{...styles.numberText}}
            content={`${keys[1][1]}.`}
          />

          <TextInput
            readOnly={true}
            value={keys[1][0]}
            cursorColor={COLORS.lightModeText}
            style={{...styles.textInputStyle, color: COLORS.lightModeText}}
          />
        </View>
        {/* <View style={styles.key}>
          <Text style={styles.number}>{keys[1][1]}</Text>
          <ScrollView style={styles.scrollView} horizontal>
            <Text style={styles.text}>{keys[1][0]}</Text>
          </ScrollView>
        </View> */}
      </View>
    );
  });

  return keyElements;
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
    marginBottom: 10,
  },
  key: {
    // width: '47%',
    // height: 50,
    // display: 'flex',
    // flexDirection: 'row',

    // alignItems: 'center',
    // justifyContent: 'space-between',

    // borderRadius: 25,
    // overflow: 'hidden',

    // marginBottom: 15,

    width: '48%',

    // borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',

    // paddingBottom: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },

  number: {
    fontSize: SIZES.large,
    marginRight: 10,
    // width: '30%',
    // height: '100%',
    // fontSize: SIZES.large,
    // color: COLORS.white,
    // backgroundColor: COLORS.primary,
    // textAlign: 'center',
    // lineHeight: 50,
    // fontFamily: FONT.Other_Regular,
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
  globalContainer: {
    flex: 1,
    backgroundColor: COLORS.lightModeBackground,
  },

  headerText: {
    width: '95%',
    fontSize: SIZES.xLarge,
    textAlign: 'center',
    marginBottom: 30,
    ...CENTER,
  },
  contentContainer: {
    flex: 1,
    width: '90%',
    ...CENTER,
  },
  seedRow: {
    width: '100%',

    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  seedItem: {
    width: '48%',

    // borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',

    // paddingBottom: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  numberText: {
    fontSize: SIZES.large,
    marginRight: 10,
  },
  textInputStyle: {
    width: '90%',
    fontSize: SIZES.large,
  },
  continueBTN: {
    fontSize: SIZES.large,
    fontFamily: FONT.Other_Regular,
    color: COLORS.background,
  },
});
