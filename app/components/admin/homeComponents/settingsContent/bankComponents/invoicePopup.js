import {StyleSheet, TouchableOpacity, View} from 'react-native';

import QRCode from 'react-native-qrcode-svg';
import {ANDROIDSAFEAREA, CENTER} from '../../../../../constants/styles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import GetThemeColors from '../../../../../hooks/themeColors';
import {COLORS, FONT, ICONS, SIZES} from '../../../../../constants';
import {useGlobalContacts} from '../../../../../../context-store/globalContacts';
import {useEffect, useState} from 'react';
import {copyToClipboard} from '../../../../../functions';
import {useNavigation} from '@react-navigation/native';

import {useGlobalContextProvider} from '../../../../../../context-store/context';
import FullLoadingScreen from '../../../../../functions/CustomElements/loadingScreen';
import {breezLiquidReceivePaymentWrapper} from '../../../../../functions/breezLiquid';

export default function LiquidAddressModal() {
  const insets = useSafeAreaInsets();
  const {backgroundOffset} = GetThemeColors();
  const {myProfileImage} = useGlobalContacts();
  const [receiveAddress, setReceiveAddress] = useState('');
  const {minMaxLiquidSwapAmounts} = useGlobalContextProvider();
  const navigate = useNavigation();
  const [isLoading, setIsLoading] = useState(true);

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
        paddingBottom: insets.bottom < 20 ? ANDROIDSAFEAREA : insets.bottom,
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
            }}
            style={[
              styles.qrContainer,
              {
                backgroundColor: backgroundOffset,
              },
            ]}>
            <QRCode
              size={230}
              quietZone={10}
              value={receiveAddress || 'Generating'}
              color={COLORS.lightModeText}
              backgroundColor={COLORS.darkModeText}
              logo={myProfileImage || ICONS.logoWithPadding}
              logoSize={50}
              logoMargin={3}
              logoBorderRadius={50}
              logoBackgroundColor={COLORS.darkModeText}
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

  qrContainer: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: 20,
    ...CENTER,
  },
});
