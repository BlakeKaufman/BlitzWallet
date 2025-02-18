import {Platform, StyleSheet, TouchableOpacity, View} from 'react-native';
import {ANDROIDSAFEAREA} from '../../../../../constants/styles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import GetThemeColors from '../../../../../hooks/themeColors';
import {useEffect, useState} from 'react';
import {copyToClipboard} from '../../../../../functions';
import {useNavigation} from '@react-navigation/native';
import FullLoadingScreen from '../../../../../functions/CustomElements/loadingScreen';
import {breezLiquidReceivePaymentWrapper} from '../../../../../functions/breezLiquid';
import QrCodeWrapper from '../../../../../functions/CustomElements/QrWrapper';
import {useAppStatus} from '../../../../../../context-store/appStatus';

export default function LiquidAddressModal() {
  const insets = useSafeAreaInsets();
  const {backgroundOffset} = GetThemeColors();
  const [receiveAddress, setReceiveAddress] = useState('');
  const {minMaxLiquidSwapAmounts} = useAppStatus();

  const navigate = useNavigation();
  const [isLoading, setIsLoading] = useState(true);

  const bottomPadding = Platform.select({
    ios: insets.bottom,
    android: ANDROIDSAFEAREA,
  });

  useEffect(() => {
    async function getReceiveAddress() {
      try {
        const addressResponse = await breezLiquidReceivePaymentWrapper({
          swapsAmounts: minMaxLiquidSwapAmounts,
          paymentType: 'liquid',
        });
        if (!addressResponse) {
          navigate.navigate('ErrorScreen', {
            errorMessage: 'Unable to generate liquid address',
          });
          return;
        }
        const {destination, receiveFeesSat} = addressResponse;
        setReceiveAddress(destination);
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    }

    getReceiveAddress();
  }, []);

  return (
    <View
      style={{
        height: 350,
        width: '100%',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingBottom: bottomPadding,
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: backgroundOffset,
          },
        ]}
      />
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        {isLoading ? (
          <FullLoadingScreen />
        ) : (
          <TouchableOpacity
            onPress={() => {
              copyToClipboard(receiveAddress, navigate);
            }}>
            <QrCodeWrapper
              outerContainerStyle={{width: 275, height: 275}}
              innerContainerStyle={{width: 250, height: 250}}
              qrSize={250}
              QRData={receiveAddress}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    width: 120,
    height: 8,
    marginTop: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
});
