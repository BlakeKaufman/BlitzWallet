import {Platform, Share, StyleSheet} from 'react-native';
import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import {staticBackup} from '@breeztech/react-native-breez-sdk';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import CustomButton from '../../../../functions/CustomElements/button';
import {CENTER} from '../../../../constants';
import {getLocalStorageItem} from '../../../../functions';

export default function RestoreChannel() {
  const [SCBfile, setSCBfile] = useState(null);
  const navigate = useNavigation();

  useEffect(() => {
    (async () => {
      try {
        const workingDirPath = await getLocalStorageItem('breezWorkignDir');

        const backupData = await staticBackup({
          workingDir: JSON.parse(workingDirPath),
        });

        setSCBfile(backupData.backup);
      } catch (err) {
        console.log(err);
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Not able to retrive SCB file',
        });
      }
    })();
  }, []);
  return (
    <>
      <ThemeText
        styles={styles.descriptionText}
        content={
          'This will generate a Static Channel Backup (SCB) file to be used as a last resort to recover funds in case the Greenlight node becomes inaccessible.'
        }
      />
      <ThemeText
        styles={styles.descriptionText}
        content={
          'To recover the funds, create a new core lighting node with its HSM secret using your backup wallet phrase. Then, trigger a channel recovery through the recoverchannel method provided by core lightning'
        }
      />

      <CustomButton
        actionFunction={() => {
          downloadBackupFile(SCBfile, navigate);
        }}
        buttonStyles={{...CENTER, marginTop: 30}}
        textContent={'Export'}
      />
    </>
  );
}

async function downloadBackupFile(file, navigate) {
  const content = file.toString();
  const fileName = `blitzSCBFile`;
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
          errorMessage: 'Error accessing file system',
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
}

const styles = StyleSheet.create({
  descriptionText: {marginTop: 20, textAlign: 'center'},
});
