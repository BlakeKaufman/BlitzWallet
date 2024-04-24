import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import {BarCodeScanner} from 'expo-barcode-scanner';
import {Alert} from 'react-native';
import {createLiquidSwap, getSwapPairInformation} from '../LBTC';

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
    const [fee, pairSwapInfo] = await calculateBoltzFee(swapAmountSats);

    const [swapInfo, privateKey] = await createLiquidSwap(
      invoice,
      pairSwapInfo.hash,
    );

    return new Promise(resolve => resolve([swapInfo, privateKey]));
  } catch (err) {
    console.log(err, 'BANK LN PAYMENT ERROR');
  }
}

async function calculateBoltzFee(swapAmountSats) {
  const pairSwapInfo = await getSwapPairInformation();
  if (!pairSwapInfo) return new Promise(resolve => resolve(false));

  const fee = Math.round(
    pairSwapInfo.fees.minerFees +
      swapAmountSats * (pairSwapInfo.fees.percentage / 100),
  );

  return new Promise(resolve => resolve([fee, pairSwapInfo]));
}
export {
  getClipboardText,
  getQRImage,
  calculateBoltzFee,
  bankToLightningPayment,
};
