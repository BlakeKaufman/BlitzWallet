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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../constants';
import {ThemeText, GlobalThemeView} from '../../../functions/CustomElements';
import FullLoadingScreen from '../../../functions/CustomElements/loadingScreen';
import {ANDROIDSAFEAREA, backArrow} from '../../../constants/styles';
import handleBackPress from '../../../hooks/handleBackPress';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import ThemeImage from '../../../functions/CustomElements/themeImage';
import {useGlobalContextProvider} from '../../../../context-store/context';
// import * as BarCodeScanner from 'expo-barcode-scanner';

export default function CameraModal(props) {
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();
  const {theme, darkModeType} = useGlobalContextProvider();
  const [hasPermission, setHasPermission] = useState(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  // const [didScan, setDidScan] = useState(false);
  const windowDimensions = Dimensions.get('window');

  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
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

    navigate.goBack();
    props.route.params.updateBitcoinAdressFunc(data);

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
        onPress={() => navigate.goBack()}>
        <Image style={backArrow} source={ICONS.arrow_small_left_white} />
      </TouchableOpacity>

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
              <TouchableOpacity onPress={getQRImage}>
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
              onPress={getClipboardText}
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

  async function getClipboardText() {
    try {
      const text = await Clipboard.getStringAsync();
      navigate.goBack();
      props.route.params.updateBitcoinAdressFunc(text);
    } catch (err) {
      console.log(err);
    }
  }
  async function getQRImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (result.canceled) return;

    const imgURL = result.assets[0].uri;

    try {
      const [{data}] = await Camera.scanFromURLAsync(imgURL);

      navigate.goBack();
      props.route.params.updateBitcoinAdressFunc(data);
    } catch (err) {
      console.log(err);
    }
  }
}

const styles = StyleSheet.create({
  topBar: {position: 'absolute', zIndex: 99, left: '2.5%'},
  errorText: {width: '80%', textAlign: 'center'},
  backArrow: {
    width: 30,
    height: 30,
  },
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
