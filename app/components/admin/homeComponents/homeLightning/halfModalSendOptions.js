import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useGlobalContextProvider} from '../../../../../context-store/context';

export default function HalfModalSendOptions() {
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();
  const {theme} = useGlobalContextProvider();

  return (
    <TouchableWithoutFeedback onPress={() => navigate.goBack()}>
      <View style={{flex: 1}}>
        <View
          style={{
            height: '50%',
            width: '100%',
            marginTop: 'auto',
            backgroundColor: theme
              ? COLORS.darkModeBackground
              : COLORS.lightModeBackground,

            borderTopColor: theme
              ? COLORS.darkModeBackgroundOffset
              : COLORS.lightModeBackgroundOffset,
            borderTopWidth: 10,

            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,

            borderRadius: 10,

            padding: 10,
            paddingBottom: insets.bottom,
            alignItems: 'center',
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
            <TouchableOpacity>
              <View style={styles.optionRow}>
                <Image style={styles.icon} source={ICONS.scanQrCode} />
                <Text
                  style={[
                    styles.optionText,
                    {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                  ]}>
                  Scan QR
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity>
              <View style={styles.optionRow}>
                <Image style={styles.icon} source={ICONS.ImagesIcon} />
                <Text
                  style={[
                    styles.optionText,
                    {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                  ]}>
                  From Image
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => {
              navigate.goBack();
            }}>
            <Text>Close</Text>
          </TouchableOpacity>
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
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.large,
  },

  icon: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
});
