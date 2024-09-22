import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import {Camera, CameraView} from 'expo-camera';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ICONS, COLORS, SIZES, WEBSITE_REGEX} from '../../constants';
import {GlobalThemeView, ThemeText} from '../../functions/CustomElements';
import openWebBrowser from '../../functions/openWebBrowser';
import {getClipboardText, getQRImage} from '../../functions';
import FullLoadingScreen from '../../functions/CustomElements/loadingScreen';
import {ANDROIDSAFEAREA} from '../../constants/styles';

export default function SendPaymentHome() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [hasPermission, setHasPermission] = useState(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const windowDimensions = Dimensions.get('window');

  useEffect(() => {
    (async () => {
      const {status} = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const toggleFlash = () => {
    setIsFlashOn(prev => !prev);
  };

  const handleBarCodeScanned = ({type, data, bounds}) => {
    const {origin, size} = bounds;

    const centerX = windowDimensions.width / 2;
    const centerY = windowDimensions.height / 2;

    const frameSize = 250;
    const frameLeft = centerX - frameSize / 2;
    const frameRight = centerX + frameSize / 2;
    const frameTop = centerY - frameSize / 2;
    const frameBottom = centerY + frameSize / 2;

    const isWithinBounds =
      origin.x >= frameLeft &&
      origin.x + size.width <= frameRight &&
      origin.y >= frameTop &&
      origin.y + size.height <= frameBottom;

    if (isScanning || !isWithinBounds) return;
    setIsScanning(true);

    if (WEBSITE_REGEX.test(data)) {
      openWebBrowser({navigation, link: data});
    } else {
      navigation.goBack();
      navigation.navigate('ConfirmPaymentScreen', {btcAdress: data});
    }

    setIsScanning(false);
  };

  if (hasPermission === null) {
    return (
      <GlobalThemeView useStandardWidth={true}>
        <FullLoadingScreen text={'Loading Camera'} />
      </GlobalThemeView>
    );
  }
  if (hasPermission === false) {
    return (
      <GlobalThemeView
        styles={{alignItems: 'center', justifyContent: 'center'}}>
        <ThemeText styles={styles.errorText} content="No access to camera" />
        <ThemeText
          styles={styles.errorText}
          content="Go to settings to let Blitz Wallet access your camera"
        />
      </GlobalThemeView>
    );
  }

  return (
    <GlobalThemeView styles={{paddingTop: 0, paddingBottom: 0}}>
      <TouchableOpacity
        style={[
          styles.topBar,
          {top: insets.top < 20 ? ANDROIDSAFEAREA : insets.top},
        ]}
        activeOpacity={0.5}
        onPress={() => navigation.goBack()}>
        <Image
          source={ICONS.arrow_small_left_white}
          style={styles.backArrow}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <CameraView
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        facing="back"
        enableTorch={isFlashOn}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={handleBarCodeScanned}>
        <View
          style={[
            styles.overlay,
            {top: 0, bottom: windowDimensions.height - 300, left: 0, right: 0},
          ]}
        />
        <View
          style={[
            styles.overlay,
            {top: windowDimensions.height - 300, bottom: 0, left: 0, right: 0},
          ]}
        />
        <View
          style={[
            styles.overlay,
            {
              height: 244,
              // top: windowDimensions.height - 300 - 245,
              width: (windowDimensions.width - 245) / 2,
              left: 0,
              right: 0,
            },
          ]}
        />
        <View
          style={[
            styles.overlay,
            {
              height: 244,
              width: (windowDimensions.width - 245) / 2,
              right: 0,
            },
          ]}
        />
        <View
          //THIS VIEW
          style={styles.qrBox}>
          <TouchableOpacity onPress={toggleFlash}>
            <Image source={ICONS.FlashLightIcon} style={styles.choiceIcon} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => getQRImage(navigation, 'sendBTCPage')}>
            <Image
              source={ICONS.ImagesIcon}
              style={{...styles.choiceIcon, right: 0}}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => getClipboardText(navigation, null)}
            style={styles.pasteBTN}
            activeOpacity={0.2}>
            <Text style={styles.pasteBTNText}>Paste</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </GlobalThemeView>
  );
}

const styles = StyleSheet.create({
  topBar: {position: 'absolute', zIndex: 99, left: '2.5%'},
  errorText: {width: '80%', textAlign: 'center'},
  backArrow: {
    width: 30,
    height: 30,
  },
  qrBox: {
    width: 250,
    height: 250,
    borderWidth: 5,
    borderColor: COLORS.primary,
    borderRadius: 8,
  },
  qrLine: {
    backgroundColor: COLORS.primary,
    width: '100%',
    height: 10,
    position: 'absolute',
  },
  choiceIcon: {
    width: 30,
    height: 30,
    position: 'absolute',
    top: -45,
  },
  pasteBTN: {
    width: 120,
    height: 35,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.darkModeText,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: -50,
    left: 65,
  },
  pasteBTNText: {
    fontSize: SIZES.medium,
    color: COLORS.darkModeText,
  },
  overlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent black
  },
});
