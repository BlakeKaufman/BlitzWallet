import {
  Animated,
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
import {TabActions, TabRouter, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {getClipboardText, getQRImage} from '../../../../functions';
import {ThemeText} from '../../../../functions/CustomElements';
import handleBackPress from '../../../../hooks/handleBackPress';
import {useEffect, useRef} from 'react';
import Icon from '../../../../functions/CustomElements/Icon';

export default function HalfModalSendOptions(props) {
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();
  const {theme, nodeInformation} = useGlobalContextProvider();
  const tabNavigation = props?.route?.params?.tabNavigation;

  const windowDimensions = useWindowDimensions();

  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
    setTimeout(() => {
      slideIn();
    }, 100);
  }, []);

  const slideIn = () => {
    Animated.timing(translateY, {
      toValue: windowDimensions.height * 0.5,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const slideOut = () => {
    Animated.timing(translateY, {
      toValue: windowDimensions.height,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const translateY = useRef(
    new Animated.Value(windowDimensions.height),
  ).current;

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        slideOut();
        setTimeout(() => {
          navigate.goBack();
        }, 200);
      }}>
      <View style={{flex: 1, backgroundColor: COLORS.opaicityGray}}>
        <Animated.View style={{marginTop: translateY}}>
          {/* <View
            style={[
              styles.borderTop,
              {
                width: useWindowDimensions().width * 0.99,
                backgroundColor: theme
                  ? COLORS.darkModeBackgroundOffset
                  : COLORS.lightModeBackgroundOffset,
                left: (useWindowDimensions().width * 0.01) / 2,
              },
            ]}></View> */}
          <View
            style={{
              height: useWindowDimensions().height * 0.5,
              minHeight: 'auto',
              width: '100%',
              backgroundColor: theme
                ? COLORS.darkModeBackground
                : COLORS.lightModeBackground,

              // borderTopColor: theme ? COLORS.darkModeText : COLORS.lightModeText,
              // borderTopWidth: 10,

              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,

              // borderTopLeftRadius: 10,
              // borderTopRightRadius: 10,

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
                <TouchableOpacity
                  onPress={() => {
                    navigate.goBack();
                    tabNavigation.jumpTo('ContactsPageInit');
                  }}>
                  <View style={styles.optionRow}>
                    <View
                      style={{
                        height: 35,
                        width: 35,
                        marginRight: 15,
                      }}>
                      <Image
                        style={styles.icon}
                        source={
                          theme ? ICONS.contactsIconLight : ICONS.contactsIcon
                        }
                      />
                    </View>
                    <ThemeText
                      styles={{...styles.optionText}}
                      content={'Contacts'}
                    />
                  </View>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Animated.View>
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
    marginTop: 20,
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
