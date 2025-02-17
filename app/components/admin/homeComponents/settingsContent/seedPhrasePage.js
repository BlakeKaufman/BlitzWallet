import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {KeyContainer} from '../../../login';
import {retrieveData} from '../../../../functions';
import {useEffect, useRef, useState} from 'react';
import {COLORS, FONT, SIZES, SHADOWS, CENTER} from '../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {ThemeText} from '../../../../functions/CustomElements';
import CustomButton from '../../../../functions/CustomElements/button';
import {WINDOWWIDTH} from '../../../../constants/theme';
import GetThemeColors from '../../../../hooks/themeColors';
import {useGlobalThemeContext} from '../../../../../context-store/theme';

export default function SeedPhrasePage() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isInitialRender = useRef(true);
  const [mnemonic, setMnemonic] = useState([]);
  const [showSeed, setShowSeed] = useState(false);
  const navigate = useNavigation();
  const {backgroundColor} = GetThemeColors();
  const {theme, darkModeType} = useGlobalThemeContext();
  const {backgroundOffset} = GetThemeColors();

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    if (showSeed) {
      (async () => {
        const mnemonic = await retrieveData('mnemonic');
        const sanitizedMnemonic = mnemonic.split(' ').filter(key => {
          return key && true;
        });
        setMnemonic(sanitizedMnemonic);
        fadeout();
      })();
    }
  }, [showSeed]);

  return (
    <View style={styles.globalContainer}>
      <View style={styles.container}>
        <ThemeText
          styles={{...styles.headerPhrase}}
          content={'Keep this phrase in a secure and safe place'}
        />
        <ThemeText
          styles={{color: COLORS.cancelRed, marginBottom: 50}}
          content={'Do not share it with anyone'}
        />
        <View style={{width: WINDOWWIDTH, ...CENTER}}>
          <KeyContainer keys={mnemonic} />
        </View>
      </View>

      <Animated.View
        style={[
          styles.confirmPopup,
          {
            transform: [{translateY: fadeAnim}],
            backgroundColor: backgroundColor,
          },
        ]}>
        <View style={styles.confirmPopupInnerContainer}>
          <ThemeText
            styles={{...styles.confirmPopupTitle}}
            content={'Are you sure you want to show your recovery phrase?'}
          />
          <View style={styles.confirmationContainer}>
            <CustomButton
              buttonStyles={{
                backgroundColor:
                  theme && darkModeType ? backgroundOffset : COLORS.primary,
                marginRight: 20,
              }}
              textStyles={{color: COLORS.darkModeText}}
              textContent={'Yes'}
              actionFunction={() => setShowSeed(true)}
            />

            <CustomButton
              textContent={'No'}
              actionFunction={() => navigate.goBack()}
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );

  function fadeout() {
    Animated.timing(fadeAnim, {
      toValue: 900,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 'auto',
    marginLeft: 'auto',
  },

  headerPhrase: {
    marginBottom: 15,
    fontSize: SIZES.xLarge,
    textAlign: 'center',
  },

  confirmPopup: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
  },
  confirmationContainer: {
    flexDirection: 'row',
    marginTop: 50,
    width: '90%',
    justifyContent: 'center',
  },
  confirmPopupInnerContainer: {
    width: '90%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmPopupTitle: {
    fontSize: SIZES.large,
    textAlign: 'center',
  },
  confirmBTN: {
    flex: 1,
    maxWidth: '45%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    ...SHADOWS.small,
  },
  confirmBTNText: {
    color: 'white',
    paddingVertical: 10,
  },
});
