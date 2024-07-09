import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {getClipboardText, getQRImage} from '../../../../functions';
import {ThemeText} from '../../../../functions/CustomElements';
import handleBackPress from '../../../../hooks/handleBackPress';
import {useEffect} from 'react';

export default function HalfModalSendOptions() {
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();
  const {theme, nodeInformation} = useGlobalContextProvider();

  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

  return (
    <TouchableWithoutFeedback onPress={() => navigate.goBack()}>
      <View style={{flex: 1}}>
        <View style={{marginTop: 'auto'}}>
          <View
            style={[
              styles.borderTop,
              {
                width: useWindowDimensions().width * 0.99,
                backgroundColor: theme
                  ? COLORS.darkModeBackgroundOffset
                  : COLORS.lightModeBackgroundOffset,
                left: (useWindowDimensions().width * 0.01) / 2,
              },
            ]}></View>
          <View
            style={{
              height: useWindowDimensions().height * 0.5,
              width: '100%',
              backgroundColor: theme
                ? COLORS.darkModeBackground
                : COLORS.lightModeBackground,

              // borderTopColor: theme ? COLORS.darkModeText : COLORS.lightModeText,
              // borderTopWidth: 10,

              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,

              // borderTopLeftRadius: 10,
              // borderTopRightRadius: 10,

              padding: 10,
              paddingBottom: insets.bottom,
              alignItems: 'center',
              position: 'relative',
              zIndex: 1,
            }}>
            <View
              style={[
                styles.topBar,
                {
                  backgroundColor: theme
                    ? COLORS.darkModeBackgroundOffset
                    : COLORS.lightModeBackgroundOffset,
                },
              ]}></View>
            <View style={styles.optionsContainer}>
              <ScrollView showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  onPress={() => {
                    navigate.navigate('HomeAdmin');
                    navigate.navigate('SendBTC');
                  }}>
                  <View style={styles.optionRow}>
                    <Image
                      style={styles.icon}
                      source={
                        theme ? ICONS.scanQrCodeLight : ICONS.scanQrCodeDark
                      }
                    />

                    <ThemeText
                      styles={{...styles.optionText}}
                      content={'Scan QR'}
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    getQRImage(navigate, 'modal', nodeInformation);
                  }}>
                  <View style={styles.optionRow}>
                    <Image
                      style={styles.icon}
                      source={theme ? ICONS.ImagesIcon : ICONS.ImagesIconDark}
                    />
                    <ThemeText
                      styles={{...styles.optionText}}
                      content={'From Image'}
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    getClipboardText(navigate, 'modal', nodeInformation);
                  }}>
                  <View style={styles.optionRow}>
                    <Image
                      style={styles.icon}
                      source={
                        theme ? ICONS.clipboardLight : ICONS.clipboardDark
                      }
                    />
                    <ThemeText
                      styles={{...styles.optionText}}
                      content={'From Clipboard'}
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    navigate.goBack();
                    navigate.navigate('ManualyEnterSendAddress');
                  }}>
                  <View style={styles.optionRow}>
                    <Image
                      style={styles.icon}
                      source={theme ? ICONS.editIconLight : ICONS.editIcon}
                    />
                    <ThemeText
                      styles={{...styles.optionText}}
                      content={'Manual Input'}
                    />
                  </View>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  topBar: {
    width: 120,
    height: 8,
    marginTop: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  borderTop: {
    width: '100%',
    height: 60,
    position: 'absolute',
    top: -5,
    zIndex: -1,

    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  optionsContainer: {
    width: '100%',
    height: '100%',
  },

  optionRow: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    ...CENTER,
  },
  optionText: {
    fontSize: SIZES.large,
  },

  icon: {
    width: 35,
    height: 35,
    marginRight: 15,
  },
});
