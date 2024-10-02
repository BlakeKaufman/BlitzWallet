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
  Platform,
} from 'react-native';

import {useEffect, useRef, useState} from 'react';

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
import {ANDROIDSAFEAREA, backArrow} from '../../constants/styles';
import FullLoadingScreen from '../../functions/CustomElements/loadingScreen';

export default function SendPaymentHome() {
  console.log('SCREEN OPTIONS PAGE');
  const navigate = useNavigation();
  const isFocused = useIsFocused();
  const isForground = useIsForeground();
  const windowDimensions = Dimensions.get('window');
  const screenDimensions = Dimensions.get('screen');
  const screenAspectRatio = screenDimensions.height / screenDimensions.width;
  const {theme, nodeInformation, darkModeType} = useGlobalContextProvider();
  const insets = useSafeAreaInsets();

  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');

  const [isFlashOn, setIsFlashOn] = useState(false);
  const didScanRef = useRef(false);

  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        requestPermission();
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: handleBarCodeScanned,
  });
  const format = useCameraFormat(device, [
    {photoAspectRatio: screenAspectRatio},
  ]);

  if (!hasPermission) {
    return (
      <GlobalThemeView useStandardWidth={true}>
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
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <ThemeText styles={styles.errorText} content="No access to camera" />
          <ThemeText
            styles={styles.errorText}
            content="Go to settings to let Blitz Wallet access your camera"
          />
        </View>
      </GlobalThemeView>
    );
  }
  if (device == null) {
    return (
      <GlobalThemeView useStandardWidth={true}>
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
        <FullLoadingScreen
          showLoadingIcon={false}
          text={'You do not have a camera device.'}
        />
      </GlobalThemeView>
    );
  }

  return (
    <GlobalThemeView>
      <Camera
        codeScanner={codeScanner}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: -1,
          height: windowDimensions.height,
          width: windowDimensions.width,
        }}
        device={device}
        isActive={isForground && isFocused}
        format={format}
        torch={isFlashOn ? 'on' : 'off'}
      />
      <View
        style={{
          position: 'absolute',
          zIndex: 1,
          top: 0,
          left: 0,
          height: windowDimensions.height,
          width: windowDimensions.width,
        }}>
        <View style={styles.topOverlay}>
          <TouchableOpacity
            style={{
              ...styles.topBar,
              paddingTop:
                insets.top < ANDROIDSAFEAREA ? ANDROIDSAFEAREA : insets.top,
            }}
            activeOpacity={0.5}
            onPress={() => {
              navigate.goBack();
            }}>
            <Image
              source={ICONS.arrow_small_left_white}
              style={[backArrow]}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={styles.qrVerticalBackground}>
            <TouchableOpacity onPress={toggleFlash}>
              <Image
                style={backArrow}
                source={
                  isFlashOn ? ICONS.FlashLightIcon : ICONS.flashlightNoFillWhite
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => getQRImage(navigate, 'sendBTCPage')}>
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
            onPress={() => getClipboardText(navigate, 'sendBTCPage')}
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
    </GlobalThemeView>
  );

  function toggleFlash() {
    if (!device?.hasTorch) {
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Device does not have a tourch',
      });
      return;
    }
    setIsFlashOn(prev => !prev);
  }

  async function handleBarCodeScanned(codes) {
    if (didScanRef.current) return;
    const [data] = codes;

    if (!data.type.includes('qr')) return;
    if (await handleScannedAddressCheck(data)) return;

    if (WEBSITE_REGEX.test(data.value)) {
      openWebBrowser({navigate, link: data.value});
      return;
    }
    didScanRef.current = true;

    navigate.goBack();
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
      navigate.navigate('ErrorScreen', {
        errorMessage: 'You have already paid this invoice',
      });
      return;
    }
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
});
