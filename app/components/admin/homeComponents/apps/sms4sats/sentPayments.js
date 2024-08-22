import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import {ThemeText} from '../../../../../functions/CustomElements';
import {COLORS, FONT, ICONS, SIZES} from '../../../../../constants';
import axios from 'axios';
import {useEffect, useState} from 'react';

import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {copyToClipboard} from '../../../../../functions';
import {useNavigation} from '@react-navigation/native';
import {parsePhoneNumber} from 'libphonenumber-js';

export default function HistoricalSMSMessagingPage({
  notificationsList,
  selectedPage,
}) {
  const {theme} = useGlobalContextProvider();
  const navigate = useNavigation();
  const dimensions = useWindowDimensions();
  const [notificationElements, setNotificationElements] = useState([]);
  useEffect(() => {
    const fetchNotifications = async () => {
      const elements = await Promise.all(
        notificationsList.map(async element => {
          if (!JSON.stringify(element).startsWith('{')) return;

          const response = (
            await axios.get(
              `https://api2.sms4sats.com/orderstatus?orderId=${element.orderId}`,
            )
          ).data;

          return (
            <View style={styles.orderIdContainer} key={element.orderId}>
              <TouchableOpacity
                onPress={() => {
                  copyToClipboard(`${element.orderId}`, navigate);
                }}>
                <View
                  style={{
                    width: dimensions.width * 0.75 - 50,
                  }}>
                  <ThemeText
                    content={`${parsePhoneNumber(
                      element.phone,
                    ).formatInternational()}`}
                  />

                  <ThemeText
                    styles={{fontSize: SIZES.small}}
                    content={`${element.message}`}
                  />
                  <ThemeText
                    styles={{fontSize: SIZES.small}}
                    content={`${element.orderId}`}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  navigate.navigate('ErrorScreen', {
                    errorMessage: `Your transaction status is: ${response.smsStatus}`,
                  });
                }}
                style={[
                  styles.idStatus,
                  {
                    backgroundColor: theme
                      ? COLORS.darkModeBackgroundOffset
                      : COLORS.lightModeBackgroundOffset,
                  },
                ]}>
                <ThemeText content={'Status'} />
              </TouchableOpacity>
            </View>
          );
        }),
      );
      setNotificationElements(elements);
    };

    fetchNotifications();
  }, []);

  return (
    <>
      <View style={styles.homepage}>
        {notificationElements.length === 0 ? (
          <ThemeText content={'You have not sent any messages'} />
        ) : (
          <ScrollView style={{paddingVertical: 20}}>
            {notificationElements}
          </ScrollView>
        )}
        {notificationElements.length > 1 && (
          <TouchableOpacity
            onPress={() => {
              copyToClipboard('hi@sms4sats.com', navigate);
            }}>
            <ThemeText
              styles={{textAlign: 'center'}}
              content={'For help, reach out to hi@sms4sats.com'}
            />
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  homepage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderIdContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },

  idStatus: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginLeft: 'auto',
    marginBottom: 'auto',
  },
});
