import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  Alert,
} from 'react-native';

import {useEffect, useState} from 'react';

import {
  CENTER,
  COLORS,
  FONT,
  ICONS,
  SIZES,
  WEBSITE_REGEX,
} from '../../constants';
import {useIsFocused, useNavigation} from '@react-navigation/native';

import {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import {useIsForeground} from '../../hooks/isAppForground';
import {useGlobalContextProvider} from '../../../context-store/context';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {getClipboardText, getQRImage} from '../../functions';
import openWebBrowser from '../../functions/openWebBrowser';
import {GlobalThemeView, ThemeText} from '../../functions/CustomElements';
import handleBackPress from '../../hooks/handleBackPress';
import {WINDOWWIDTH} from '../../constants/theme';
import {backArrow} from '../../constants/styles';

export default function SendPaymentHome() {
  console.log('SCREEN OPTIONS PAGE');
  const navigate = useNavigation();
  const isFocused = useIsFocused();
  const isForground = useIsForeground();
  const windowDimensions = Dimensions.get('window');
  const screenDimensions = Dimensions.get('screen');
  const screenAspectRatio = screenDimensions.height / screenDimensions.width;
  const {theme, nodeInformation} = useGlobalContextProvider();
  const insets = useSafeAreaInsets();

  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');

  const [isFlashOn, setIsFlashOn] = useState(false);
  const [didScan, setDidScan] = useState(false);

  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

  useEffect(() => {
    // setDidScan(false);
    (async () => {
      await requestPermission();
    })();
    return () => {
      // setDidScan(true);
    };
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: handleBarCodeScanned,
  });
  const format = useCameraFormat(device, [
    {photoAspectRatio: screenAspectRatio},
  ]);

  const showCamera = hasPermission && isFocused && device && isForground;

  return (
    <GlobalThemeView>
      <TouchableOpacity
        style={[styles.topBar, {position: 'abolute', zIndex: 99}]}
        activeOpacity={0.5}
        onPress={() => {
          navigate.goBack();
        }}>
        <Image
          source={ICONS.smallArrowLeft}
          style={[backArrow]}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {showCamera && (
        <Camera
          codeScanner={codeScanner}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: windowDimensions.height,
            width: windowDimensions.width,
          }}
          device={device}
          isActive={true}
          format={format}
          torch={isFlashOn ? 'on' : 'off'}
        />
      )}
      <View
        style={[
          styles.qrContent,

          {
            height: windowDimensions.height,
            width: windowDimensions.width,
            position: 'absolute',
          },
        ]}>
        {(!hasPermission || !device) && (
          <>
            <ThemeText
              styles={{
                marginBottom: 5,
              }}
              content={'No access to camera'}
            />
            <ThemeText
              styles={{
                width: '90%',
                ...CENTER,
                marginBottom: 50,
                textAlign: 'center',
              }}
              content={'Go to settings to let Blitz Wallet access your camera'}
            />
          </>
        )}
        <View style={[styles.qrBox]}>
          {!isForground && hasPermission && device && (
            <ActivityIndicator
              size="large"
              color={theme ? COLORS.darkModeText : COLORS.lightModeText}
              style={{position: 'absolute', top: 70, left: 70}}
            />
          )}
          <TouchableOpacity onPress={toggleFlash}>
            <Image
              source={ICONS.FlashLightIcon}
              style={[
                {width: 30, height: 30, top: -50, right: -10},
                styles.choiceIcon,
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              getQRImage(navigate, null, nodeInformation);
            }}>
            <Image
              source={ICONS.ImagesIcon}
              style={[
                {width: 30, height: 30, top: -50, left: -10},
                styles.choiceIcon,
              ]}
            />
          </TouchableOpacity>
          <View
            style={[
              styles.qrLine,
              {
                height: 10,
                width: 60,
                top: 0,
                left: 0,
              },
            ]}></View>
          <View
            style={[
              styles.qrLine,
              {
                height: 60,
                width: 10,
                top: 0,
                left: 0,
              },
            ]}></View>
          <View
            style={[
              styles.qrLine,
              {
                height: 10,
                width: 60,
                bottom: 0,
                left: 0,
              },
            ]}></View>
          <View
            style={[
              styles.qrLine,
              {
                height: 60,
                width: 10,
                bottom: 0,
                left: 0,
              },
            ]}></View>
          <View
            style={[
              styles.qrLine,
              {
                height: 10,
                width: 60,
                top: 0,
                right: 0,
              },
            ]}></View>
          <View
            style={[
              styles.qrLine,
              {
                height: 60,
                width: 10,
                top: 0,
                right: 0,
              },
            ]}></View>
          <View
            style={[
              styles.qrLine,
              {
                height: 10,
                width: 60,
                bottom: 0,
                right: 0,
              },
            ]}></View>
          <View
            style={[
              styles.qrLine,
              {
                height: 60,
                width: 10,
                bottom: 0,
                right: 0,
              },
            ]}></View>
        </View>
        {/* <TouchableOpacity
          onPress={() => {
            getClipboardText(navigate, null, nodeInformation);
          }}
          style={styles.pasteBTN}
          activeOpacity={0.2}>
          <Text style={styles.pasteBTNText}>Paste</Text>
        </TouchableOpacity> */}
      </View>
    </GlobalThemeView>
  );

  function toggleFlash() {
    if (!device?.hasTorch) return;
    setIsFlashOn(prev => !prev);
  }

  async function handleBarCodeScanned(codes) {
    const [data] = codes;
    console.log(data.type, data.value);

    if (!data.type.includes('qr')) return;
    if (await handleScannedAddressCheck(data)) return;

    if (WEBSITE_REGEX.test(data.value)) {
      openWebBrowser({navigate, link: data.value});
      return;
    }
    navigate.navigate('ConfirmPaymentScreen', {
      btcAdress: data.value,
    });
  }

  async function handleScannedAddressCheck(scannedAddress) {
    const didPay =
      nodeInformation.transactions.filter(
        prevTx => prevTx.details.data.bolt11 === scannedAddress,
      ).length != 0;
    if (didPay) {
      Alert.alert('You have already paid this invoice');
    }
    console.log(didPay);
    return new Promise(resolve => {
      resolve(didPay);
    });
  }
}

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
  },

  topBar: {
    width: WINDOWWIDTH,
    ...CENTER,
  },

  qrContent: {
    flex: 1,
    position: 'relative',
    zIndex: 2,
    backgroundColor: COLORS.cameraOverlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrBox: {
    width: 175,
    height: 175,
    marginVertical: 20,
    position: 'relative',
  },
  qrLine: {
    backgroundColor: COLORS.primary,
    position: 'absolute',
  },
  choiceIcon: {
    position: 'absolute',
  },

  pasteBTN: {
    width: 120,
    height: 35,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.darkModeText,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pasteBTNText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
    color: COLORS.darkModeText,
  },
});
