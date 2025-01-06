import {
  Animated,
  StyleSheet,
  View,
  useWindowDimensions,
  Image,
} from 'react-native';
import {CENTER, ICONS, SIZES} from '../../../constants';
import {useEffect, useRef} from 'react';
import {handleLogin} from '../../../functions/biometricAuthentication';
import {useTranslation} from 'react-i18next';
import {useGlobalContextProvider} from '../../../../context-store/context';
import {getLocalStorageItem} from '../../../functions';
import CustomButton from '../../../functions/CustomElements/button';
import {useNavigation} from '@react-navigation/native';

export default function HomeLogin(props) {
  const {theme, darkModeType} = useGlobalContextProvider();
  const {height, width} = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(height / 2 - 75)).current;
  const fadeBTN = useRef(new Animated.Value(0)).current;
  const {t} = useTranslation();
  const navigate = useNavigation();

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

      const didLogIn = await handleLogin();
      if (didLogIn) {
        navigate.replace('ConnectingToNodeLoadingScreen');
      }
      // }
    })();
  }, []);

  return (
    <>
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
