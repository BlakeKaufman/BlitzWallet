import {
  Image,
  Platform,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  GlobalThemeView,
  ThemeText,
} from '../../../../../../functions/CustomElements';
import {copyToClipboard} from '../../../../../../functions';
import {useNavigation} from '@react-navigation/native';
import {CENTER, ICONS} from '../../../../../../constants';
import * as FileSystem from 'expo-file-system';
import CustomButton from '../../../../../../functions/CustomElements/button';
import {SIZES, WINDOWWIDTH} from '../../../../../../constants/theme';
import {backArrow} from '../../../../../../constants/styles';
import GetThemeColors from '../../../../../../hooks/themeColors';
import {useGlobalContacts} from '../../../../../../../context-store/globalContacts';
import QrCodeWrapper from '../../../../../../functions/CustomElements/QrWrapper';

export default function GeneratedVPNFile(props) {
  const navigate = useNavigation();
  const generatedFile =
    props?.generatedFile || props?.route?.params?.generatedFile;

  return (
    <GlobalThemeView>
      {props?.generatedFile ? (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <VPNFileDisplay generatedFile={generatedFile} />
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            width: WINDOWWIDTH,
            ...CENTER,
          }}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={{marginRight: 'auto'}}
              onPress={() => {
                navigate.goBack();
              }}>
              <Image style={[backArrow]} source={ICONS.smallArrowLeft} />
            </TouchableOpacity>
          </View>
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <VPNFileDisplay generatedFile={generatedFile} />
          </View>
        </View>
      )}
    </GlobalThemeView>
  );
}

function VPNFileDisplay({generatedFile}) {
  const {myProfileImage} = useGlobalContacts();
  const navigate = useNavigation();
  const {backgroundOffset} = GetThemeColors();

  console.log(generatedFile);

  return (
    <>
      <ThemeText
        styles={{marginBottom: 10}}
        content={'Wiregurard Config File'}
      />

      <TouchableOpacity
        onPress={() => {
          copyToClipboard(generatedFile.join('\n'), navigate);
        }}>
        <QrCodeWrapper QRData={generatedFile.join('\n')} />
      </TouchableOpacity>

      <View style={{flexDirection: 'row', marginTop: 20}}>
        <CustomButton
          buttonStyles={{...CENTER, marginRight: 10, width: 'auto'}}
          textContent={'Download'}
          actionFunction={() => {
            downloadVPNFile({generatedFile, navigate});
          }}
        />
        <CustomButton
          buttonStyles={{...CENTER, with: 'auto'}}
          textContent={'Copy'}
          actionFunction={() => {
            copyToClipboard(generatedFile.join('\n'), navigate);
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
    </>
  );
}

async function downloadVPNFile({generatedFile, navigate}) {
  const content = generatedFile.join('\n');
  const fileName = `blitzVPN.conf`;
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
      } catch (err) {
        console.log(err);
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Error gettings permissions',
        });
      }
    }
  } catch (e) {
    console.log(e);
    navigate.navigate('ErrorScreen', {
      errorMessage: 'Error writting file to filesystem',
    });
  }
}

const styles = StyleSheet.create({
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
});
