import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as ExpoCamera from 'expo-camera';
import {BarCodeScanner} from 'expo-barcode-scanner';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';

import {useEffect, useState} from 'react';

import {COLORS, FONT, ICONS, SIZES} from '../../../../constants';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../context-store/context';

export default function ScanRecieverQrCode() {
  const navigate = useNavigation();
  const type = ExpoCamera.CameraType.back;
  const {theme} = useGlobalContextProvider();
  const [storedCameraPermissions, requestCameraPermissions] =
    ExpoCamera.Camera.useCameraPermissions();

  const isFocused = useIsFocused();

  const [didScan, setDidScan] = useState(false);

  const [bottomExpand, setBottomExpand] = useState(false);

  useEffect(() => {
    setDidScan(false);
    (async () => {
      await requestCameraPermissions();
    })();
  }, []);

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

    console.log(data);
  }

  const handleBarCodeScanned = ({type, data}) => {
    if (!type.includes('QRCode')) return;
    setDidScan(true);
    const parsedData = JSON.parse(data);
    navigate.navigate('AmountToGift', {...parsedData});
  };

  return (
    <View
      style={[
        styles.viewContainer,
        {
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
          paddingTop: Platform.OS === 'ios' ? 0 : 5,
        },
      ]}>
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={1}
            style={{width: 20, height: '100%'}}
            onPress={() => {
              navigate.goBack();
            }}>
            <Image
              source={ICONS.leftCheveronIcon}
              style={{width: 30, height: 30, marginRight: 'auto'}}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text
            style={[
              styles.headerText,
              {
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            Scan Gift Qr Code
          </Text>
        </View>

        {!storedCameraPermissions?.granted && (
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            {storedCameraPermissions === null ? (
              <>
                <Text
                  style={{
                    fontFamily: FONT.Title_Regular,
                    fontSize: SIZES.large,
                    marginBottom: 5,
                  }}>
                  No access to camera
                </Text>
                <Text
                  style={{
                    fontFamily: FONT.Title_Regular,
                    fontSize: SIZES.medium,
                    textAlign: 'center',
                  }}>
                  Go to settings to let Blitz Wallet access your camera
                </Text>
              </>
            ) : (
              <ActivityIndicator />
            )}
          </View>
        )}
        {storedCameraPermissions?.granted && isFocused && (
          <ExpoCamera.Camera
            type={type}
            onBarCodeScanned={didScan ? undefined : handleBarCodeScanned}
            style={[styles.camera]}
            barCodeScannerSettings={{
              barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
            }}
            focusDepth={1}
            autoFocus={ExpoCamera.AutoFocus.on}
          />
        )}
        <View
          style={{
            ...styles.bottomBar,
            height: bottomExpand ? 100 : 50,
            backgroundColor: theme
              ? COLORS.darkModeBackground
              : COLORS.lightModeBackground,
            borderTopColor: theme ? COLORS.darkModeText : COLORS.lightModeText,
            borderTopWidth: 2,
          }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setBottomExpand(prev => !prev);
            }}></TouchableOpacity>
          <TouchableOpacity
            onPress={getQRImage}
            style={{backgroundColor: 'transparent'}}
            activeOpacity={0.2}>
            <Text
              style={[
                styles.bottomText,
                {
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                },
              ]}>
              Choose image
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
    height: '100%',

    backgroundColor: COLORS.background,
    zIndex: 5,
    display: 'flex',
    // paddingTop: 50,
  },
  topBar: {
    width: '100%',
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: 'black',
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginRight: 'auto',
    marginLeft: 'auto',
    fontFamily: FONT.Title_Bold,
    transform: [{translateX: -10}],
  },
  camera: {flex: 1},
  bottomBar: {
    width: '100%',
    height: 50,

    // overflow: 'hidden',
    position: 'absolute',
    bottom: 10,
    left: 0,
    zIndex: 1,
    backgroundColor: 'white',
  },
  bottomText: {
    width: '100%',
    textAlign: 'center',
    color: 'black',
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginRight: 'auto',
    marginLeft: 'auto',
    backgroundColor: 'transparent',
    fontFamily: FONT.Other_Bold,

    lineHeight: 50,
  },
  arrowIcon: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    zIndex: 1,
    transform: [{translateX: -40}],
    color: 'white',
    backgroundColor: 'white',
    paddingVertical: 2,
    paddingHorizontal: 20,
    alignItems: 'center',

    borderTopRightRadius: 5,
    borderTopLeftRadius: 5,
  },
});
