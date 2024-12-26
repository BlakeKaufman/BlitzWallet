import {Alert, Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {CENTER, COLORS, ICONS, SIZES} from '../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {ThemeText} from '../../../../functions/CustomElements';
import {useTranslation} from 'react-i18next';
import sha256Hash from '../../../../functions/hash';

export function SendRecieveBTNs({tabNavigation}) {
  const navigate = useNavigation();
  const {nodeInformation, theme, darkModeType} = useGlobalContextProvider();

  const {t} = useTranslation();

  return (
    <View
      style={[
        styles.globalContainer,
        {marginTop: nodeInformation.userBalance === 0 ? 20 : 20},
      ]}>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => {
            (async () => {
              const areSettingsSet = await handleSettingsCheck();
              if (!areSettingsSet) {
                navigate.navigate('ErrorScreen', {
                  errorMessage: t('constants.internetError'),
                });
                return;
              }
              navigate.navigate('CustomHalfModal', {
                wantedContent: 'sendOptions',
                sliderHight: 0.5,
              });
            })();
          }}
          style={[
            styles.button,
            {
              backgroundColor: COLORS.darkModeText,
            },
          ]}>
          <ThemeText
            styles={{
              ...styles.buttonText,
              color: theme
                ? darkModeType
                  ? COLORS.lightsOutBackground
                  : COLORS.darkModeBackground
                : COLORS.lightModeText,
            }}
            content={t('constants.send')}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            (async () => {
              const areSettingsSet = await handleSettingsCheck();
              if (!areSettingsSet) {
                navigate.navigate('ErrorScreen', {
                  errorMessage: t('constants.internetError'),
                });
                return;
              }
              navigate.navigate('SendBTC');
            })();
          }}
          activeOpacity={1}
          style={{position: 'absolute', left: 110, zIndex: 1}}>
          <View
            style={{
              width: 60,
              height: 60,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 30,

              backgroundColor: theme
                ? darkModeType
                  ? COLORS.lightsOutBackgroundOffset
                  : COLORS.darkModeBackgroundOffset
                : COLORS.primary,
              // borderColor: theme ? '#013167' : COLORS.lightModeBackgroundOffset,
              // borderWidth: 3,
            }}>
            <Image
              style={{width: 35, height: 35}}
              source={ICONS.scanQrCodeLight}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            (async () => {
              const areSettingsSet = await handleSettingsCheck();
              if (!areSettingsSet) {
                navigate.navigate('ErrorScreen', {
                  errorMessage: t('constants.internetError'),
                });
                return;
              }
              navigate.navigate('EditReceivePaymentInformation', {
                from: 'homepage',
              });
              // navigate.navigate('ReceiveBTC');
            })();
          }}
          style={[
            styles.button,
            {
              backgroundColor: COLORS.darkModeText,
            },
          ]}>
          <ThemeText
            styles={{
              ...styles.buttonText,
              color: theme
                ? darkModeType
                  ? COLORS.lightsOutBackground
                  : COLORS.darkModeBackground
                : COLORS.lightModeText,
            }}
            content={t('constants.receive')}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

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
    marginTop: 20,
    marginBottom: 70,
  },

  container: {
    width: 280,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    ...CENTER,
  },
  button: {
    height: '100%',
    width: 120,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  buttonText: {
    textTransform: 'uppercase',
    paddingVertical: 10,
    includeFontPadding: false,
  },
});
