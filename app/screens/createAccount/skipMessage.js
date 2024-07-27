import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {COLORS, ICONS, SIZES} from '../../constants';
import {BlurView} from '@react-native-community/blur';
import {ThemeText} from '../../functions/CustomElements';
import CustomButton from '../../functions/CustomElements/button';
import {useNavigation} from '@react-navigation/native';
import {backArrow} from '../../constants/styles';

export default function SkipCreateAccountPathMessage() {
  const navigate = useNavigation();
  return (
    <View style={styles.container}>
      <BlurView
        blurType="light" // Options: 'xlight', 'light', 'dark'
        blurAmount={3}
        style={styles.absolute}
      />
      <View style={styles.contentContainer}>
        <TouchableOpacity
          onPress={navigate.goBack}
          style={{marginLeft: 'auto', marginBottom: 10}}>
          <Image style={[backArrow]} source={ICONS.xSmallIcon} />
        </TouchableOpacity>

        <ThemeText
          styles={{marginBottom: 20, textAlign: 'center'}}
          content={'We recommend that you write down your seed phrase'}
        />
        <ThemeText
          styles={{marginBottom: 30, textAlign: 'center'}}
          content={
            'If you do not have your seed phrase written down you risk losing your money.'
          }
        />
        <CustomButton
          buttonStyles={{
            width: 'auto',
            backgroundColor: COLORS.primary,
          }}
          textStyles={{
            paddingVertical: 5,
            // fontSize: SIZES.large,
            color: COLORS.darkModeText,
          }}
          textContent={'I understand'}
          actionFunction={() =>
            navigate.navigate('PinSetup', {isInitialLoad: true})
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  contentContainer: {
    width: '70%',
    backgroundColor: COLORS.darkModeText,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
});
