import {StyleSheet, View, TouchableOpacity, ScrollView} from 'react-native';
import {
  GlobalThemeView,
  ThemeText,
} from '../../../../../functions/CustomElements';
import {SIZES, WINDOWWIDTH} from '../../../../../constants/theme';
import {CENTER, ICONS} from '../../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import {copyToClipboard, getLocalStorageItem} from '../../../../../functions';
import CustomButton from '../../../../../functions/CustomElements/button';
import * as WebBrowser from 'expo-web-browser';
import {useGlobalAppData} from '../../../../../../context-store/appData';
import ThemeImage from '../../../../../functions/CustomElements/themeImage';

export default function HistoricalVPNPurchases() {
  const [purchaseList, setPurchaseList] = useState([]);
  const navigate = useNavigation();
  const {decodedVPNS} = useGlobalAppData();

  useEffect(() => {
    async function getSavedPurchases() {
      const savedVPNConfigs = JSON.parse(JSON.stringify(decodedVPNS));
      const savedRequests =
        JSON.parse(await getLocalStorageItem('savedVPNIds')) || [];
      setPurchaseList([...savedRequests, ...savedVPNConfigs]);
    }
    getSavedPurchases();
  }, [decodedVPNS]);

  const purchaseElements = purchaseList.map((item, index) => {
    return (
      <TouchableOpacity
        key={item.createdTime}
        style={styles.container}
        onPress={() => {
          if (item.config)
            navigate.navigate('GeneratedVPNFile', {
              generatedFile: item.config,
            });
          else
            navigate.navigate('ErrorScreen', {
              errorMessage:
                'Thre is no VPN config file associated with this purhcase.',
            });
        }}>
        <View style={styles.infoContainer}>
          <ThemeText styles={{...styles.label}} content={'Country:'} />
          <ThemeText styles={{...styles.value}} content={item.country} />
        </View>
        <View style={styles.infoContainer}>
          <ThemeText styles={{...styles.label}} content={'Created At:'} />
          <ThemeText
            styles={{...styles.value}}
            content={new Date(item.createdTime).toLocaleString()}
          />
        </View>
        <View style={styles.infoContainer}>
          <ThemeText styles={{...styles.label}} content={'Duration:'} />
          <ThemeText styles={{...styles.value}} content={item.duration} />
        </View>
        <TouchableOpacity
          onPress={() => {
            copyToClipboard(item.payment_hash, navigate);
          }}
          style={styles.infoContainer}>
          <ThemeText styles={{...styles.label}} content={'Order id:'} />
          <ThemeText styles={{...styles.value}} content={item.payment_hash} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  });
  return (
    <GlobalThemeView>
      <View style={styles.globalContainer}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={{marginRight: 'auto'}}
            onPress={() => {
              navigate.goBack();
            }}>
            <ThemeImage
              darkModeIcon={ICONS.smallArrowLeft}
              lightModeIcon={ICONS.smallArrowLeft}
              lightsOutIcon={ICONS.arrow_small_left_white}
            />
          </TouchableOpacity>
          <ThemeText
            styles={{...styles.topBarText}}
            content={'Historical Purchases'}
          />
        </View>
        {purchaseElements.length === 0 ? (
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <ThemeText content={'You have no VPN configuations'} />
          </View>
        ) : (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{marginTop: 30, width: '90%', ...CENTER}}>
              {purchaseElements}
            </ScrollView>
            <ThemeText
              styles={{textAlign: 'center'}}
              content={'For assistance, reach out to LNVPN'}
            />
            <CustomButton
              buttonStyles={{...CENTER, marginTop: 10}}
              textContent={'Contact'}
              actionFunction={() => {
                (async () => {
                  try {
                    await WebBrowser.openBrowserAsync(
                      'https://t.me/+x_j8zikjnqhiODIy',
                    );
                  } catch (err) {
                    console.log(err, 'OPENING LINK ERROR');
                  }
                })();
              }}
            />
          </>
        )}
      </View>
    </GlobalThemeView>
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

  container: {
    marginVertical: 10,
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 10,
  },
  value: {
    flex: 1,
    flexWrap: 'wrap',
  },
});
