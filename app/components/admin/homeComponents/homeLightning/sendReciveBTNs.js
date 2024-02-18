import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {CENTER, COLORS, FONT, SHADOWS, SIZES} from '../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {getLocalStorageItem, setLocalStorageItem} from '../../../../functions';
import {nodeInfo} from '@breeztech/react-native-breez-sdk';
import {useGlobalContextProvider} from '../../../../../context-store/context';

export function SendRecieveBTNs() {
  const navigate = useNavigation();
  const {nodeInformation, theme} = useGlobalContextProvider();

  return (
    <View style={[styles.globalContainer]}>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => {
            (async () => {
              const areSettingsSet = await handleSettingsCheck();
              if (!areSettingsSet) {
                Alert.alert('Not Connected To Node');
                return;
              }
              navigate.navigate('SendBTC');
            })();
          }}
          style={[
            styles.button,
            {
              backgroundColor: theme
                ? COLORS.lightModeBackground
                : COLORS.darkModeBackground,
            },
          ]}>
          <Text
            style={[
              styles.text,
              {
                color: theme
                  ? COLORS.darkModeBackground
                  : COLORS.lightModeBackground,
              },
            ]}>
            Send
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            (async () => {
              const areSettingsSet = await handleSettingsCheck();
              if (!areSettingsSet) {
                Alert.alert('Not Connected To Node');
                return;
              }
              navigate.navigate('ReceiveBTC');
            })();
          }}
          style={[
            styles.button,
            {
              backgroundColor: theme
                ? COLORS.lightModeBackground
                : COLORS.darkModeBackground,
            },
          ]}>
          <Text
            style={[
              styles.text,
              {
                color: theme
                  ? COLORS.darkModeBackground
                  : COLORS.lightModeBackground,
              },
            ]}>
            Receive
          </Text>
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

      const currency = await getLocalStorageItem('currency');
      if (!currency) setLocalStorageItem('currency', 'USD');
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
  text: {
    fontFamily: FONT.Other_Regular,
    fontSize: SIZES.medium,
    color: COLORS.background,
  },
});
