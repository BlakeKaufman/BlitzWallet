import {Linking, StyleSheet, useWindowDimensions} from 'react-native';
import {GlobalThemeView, ThemeText} from '../functions/CustomElements';
import LottieView from 'lottie-react-native';
import CustomButton from '../functions/CustomElements/button';
import {SIZES} from '../constants';

export default function EnableGoogleServices() {
  return (
    <GlobalThemeView styles={styles.container} useStandardWidth={true}>
      <LottieView
        source={require('../assets/errorTxAnimation.json')}
        autoPlay
        speed={1}
        loop={false}
        style={{
          width: useWindowDimensions().width / 1.5,
          height: useWindowDimensions().width / 1.5,
        }}
      />
      <ThemeText
        styles={styles.text}
        content={
          'Blitz Wallet requires Google Play Services to function properly. Please enable Google Play Services on your device to continue.'
        }
      />
      <CustomButton
        buttonStyles={styles.buttonStyle}
        textContent={'Open settings'}
        actionFunction={() => {
          Linking.openSettings();
        }}
      />
    </GlobalThemeView>
  );
}
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  buttonStyle: {
    marginTop: 'auto',
    width: 'auto',
  },
  text: {
    textAlign: 'center',
    fontSize: SIZES.large,
  },
});
