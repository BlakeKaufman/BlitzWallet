import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {ThemeText} from '../../../../../functions/CustomElements';
import {COLORS, SIZES, WINDOWWIDTH} from '../../../../../constants/theme';
import {CENTER, ICONS} from '../../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {backArrow} from '../../../../../constants/styles';
import {useEffect, useState} from 'react';
import axios from 'axios';
import CustomButton from '../../../../../functions/CustomElements/button';
import * as WebBrowser from 'expo-web-browser';
import VPNPlanPage from './VPNPlanPage';
import ThemeImage from '../../../../../functions/CustomElements/themeImage';
import {useGlobalContextProvider} from '../../../../../../context-store/context';

export default function VPNHome() {
  const navigate = useNavigation();
  const {theme, darkModeType} = useGlobalContextProvider();
  const [selectedPage, setSelectedPage] = useState(null);

  return (
    <View style={styles.globalContainer}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={{marginRight: 'auto'}}
          onPress={() => {
            if (selectedPage === null) navigate.goBack();
            else setSelectedPage(null);
          }}>
          <ThemeImage
            darkModeIcon={ICONS.smallArrowLeft}
            lightModeIcon={ICONS.smallArrowLeft}
            lightsOutIcon={ICONS.arrow_small_left_white}
          />
        </TouchableOpacity>
        <ThemeText
          styles={{...styles.topBarText}}
          content={selectedPage != null ? selectedPage : ''}
        />

        {!selectedPage && (
          <TouchableOpacity
            onPress={() => {
              navigate.navigate('HistoricalVPNPurchases');
            }}>
            <ThemeImage
              darkModeIcon={ICONS.receiptIcon}
              lightModeIcon={ICONS.receiptIcon}
              lightsOutIcon={ICONS.receiptWhite}
            />
          </TouchableOpacity>
        )}
      </View>
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

          {/* {notSentNotifications.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedPage('Not sent notifications');
                }}
                style={[
                  {
                    marginTop: 20,
                  },
                ]}>
                <ThemeText
                  styles={{textAlign: 'center'}}
                  content={'View not sent notification status'}
                />
              </TouchableOpacity>
            )} */}
        </View>
      ) : selectedPage.toLowerCase('select plan') ? (
        <VPNPlanPage />
      ) : (
        <View></View>
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
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    ...CENTER,
  },
  topBarText: {
    fontSize: SIZES.large,
    textTransform: 'capitalize',
    includeFontPadding: false,
  },
  homepage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
