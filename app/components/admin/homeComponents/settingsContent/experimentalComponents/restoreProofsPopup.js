import {
  InteractionManager,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {ThemeText} from '../../../../../functions/CustomElements';
import {CENTER, COLORS, SIZES} from '../../../../../constants';
import {useGlobalThemeContext} from '../../../../../../context-store/theme';
import {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  RESTORE_PROOFS_EVENT_NAME,
  restoreProofs,
  restoreProofsEventListener,
} from '../../../../../functions/eCash/wallet';
import GetThemeColors from '../../../../../hooks/themeColors';
import handleBackPress from '../../../../../hooks/handleBackPress';
import FullLoadingScreen from '../../../../../functions/CustomElements/loadingScreen';

export default function RestoreProofsPopup(props) {
  const {mintURL} = props?.route?.params;
  const navigate = useNavigation();
  const {theme, darkModeType} = useGlobalThemeContext();
  const {backgroundColor, backgroundOffset} = GetThemeColors();
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProcessText, setRestoreProcessText] = useState('');

  useEffect(() => {
    handleBackPress(() => {
      navigate.goBack();
      return true;
    });
  }, [navigate]);

  useEffect(() => {
    function handleRestoreProofEvents(eventName) {
      if (eventName === 'end') {
        navigate.goBack();
        return;
      } else if (eventName === 'error') {
        setRestoreProcessText('An error occured during the restore process.');
        setTimeout(() => {
          navigate.goBack();
        }, 2000);
        return;
      }
      setRestoreProcessText(eventName);
    }
    restoreProofsEventListener.on(
      RESTORE_PROOFS_EVENT_NAME,
      handleRestoreProofEvents,
    );
    () =>
      restoreProofsEventListener.off(
        RESTORE_PROOFS_EVENT_NAME,
        handleRestoreProofEvents,
      );
  }, []);
  return (
    <View style={styles.container}>
      {isRestoring ? (
        <View
          style={[
            styles.content,
            {
              height: 200,
              backgroundColor:
                theme && darkModeType ? backgroundOffset : backgroundColor,
            },
          ]}>
          <FullLoadingScreen
            containerStyles={{width: '95%', ...CENTER}}
            textStyles={{textAlign: 'center'}}
            text={restoreProcessText || 'Starting restore process'}
          />
        </View>
      ) : (
        <View
          style={[
            styles.content,
            {
              backgroundColor:
                theme && darkModeType ? backgroundOffset : backgroundColor,
            },
          ]}>
          <ThemeText
            styles={styles.headerText}
            content={`Would you like to restore proofs?`}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => {
                setIsRestoring(true);
                InteractionManager.runAfterInteractions(() => {
                  restoreProofs(mintURL);
                });
              }}
              style={[styles.button]}>
              <ThemeText styles={styles.buttonText} content={'Yes'} />
            </TouchableOpacity>
            <View
              style={{
                height: '100%',
                width: 2,
                backgroundColor: theme
                  ? COLORS.darkModeText
                  : COLORS.lightModeText,
              }}
            />
            <TouchableOpacity onPress={navigate.goBack} style={styles.button}>
              <ThemeText styles={styles.buttonText} content={'No'} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.halfModalBackgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 15,
  },
  button: {
    width: '50%',
    height: 30,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: SIZES.large,
  },

  content: {
    width: '95%',
    maxWidth: 300,
    borderRadius: 8,
  },
  headerText: {
    width: '90%',
    paddingVertical: 15,
    textAlign: 'center',
    ...CENTER,
  },
  border: {
    height: '100%',
    width: 1,
  },
});
