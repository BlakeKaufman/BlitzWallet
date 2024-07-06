import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ANDROIDSAFEAREA, BTN, CENTER} from '../../../../../constants/styles';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {COLORS, FONT, ICONS, SIZES} from '../../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import {ThemeText} from '../../../../../functions/CustomElements';
import SMSMessagingReceivedPage from './receivePage';
import SMSMessagingSendPage from './sendPage';
import {getLocalStorageItem} from '../../../../../functions';
import SMSMessagingFailedPage from './failedNotifications';
import {WINDOWWIDTH} from '../../../../../constants/theme';

export default function SMSMessagingHome() {
  const {theme} = useGlobalContextProvider();
  const navigate = useNavigation();
  const [selectedPage, setSelectedPage] = useState(null);
  const [notSentNotifications, setNotSentNotifications] = useState([]);

  useEffect(() => {
    if (selectedPage) return;
    (async () => {
      setNotSentNotifications(
        JSON.parse(await getLocalStorageItem('savedSMS4SatsIds')) || [],
      );
    })();
  }, [selectedPage]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      style={{flex: 1}}>
      <View
        style={{
          flex: 1,
          width: WINDOWWIDTH,
          ...CENTER,
        }}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => {
              if (selectedPage === null) navigate.goBack();
              else setSelectedPage(null);
            }}>
            <Image style={[styles.topBarIcon]} source={ICONS.smallArrowLeft} />
          </TouchableOpacity>
          <ThemeText
            styles={{...styles.topBarText}}
            content={selectedPage != null ? selectedPage : ''}
          />
        </View>
        <View style={styles.contentContainer}>
          {selectedPage === null ? (
            <View style={styles.homepage}>
              <ThemeText
                styles={{textAlign: 'center', fontSize: SIZES.large}}
                content={
                  'Send and Receive sms messages without giving away your personal phone number'
                }
              />
              <TouchableOpacity
                onPress={() => setSelectedPage('send')}
                style={[
                  BTN,
                  {
                    backgroundColor: theme
                      ? COLORS.darkModeBackgroundOffset
                      : COLORS.lightModeBackgroundOffset,
                  },
                ]}>
                <ThemeText styles={{textAlign: 'center'}} content={'Send'} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  navigate.navigate('ErrorScreen', {
                    errorMessage: 'Coming Soon...',
                  });
                  return;
                  setSelectedPage('receive');
                }}
                style={[
                  BTN,
                  {
                    backgroundColor: theme
                      ? COLORS.darkModeBackgroundOffset
                      : COLORS.lightModeBackgroundOffset,
                  },
                ]}>
                <ThemeText styles={{textAlign: 'center'}} content={'Receive'} />
              </TouchableOpacity>
              {notSentNotifications.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedPage('Not sent notifications');
                  }}
                  style={[
                    {
                      marginTop: 20,
                    },
                  ]}>
                  <ThemeText
                    styles={{textAlign: 'center'}}
                    content={'View not sent notification status'}
                  />
                </TouchableOpacity>
              )}
            </View>
          ) : selectedPage === 'send' ? (
            <SMSMessagingSendPage />
          ) : selectedPage === 'receive' ? (
            <SMSMessagingReceivedPage />
          ) : (
            <SMSMessagingFailedPage notificationsList={notSentNotifications} />
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...CENTER,
  },
  topBarText: {
    fontSize: SIZES.large,
    textTransform: 'capitalize',
  },
  topBarIcon: {
    width: 30,
    height: 30,
  },
  contentContainer: {
    flex: 1,
  },
  homepage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
