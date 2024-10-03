import {
  Animated,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {COLORS, ICONS, SIZES} from '../../constants';
import {BlurView} from '@react-native-community/blur';
import {ThemeText} from '../../functions/CustomElements';
import CustomButton from '../../functions/CustomElements/button';
import {useNavigation} from '@react-navigation/native';
import {backArrow} from '../../constants/styles';
import {useEffect, useRef, useState} from 'react';

export default function SkipCreateAccountPathMessage() {
  const BlurViewAnimation = useRef(new Animated.Value(0)).current;
  const isInitialLoad = useRef(true);
  const navigate = useNavigation();
  const [goBack, setGoGack] = useState(false);

  useEffect(() => {
    if (isInitialLoad.current) {
      Animated.timing(BlurViewAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      isInitialLoad.current = false;
    }
    if (goBack) {
      Animated.timing(BlurViewAnimation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        navigate.goBack();
      });
    }
  }, [goBack]);

  return (
    <Animated.View style={[styles.absolute, {opacity: BlurViewAnimation}]}>
      <View style={styles.container}>
        <BlurView
          blurType="dark" // Options: 'xlight', 'light', 'dark'
          blurAmount={3}
          style={styles.absolute}
        />

        <View style={styles.contentContainer}>
          <TouchableOpacity
            onPress={() => setGoGack(true)}
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
            actionFunction={() => {
              navigate.goBack();
              navigate.navigate('PinSetup', {isInitialLoad: true});
            }}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  absolute: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  contentContainer: {
    width: '70%',
    backgroundColor: COLORS.darkModeText,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
});
