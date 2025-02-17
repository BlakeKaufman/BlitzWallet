import {KeyboardAvoidingView, Platform, StyleSheet, View} from 'react-native';
import {CENTER} from '../../../../../constants/styles';
import {ICONS, SIZES} from '../../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import {ThemeText} from '../../../../../functions/CustomElements';
import SMSMessagingReceivedPage from './receivePage';
import SMSMessagingSendPage from './sendPage';
import {getLocalStorageItem} from '../../../../../functions';
import {WINDOWWIDTH} from '../../../../../constants/theme';
import CustomButton from '../../../../../functions/CustomElements/button';
import {encriptMessage} from '../../../../../functions/messaging/encodingAndDecodingMessages';
import {useGlobalAppData} from '../../../../../../context-store/appData';
import CustomSettingsTopBar from '../../../../../functions/CustomElements/settingsTopBar';
import {useKeysContext} from '../../../../../../context-store/keys';

export default function SMSMessagingHome() {
  const {contactsPrivateKey, publicKey} = useKeysContext();
  const {decodedMessages, toggleGlobalAppDataInformation} = useGlobalAppData();
  const navigate = useNavigation();
  const [selectedPage, setSelectedPage] = useState(null);
  const [SMSprices, setSMSPrices] = useState(null);
  const sentMessages = decodedMessages?.sent;

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

      try {
        const response = await fetch('https://api2.sms4sats.com/price', {
          method: 'GET',
        });
        const data = await response.json();
        setSMSPrices(data);
      } catch (err) {
        console.log(err);
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Unable to get SMS pricing',
        });
      }
    })();
  }, [
    selectedPage,
    contactsPrivateKey,
    publicKey,
    sentMessages,
    toggleGlobalAppDataInformation,
  ]);

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
        <CustomSettingsTopBar
          customBackFunction={() => {
            if (selectedPage === null) navigate.goBack();
            else setSelectedPage(null);
          }}
          label={selectedPage || ''}
          showLeftImage={!selectedPage}
          leftImageBlue={ICONS.receiptIcon}
          LeftImageDarkMode={ICONS.receiptWhite}
          leftImageFunction={() => {
            navigate.navigate('HistoricalSMSMessagingPage');
          }}
          containerStyles={{
            marginBottom: 0,
            height: 30,
          }}
        />

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
              actionFunction={() => setSelectedPage('Send')}
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
                // setSelectedPage('receive');
              }}
              textContent={'Receive'}
            />
          </View>
        ) : selectedPage?.toLowerCase() === 'send' ? (
          <SMSMessagingSendPage SMSprices={SMSprices} />
        ) : (
          <SMSMessagingReceivedPage />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  homepage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
