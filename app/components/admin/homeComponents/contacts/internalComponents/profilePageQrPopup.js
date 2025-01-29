import {Platform, StyleSheet, View} from 'react-native';

import {ANDROIDSAFEAREA, CENTER} from '../../../../../constants/styles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import GetThemeColors from '../../../../../hooks/themeColors';
import {useGlobalContacts} from '../../../../../../context-store/globalContacts';
import {btoa} from 'react-native-quick-base64';
import QrCodeWrapper from '../../../../../functions/CustomElements/QrWrapper';

export default function MyProfileQRCode() {
  const insets = useSafeAreaInsets();
  const {backgroundOffset} = GetThemeColors();
  const {globalContactsInformation} = useGlobalContacts();

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
        <QrCodeWrapper
          outerContainerStyle={{width: 275, height: 275}}
          innerContainerStyle={{width: 250, height: 250}}
          qrSize={250}
          QRData={btoa(
            JSON.stringify({
              uniqueName: globalContactsInformation.myProfile.uniqueName,
              name: globalContactsInformation.myProfile.name || '',
              bio: globalContactsInformation.myProfile?.bio || 'No bio set',
              uuid: globalContactsInformation.myProfile?.uuid,
              receiveAddress:
                globalContactsInformation.myProfile.receiveAddress,
            }),
          )}
        />
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
});
