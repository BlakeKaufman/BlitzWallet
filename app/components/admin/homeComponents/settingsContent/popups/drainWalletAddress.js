import {useEffect, useState} from 'react';
import {
  Animated,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import {CameraType} from 'expo-camera';
import {BarCodeScanner} from 'expo-barcode-scanner';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';

import {COLORS, FONT, ICONS, SIZES} from '../../../../../constants';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {useNavigation} from '@react-navigation/native';

export default function DrainWalletAddress(props) {
  const {width} = useWindowDimensions();
  const {theme} = useGlobalContextProvider();
  const type = CameraType.back;
  const [permission, setPermission] = useState(
    BarCodeScanner.getPermissionsAsync(),
  );
  const [bottomExpand, setBottomExpand] = useState(false);
  const [photoesPermission, setPhotoesPermission] = useState({});
  const navigate = useNavigation();

  useEffect(() => {
    (async () => {
      const status = await BarCodeScanner.requestPermissionsAsync();

      setPermission(status.granted);
    })();
  }, []);

  return (
    <View
      style={[
        styles.globalContainer,
        {
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
        },
      ]}>
      <SafeAreaView
        style={{
          flex: 1,

          overflow: 'hidden',
        }}>
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
            Scan A QR code
          </Text>
        </View>

        {!permission && <Text>No access to camera</Text>}
        {permission && (
          <BarCodeScanner
            type={type}
            onBarCodeScanned={handleBarCodeScanned}
            style={styles.camera}
          />
        )}

        <View
          style={[
            styles.bottomBar,
            {
              height: bottomExpand ? 120 : 60,
              backgroundColor: theme
                ? COLORS.darkModeBackground
                : COLORS.lightModeBackground,
              borderTopColor: theme
                ? COLORS.darkModeText
                : COLORS.lightModeText,
            },
          ]}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setBottomExpand(prev => !prev)}
            style={[
              styles.arrowIcon,
              {
                backgroundColor: theme
                  ? COLORS.darkModeBackground
                  : COLORS.lightModeBackground,
                left: width / 2,
                borderTopColor: theme
                  ? COLORS.darkModeText
                  : COLORS.lightModeText,
                borderLeftColor: theme
                  ? COLORS.darkModeText
                  : COLORS.lightModeText,
                borderRightColor: theme
                  ? COLORS.darkModeText
                  : COLORS.lightModeText,
              },
            ]}>
            <Animated.Image
              source={ICONS.angleUpIcon}
              style={{
                width: 25,
                height: 25,
                transform: bottomExpand
                  ? [{rotate: '180deg'}]
                  : [{rotate: '0deg'}],
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={getClipboardText} activeOpacity={0.2}>
            <Text
              style={[
                styles.bottomText,
                {
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                },
              ]}>
              Paste from clipbard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={getQRImage} activeOpacity={0.2}>
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

  async function getClipboardText() {
    try {
      const text = await Clipboard.getStringAsync();
      props.route.params.updateBitcoinAdressFunc(text);
      navigate.goBack();
      //   props.setBitcoinAddress(text);
    } catch (err) {
      console.log(err);
    }
  }
  async function getQRImage() {
    if (!photoesPermission) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (result.canceled) return;

    const imgURL = result.assets[0].uri;
    console.log(imgURL);

    try {
      const [{data}] = await BarCodeScanner.scanFromURLAsync(imgURL);

      props.route.params.updateBitcoinAdressFunc(data);
      navigate.goBack();
    } catch (err) {
      console.log(err);
    }
  }
  function handleBarCodeScanned({type, data}) {
    if (!type.includes('QRCode')) return;

    const bitcoinAdress = data;
    props.route.params.updateBitcoinAdressFunc(bitcoinAdress);
    navigate.goBack();
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },
  topBar: {
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: SIZES.large,
    marginRight: 'auto',
    marginLeft: 'auto',
    fontFamily: FONT.Title_Bold,
    transform: [{translateX: -10}],
  },
  camera: {flex: 1},
  bottomBar: {
    width: '100%',
    height: 60,
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 1,
    borderTopWidth: 1,
  },
  bottomText: {
    width: '100%',
    height: 50,
    textAlign: 'center',
    fontSize: SIZES.large,
    fontFamily: FONT.Other_Bold,

    lineHeight: 50,
  },
  arrowIcon: {
    position: 'absolute',
    top: -30,
    zIndex: 1,
    transform: [{translateX: -32.5}],
    color: 'white',

    paddingVertical: 2,
    paddingHorizontal: 20,

    borderTopRightRadius: 5,
    borderTopLeftRadius: 5,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
});
