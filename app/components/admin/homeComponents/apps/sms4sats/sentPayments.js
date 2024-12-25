import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import {ThemeText} from '../../../../../functions/CustomElements';
import {SIZES} from '../../../../../constants';
import {useEffect, useState} from 'react';

import {copyToClipboard} from '../../../../../functions';
import {useNavigation} from '@react-navigation/native';
import {parsePhoneNumber} from 'libphonenumber-js';
import GetThemeColors from '../../../../../hooks/themeColors';

export default function HistoricalSMSMessagingPage({
  notificationsList,
  selectedPage,
}) {
  const navigate = useNavigation();
  const dimensions = useWindowDimensions();
  const [notificationElements, setNotificationElements] = useState([]);
  const {backgroundOffset} = GetThemeColors();
  const windowWidth = dimensions.width;
  useEffect(() => {
    const fetchNotifications = async () => {
      const elements = (
        await Promise.all(
          notificationsList.map(async element => {
            if (!JSON.stringify(element).startsWith('{')) return;

            const response = await fetch(
              `https://api2.sms4sats.com/orderstatus?orderId=${element.orderId}`,
              {method: 'GET'},
            );
            const data = await response.data;

            return (
              <View style={styles.orderIdContainer} key={element.orderId}>
                <TouchableOpacity
                  onPress={() => {
                    copyToClipboard(`${element.orderId}`, navigate);
                  }}>
                  <View
                    style={{
                      width: windowWidth * 0.75 - 50,
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
                      errorMessage: `Your transaction status is: ${data.smsStatus}`,
                    });
                  }}
                  style={[
                    styles.idStatus,
                    {
                      backgroundColor: backgroundOffset,
                    },
                  ]}>
                  <ThemeText content={'Status'} />
                </TouchableOpacity>
              </View>
            );
          }),
        )
      ).filter(invalidElements => !invalidElements);
      setNotificationElements(elements);
    };

    fetchNotifications();
  }, [notificationsList, backgroundOffset, navigate, windowWidth]);

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
    borderRadius: 8,
    marginLeft: 'auto',
    marginBottom: 'auto',
  },
});
