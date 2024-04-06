import {Switch, Text, View} from 'react-native';
import {COLORS, FONT, SIZES} from '../../../../constants';
import {useEffect, useRef, useState} from 'react';

import {useGlobalContextProvider} from '../../../../../context-store/context';

import {useNavigation} from '@react-navigation/native';
import {handleDataStorageSwitch} from '../../../../../db';

export default function DataStorageOptions() {
  const [isUsingBlitzStorage, setIsUsingBlitzStorage] = useState(null);
  const {theme, masterInfoObject, toggleMasterInfoObject} =
    useGlobalContextProvider();
  const navigate = useNavigation();

  useEffect(() => {
    setIsUsingBlitzStorage(!masterInfoObject.usesLocalStorage);
  }, []);

  return (
    <View style={{flex: 1}}>
      <View
        style={{
          backgroundColor: theme
            ? COLORS.darkModeBackgroundOffset
            : COLORS.lightModeBackgroundOffset,
          borderRadius: 8,
          marginTop: 20,
        }}>
        <View
          style={{
            flexDirection: 'row',
            width: '95%',
            marginLeft: 'auto',
            borderBottomColor: theme
              ? COLORS.darkModeBackground
              : COLORS.lightModeBackground,
            borderBottomWidth: 1,
          }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 10,
            }}>
            <Text
              style={{
                fontSize: SIZES.medium,
                fontFamily: FONT.Title_Regular,
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              }}>
              Store data with blitz
            </Text>
            <Switch
              style={{marginRight: 10}}
              onChange={async event => {
                const didSwitch = await handleDataStorageSwitch(
                  event.nativeEvent.value,
                  toggleMasterInfoObject,
                );

                if (didSwitch)
                  setIsUsingBlitzStorage(prev => {
                    return !prev;
                  });
                else
                  navigate.navigate('ErrorScreen', {
                    errorMessage: 'Could not switch storage locations',
                  });
              }}
              value={isUsingBlitzStorage}
              trackColor={{false: '#767577', true: COLORS.primary}}
            />
          </View>
        </View>
        <View
          style={{
            width: '95%',
            marginLeft: 'auto',
            paddingVertical: 10,
          }}>
          <Text
            style={{
              width: '90%',
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
            }}>
            By storing non-sensitive data with Blitz, you can retrieve all your
            data in the event of an emergency. Otherwise, if your app is deleted
            or you get a new phone locally stored data will not be recoverable.
          </Text>
        </View>

        {isUsingBlitzStorage && (
          <Text
            style={{
              fontSize: SIZES.medium,
              textAlign: 'center',
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              marginVertical: 10,
            }}>
            To recover your information, save this key somewhere safe:{' '}
            {masterInfoObject.uuid}
          </Text>
        )}
      </View>
    </View>
  );
}
