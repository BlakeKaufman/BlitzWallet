import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

import {BarCodeScanner} from 'expo-barcode-scanner';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';

import {useEffect, useState} from 'react';

import {COLORS, FONT, ICONS, SIZES} from '../../constants';
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

export default function SendPaymentHome() {
  console.log('SCREEN OPTIONS PAGE');
  const navigate = useNavigation();
  const isFocused = useIsFocused();
  const isForground = useIsForeground();
  const windowDimensions = Dimensions.get('window');
  const screenDimensions = Dimensions.get('screen');
  const screenAspectRatio = screenDimensions.height / screenDimensions.width;
  const {theme} = useGlobalContextProvider();

  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');

  const [isFlashOn, setIsFlashOn] = useState(false);
  const [didScan, setDidScan] = useState(false);

  useEffect(() => {
    setDidScan(false);
    (async () => {
      await requestPermission();
    })();
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: handleBarCodeScanned,
  });
  const format = useCameraFormat(device, [
    {photoAspectRatio: screenAspectRatio},
  ]);

  console.log(!hasPermission || !device || !isForground);
  return (
    <View
      style={[
        styles.viewContainer,
        {
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
        },
      ]}>
      <TouchableOpacity
        style={[
          styles.topBar,
          {position: 'absolute', zIndex: 99, top: 60, left: 20},
        ]}
        activeOpacity={0.5}
        onPress={() => {
          navigate.goBack();
        }}>
        <Image
          source={ICONS.leftCheveronIcon}
          style={{width: 30, height: 30, transform: [{translateX: -1}]}}
          resizeMode="contain"
        />
      </TouchableOpacity>
      {(!hasPermission || !device || !isForground) && (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          {isForground ? (
            <>
              <Text
                style={{
                  fontFamily: FONT.Title_Regular,
                  fontSize: SIZES.large,
                  marginBottom: 5,
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                }}>
                No access to camera
              </Text>
              <Text
                style={{
                  fontFamily: FONT.Title_Regular,
                  fontSize: SIZES.medium,
                  textAlign: 'center',
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                }}>
                Go to settings to let Blitz Wallet access your camera
              </Text>
            </>
          ) : (
            <ActivityIndicator />
          )}
        </View>
      )}
      {hasPermission && isFocused && device && isForground && (
        <>
          <Camera
            codeScanner={didScan ? undefined : codeScanner}
            style={{
              height: windowDimensions.height,
              width: windowDimensions.width,
            }}
            device={device}
            isActive={true}
            format={format}
            torch={isFlashOn ? 'on' : 'off'}
          />
          <View
            style={[
              styles.qrContent,
              {
                height: windowDimensions.height,
                width: windowDimensions.width,
              },
            ]}>
            <View style={styles.qrBox}>
              <TouchableOpacity onPress={toggleFlash}>
                <Image
                  source={ICONS.FlashLightIcon}
                  style={[
                    {width: 30, height: 30, top: -50, right: -10},
                    styles.choiceIcon,
                  ]}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={getQRImage}>
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
            <TouchableOpacity
              onPress={getClipboardText}
              style={styles.pasteBTN}
              activeOpacity={0.2}>
              <Text style={styles.pasteBTNText}>Paste</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  async function getClipboardText() {
    const data = await Clipboard.getStringAsync();
    if (!data) return;
    navigate.navigate('ConfirmPaymentScreen', {
      btcAdress: data,
      setDidScan: setDidScan,
    });
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

    const [{data}] = await BarCodeScanner.scanFromURLAsync(imgURL);

    navigate.navigate('ConfirmPaymentScreen', {
      btcAdress: data,
      setDidScan: setDidScan,
    });
  }

  function toggleFlash() {
    if (!device.hasTorch) return;
    setIsFlashOn(prev => !prev);
  }

  function handleBarCodeScanned(codes) {
    const [data] = codes;
    console.log(data.type, data.value);

    if (!data.type.includes('qr')) return;
    setDidScan(true);
    navigate.navigate('ConfirmPaymentScreen', {
      btcAdress: data.value,
      setDidScan: setDidScan,
    });
  }
}

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
  },

  topBar: {
    width: 35,
    height: 35,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 27.5,
    backgroundColor: COLORS.lightModeBackground,
  },

  camera: {position: 'absolute', top: 0, left: 0, zIndex: 1},

  qrContent: {
    position: 'absolute',
    top: 0,
    left: 0,
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
