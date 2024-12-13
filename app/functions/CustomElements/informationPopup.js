import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {useNavigation} from '@react-navigation/native';
import {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {COLORS, ICONS} from '../../constants';
import ThemeText from './textTheme';
import CustomButton from './button';
import {backArrow} from '../../constants/styles';
import {useGlobalContextProvider} from '../../../context-store/context';
import GetThemeColors from '../../hooks/themeColors';

export default function InformationPopup(props) {
  const BlurViewAnimation = useRef(new Animated.Value(0)).current;
  const isInitialLoad = useRef(true);
  const navigate = useNavigation();
  const [goBack, setGoGack] = useState(false);
  const {theme, darkModeType} = useGlobalContextProvider();
  const {backgroundOffset} = GetThemeColors();
  const {
    route: {
      params: {textContent, buttonText},
    },
  } = props;

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
        {/* {Platform.OS === 'ios' && (
          <BlurView
            blurType="dark" // Options: 'xlight', 'light', 'dark'
            blurAmount={1}
            style={styles.absolute}
          />
        )} */}

        <View style={styles.contentContainer}>
          <TouchableOpacity
            onPress={() => setGoGack(true)}
            style={{marginLeft: 'auto', marginBottom: 10}}>
            <Image style={[backArrow]} source={ICONS.xSmallIcon} />
          </TouchableOpacity>

          <ThemeText
            styles={{marginBottom: 30, textAlign: 'center'}}
            content={textContent}
          />
          <CustomButton
            buttonStyles={{
              width: 'auto',
              backgroundColor:
                theme && darkModeType ? backgroundOffset : COLORS.primary,
            }}
            textStyles={{
              paddingVertical: 5,
              // fontSize: SIZES.large,
              color: COLORS.darkModeText,
            }}
            textContent={buttonText}
            actionFunction={() => {
              setGoGack(true);
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
    backgroundColor: COLORS.halfModalBackgroundColor,
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
