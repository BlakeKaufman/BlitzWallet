import AsyncStorage from '@react-native-async-storage/async-storage';
import {retrieveData} from './secureStore';
import * as nostr from 'nostr-tools';
import {
  getLocalStorageItem,
  removeLocalStorageItem,
  setLocalStorageItem,
  usesLocalStorage,
} from './localStorage';
import {
  addDataToCollection,
  getDataFromCollection,
  getUserAuth,
  handleDataStorageSwitch,
} from '../../db';
import {generateRandomContact} from './contacts';
import {generatePubPrivKeyForMessaging} from './messaging/generateKeys';
import * as Device from 'expo-device';
import axios from 'axios';
import {getContactsImage} from './contacts/contactsFileSystem';
import {
  getCurrentDateFormatted,
  isMoreThan7DaysPast,
} from './rotateAddressDateChecker';
import {MIN_CHANNEL_OPEN_FEE, QUICK_PAY_STORAGE_KEY} from '../constants';
import {deepCopy} from '../../context-store/context';
import {createLiquidReceiveAddress} from './liquidWallet';
import sha256Hash from './hash';
import {encriptMessage} from './messaging/encodingAndDecodingMessages';

export default async function initializeUserSettingsFromHistory({
  setContactsPrivateKey,
  setJWT,
  toggleMasterInfoObject,
  setMasterInfoObject,
  toggleGlobalContactsInformation,
  toggleGLobalEcashInformation,
  toggleGlobalAppDataInformation,
}) {
  try {
    let needsToUpdate = false;
    let tempObject = {};
    let mnemonic = await retrieveData('mnemonic');
    mnemonic &&
      mnemonic
        .split(' ')
        .filter(word => word.length > 0)
        .join(' ');

    const privateKey =
      mnemonic && nostr.nip06.privateKeyFromSeedWords(mnemonic);

    // const publicKey = nostr.getPublicKey(privateKey);

    let blitzStoredData;
    let retrivedStoredBlitzData = await getDataFromCollection(
      'blitzWalletUsers',
    );

    if (retrivedStoredBlitzData === null) throw Error('Failed to retrive');
    else if (retrivedStoredBlitzData) blitzStoredData = retrivedStoredBlitzData;
    else blitzStoredData = {};

    let blitzWalletLocalStorage =
      JSON.parse(await getLocalStorageItem('blitzWalletLocalStorage')) || {};

    // const {data} = await axios.post(process.env.CREATE_JWT_URL, {
    //   id: Device.osBuildId,
    //   appPubKey: publicKey,
    //   checkContent: encriptMessage(
    //     privateKey,
    //     process.env.BACKEND_PUB_KEY,
    //     JSON.stringify({checkHash: sha256Hash(mnemonic), sendTime: new Date()}),
    //   ),
    // });

    // setLocalStorageItem('blitzWalletJWT', JSON.stringify(data.token));

    setContactsPrivateKey(privateKey);
    // setJWT(data.token);

    const generatedUniqueName = generateRandomContact();
    const contacts = blitzWalletLocalStorage.contacts ||
      blitzStoredData.contacts || {
        myProfile: {
          uniqueName: generatedUniqueName.uniqueName,
          uniqueNameLower: generatedUniqueName.uniqueName.toLocaleLowerCase(),
          bio: '',
          name: '',
          nameLower: '',
          uuid: await generatePubPrivKeyForMessaging(),
          didEditProfile: false,
          receiveAddress: null,
          lastRotated: getCurrentDateFormatted(),
        },
        addedContacts: [],
      };

    const storedUserTxPereferance =
      JSON.parse(await getLocalStorageItem('homepageTxPreferance')) || 25;

    const enabledSlidingCamera =
      JSON.parse(await getLocalStorageItem('enabledSlidingCamera')) ?? false;

    const userFaceIDPereferance =
      JSON.parse(await getLocalStorageItem('userFaceIDPereferance')) ?? false;

    const fiatCurrenciesList =
      JSON.parse(await getLocalStorageItem('fiatCurrenciesList')) || [];

    const failedTransactions =
      JSON.parse(await getLocalStorageItem('failedTransactions')) || [];

    const satDisplay =
      JSON.parse(await getLocalStorageItem('satDisplay')) || 'word';
    const enabledEcash =
      JSON.parse(await getLocalStorageItem('enabledEcash')) ?? false;

    const hideUnknownContacts =
      JSON.parse(await getLocalStorageItem('hideUnknownContacts')) ?? false;
    const useTrampoline =
      JSON.parse(await getLocalStorageItem('useTrampoline')) ?? true;
    const fastPaySettings = JSON.parse(
      await getLocalStorageItem(QUICK_PAY_STORAGE_KEY),
    ) ?? {isFastPayEnabled: false, fastPayThresholdSats: 5000};

    const fiatCurrency =
      blitzWalletLocalStorage.fiatCurrency ||
      blitzStoredData.fiatCurrency ||
      'USD';

    const jwtCheckValue =
      blitzWalletLocalStorage.jwtCheckValue ||
      blitzStoredData.jwtCheckValue ||
      encriptMessage(
        privateKey,
        process.env.BACKEND_PUB_KEY,
        JSON.stringify({checkHash: sha256Hash(mnemonic), databaseCopy: true}),
      );
    let enabledLNURL =
      blitzWalletLocalStorage.enabledLNURL || blitzStoredData.enabledLNURL;

    const userBalanceDenomination =
      blitzWalletLocalStorage.userBalanceDenomination ||
      blitzStoredData.userBalanceDenomination ||
      'sats';

    const selectedLanguage =
      blitzWalletLocalStorage.userSelectedLanguage ||
      blitzStoredData.userSelectedLanguage ||
      'en';

    const pushNotifications =
      blitzWalletLocalStorage.pushNotifications ||
      blitzStoredData.pushNotifications ||
      {};

    const liquidSwaps =
      blitzWalletLocalStorage.liquidSwaps || blitzStoredData.liquidSwaps || [];

    const chatGPT = blitzWalletLocalStorage.chatGPT ||
      blitzStoredData.chatGPT || {
        conversation: [],
        credits: 0,
      };
    const liquidWalletSettings = blitzWalletLocalStorage.liquidWalletSettings ||
      blitzStoredData.liquidWalletSettings || {
        autoChannelRebalance: true,
        autoChannelRebalancePercantage: 90,
        regulateChannelOpen: true,
        regulatedChannelOpenSize: MIN_CHANNEL_OPEN_FEE, //sats
        maxChannelOpenFee: 5000, //sats
        isLightningEnabled: false, //dissabled by deafult
        minAutoSwapAmount: 10000, //sats
      };

    const eCashInformation =
      blitzWalletLocalStorage.eCashInformation ||
      blitzStoredData.eCashInformation ||
      [
        // {
        //   proofs: [],
        //   transactions: [],
        //   mintURL: '',
        //   isCurrentMint: null,
        // },
      ];
    const messagesApp = blitzWalletLocalStorage.messagesApp ||
      blitzStoredData.messagesApp || {sent: [], received: []};
    const VPNplans =
      blitzWalletLocalStorage.VPNplans || blitzStoredData.VPNplans || [];

    const posSettings = blitzWalletLocalStorage.posSettings ||
      blitzStoredData.posSettings || {
        storeName: contacts.myProfile.uniqueName,
        storeNameLower: contacts.myProfile.uniqueName.toLowerCase(),
        storeCurrency: fiatCurrency,
        lastRotated: getCurrentDateFormatted(),
        receiveAddress: null,
      };

    const appData = blitzWalletLocalStorage.appData ||
      blitzStoredData.appData || {
        VPNplans: VPNplans,
        chatGPT: chatGPT,
        messagesApp: messagesApp,
      };

    //added here for legecy people
    liquidWalletSettings.regulatedChannelOpenSize =
      liquidWalletSettings.regulatedChannelOpenSize < MIN_CHANNEL_OPEN_FEE
        ? MIN_CHANNEL_OPEN_FEE
        : liquidWalletSettings.regulatedChannelOpenSize;

    if (!contacts.myProfile?.uniqueNameLower) {
      contacts.myProfile.uniqueNameLower =
        contacts.myProfile.uniqueName.toLocaleLowerCase();
      needsToUpdate = true;
    }
    if (!contacts.myProfile.lastRotated) {
      contacts.myProfile.lastRotated = getCurrentDateFormatted();
      needsToUpdate = true;
    }
    if (!posSettings.storeNameLower) {
      posSettings.storeNameLower = posSettings.storeName.toLowerCase();
      needsToUpdate = true;
    }
    if (!posSettings.lastRotated) {
      posSettings.lastRotated = getCurrentDateFormatted();
      needsToUpdate = true;
    }

    if (liquidWalletSettings.isLightningEnabled === undefined) {
      liquidWalletSettings.isLightningEnabled = true;
      needsToUpdate = true;
    }
    if (liquidWalletSettings.minAutoSwapAmount === undefined) {
      liquidWalletSettings.minAutoSwapAmount = 10000;
      needsToUpdate = true;
    }
    if (contacts.myProfile.didEditProfile === undefined) {
      contacts.myProfile.didEditProfile = true;
      needsToUpdate = true;
    }
    if (contacts.myProfile.nameLower === undefined) {
      contacts.myProfile.nameLower = contacts.myProfile.name.toLowerCase();
      needsToUpdate = true;
    }
    if (enabledLNURL === undefined) {
      enabledLNURL = true;
      needsToUpdate = true;
    }
    if (
      !contacts.myProfile.receiveAddress ||
      isMoreThan7DaysPast(contacts.myProfile.receiveAddress)
    ) {
      const {address: liquidAddress} = await createLiquidReceiveAddress();
      contacts.myProfile.receiveAddress = liquidAddress;
      posSettings.receiveAddress = liquidAddress;
      needsToUpdate = true;
    }

    if (!blitzStoredData.jwtCheckValue) {
      needsToUpdate = true;
    }

    const isUsingLocalStorage = await usesLocalStorage();
    tempObject['homepageTxPreferance'] = storedUserTxPereferance;
    tempObject['userBalanceDenomination'] = userBalanceDenomination;
    tempObject['userSelectedLanguage'] = selectedLanguage;
    tempObject['usesLocalStorage'] = isUsingLocalStorage.data;
    tempObject['fiatCurrenciesList'] = fiatCurrenciesList;
    tempObject['fiatCurrency'] = fiatCurrency;
    tempObject['userFaceIDPereferance'] = userFaceIDPereferance;
    tempObject['liquidSwaps'] = liquidSwaps;
    tempObject['failedTransactions'] = failedTransactions;
    tempObject['satDisplay'] = satDisplay;
    tempObject['uuid'] = await getUserAuth();
    tempObject['liquidWalletSettings'] = liquidWalletSettings;
    tempObject['enabledSlidingCamera'] = enabledSlidingCamera;
    tempObject['posSettings'] = posSettings;
    tempObject['enabledEcash'] = enabledEcash;
    tempObject['pushNotifications'] = pushNotifications;
    tempObject['hideUnknownContacts'] = hideUnknownContacts;
    tempObject['enabledLNURL'] = enabledLNURL;
    tempObject['useTrampoline'] = useTrampoline;
    tempObject['jwtCheckValue'] = jwtCheckValue;
    // store in contacts context
    tempObject['contacts'] = contacts;

    // Store in ecash context
    tempObject['eCashInformation'] = eCashInformation;

    // store in app context
    tempObject['appData'] = appData;
    tempObject['fastPaySettings'] = fastPaySettings;
    // tempObject['chatGPT'] = chatGPT;
    // tempObject['messagesApp'] = messagesApp;
    // tempObject['VPNplans'] = VPNplans;

    if (
      needsToUpdate ||
      (Object.keys(blitzStoredData).length === 0 &&
        Object.keys(blitzWalletLocalStorage).length === 0)
    ) {
      let tempObjectCopy = deepCopy(tempObject);
      delete tempObjectCopy['homepageTxPreferance'];
      delete tempObjectCopy['userFaceIDPereferance'];
      delete tempObjectCopy['enabledSlidingCamera'];
      delete tempObjectCopy['fiatCurrenciesList'];
      delete tempObjectCopy['failedTransactions'];
      delete tempObjectCopy['satDisplay'];
      delete tempObjectCopy['enabledEcash'];
      delete tempObjectCopy['hideUnknownContacts'];
      delete tempObjectCopy['useTrampoline'];

      addDataToCollection(tempObjectCopy, 'blitzWalletUsers');
    }
    delete tempObject['contacts'];
    delete tempObject['eCashInformation'];
    delete tempObject['appData'];

    // if (!retrivedStoredBlitzData && !(await usesLocalStorage()).data) {
    //   handleDataStorageSwitch(true, toggleMasterInfoObject);
    // }

    // if no account exists add account to database otherwise just save information in global state
    // if (
    //   Object.keys(blitzStoredData).length === 0 &&
    //   Object.keys(blitzWalletLocalStorage).length === 0
    // ) {
    //   addDataToCollection(tempObject);
    //   setMasterInfoObject(tempObject);
    // }
    // Object.keys(blitzStoredData).length === 0 &&
    // Object.keys(blitzWalletLocalStorage).length === 0
    //   ? addDataToCollection(tempObject)
    //   : setMasterInfoObject(tempObject);

    // if (needsToUpdate) {
    //   addDataToCollection(tempObject, null, true);
    // }
    // if (Object.keys(appData).length === 0) {
    //   toggleGlobalAppDataInformation(
    //     {
    //       chatGPT: chatGPT,
    //       messagesApp: messagesApp,
    //       VPNplans: VPNplans,
    //     },
    //     true,
    //   );
    // } else
    toggleGlobalAppDataInformation(appData);
    toggleGLobalEcashInformation(eCashInformation);
    toggleGlobalContactsInformation(contacts);
    setMasterInfoObject(tempObject);

    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}
