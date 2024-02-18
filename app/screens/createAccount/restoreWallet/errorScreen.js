import {
  KeyboardAvoidingView,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {BTN, CENTER, COLORS, FONT, SIZES} from '../../../constants';
import {useNavigation} from '@react-navigation/native';

export default function RestoreWalletError(props) {
  const {reason, type} = props.route.params;
  const navigate = useNavigation();

  return (
    <View style={styles.globalContainer}>
      <SafeAreaView style={styles.innerContainer}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorHeader}>{reason}</Text>

          <TouchableOpacity
            onPress={() => navigate.goBack()}
            style={[
              BTN,
              {
                backgroundColor: COLORS.primary,
                width: 100,
                height: 35,
                marginTop: 30,
              },
              CENTER,
            ]}>
            <Text style={styles.BTNText}>Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
    backgroundColor: COLORS.opaicityGray,
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    width: '90%',
    height: 'auto',
    backgroundColor: COLORS.lightModeBackground,
    padding: 15,
    borderRadius: 8,
  },
  errorHeader: {
    fontSize: SIZES.large,
    fontFamily: FONT.Title_Bold,
    textAlign: 'center',
    color: COLORS.lightModeText,
  },
  BTNText: {
    fontSize: SIZES.large,
    fontFamily: FONT.Other_Regular,
    color: COLORS.background,
  },
});
