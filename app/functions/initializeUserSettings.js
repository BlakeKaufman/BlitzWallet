import AsyncStorage from '@react-native-async-storage/async-storage';
import {retrieveData} from './secureStore';
import * as nostr from 'nostr-tools';
import {
  getLocalStorageItem,
  removeLocalStorageItem,
  usesLocalStorage,
} from './localStorage';
import {
  getDataFromCollection,
  getUserAuth,
  handleDataStorageSwitch,
} from '../../db';
import {useGlobalContextProvider} from '../../context-store/context';
import {generateRandomContact} from './contacts';
import {generatePubPrivKeyForMessaging} from './messaging/generateKeys';
import * as Device from 'expo-device';
import axios from 'axios';
import {getContactsImage} from './contacts/contactsFileSystem';
import {useEffect, useRef, useState} from 'react';

export default function initializeUserSettingsFromHistory() {
  const {
    setContactsPrivateKey,
    setJWT,
    setContactsImages,
    toggleMasterInfoObject,
    setMasterInfoObject,
  } = useGlobalContextProvider();
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (!isInitialRender.current) return;
    isInitialRender.current = false;

    (async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        let tempObject = {};
        let mnemonic = await retrieveData('mnemonic');
        mnemonic &&
          mnemonic
            .split(' ')
            .filter(word => word.length > 0)
            .join(' ');

        const privateKey =
          mnemonic && nostr.nip06.privateKeyFromSeedWords(mnemonic);
        let blitzStoredData =
          (await getDataFromCollection('blitzWalletUsers')) || {};
        let blitzWalletLocalStorage =
          JSON.parse(await getLocalStorageItem('blitzWalletLocalStorage')) ||
          {};
        const {data} = await axios.post(process.env.CREATE_JWT_URL, {
          id: Device.osBuildId,
        });
        setContactsPrivateKey(privateKey);
        setJWT(data.token);
        setContactsImages((await getContactsImage()) || []);
        const contacts = blitzWalletLocalStorage.contacts ||
          blitzStoredData.contacts || {
            myProfile: {
              ...generateRandomContact(),
              bio: '',
              name: '',
              uuid: await generatePubPrivKeyForMessaging(),
            },
            addedContacts: [],
            // unaddedContacts: [],
          };

        const storedUserTxPereferance =
          blitzWalletLocalStorage.homepageTxPreferace ||
          blitzStoredData.homepageTxPreferace ||
          15;
        const userBalanceDenomination =
          blitzWalletLocalStorage.userBalanceDenominatoin ||
          blitzStoredData.userBalanceDenominatoin ||
          'sats';
        const selectedLanguage =
          blitzWalletLocalStorage.userSelectedLanguage ||
          blitzStoredData.userSelectedLanguage ||
          'en';
        const currencyList =
          blitzWalletLocalStorage.currenciesList ||
          blitzStoredData.currenciesList ||
          [];
        const currency =
          blitzWalletLocalStorage.currency || blitzStoredData.currency || 'USD';
        const userFaceIDPereferance =
          blitzWalletLocalStorage.userFaceIDPereferance ||
          blitzStoredData.userFaceIDPereferance ||
          false;
        const liquidSwaps =
          blitzWalletLocalStorage.liquidSwaps ||
          blitzStoredData.liquidSwaps ||
          [];
        const failedTransactions =
          blitzWalletLocalStorage.failedTransactions ||
          blitzStoredData.failedTransactions ||
          [];
        const chatGPT = blitzWalletLocalStorage.chatGPT ||
          blitzStoredData.chatGPT || {conversation: [], credits: 0};
        const liquidWalletSettings =
          blitzWalletLocalStorage.liquidWalletSettings ||
            blitzStoredData.liquidWalletSettings || {
              autoChannelRebalance: true,
              autoChannelRebalancePercantage: 50,
              regulateChannelOpen: true,
              regulatedChannelOpenSize: 100000, //sats
            };
        const isUsingLocalStorage = await usesLocalStorage();
        tempObject['homepageTxPreferance'] = storedUserTxPereferance;
        tempObject['userBalanceDenomination'] = userBalanceDenomination;
        tempObject['userSelectedLanguage'] = selectedLanguage;
        tempObject['usesLocalStorage'] = isUsingLocalStorage.data;
        tempObject['currenciesList'] = currencyList;
        tempObject['currency'] = currency;
        tempObject['userFaceIDPereferance'] = userFaceIDPereferance;
        tempObject['liquidSwaps'] = liquidSwaps;
        tempObject['failedTransactions'] = failedTransactions;
        tempObject['chatGPT'] = chatGPT;
        tempObject['contacts'] = contacts;
        tempObject['uuid'] = await getUserAuth();
        tempObject['liquidWalletSettings'] = liquidWalletSettings;

        if (keys?.length > 4) {
          handleDataStorageSwitch(true, toggleMasterInfoObject);
        }

        // if no account exists add account to database otherwise just save information in global state
        Object.keys(blitzStoredData).length === 0 &&
        Object.keys(blitzWalletLocalStorage).length === 0
          ? toggleMasterInfoObject(tempObject)
          : setMasterInfoObject(tempObject);
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);
}
