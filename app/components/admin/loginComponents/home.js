import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Image,
  Easing,
} from 'react-native';
import {BTN, CENTER, COLORS, FONT, ICONS, SIZES} from '../../../constants';
import * as Device from 'expo-device';
import {useEffect, useRef, useState} from 'react';
import {handleLogin} from '../../../functions/biometricAuthentication';

import {Trans, useTranslation} from 'react-i18next';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useGlobalContextProvider} from '../../../../context-store/context';
import {getLocalStorageItem} from '../../../functions';
import {ThemeText} from '../../../functions/CustomElements';
import CustomButton from '../../../functions/CustomElements/button';

export default function HomeLogin(props) {
  const {theme, darkModeType} = useGlobalContextProvider();
  const {height, width} = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(height / 2 - 75)).current;
  const fadeBTN = useRef(new Animated.Value(0)).current;
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();

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
  async function fadePinBTN() {
    setTimeout(() => {
      Animated.timing(fadeBTN, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 100);
  }

  useEffect(() => {
    fadePinBTN();
    (async () => {
      const isBiometricEnabled =
        JSON.parse(await getLocalStorageItem('userFaceIDPereferance')) || false;

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

  console.log(fadeBTN);

  return (
    <>
      {/* <Animated.Image
        style={[styles.logo, {transform: [{translateY: fadeAnim}]}]}
        source={ICONS.transparentIcon}
      /> */}
      <Animated.View
        style={{
          opacity: fadeBTN,
          flex: 1,
        }}>
        <Image
          style={{
            ...styles.logo,
            left: width / 2 - 80,
            top: height / 2.75 - 75,
          }}
          source={
            theme && darkModeType
              ? ICONS.transparentIconWhite
              : ICONS.transparentIcon
          }
        />

        <View style={{marginTop: 'auto', marginBottom: 50}}>
          <CustomButton
            buttonStyles={{
              width: 175,
              ...CENTER,
            }}
            textStyles={{
              fontSize: SIZES.large,
              paddingVertical: 10,
            }}
            textContent={t('adminLogin.home.button')}
            actionFunction={() => props.setDidUsePin(true)}
          />
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // position: 'relative',
    // alignItems: 'center',
    // justifyContent: 'flex-end',
  },

  logo: {
    width: 150,
    height: 150,
    marginTop: 'auto',
    marginBottom: 'auto',
    ...CENTER,
    position: 'absolute',

    // position: 'absolute',
    // top: 0,
  },

  appName: {
    fontSize: SIZES.xLarge,
  },
});
