import {StyleSheet, Switch, Text, View} from 'react-native';
import {CENTER, COLORS, FONT, SIZES} from '../../../../constants';
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
          style={[
            styles.switchContainer,
            {
              borderBottomColor: theme
                ? COLORS.darkModeBackground
                : COLORS.lightModeBackground,
            },
          ]}>
          <View style={styles.switchTextContainer}>
            <Text
              style={[
                styles.switchText,
                {
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                },
              ]}>
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
        <View style={styles.warningContainer}>
          <Text
            style={[
              styles.warningText,
              {
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            By storing non-sensitive data with Blitz, you can retrieve all your
            data in the event of an emergency. Otherwise, if your app is deleted
            or you get a new phone locally stored data will not be recoverable.
          </Text>
        </View>

        {isUsingBlitzStorage && (
          <Text
            style={[
              styles.recoveryText,
              {
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            To recover your information, save this key somewhere safe:{' '}
            {masterInfoObject.uuid}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  switchContainer: {
    flexDirection: 'row',
    width: '95%',
    marginLeft: 'auto',
    borderBottomWidth: 1,
  },
  switchTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  switchText: {fontSize: SIZES.medium, fontFamily: FONT.Title_Regular},

  warningContainer: {
    width: '95%',
    marginLeft: 'auto',
    paddingVertical: 10,
  },
  warningText: {
    width: '90%',
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
  },

  recoveryText: {
    width: '95%',
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Regular,
    textAlign: 'center',
    marginVertical: 10,
    ...CENTER,
  },
});
