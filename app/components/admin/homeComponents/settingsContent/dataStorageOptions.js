import {Switch, Text, View} from 'react-native';
import {COLORS, FONT, SIZES} from '../../../../constants';
import {useEffect, useRef, useState} from 'react';
import {getLocalStorageItem, setLocalStorageItem} from '../../../../functions';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {
  addDataToCollection,
  deleteDataFromCollection,
  getDataFromCollection,
} from '../../../../../db';
import {deleteItem} from '../../../../functions/secureStore';
import {
  removeLocalStorageItem,
  usesLocalStorage,
} from '../../../../functions/localStorage';

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

  //   async function handleDataStorageSwitch(direction) {
  //     try {
  //       if (direction) {
  //         let object = {};
  //         const keys = await AsyncStorage.getAllKeys();
  //         console.log(keys, 'TESTING');

  //         if (keys.length === 1) {
  //           object =
  //             JSON.parse(await getLocalStorageItem('blitzWalletLocalStorage')) ||
  //             {};
  //         } else {
  //           const result = await AsyncStorage.multiGet(keys);
  //           const blitzWalletStoreage = JSON.parse(
  //             await getLocalStorageItem('blitzWalletLocalStorage'),
  //           );

  //           let values = result
  //             .map(([key, value]) => {
  //               if (key === 'blitzWalletLocalStorage') {
  //                 return;
  //               }
  //               try {
  //                 const parsedValue = JSON.parse(value);
  //                 return {[key]: parsedValue};
  //               } catch (err) {
  //                 return {[key]: value};
  //               }
  //             })
  //             .filter(item => item);

  //           object = Object.assign({}, ...values);

  //           if (blitzWalletStoreage?.blitzWalletLocalStorage)
  //             object = {
  //               ...object,
  //               ...blitzWalletStoreage.blitzWalletLocalStorage,
  //             };
  //         }

  //         object['usesLocalStorage'] = false;

  //         const didSave = await addDataToCollection(object, 'blitzWalletUsers');

  //         if (didSave) {
  //           AsyncStorage.clear();
  //           toggleMasterInfoObject({usesLocalStorage: false}, false);

  //           return new Promise(resolve => {
  //             resolve(true);
  //           });
  //         } else throw new Error('did not save');
  //       } else {
  //         try {
  //           const data = await getDataFromCollection('blitzWalletUsers');
  //           data['usesLocalStorage'] = true;

  //           //   Object.keys(data).forEach(key => {
  //           //     setLocalStorageItem(key, JSON.stringify(data[key]));
  //           //   });

  //           toggleMasterInfoObject(data, true);

  //           deleteDataFromCollection('blitzWalletUsers');

  //           return new Promise(resolve => {
  //             resolve(true);
  //           });
  //         } catch (err) {
  //           console.log(err);
  //         }
  //       }
  //     } catch (e) {
  //       return new Promise(resolve => {
  //         resolve(false);
  //       });
  //       // read key error
  //     }
  //   }
}
