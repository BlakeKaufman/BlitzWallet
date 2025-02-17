import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {CENTER, COLORS, ICONS} from '../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useTranslation} from 'react-i18next';
import ThemeImage from '../../../../functions/CustomElements/themeImage';
import {useMemo} from 'react';
import CustomSendAndRequsetBTN from '../../../../functions/CustomElements/sendRequsetCircleBTN';
import {useGlobalThemeContext} from '../../../../../context-store/theme';

export function SendRecieveBTNs() {
  const navigate = useNavigation();
  const {isConnectedToTheInternet} = useGlobalContextProvider();
  const {theme, darkModeType} = useGlobalThemeContext();

  const {t} = useTranslation();

  const buttonElements = useMemo(
    () =>
      ['send', 'camera', 'receive'].map(btnType => {
        const isArrow = btnType === 'send' || btnType === 'receive';
        if (isArrow) {
          return CustomSendAndRequsetBTN({
            btnType,
            btnFunction: async () => {
              const areSettingsSet = await handleSettingsCheck();
              if (!areSettingsSet) {
                navigate.navigate('ErrorScreen', {
                  errorMessage: t('constants.internetError'),
                });
                return;
              }
              if (btnType === 'send') {
                navigate.navigate('CustomHalfModal', {
                  wantedContent: 'sendOptions',
                  sliderHight: 0.5,
                });
              } else {
                navigate.navigate('EditReceivePaymentInformation', {
                  from: 'homepage',
                });
              }
            },
            arrowColor: theme
              ? darkModeType
                ? COLORS.lightsOutBackground
                : COLORS.darkModeBackground
              : COLORS.primary,
            containerBackgroundColor: COLORS.darkModeText,
          });
        }
        return (
          <TouchableOpacity
            key={btnType}
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
            }}>
            <View
              style={{
                ...styles.scanQrIcon,
                backgroundColor: theme
                  ? darkModeType
                    ? COLORS.opaicityGray
                    : COLORS.darkModeBackgroundOffset
                  : COLORS.primary,
              }}>
              <ThemeImage
                darkModeIcon={ICONS.scanQrCodeLight}
                lightsOutIcon={ICONS.scanQrCodeLight}
                lightModeIcon={ICONS.scanQrCodeLight}
              />
            </View>
          </TouchableOpacity>
        );
      }),
    [isConnectedToTheInternet, theme, darkModeType],
  );

  return <View style={styles.container}>{buttonElements}</View>;

  async function handleSettingsCheck() {
    try {
      if (!isConnectedToTheInternet) throw new Error('Not Connected To Node');

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
  container: {
    width: 220,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 70,
    ...CENTER,
  },

  scanQrIcon: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
});
