import {
  Platform,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {ThemeText} from '../../../../../../functions/CustomElements';
import {copyToClipboard} from '../../../../../../functions';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../../../context-store/context';
import {CENTER, COLORS, ICONS} from '../../../../../../constants';

import * as FileSystem from 'expo-file-system';
import QRCode from 'react-native-qrcode-svg';
import CustomButton from '../../../../../../functions/CustomElements/button';

export default function GeneratedFile({generatedFile}) {
  const {theme} = useGlobalContextProvider();
  const navigate = useNavigation();
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <ThemeText
        styles={{marginBottom: 10}}
        content={'Wiregurard Config File'}
      />
      <TouchableOpacity
        onPress={() => {
          copyToClipboard(generatedFile, navigate);
        }}
        activeOpacity={0.9}
        style={[
          styles.qrCodeContainer,
          {
            backgroundColor: theme
              ? COLORS.darkModeBackgroundOffset
              : COLORS.lightModeBackgroundOffset,
          },
        ]}>
        <View
          style={{
            width: 275,
            height: 275,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 5,
          }}>
          <QRCode
            size={275}
            quietZone={15}
            value={generatedFile.join('\n')}
            color={COLORS.lightModeText}
            backgroundColor={COLORS.darkModeText}
            logo={ICONS.logoIcon}
            logoSize={50}
            logoMargin={5}
            logoBorderRadius={50}
            logoBackgroundColor={COLORS.darkModeText}
          />
        </View>
      </TouchableOpacity>

      <View style={{flexDirection: 'row', marginTop: 20}}>
        <CustomButton
          buttonStyles={{...CENTER, marginRight: 10}}
          textContent={'Download'}
          actionFunction={() => {
            downloadVPNFile({generatedFile});
          }}
        />
        <CustomButton
          buttonStyles={{...CENTER}}
          textContent={'Copy'}
          actionFunction={() => {
            copyToClipboard(generatedFile, navigate);
          }}
        />
      </View>
      <ThemeText
        styles={{marginTop: 10, textAlign: 'center'}}
        content={
          Platform.OS === 'ios'
            ? 'When dowloading, click save to files'
            : 'When dowloading, you will need to give permission to a location where we can save the config file to.'
        }
      />
    </View>
  );
}

async function downloadVPNFile({generatedFile}) {
  const content = generatedFile.join('\n');
  const fileName = `blitzVPN-${getCurrentFormattedDate()}.conf`;
  const fileUri = `${FileSystem.documentDirectory}${fileName}`;

  try {
    await FileSystem.writeAsStringAsync(fileUri, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (Platform.OS === 'ios') {
      await Share.share({
        title: `${fileName}`,
        // message: `${content}`,
        url: `${fileUri}`,
        type: 'application/octet-stream',
      });
    } else {
      try {
        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const data =
            await FileSystem.StorageAccessFramework.readAsStringAsync(fileUri);
          await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            fileName,
            'application/octet-stream',
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
            // message: `${content}`,
            url: `${fileUri}`,
            type: 'application/octet-stream',
          });
        }
      } catch (e) {
        console.log(err);
      }
    }
  } catch (e) {
    console.log(e);
  }
}

const getCurrentFormattedDate = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(now.getDate()).padStart(2, '0');
  const year = now.getFullYear();

  return `${month}-${day}-${year}`;
};

const styles = StyleSheet.create({
  qrCodeContainer: {
    width: 300,
    height: 'auto',
    minHeight: 300,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
