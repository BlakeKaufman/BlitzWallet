import {useNavigation} from '@react-navigation/native';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {COLORS} from '../../constants';
import icons from '../../constants/icons';
import {sendSpontaneousPayment} from '@breeztech/react-native-breez-sdk';

export default function ContactsPage(props) {
  const isDarkMode = props.route.params?.isDarkMode;
  const navigate = useNavigation();

  async function sendp() {
    console.log('clicked');
    try {
      const nodeId =
        '029379fcb7a0e39a9f7b196ae5a4a533309bed0b0fb0ae271e5e1bd65bf45539f8';

      const sendPaymentResponse = await sendSpontaneousPayment({
        nodeId,
        amountMsat: 5000,
      });
      console.log(sendPaymentResponse);
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <View
      style={[
        styles.globalContainer,
        {
          backgroundColor: isDarkMode
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
        },
      ]}>
      <SafeAreaView>
        <TouchableOpacity
          onPress={() => {
            navigate.goBack();
          }}>
          <Image style={styles.backButton} source={icons.xSmallIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={sendp}>
          <Text>Send Payment</Text>
        </TouchableOpacity>
        <Text></Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
  },
});
