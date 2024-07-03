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
import {generateRandomContact} from './contacts';
import {generatePubPrivKeyForMessaging} from './messaging/generateKeys';
import * as Device from 'expo-device';
import axios from 'axios';
import {getContactsImage} from './contacts/contactsFileSystem';

export default async function initializeUserSettingsFromHistory({
  setContactsPrivateKey,
  setJWT,
  setContactsImages,
  toggleMasterInfoObject,
  setMasterInfoObject,
}) {
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

    let blitzStoredData;
    let retrivedStoredBlitzData = await getDataFromCollection(
      'blitzWalletUsers',
    );

    if (retrivedStoredBlitzData === null) throw Error('Failed to retrive');
    else if (retrivedStoredBlitzData) blitzStoredData = retrivedStoredBlitzData;
    else blitzStoredData = {};

    let blitzWalletLocalStorage =
      JSON.parse(await getLocalStorageItem('blitzWalletLocalStorage')) || {};
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
      };

    const storedUserTxPereferance =
      JSON.parse(await getLocalStorageItem('homepageTxPreferance')) || 25;

    const userBalanceDenomination =
      JSON.parse(await getLocalStorageItem('userBalanceDenomination')) ||
      'sats';

    const enabledSlidingCamera =
      JSON.parse(await getLocalStorageItem('enabledSlidingCamera')) || false;

    const userFaceIDPereferance =
      JSON.parse(await getLocalStorageItem('userFaceIDPereferance')) || false;

    const currencyList =
      JSON.parse(await getLocalStorageItem('fiatCurrenciesList')) || [];
    const currency =
      JSON.parse(await getLocalStorageItem('fiatCurrency')) || 'USD';

    const failedTransactions =
      JSON.parse(await getLocalStorageItem('failedTransactions')) || [];

    const selectedLanguage =
      blitzWalletLocalStorage.userSelectedLanguage ||
      blitzStoredData.userSelectedLanguage ||
      'en';

    const liquidSwaps =
      blitzWalletLocalStorage.liquidSwaps || blitzStoredData.liquidSwaps || [];

    const chatGPT = blitzWalletLocalStorage.chatGPT ||
      blitzStoredData.chatGPT || {conversation: [], credits: 0};
    const liquidWalletSettings = blitzWalletLocalStorage.liquidWalletSettings ||
      blitzStoredData.liquidWalletSettings || {
        autoChannelRebalance: true,
        autoChannelRebalancePercantage: 90,
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
    tempObject['enabledSlidingCamera'] = enabledSlidingCamera;

    if (!retrivedStoredBlitzData && !(await usesLocalStorage()).data) {
      handleDataStorageSwitch(true, toggleMasterInfoObject);
    }

    // if no account exists add account to database otherwise just save information in global state
    Object.keys(blitzStoredData).length === 0 &&
    Object.keys(blitzWalletLocalStorage).length === 0
      ? toggleMasterInfoObject(tempObject)
      : setMasterInfoObject(tempObject);

    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}
