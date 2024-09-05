import React, {useEffect} from 'react';
import {Alert, Platform, View} from 'react-native';
import {Notifications} from 'react-native-notifications';

export default class PushNotificationManager extends React.Component {
  hasRegisteredDevice = false;
  hasRegisteredNotificationEvents = false;
  componentDidMount() {
    if (Platform.OS === 'ios') Notifications.ios.setBadgeCount(0);
    if (!this.hasRegisteredDevice) {
      this.registerDevice();
      this.hasRegisteredDevice = true;
    }

    if (!this.hasRegisteredNotificationEvents) {
      this.registerNotificationEvents();
      this.hasRegisteredNotificationEvents = true;
    }
  }

  registerDevice = async () => {
    Notifications.events().registerRemoteNotificationsRegistered(
      async event => {
        const deviceToken = event.deviceToken;
        console.log('Device Token Received', deviceToken);

        //   SAVE DEVICE TOKEN IN DATABASE
        //   stores.lightningAddressStore.setDeviceToken(deviceToken);
      },
    );
    Notifications.events().registerRemoteNotificationsRegistrationFailed(
      event => {
        console.error('event-err', event);
      },
    );

    Notifications.registerRemoteNotifications();
  };

  registerNotificationEvents = () => {
    Notifications.events().registerNotificationReceivedForeground(
      (notification, completion) => {
        console.log('Notification Received - Foreground', notification);
        // Don't display redeem notification if auto-redeem is on

        if (Platform.OS === 'android') {
          Alert.alert(
            notification.payload['gcm.notification.title'],
            notification.payload['gcm.notification.body'],
            [
              {
                text: 'OK',
                onPress: () => console.log('OK Pressed'),
              },
            ],
          );
        }
        if (Platform.OS === 'ios') {
          // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
          completion({alert: true, sound: false, badge: false});
        }
      },
    );

    Notifications.events().registerNotificationOpened(
      (notification, completion) => {
        console.log('Notification opened by device user', notification);
        console.log(
          `Notification opened with an action identifier: ${notification.identifier}`,
        );
        completion();
      },
    );

    Notifications.events().registerNotificationReceivedBackground(
      (notification, completion) => {
        console.log('Notification Received - Background', notification);
        // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
        completion({alert: true, sound: true, badge: false});
      },
    );

    Notifications.getInitialNotification()
      .then(notification => {
        console.log('Initial notification was:', notification || 'N/A');
      })
      .catch(err => console.error('getInitialNotifiation() failed', err));
  };

  render() {
    const {children} = this.props;
    return <View style={{flex: 1}}>{children}</View>;
  }
}
