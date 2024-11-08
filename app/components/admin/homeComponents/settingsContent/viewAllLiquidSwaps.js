import {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Share,
  Platform,
} from 'react-native';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {CENTER, COLORS, FONT, SHADOWS, SIZES} from '../../../../constants';
import * as FileSystem from 'expo-file-system';
import {decryptMessage} from '../../../../functions/messaging/encodingAndDecodingMessages';
import {getPublicKey} from 'nostr-tools';
import WebView from 'react-native-webview';
import handleRefundSubmarineClaim from '../../../../functions/boltz/handle-refund-wss';
import {createLiquidReceiveAddress} from '../../../../functions/liquidWallet';
import {getLocalStorageItem} from '../../../../functions';
import {ThemeText} from '../../../../functions/CustomElements';
import {useNavigation} from '@react-navigation/native';
import {useWebView} from '../../../../../context-store/webViewContext';
import {getBoltzApiUrl} from '../../../../functions/boltz/boltzEndpoitns';
import getBoltzFeeRates from '../../../../functions/boltz/getBoltzFeerate,';
import CustomButton from '../../../../functions/CustomElements/button';
import * as WebBrowser from 'expo-web-browser';

const webviewHTML = require('boltz-swap-web-context');

export default function ViewAllLiquidSwaps(props) {
  const {masterInfoObject, contactsPrivateKey} = useGlobalContextProvider();
  const [liquidSwaps, setLiquidSwaps] = useState([]);
  const {refundSwapsRef} = useWebView();
  const navigate = useNavigation();

  const refundSwap = async refundInfo => {
    const feeRate = await getBoltzFeeRates();
    const liquidAddres = await createLiquidReceiveAddress();

    const args = JSON.stringify({
      address: liquidAddres.address,
      feeRate: process.env.BOLTZ_ENVIRONMENT === 'testnet' ? 0.11 : feeRate,
      swapInfo: refundInfo,
      privateKey: refundInfo.privateKey,
      apiUrl: getBoltzApiUrl(process.env.BOLTZ_ENVIRONMENT),
      network: process.env.BOLTZ_ENVIRONMENT,
    });

    refundSwapsRef.current.injectJavaScript(
      `window.refundSubmarineSwap(${args}); void(0);`,
    );
  };
  useEffect(() => {
    (async () => {
      const liquidSwaps =
        JSON.parse(await getLocalStorageItem('savedLiquidSwaps')) || [];
      setLiquidSwaps(liquidSwaps);
    })();
  }, []);

  const transectionElements = liquidSwaps.map((tx, id) => {
    return (
      <View
        style={[
          styles.swapContainer,
          {
            marginVertical: 10,
          },
        ]}
        key={id}>
        <ThemeText content={tx?.id} />

        <TouchableOpacity
          style={[
            styles.buttonContainer,
            {
              backgroundColor: props.theme
                ? COLORS.darkModeText
                : COLORS.lightModeText,
            },
          ]}
          onPress={() => {
            downloadRefundFile(tx?.id);
          }}>
          <Text
            style={[
              styles.buttonText,
              {
                color: props.theme ? COLORS.lightModeText : COLORS.darkModeText,
              },
            ]}>
            Refund
          </Text>
        </TouchableOpacity>
      </View>
    );
  });

  return (
    <View style={styles.globalContainer}>
      {liquidSwaps.length === 0 ? (
        <ThemeText
          styles={{...styles.noTxText}}
          content={'You have no failed liquid transactions'}
        />
      ) : (
        <View style={{flex: 1, width: '100%'}}>
          <ScrollView style={{flex: 1}}>{transectionElements}</ScrollView>
          <ThemeText
            styles={{textAlign: 'center'}}
            content={
              'To refund a failed swap download the refund file and then click the link below'
            }
          />
          <CustomButton
            buttonStyles={{width: 'auto', ...CENTER, marginTop: 10}}
            textContent={'Boltz Website'}
            actionFunction={() => {
              (async () => {
                try {
                  await WebBrowser.openBrowserAsync(
                    'https://boltz.exchange/refund',
                  );
                } catch (err) {
                  console.log(err, 'OPENING LINK ERROR');
                }
              })();
            }}
          />
        </View>
      )}
    </View>
  );

  async function downloadRefundFile(id) {
    try {
      const [filteredFile] = liquidSwaps.filter(tx => {
        if (tx.id === id) {
          return tx;
        }
      });
      console.log(filteredFile);

      // refundSwap(filteredFile);
      // return;

      const data = JSON.stringify(filteredFile);
      const fileName = `${id}_Blitz_LiquidSwap.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, data, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (Platform.OS === 'ios') {
        await Share.share({
          title: `${fileName}`,
          url: `${fileUri}`,
          type: 'application/json',
        });
      } else {
        try {
          const permissions =
            await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (permissions.granted) {
            const data =
              await FileSystem.StorageAccessFramework.readAsStringAsync(
                fileUri,
              );
            await FileSystem.StorageAccessFramework.createFileAsync(
              permissions.directoryUri,
              fileName,
              'application/json',
            )
              .then(async uri => {
                await FileSystem.writeAsStringAsync(uri, data);
              })
              .catch(err => {
                navigate.navigate('ErrorScreen', {
                  errorMessage: 'Error saving file to document',
                });
              });
          } else {
            await Share.share({
              title: `${fileName}`,
              url: `${fileUri}`,
              type: 'application/json',
            });
          }
        } catch (err) {
          console.log(err);
          navigate.navigate('ErrorScreen', {
            errorMessage: 'Error gettings permissions',
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
}
const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noTxText: {
    width: '95%',
    maxWidth: 250,
    textAlign: 'center',
  },
  backgroundScrollContainer: {
    flex: 1,
    height: 400,
    maxWidth: 400,
    padding: 10,
    borderRadius: 8,
  },

  swapContainer: {
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },

  buttonContainer: {
    paddingVertical: 8,
    paddingHorizontal: 17,
    borderRadius: 9,
  },
  buttonText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
  },
});
