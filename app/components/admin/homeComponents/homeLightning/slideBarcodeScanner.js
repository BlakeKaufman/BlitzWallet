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
  Platform,
} from 'react-native';
import {Camera, CameraView} from 'expo-camera';
import {useNavigation} from '@react-navigation/native';
import {
  CENTER,
  COLORS,
  ICONS,
  SIZES,
  WEBSITE_REGEX,
} from '../../../../constants';
import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import openWebBrowser from '../../../../functions/openWebBrowser';
import {getClipboardText, getQRImage} from '../../../../functions';
import FullLoadingScreen from '../../../../functions/CustomElements/loadingScreen';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import ThemeImage from '../../../../functions/CustomElements/themeImage';
import {backArrow} from '../../../../constants/styles';

export default function SendPaymentHome(props) {
  const navigation = useNavigation();
  const {theme, darkModeType} = useGlobalContextProvider();
  const [hasPermission, setHasPermission] = useState(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const showCamera = props.pageViewPage === 0;

  console.log(showCamera, 'CAMEA PAGE');

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
      navigation.navigate('ConfirmPaymentScreen', {
        btcAdress: data,
        fromPage: 'slideCamera',
      });
    }

    setIsScanning(false);
  };

  if (hasPermission === null || !showCamera) {
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
      <CameraView
        style={{
          flex: 1,
        }}
        facing="back"
        enableTorch={isFlashOn}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={handleBarCodeScanned}>
        <View style={styles.overlay}>
          <View style={styles.topOverlay}>
            <View style={styles.qrVerticalBackground}>
              <TouchableOpacity onPress={toggleFlash}>
                <Image
                  style={backArrow}
                  source={
                    isFlashOn
                      ? ICONS.FlashLightIcon
                      : ICONS.flashlightNoFillWhite
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => getQRImage(navigation, 'sendBTCPage')}>
                <Image style={backArrow} source={ICONS.ImagesIcon} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.middleRow}>
            <View style={styles.sideOverlay} />
            <View
              style={{
                ...styles.qrBoxOutline,
                borderColor:
                  theme && darkModeType ? COLORS.darkModeText : COLORS.primary,
              }}
            />
            <View style={styles.sideOverlay} />
          </View>
          <View style={styles.bottomOverlay}>
            <TouchableOpacity
              onPress={() => getClipboardText(navigation, 'sendBTCPage')}
              style={{
                ...styles.pasteBTN,
                borderColor: COLORS.darkModeText,
                marginTop: 10,
              }}
              activeOpacity={0.2}>
              <ThemeText
                styles={{
                  color: COLORS.darkModeText,
                  includeFontPadding: false,
                  paddingHorizontal: 40,
                  paddingVertical: Platform.OS === 'ios' ? 8 : 5,
                }}
                content={'Paste'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </GlobalThemeView>
  );
}

const styles = StyleSheet.create({
  errorText: {width: '80%', textAlign: 'center'},
  qrBoxOutline: {
    width: 250,
    height: 250,
    borderWidth: 3,
  },
  qrLine: {
    width: '100%',
    height: 10,
    position: 'absolute',
  },
  qrVerticalBackground: {
    width: 250,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    marginTop: 'auto',
    ...CENTER,
  },
  pasteBTN: {
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...CENTER,
  },

  overlay: {
    flex: 1,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  middleRow: {
    flexDirection: 'row',
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
});
