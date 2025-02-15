import {retrieveData} from './secureStore';
import * as nostr from 'nostr-tools';
import {getLocalStorageItem} from './localStorage';
import {getDataFromCollection} from '../../db';
import {generateRandomContact} from './contacts';
import {
  getCurrentDateFormatted,
  getDateXDaysAgo,
} from './rotateAddressDateChecker';
import {MIN_CHANNEL_OPEN_FEE, QUICK_PAY_STORAGE_KEY} from '../constants';
import {sendDataToDB} from '../../db/interactionManager';
import {initializeFirebase} from '../../db/initializeFirebase';

export default async function initializeUserSettingsFromHistory({
  setContactsPrivateKey,
  setMasterInfoObject,
  toggleGlobalContactsInformation,
  toggleGLobalEcashInformation,
  toggleGlobalAppDataInformation,
}) {
  try {
    let needsToUpdate = false;
    let tempObject = {};
    const mnemonic = await retrieveData('mnemonic');
    mnemonic &&
      mnemonic
        .split(' ')
        .filter(word => word.length > 0)
        .join(' ');

    const privateKey =
      mnemonic && nostr.nip06.privateKeyFromSeedWords(mnemonic);

    const publicKey = privateKey && nostr.getPublicKey(privateKey);

    if (!privateKey || !publicKey) throw Error('Failed to retrive');

    await initializeFirebase(publicKey, privateKey);

    let blitzStoredData;
    const retrivedStoredBlitzData = await getDataFromCollection(
      'blitzWalletUsers',
      publicKey,
    );

    if (retrivedStoredBlitzData === null) throw Error('Failed to retrive');
    else if (retrivedStoredBlitzData) blitzStoredData = retrivedStoredBlitzData;
    else blitzStoredData = {};

    setContactsPrivateKey(privateKey);

    const generatedUniqueName = generateRandomContact();
    const contacts = blitzStoredData.contacts || {
      myProfile: {
        uniqueName: generatedUniqueName.uniqueName,
        uniqueNameLower: generatedUniqueName.uniqueName.toLocaleLowerCase(),
        bio: '',
        name: '',
        nameLower: '',
        uuid: publicKey,
        didEditProfile: false,
        receiveAddress: null,
        lastRotated: getCurrentDateFormatted(),
        lastRotatedAddedContact: getCurrentDateFormatted(),
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

    const fiatCurrency = blitzStoredData.fiatCurrency || 'USD';

    let enabledLNURL = blitzStoredData.enabledLNURL;

    const userBalanceDenomination =
      blitzStoredData.userBalanceDenomination || 'sats';

    const selectedLanguage = blitzStoredData.userSelectedLanguage || 'en';

    const pushNotifications = blitzStoredData.pushNotifications || {};

    const liquidSwaps = blitzStoredData.liquidSwaps || [];

    const chatGPT = blitzStoredData.chatGPT || {
      conversation: [],
      credits: 0,
    };
    const liquidWalletSettings = blitzStoredData.liquidWalletSettings || {
      autoChannelRebalance: true,
      autoChannelRebalancePercantage: 90,
      regulateChannelOpen: true,
      regulatedChannelOpenSize: MIN_CHANNEL_OPEN_FEE, //sats
      maxChannelOpenFee: 5000, //sats
      isLightningEnabled: false, //dissabled by deafult
      minAutoSwapAmount: 10000, //sats
    };

    const eCashInformation =
      blitzStoredData.eCashInformation ||
      [
        // {
        //   proofs: [],
        //   transactions: [],
        //   mintURL: '',
        //   isCurrentMint: null,
        // },
      ];
    const messagesApp = blitzStoredData.messagesApp || {sent: [], received: []};
    const VPNplans = blitzStoredData.VPNplans || [];

    const posSettings = blitzStoredData.posSettings || {
      storeName: contacts.myProfile.uniqueName,
      storeNameLower: contacts.myProfile.uniqueName.toLowerCase(),
      storeCurrency: fiatCurrency,
      lastRotated: getCurrentDateFormatted(),
      receiveAddress: null,
    };

    const appData = blitzStoredData.appData || {
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
    if (!contacts.myProfile.lastRotatedAddedContact) {
      contacts.myProfile.lastRotatedAddedContact = getDateXDaysAgo(22); // set to 22 days ago to force contacts adderess update for legacy users
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

    tempObject['homepageTxPreferance'] = storedUserTxPereferance;
    tempObject['userBalanceDenomination'] = userBalanceDenomination;
    tempObject['userSelectedLanguage'] = selectedLanguage;
    tempObject['fiatCurrenciesList'] = fiatCurrenciesList;
    tempObject['fiatCurrency'] = fiatCurrency;
    tempObject['userFaceIDPereferance'] = userFaceIDPereferance;
    tempObject['liquidSwaps'] = liquidSwaps;
    tempObject['failedTransactions'] = failedTransactions;
    tempObject['satDisplay'] = satDisplay;
    tempObject['uuid'] = publicKey;
    tempObject['liquidWalletSettings'] = liquidWalletSettings;
    tempObject['enabledSlidingCamera'] = enabledSlidingCamera;
    tempObject['posSettings'] = posSettings;
    tempObject['enabledEcash'] = enabledEcash;
    tempObject['pushNotifications'] = pushNotifications;
    tempObject['hideUnknownContacts'] = hideUnknownContacts;
    tempObject['enabledLNURL'] = enabledLNURL;
    tempObject['useTrampoline'] = useTrampoline;

    // store in contacts context
    tempObject['contacts'] = contacts;

    // Store in ecash context
    tempObject['eCashInformation'] = eCashInformation;

    // store in app context
    tempObject['appData'] = appData;
    tempObject[QUICK_PAY_STORAGE_KEY] = fastPaySettings;

    if (needsToUpdate || Object.keys(blitzStoredData).length === 0) {
      await sendDataToDB(tempObject, publicKey);
    }
    delete tempObject['contacts'];
    delete tempObject['eCashInformation'];
    delete tempObject['appData'];

    toggleGlobalAppDataInformation(appData);
    toggleGLobalEcashInformation(eCashInformation);
    toggleGlobalContactsInformation(contacts);
    setMasterInfoObject(tempObject);

    return true;
  } catch (err) {
    console.log(err, 'INITIALIZE USER SETTINGS');
    return false;
  }
}
