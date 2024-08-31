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
import {
  ANDROIDSAFEAREA,
  BTN,
  CENTER,
  backArrow,
} from '../../../../../constants/styles';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {COLORS, FONT, ICONS, SIZES} from '../../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import {ThemeText} from '../../../../../functions/CustomElements';
import SMSMessagingReceivedPage from './receivePage';
import SMSMessagingSendPage from './sendPage';
import {getLocalStorageItem} from '../../../../../functions';
import {WINDOWWIDTH} from '../../../../../constants/theme';
import axios from 'axios';
import HistoricalSMSMessagingPage from './sentPayments';
import CustomButton from '../../../../../functions/CustomElements/button';
import {
  decryptMessage,
  encriptMessage,
} from '../../../../../functions/messaging/encodingAndDecodingMessages';
import {getPublicKey} from 'nostr-tools';
import {useGlobalAppData} from '../../../../../../context-store/appData';

export default function SMSMessagingHome() {
  const {contactsPrivateKey} = useGlobalContextProvider();
  const {decodedMessages, toggleGlobalAppDataInformation} = useGlobalAppData();
  const publicKey = getPublicKey(contactsPrivateKey);
  const navigate = useNavigation();
  const [selectedPage, setSelectedPage] = useState(null);
  const [notSentNotifications, setNotSentNotifications] = useState([]);
  const [SMSprices, setSMSPrices] = useState(null);

  useEffect(() => {
    if (selectedPage) return;
    (async () => {
      const localStoredMessages =
        JSON.parse(await getLocalStorageItem('savedSMS4SatsIds')) || [];

      if (localStoredMessages.length != 0) {
        const newMessageObject = [
          ...localStoredMessages,
          ...decodedMessages.sent,
        ];
        const em = encriptMessage(
          contactsPrivateKey,
          publicKey,
          JSON.stringify(newMessageObject),
        );

        toggleGlobalAppDataInformation({messagesApp: em}, true);
      }
      setNotSentNotifications([
        ...localStoredMessages,
        ...decodedMessages.sent,
      ]);
      const smsPrices = (await axios.get('https://api2.sms4sats.com/price'))
        .data;
      setSMSPrices(smsPrices);
      console.log(smsPrices);
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
            style={{marginRight: 'auto'}}
            onPress={() => {
              if (selectedPage === null) navigate.goBack();
              else setSelectedPage(null);
            }}>
            <Image style={[backArrow]} source={ICONS.smallArrowLeft} />
          </TouchableOpacity>
          <ThemeText
            styles={{...styles.topBarText}}
            content={selectedPage != null ? selectedPage : ''}
          />
          {!selectedPage && (
            <TouchableOpacity
              onPress={() => {
                setSelectedPage('sent notifications');
              }}>
              <Image
                style={[backArrow, {marginLeft: 10}]}
                source={ICONS.receiptIcon}
              />
            </TouchableOpacity>
          )}
        </View>

        {selectedPage === null ? (
          <View style={styles.homepage}>
            <ThemeText
              styles={{textAlign: 'center', fontSize: SIZES.large}}
              content={
                'Send and Receive sms messages without giving away your personal phone number'
              }
            />
            <CustomButton
              buttonStyles={{width: '80%', marginTop: 50}}
              textStyles={{fontSize: SIZES.large}}
              actionFunction={() => setSelectedPage('send')}
              textContent={'Send'}
            />
            <CustomButton
              buttonStyles={{width: '80%', marginTop: 50}}
              textStyles={{fontSize: SIZES.large}}
              actionFunction={() => {
                navigate.navigate('ErrorScreen', {
                  errorMessage: 'Coming Soon...',
                });
                return;
                setSelectedPage('receive');
              }}
              textContent={'Receive'}
            />

            {/* {notSentNotifications.length > 0 && (
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
            )} */}
          </View>
        ) : selectedPage === 'send' ? (
          <SMSMessagingSendPage SMSprices={SMSprices} />
        ) : selectedPage === 'receive' ? (
          <SMSMessagingReceivedPage />
        ) : (
          <HistoricalSMSMessagingPage
            selectedPage={selectedPage}
            notificationsList={notSentNotifications}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
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

  homepage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
