import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
// import {BarCodeScanner} from 'expo-barcode-scanner';
import {Alert} from 'react-native';
import {WEBSITE_REGEX} from '../../constants';
import openWebBrowser from '../openWebBrowser';
import {Camera} from 'expo-camera';
import {convertMerchantQRToLightningAddress} from './getMerchantAddress';

async function getClipboardText(navigate, callLocation, nodeInformation) {
  const data = await Clipboard.getStringAsync();
  if (!data) return;

  // if (await handleScannedAddressCheck(data, nodeInformation)) return;
  if (WEBSITE_REGEX.test(data)) {
    openWebBrowser({navigate, link: data});
    return;
  }

  // if (callLocation === 'modal') navigate.navigate('HomeAdmin');
  // if (callLocation === 'sendBTCPage') navigate.goBack();
  const merchantLNAddress = convertMerchantQRToLightningAddress({
    qrContent: data,
    network: process.env.BOLTZ_ENVIRONEMNT,
  });
  navigate.reset({
    index: 0, // The top-level route index
    routes: [
      {
        name: 'HomeAdmin', // Navigate to HomeAdmin
        params: {
          screen: 'Home',
        },
      },
      {
        name: 'ConfirmPaymentScreen', // Navigate to ExpandedAddContactsPage
        params: {
          btcAdress: merchantLNAddress || data,
          fromPage: callLocation === 'slideCamera' ? 'slideCamera' : '',
        },
      },
    ],
    // Array of routes to set in the stack
  });
}

async function getQRImage(navigate, callLocation, nodeInformation) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    allowsMultipleSelection: false,
    quality: 1,
  });

  if (result.canceled) return;

  const imgURL = result.assets[0].uri;

  const [{data}] = await Camera.scanFromURLAsync(imgURL);
  // if (await handleScannedAddressCheck(data, nodeInformation)) return;

  if (WEBSITE_REGEX.test(data)) {
    openWebBrowser({navigate, link: data});
    return;
  }
  const merchantLNAddress = convertMerchantQRToLightningAddress({
    qrContent: data,
    network: process.env.BOLTZ_ENVIRONEMNT,
  });

  // if (callLocation === 'modal') navigate.navigate('HomeAdmin');
  // if (callLocation === 'sendBTCPage') navigate.goBack();
  // navigate.navigate('ConfirmPaymentScreen', {
  //   btcAdress: data,
  //   fromPage: callLocation === 'slideCamera' ? 'slideCamera' : '',
  // });
  navigate.reset({
    index: 0, // The top-level route index
    routes: [
      {
        name: 'HomeAdmin', // Navigate to HomeAdmin
        params: {
          screen: 'Home',
        },
      },
      {
        name: 'ConfirmPaymentScreen', // Navigate to ExpandedAddContactsPage
        params: {
          btcAdress: merchantLNAddress || data,
          fromPage: callLocation === 'slideCamera' ? 'slideCamera' : '',
        },
      },
    ],
  });
}

async function handleScannedAddressCheck(scannedAddress, nodeInformation) {
  const didPay =
    nodeInformation.transactions.filter(
      prevTx => prevTx.details.data.bolt11 === scannedAddress,
    ).length != 0;
  if (didPay) {
    Alert.alert('You have already paid this invoice');
  }
  console.log(didPay);
  return new Promise(resolve => {
    resolve(didPay);
  });
}

export {getClipboardText, getQRImage};
