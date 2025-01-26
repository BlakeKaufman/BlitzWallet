import {Platform, StyleSheet, useWindowDimensions, View} from 'react-native';

import {ANDROIDSAFEAREA, CENTER} from '../../../../../constants/styles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import GetThemeColors from '../../../../../hooks/themeColors';
import {COLORS, FONT, ICONS, SIZES} from '../../../../../constants';
import {useGlobalContacts} from '../../../../../../context-store/globalContacts';

import QRCode from 'react-native-qrcode-svg';
import {btoa} from 'react-native-quick-base64';

export default function MyProfileQRCode() {
  const insets = useSafeAreaInsets();
  const {backgroundOffset} = GetThemeColors();
  const {globalContactsInformation, myProfileImage} = useGlobalContacts();

  const bottomPadding = Platform.select({
    ios: insets.bottom,
    android: ANDROIDSAFEAREA,
  });

  return (
    <View
      style={{
        ...styles.container,
        paddingBottom: bottomPadding,
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
        <View
          style={[
            styles.qrContainer,
            {
              backgroundColor: backgroundOffset,
            },
          ]}>
          <QRCode
            size={230}
            quietZone={10}
            value={btoa(
              JSON.stringify({
                uniqueName: globalContactsInformation.myProfile.uniqueName,
                name: globalContactsInformation.myProfile.name || '',
                bio: globalContactsInformation.myProfile?.bio || 'No bio set',
                uuid: globalContactsInformation.myProfile?.uuid,
                receiveAddress:
                  globalContactsInformation.myProfile.receiveAddress,
              }),
            )}
            color={COLORS.lightModeText}
            backgroundColor={COLORS.darkModeText}
            logo={myProfileImage || ICONS.logoWithPadding}
            logoSize={50}
            logoMargin={3}
            logoBorderRadius={50}
            logoBackgroundColor={COLORS.darkModeText}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 350,
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
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
