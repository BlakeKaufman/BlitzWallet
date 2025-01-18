import {Platform, Share, StyleSheet} from 'react-native';
import {ThemeText} from '../../../../functions/CustomElements';
import {useEffect, useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import {staticBackup} from '@breeztech/react-native-breez-sdk';
import CustomButton from '../../../../functions/CustomElements/button';
import {BREEZ_WORKING_DIR_KEY, CENTER} from '../../../../constants';
import {connectToNode, getLocalStorageItem} from '../../../../functions';
import FullLoadingScreen from '../../../../functions/CustomElements/loadingScreen';
import {useLightningEvent} from '../../../../../context-store/lightningEventContext';
// import useGlobalOnBreezEvent from '../../../../hooks/globalOnBreezEvent';

export default function RestoreChannel() {
  const [SCBfile, setSCBfile] = useState(null);
  const [failedToConnect, setFailedToConnect] = useState(false);
  const navigate = useNavigation();
  // const breezListener = useGlobalOnBreezEvent();
  const {onLightningBreezEvent} = useLightningEvent();
  const didRunConnection = useRef(false);

  useEffect(() => {
    async function getStaticBackup() {
      try {
        const workingDirPath = await getLocalStorageItem(BREEZ_WORKING_DIR_KEY);

        const backupData = await staticBackup({
          workingDir: workingDirPath,
        });

        setSCBfile(backupData);
      } catch (err) {
        if (didRunConnection.current) return;
        didRunConnection.current = true;
        const lightningSession = await connectToNode(onLightningBreezEvent);
        if (lightningSession?.isConnected) {
          getStaticBackup();
        } else setFailedToConnect(true);
        console.log(err);
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Not able to retrive SCB file',
        });
      }
    }
    getStaticBackup();
  }, []);
  return (
    <>
      {SCBfile ? (
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
      ) : (
        <FullLoadingScreen
          showLoadingIcon={!failedToConnect}
          text={'Getting Channel'}
        />
      )}
    </>
  );
}

async function downloadBackupFile(file, navigate) {
  const content = JSON.stringify(file);
  const fileName = `blitzSCBFile.json`;
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
        type: 'application/json',
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
            // message: `${content}`,
            url: `${fileUri}`,
            type: 'application/json',
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
