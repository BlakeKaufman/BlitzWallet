import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
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

export default function VPNHome() {
  const navigate = useNavigation();
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
          <Image style={[backArrow]} source={ICONS.smallArrowLeft} />
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
            <Image
              style={[backArrow, {marginLeft: 10}]}
              source={ICONS.receiptIcon}
            />
          </TouchableOpacity>
        )}
      </View>
      {!selectedPage ? (
        <View style={styles.homepage}>
          <ThemeText
            styles={{textAlign: 'center', fontSize: SIZES.large}}
            content={
              'To use this VPN please dowload the Wireguard VPN client app'
            }
          />
          <TouchableOpacity
            onPress={() => {
              (async () => {
                try {
                  await WebBrowser.openBrowserAsync(
                    'https://www.wireguard.com/install',
                  );
                } catch (err) {
                  console.log(err, 'OPENING LINK ERROR');
                }
              })();
            }}>
            <ThemeText
              styles={{
                textAlign: 'center',
                color: COLORS.primary,
              }}
              content={'Dowload Here'}
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
