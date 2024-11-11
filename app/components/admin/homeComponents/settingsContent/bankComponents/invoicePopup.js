import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import QRCode from 'react-native-qrcode-svg';
import {btoa} from 'react-native-quick-base64';
import {ANDROIDSAFEAREA, CENTER} from '../../../../../constants/styles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import GetThemeColors from '../../../../../hooks/themeColors';
import {COLORS, FONT, ICONS, SIZES} from '../../../../../constants';
import {useGlobalContacts} from '../../../../../../context-store/globalContacts';
import {useEffect, useState} from 'react';
import {createLiquidReceiveAddress} from '../../../../../functions/liquidWallet';
import {copyToClipboard} from '../../../../../functions';
import {useNavigation} from '@react-navigation/native';

export default function LiquidAddressModal() {
  const insets = useSafeAreaInsets();
  const {backgroundOffset} = GetThemeColors();
  const {myProfileImage} = useGlobalContacts();
  const [receiveAddress, setReceiveAddress] = useState('');
  const navigate = useNavigation();

  useEffect(() => {
    async function getReceiveAddress() {
      const {address} = await createLiquidReceiveAddress();
      setReceiveAddress(address);
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
