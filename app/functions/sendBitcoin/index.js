import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import {BarCodeScanner} from 'expo-barcode-scanner';
import {Alert} from 'react-native';

import createLiquidToLNSwap from '../boltz/liquidToLNSwap';
import {getBoltzSwapPairInformation} from '../boltz/boltzSwapInfo';

async function getClipboardText(navigate, callLocation, nodeInformation) {
  const data = await Clipboard.getStringAsync();
  if (!data) return;

  if (await handleScannedAddressCheck(data, nodeInformation)) return;
  if (callLocation === 'modal') navigate.navigate('HomeAdmin');
  navigate.navigate('ConfirmPaymentScreen', {
    btcAdress: data,
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

  const [{data}] = await BarCodeScanner.scanFromURLAsync(imgURL);
  if (await handleScannedAddressCheck(data, nodeInformation)) return;

  if (callLocation === 'modal') navigate.navigate('HomeAdmin');
  navigate.navigate('ConfirmPaymentScreen', {
    btcAdress: data,
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

async function bankToLightningPayment(
  swapAmountSats,
  invoice,
  toggleMasterInfoObject,
  masterInfoObject,
) {
  try {
    const pairSwapInfo = await getBoltzSwapPairInformation('liquid-ln');
    if (!pairSwapInfo) new Error('no swap info');

    console.log(pairSwapInfo);

    const {swapInfo, privateKey} = await createLiquidToLNSwap(
      invoice,
      pairSwapInfo.hash,
    );

    return new Promise(resolve => resolve([swapInfo, privateKey]));
  } catch (err) {
    console.log(err, 'BANK LN PAYMENT ERROR');
  }
}

export {getClipboardText, getQRImage, bankToLightningPayment};
