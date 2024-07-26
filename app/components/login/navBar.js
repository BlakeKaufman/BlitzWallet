import {useNavigation} from '@react-navigation/native';
import {StyleSheet, View} from 'react-native';
import Back_BTN from './back_BTN';
import CustomButton from '../../functions/CustomElements/button';
import {SIZES} from '../../constants';

export default function LoginNavbar({destination}) {
  const navigate = useNavigation();
  return (
    <View style={styles.container}>
      <Back_BTN navigation={navigate.navigate} destination={destination} />
      <CustomButton
        buttonStyles={{
          width: 'auto',
        }}
        textStyles={{
          paddingVertical: 5,
          fontSize: SIZES.large,
        }}
        textContent={'Skip all'}
        // actionFunction={() => }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
