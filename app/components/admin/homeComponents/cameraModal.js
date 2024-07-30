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

import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../constants';

import {useIsFocused, useNavigation} from '@react-navigation/native';

import {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import {useIsForeground} from '../../../hooks/isAppForground';
import {useGlobalContextProvider} from '../../../../context-store/context';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ThemeText} from '../../../functions/CustomElements';
import handleBackPress from '../../../hooks/handleBackPress';

export default function CameraModal(props) {
  const navigate = useNavigation();
  const isFocused = useIsFocused();
  const isForground = useIsForeground();
  const windowDimensions = Dimensions.get('window');
  const screenDimensions = Dimensions.get('screen');
  const screenAspectRatio = screenDimensions.height / screenDimensions.width;
  const {theme} = useGlobalContextProvider();
  const insets = useSafeAreaInsets();

  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');

  const [didScan, setDidScan] = useState(false);

  const [isFlashOn, setIsFlashOn] = useState(false);

  useEffect(() => {
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
          {position: 'abolute', zIndex: 99, top: insets.top + 10, left: 5},
        ]}
        activeOpacity={0.5}
        onPress={() => {
          navigate.goBack();
        }}>
        <Image
          source={ICONS.smallArrowLeft}
          style={{width: 30, height: 30}}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {hasPermission && isFocused && device && isForground && (
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
        {/* {!props.route.params?.fromPage ||
          (props.route.params?.fromPage != 'addContact' && ( */}
        <TouchableOpacity
          onPress={getClipboardText}
          style={styles.pasteBTN}
          activeOpacity={0.2}>
          <Text style={styles.pasteBTNText}>Paste</Text>
        </TouchableOpacity>
        {/* ))} */}
      </View>
    </View>
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
      const [{data}] = await BarCodeScanner.scanFromURLAsync(imgURL);

      navigate.goBack();
      props.route.params.updateBitcoinAdressFunc(data);
    } catch (err) {
      console.log(err);
    }
  }
  function toggleFlash() {
    setIsFlashOn(prev => !prev);
  }
  function handleBarCodeScanned(codes) {
    const [data] = codes;
    console.log(data.type, data.value);

    if (!data.type.includes('qr')) return;
    setDidScan(true);

    navigate.goBack();
    props.route.params.updateBitcoinAdressFunc(data.value);
  }
}

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
  },

  // topBar: {
  //   width: 35,
  //   height: 35,
  //   flexDirection: 'row',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   borderRadius: 27.5,
  //   backgroundColor: COLORS.lightModeBackground,
  // },

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
