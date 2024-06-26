import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CENTER,
  COLORS,
  FONT,
  ICONS,
  SHADOWS,
  SIZES,
} from '../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {ThemeText} from '../../../../functions/CustomElements';

export function SendRecieveBTNs() {
  const navigate = useNavigation();
  const {nodeInformation, theme} = useGlobalContextProvider();

  return (
    <View
      style={[
        styles.globalContainer,
        {marginTop: nodeInformation.userBalance === 0 ? 20 : 40},
      ]}>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => {
            (async () => {
              const areSettingsSet = await handleSettingsCheck();
              if (!areSettingsSet) {
                navigate.navigate('ErrorScreen', {
                  errorMessage: 'Not connected to the node',
                });
                return;
              }
              navigate.navigate('HalfModalSendOption');
            })();
          }}
          style={[
            styles.button,
            {
              backgroundColor: theme
                ? COLORS.darkModeText
                : COLORS.lightModeText,
            },
          ]}>
          <ThemeText content={'Send'} reversed={true} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            (async () => {
              const areSettingsSet = await handleSettingsCheck();
              if (!areSettingsSet) {
                navigate.navigate('ErrorScreen', {
                  errorMessage: 'Not connected to the node',
                });
                return;
              }
              navigate.navigate('SendBTC');
            })();
          }}
          activeOpacity={0.9}
          style={{position: 'absolute', top: -7.5, left: 120, zIndex: 1}}>
          <View
            style={{
              width: 55,
              height: 55,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 30,

              backgroundColor: theme
                ? COLORS.darkModeBackground
                : COLORS.lightModeBackground,
              borderColor: theme ? '#013167' : COLORS.lightModeBackgroundOffset,
              borderWidth: 3,
            }}>
            <Image
              style={{width: 30, height: 30}}
              source={theme ? ICONS.scanQrCodeLight : ICONS.scanQrCodeDark}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            (async () => {
              const areSettingsSet = await handleSettingsCheck();
              if (!areSettingsSet) {
                navigate.navigate('ErrorScreen', {
                  errorMessage: 'Not connected to the node',
                });
                return;
              }
              navigate.navigate('ReceiveBTC');
            })();
          }}
          style={[
            styles.button,
            {
              backgroundColor: theme
                ? COLORS.darkModeText
                : COLORS.lightModeText,
            },
          ]}>
          <ThemeText content={'Receive'} reversed={true} />
        </TouchableOpacity>
      </View>
    </View>
  );

  async function canSendOrReceivePayment() {
    const areSettingsSet = await handleSettingsCheck();
    if (!areSettingsSet) {
      Alert.alert(
        'Not connected to your node',
        'To send and receive you must be connected to your node',
      );
      return new Promise(resolve => {
        resolve(false);
      });
    } else {
      return new Promise(resolve => {
        resolve(true);
      });
    }
  }
  async function handleSettingsCheck() {
    try {
      if (!nodeInformation.didConnectToNode)
        throw new Error('Not Connected To Node');

      return new Promise(resolve => {
        resolve(true);
      });
    } catch (err) {
      return new Promise(resolve => {
        resolve(false);
      });
    }
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },

  container: {
    width: 300,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    ...CENTER,
  },
  button: {
    height: '100%',
    width: 130,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    ...SHADOWS.medium,
  },
});
