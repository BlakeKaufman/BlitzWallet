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
import {useState} from 'react';
import {ThemeText} from '../../../../../functions/CustomElements';
import SMSMessagingReceivedPage from './receivePage';
import SMSMessagingSendPage from './sendPage';

export default function SMSMessagingHome() {
  const {theme} = useGlobalContextProvider();
  const navigate = useNavigation();
  const [selectedPage, setSelectedPage] = useState(null);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      style={{flex: 1}}>
      <View
        style={{
          flex: 1,
        }}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => {
              if (selectedPage === null) navigate.goBack();
              else setSelectedPage(null);
            }}>
            <Image
              style={[styles.topBarIcon, {transform: [{translateX: -6}]}]}
              source={ICONS.smallArrowLeft}
            />
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
            </View>
          ) : selectedPage === 'send' ? (
            <SMSMessagingSendPage />
          ) : (
            <SMSMessagingReceivedPage />
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...CENTER,
  },
  topBarText: {
    fontSize: SIZES.large,
    transform: [{translateX: -5}],
    textTransform: 'capitalize',
  },
  topBarIcon: {
    width: 30,
    height: 30,
  },
  contentContainer: {
    flex: 1,
    width: '90%',
    ...CENTER,
  },
  homepage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
