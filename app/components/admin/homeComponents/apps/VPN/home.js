import {Platform, StyleSheet, TouchableOpacity, View} from 'react-native';
import {ThemeText} from '../../../../../functions/CustomElements';
import {COLORS, SIZES, WINDOWWIDTH} from '../../../../../constants/theme';
import {CENTER, ICONS} from '../../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import CustomButton from '../../../../../functions/CustomElements/button';
import * as WebBrowser from 'expo-web-browser';
import VPNPlanPage from './VPNPlanPage';
import CustomSettingsTopBar from '../../../../../functions/CustomElements/settingsTopBar';
import {useGlobalThemeContext} from '../../../../../../context-store/theme';

export default function VPNHome() {
  const navigate = useNavigation();
  const {theme, darkModeType} = useGlobalThemeContext();
  const [selectedPage, setSelectedPage] = useState(null);
  const [countryList, setCountriesList] = useState([]);
  useEffect(() => {
    async function getAvailableCountries() {
      try {
        const response = await fetch('https://lnvpn.net/api/v1/countryList', {
          method: 'GET',
        });
        const data = await response.json();

        setCountriesList(data);
      } catch (err) {
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Unable to get available countries',
          customNavigator: () => {
            navigate.reset({
              index: 0,
              routes: [
                {
                  name: 'HomeAdmin', // Navigate to HomeAdmin
                  params: {
                    screen: 'Home',
                  },
                },
                {
                  name: 'HomeAdmin', // Navigate to HomeAdmin
                  params: {
                    screen: 'App Store',
                  },
                },
              ],
            });
          },
        });
        console.log(err);
      }
    }
    getAvailableCountries();
  }, []);

  return (
    <View style={styles.globalContainer}>
      <CustomSettingsTopBar
        customBackFunction={() => {
          if (selectedPage === null) navigate.goBack();
          else setSelectedPage(null);
        }}
        label={selectedPage || ''}
        showLeftImage={!selectedPage}
        leftImageBlue={ICONS.receiptIcon}
        LeftImageDarkMode={ICONS.receiptWhite}
        leftImageFunction={() => {
          navigate.navigate('HistoricalVPNPurchases');
        }}
        containerStyles={{height: 30}}
      />
      {!selectedPage ? (
        <View style={styles.homepage}>
          <ThemeText
            styles={{textAlign: 'center', fontSize: SIZES.large}}
            content={
              'To use this VPN please download the Wireguard VPN client app'
            }
          />
          <TouchableOpacity
            onPress={() => {
              (async () => {
                try {
                  await WebBrowser.openBrowserAsync(
                    Platform.OS === 'ios'
                      ? 'https://apps.apple.com/us/app/wireguard/id1441195209'
                      : 'https://play.google.com/store/apps/details?id=com.wireguard.android',
                  );
                } catch (err) {
                  console.log(err, 'OPENING LINK ERROR');
                }
              })();
            }}>
            <ThemeText
              styles={{
                textAlign: 'center',
                marginTop: 15,
                color:
                  theme && darkModeType ? COLORS.darkModeText : COLORS.primary,
              }}
              content={'Download Here'}
            />
          </TouchableOpacity>

          <CustomButton
            buttonStyles={{width: '80%', marginTop: 50}}
            textStyles={{fontSize: SIZES.large}}
            actionFunction={() => {
              setSelectedPage('Select Plan');
            }}
            textContent={'Continue'}
          />
        </View>
      ) : (
        <VPNPlanPage countryList={countryList} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
    width: WINDOWWIDTH,
    ...CENTER,
  },
  homepage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
