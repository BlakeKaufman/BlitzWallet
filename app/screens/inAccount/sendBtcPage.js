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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {getClipboardText, getQRImage} from '../../functions';
import openWebBrowser from '../../functions/openWebBrowser';
import {GlobalThemeView, ThemeText} from '../../functions/CustomElements';
import handleBackPress from '../../hooks/handleBackPress';
import {WINDOWWIDTH} from '../../constants/theme';
import {ANDROIDSAFEAREA, backArrow} from '../../constants/styles';
import FullLoadingScreen from '../../functions/CustomElements/loadingScreen';
import {useTranslation} from 'react-i18next';
import {convertMerchantQRToLightningAddress} from '../../functions/sendBitcoin/getMerchantAddress';
import {useGlobalThemeContext} from '../../../context-store/theme';
import {useNodeContext} from '../../../context-store/nodeContext';

export default function SendPaymentHome(props) {
  console.log('SCREEN OPTIONS PAGE');
  const navigate = useNavigation();
  const isFocused = useIsFocused();
  const isForground = useIsForeground();
  const windowDimensions = Dimensions.get('window');
  const screenDimensions = Dimensions.get('screen');
  const screenAspectRatio = screenDimensions.height / screenDimensions.width;
  const {nodeInformation, liquidNodeInformation} = useNodeContext();
  const {theme, darkModeType} = useGlobalThemeContext();
  const insets = useSafeAreaInsets();

  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');

  const [isFlashOn, setIsFlashOn] = useState(false);
  const didScanRef = useRef(false);
  const {t} = useTranslation();

  const topPadding = Platform.select({
    ios: insets.top,
    android: ANDROIDSAFEAREA,
  });

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

  const isCameraActive = navigate.canGoBack()
    ? isFocused && isForground
    : props.pageViewPage === 0;

  if (!hasPermission) {
    return (
      <GlobalThemeView useStandardWidth={true}>
        {props.from != 'home' && (
          <TouchableOpacity
            style={[styles.topBar, {position: 'absolute', zIndex: 99}]}
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
        )}
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <ThemeText
            styles={styles.errorText}
            content={t('wallet.cameraPage.noCameraAccess')}
          />
          <ThemeText
            styles={styles.errorText}
            content={t('wallet.cameraPage.settingsText')}
          />
        </View>
      </GlobalThemeView>
    );
  }
  if (device == null) {
    return (
      <GlobalThemeView useStandardWidth={true}>
        {props.from != 'home' && (
          <TouchableOpacity
            style={[styles.topBar, {position: 'absolute', zIndex: 99}]}
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
        )}
        <FullLoadingScreen
          showLoadingIcon={false}
          text={t('wallet.cameraPage.noCameraDevice')}
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
        isActive={isCameraActive}
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
          {props.from != 'home' && (
            <TouchableOpacity
              style={{
                ...styles.topBar,
                paddingTop: topPadding,
              }}
              activeOpacity={0.5}
              onPress={() => {
                if (!navigate.canGoBack()) return;
                navigate.goBack();
              }}>
              <Image
                source={ICONS.arrow_small_left_white}
                style={[backArrow]}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
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
              onPress={async () => {
                const response = await getQRImage(navigate, 'modal');
                const canGoBack = navigate.canGoBack();
                if (response.error) {
                  if (canGoBack) {
                    navigate.goBack();
                    setTimeout(
                      () => {
                        navigate.navigate('ErrorScreen', {
                          errorMessage: response.error,
                        });
                      },
                      Platform.OS === 'android' ? 350 : 50,
                    );
                    return;
                  }

                  navigate.navigate('ErrorScreen', {
                    errorMessage: response.error,
                  });
                  return;
                }
                if (!response.didWork || !response.btcAdress) return;
                if (Platform.OS === 'android') {
                  navigate.navigate('ConfirmPaymentScreen', {
                    btcAdress: response.btcAdress,
                    fromPage: '',
                  });
                } else {
                  navigate.reset({
                    index: 0,
                    routes: [
                      {
                        name: 'HomeAdmin',
                        params: {
                          screen: 'Home',
                        },
                      },
                      {
                        name: 'ConfirmPaymentScreen',
                        params: {
                          btcAdress: response.btcAdress,
                        },
                      },
                    ],
                  });
                }
              }}>
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
            onPress={() => {
              getClipboardText(navigate, 'sendBTCPage');
            }}
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
        errorMessage: t('wallet.cameraPage.error1'),
      });
      return;
    }
    setIsFlashOn(prev => !prev);
  }

  async function handleBarCodeScanned(codes) {
    if (didScanRef.current) return;
    const [data] = codes;

    if (!data.type.includes('qr')) return;
    if (handleScannedAddressCheck(data)) return;

    if (WEBSITE_REGEX.test(data.value)) {
      openWebBrowser({navigate, link: data.value});
      return;
    }
    didScanRef.current = true;
    const merchantLNAddress = convertMerchantQRToLightningAddress({
      qrContent: data.value,
      network: process.env.BOLTZ_ENVIRONEMNT,
    });
    navigate.reset({
      index: 0,
      routes: [
        {
          name: 'HomeAdmin',
          params: {
            screen: 'Home',
          },
        },
        {
          name: 'ConfirmPaymentScreen',
          params: {
            btcAdress: merchantLNAddress || data.value,
          },
        },
      ],
    });

    // navigate.goBack();
    // navigate.navigate('ConfirmPaymentScreen', {
    //   btcAdress: data.value,
    // });
  }

  function handleScannedAddressCheck(scannedAddress) {
    const didPay =
      nodeInformation.transactions.filter(
        prevTx => prevTx.details.data.bolt11 === scannedAddress,
      ).length != 0;
    if (didPay) {
      navigate.navigate('ErrorScreen', {
        errorMessage: t('wallet.cameraPage.error2'),
      });
      return;
    }
    return didPay;
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
