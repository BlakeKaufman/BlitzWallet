import {Platform, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {Back_BTN, Continue_BTN} from '../../../components/login';
import {Background, COLORS, FONT, SIZES} from '../../../constants';

export default function SecuityOption({navigation: {navigate}}) {
  return (
    <View style={Background}>
      <SafeAreaView
        style={[
          styles.global_container,
          {paddingBottom: Platform.OS === 'ios' ? 0 : 15},
        ]}>
        <Back_BTN navigation={navigate} destination="DisclaimerPage" />
        <View style={styles.container}>
          <Text style={styles.header}>
            First, Let's create your recovery phrase
          </Text>
          <Text style={styles.subHeader}>
            A recovery phrase is a series of 12 words in a specific order. This
            word combination is unique to your wallet. Make sure to have a pen
            and paper ready so you can write it down.
          </Text>
          <Continue_BTN
            navigation={navigate}
            text="Continue"
            destination="GenerateKey"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  global_container: {
    flex: 1,
  },
  container: {
    width: '90%',
    flex: 1,
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 20,
    justifyContent: 'center',
  },

  header: {
    maxWidth: 330,
    fontSize: SIZES.xLarge,
    fontFamily: FONT.Title_Bold,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.lightModeText,
  },
  subHeader: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Descriptoin_Regular,
    textAlign: 'center',

    color: COLORS.lightModeText,
  },
});
