import {
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {COLORS, FONT, ICONS, SIZES} from '../../../../constants';
import {backArrow, headerText} from '../../../../constants/styles';
import * as Device from 'expo-device';

import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../context-store/context';

export default function FaucetHome() {
  const navigate = useNavigation();
  const {theme} = useGlobalContextProvider();

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
        style={[
          {flex: 1, marginVertical: Device.osName === 'Android' ? 10 : 0},
        ]}>
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              navigate.goBack();
              return;
            }}>
            <Image style={[backArrow]} source={ICONS.leftCheveronIcon} />
          </TouchableOpacity>
          <Text
            style={[
              headerText,
              {
                transform: [{translateX: -12.5}],
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            Faucet
          </Text>
        </View>
        <View style={styles.contentContainer}>
          <Text
            style={[
              styles.questionText,
              {
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            Would you like to create a send or receive faucet?
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => {
                return;
              }}
              style={[styles.button, {opacity: 0.3}]}>
              <Text style={{color: COLORS.white}}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigate.navigate('FaucetSettingsPage', {
                  faucetType: 'recieve',
                });
              }}
              style={[styles.button]}>
              <Text style={{color: COLORS.white}}>Receive</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  //   topbar
  topBar: {
    width: '100%',
    flexDirection: 'row',
  },
  //   content container

  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionText: {
    width: 250,
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Bold,
    textAlign: 'center',
    marginBottom: 50,
  },

  buttonContainer: {
    width: '75%',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  button: {
    width: '40%',
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
});
