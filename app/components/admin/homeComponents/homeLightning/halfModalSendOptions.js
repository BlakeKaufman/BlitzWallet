import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {CENTER, ICONS, SIZES} from '../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {getClipboardText, getQRImage} from '../../../../functions';
import {ThemeText} from '../../../../functions/CustomElements';

import {useGlobalContacts} from '../../../../../context-store/globalContacts';
import GetThemeColors from '../../../../hooks/themeColors';
import {useTranslation} from 'react-i18next';

export default function HalfModalSendOptions(props) {
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();
  const {theme, nodeInformation} = useGlobalContextProvider();
  const {backgroundOffset, backgroundColor} = GetThemeColors();
  const {decodedAddedContacts} = useGlobalContacts();
  const {t} = useTranslation();

  const windowDimensions = useWindowDimensions();
  console.log(windowDimensions.height * props.slideHeight, 'TE');

  return (
    <View
      style={{
        height: windowDimensions.height * props.slideHeight,
        minHeight: 'auto',
        width: '100%',
        backgroundColor: backgroundColor,

        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,

        paddingBottom: insets.bottom,
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: backgroundOffset,
          },
        ]}></View>
      <View style={styles.optionsContainer}>
        <ScrollView showsHorizontalScrollIndicator={false}>
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
                content={t('wallet.halfModal.images')}
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
                source={theme ? ICONS.clipboardLight : ICONS.clipboardDark}
              />
              <ThemeText
                styles={{...styles.optionText}}
                content={t('wallet.halfModal.clipboard')}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              navigate.navigate('CustomHalfModal', {
                wantedContent: 'manualEnterSendAddress',
                sliderHight: 0.5,
              });
            }}>
            <View style={styles.optionRow}>
              <Image
                style={styles.icon}
                source={theme ? ICONS.editIconLight : ICONS.editIcon}
              />
              <ThemeText
                styles={{...styles.optionText}}
                content={t('wallet.halfModal.manual')}
              />
            </View>
          </TouchableOpacity>
          {decodedAddedContacts.length != 0 && (
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS === 'android') {
                  navigate.navigate('ChooseContactHalfModal');
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
                        name: 'ChooseContactHalfModal',
                      },
                    ],
                  });
                }
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
                  content={t('wallet.halfModal.contacts')}
                />
              </View>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </View>
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
