import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {BTN, COLORS, FONT, ICONS, SIZES} from '../../../constants';
import * as Device from 'expo-device';
import {useEffect, useRef, useState} from 'react';
import {handleLogin} from '../../../functions/biometricAuthentication';
import {getLocalStorageItem, setLocalStorageItem} from '../../../functions';
import {Trans, useTranslation} from 'react-i18next';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useGlobalContextProvider} from '../../../../context-store/context';

export default function HomeLogin(props) {
  const {height} = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(height / 2 - 75)).current;
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const {masterInfoObject} = useGlobalContextProvider();

  async function moveLogo(type) {
    Animated.timing(fadeAnim, {
      toValue: type === 'up' ? 20 : height / 2 - 75,
      duration: 200,
      useNativeDriver: true,
    }).start();

    return new Promise(resolve => {
      setTimeout(() => {
        resolve(true);
      }, 200);
    });
  }

  useEffect(() => {
    (async () => {
      const isBiometricEnabled = masterInfoObject.userFaceIDPreferance;

      if (!isBiometricEnabled) return;

      const didMove = await moveLogo('up');
      if (didMove) {
        const didLogIn = await handleLogin();
        if (didLogIn) {
          props.setDidUsePin(false);
          const didMove = await moveLogo('down');
          if (didMove) {
            // if (props.fromBackground) props.navigation.goBack();
            props.navigation.replace('ConnectingToNodeLoadingScreen');
          }
        }
        // else {
        //   props.setDidUsePin(true);
        //   Alert.alert(
        //     'Biometric record not found',
        //     'Please verify your identity with your password',
        //     [{text: 'Ok', onPress: () => props.setDidUsePin(true)}],
        //   );
        // }
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        style={[styles.logo, {transform: [{translateY: fadeAnim}]}]}
        source={ICONS.transparentIcon}
      />
      <TouchableOpacity
        onPress={() => props.setDidUsePin(true)}
        style={[
          BTN,
          {backgroundColor: COLORS.primary, marginTop: 0, marginBottom: 15},
        ]}>
        <Text style={styles.btnText}>{t('adminLogin.home.button')}</Text>
      </TouchableOpacity>
      <Text
        style={[
          styles.appName,
          {
            color: props.theme ? COLORS.darkModeText : COLORS.lightModeText,
            marginBottom: Device.osName === 'Android' ? insets.bottom + 10 : 0,
          },
        ]}>
        Blitz Wallet
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  logo: {
    width: 150,
    height: 150,
    position: 'absolute',
    top: 0,
  },
  btnText: {
    color: COLORS.lightModeBackground,
    fontSize: SIZES.medium,
    fontFamily: FONT.Other_Regular,
  },
  appName: {
    fontSize: SIZES.xLarge,
    fontFamily: FONT.Title_Bold,
  },
});
