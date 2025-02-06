import * as Clipboard from 'expo-clipboard';
import {Alert} from 'react-native';
import {WEBSITE_REGEX} from '../../constants';
import openWebBrowser from '../openWebBrowser';
import {convertMerchantQRToLightningAddress} from './getMerchantAddress';
import {getImageFromLibrary} from '../imagePickerWrapper';
import RNQRGenerator from 'rn-qr-generator';

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

async function getQRImage(navigate, callLocation) {
  const imagePickerResponse = await getImageFromLibrary();
  const {didRun, error, imgURL} = imagePickerResponse;
  if (!didRun) return {btcAdress: '', didWork: true, error: ''};
  if (error) {
    return {btcAdress: '', didWork: false, error: error};
  }
  let address;
  console.log(imgURL.uri);

  try {
    const response = await RNQRGenerator.detect({
      uri: imgURL.uri,
    });

    console.log(response);
    // const respose = await scanFromURLAsync(imgURL.uri, ['qr']);
    // console.log(respose);

    if (response.type != 'QRCode')
      return {
        btcAdress: '',
        didWork: false,
        error: 'Not able to get find QRcode from image.',
      };
    if (!response.values.length)
      return {
        btcAdress: '',
        didWork: false,
        error: 'Not able to get find data from image.',
      };

    address = response.values[0];
  } catch (err) {
    console.log('get qr image error', err);
    return {
      btcAdress: '',
      didWork: false,
      error: 'Not able to get invoice from image.',
    };
  }

  if (WEBSITE_REGEX.test(address)) {
    openWebBrowser({navigate, link: address});
    return {btcAdress: '', didWork: false, error: ''};
  }
  const merchantLNAddress = convertMerchantQRToLightningAddress({
    qrContent: address,
    network: process.env.BOLTZ_ENVIRONEMNT,
  });

  return {btcAdress: merchantLNAddress || address, didWork: true, error: ''};

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
          btcAdress: merchantLNAddress || address,
          fromPage: callLocation === 'slideCamera' ? 'slideCamera' : '',
        },
      },
    ],
  });
}

export {getClipboardText, getQRImage};
